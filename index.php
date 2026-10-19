<?php
require __DIR__ . '/vendor/autoload.php';

use Bramus\Router\Router;
use Dompdf\Dompdf;
use Dompdf\Options;
use Aws\S3\S3Client;

header('Content-Type: application/json');

function readCsv(string $file): array {
    $rows = [];
    $h = fopen(__DIR__ . "/data/$file", 'r');
    $headers = fgetcsv($h);
    $headers[0] = ltrim($headers[0], "\xEF\xBB\xBF"); // strip BOM if present
    while (($r = fgetcsv($h)) !== false) {
        if (count($r) === count($headers)) $rows[] = array_combine($headers, $r);
    }
    fclose($h);
    return $rows;
}

function respond($data, int $code = 200, ?string $message = null): void {
    http_response_code($code);
    $out = ['success' => $code < 400];
    if ($message) $out['message'] = $message;
    $out[$code < 400 ? 'data' : 'error'] = $data;
    echo json_encode($out);
}

function buildPayslip(string $id): ?array {
    foreach (readCsv('payroll.csv') as $p) {
        if ($p['id'] !== $id) continue;
        $emp = null;
        foreach (readCsv('employees.csv') as $e) {
            if ($e['id'] === $p['employee_id']) { $emp = $e; break; }
        }
        $gross = (float)$p['gross_pay'];
        $net = (float)$p['net_pay'];
        return [
            'payroll_id'       => (int)$p['id'],
            'employee_id'      => (int)$p['employee_id'],
            'employee_name'    => $emp['full_name'] ?? 'Unknown',
            'department_id'    => isset($emp['department_id']) ? (int)$emp['department_id'] : null,
            'pay_period_start' => $p['pay_period_start'],
            'pay_period_end'   => $p['pay_period_end'],
            'gross_pay'        => $gross,
            'deductions'       => round($gross - $net, 2),
            'net_pay'          => $net,
        ];
    }
    return null;
}

$router = new Router();

$router->get('/api/employees', function () {
    $out = [];
    foreach (readCsv('employees.csv') as $e) {
        $out[] = [
            'employee_id'   => (int)$e['id'],
            'full_name'     => $e['full_name'],
            'email'         => $e['email'],
            'position_id'   => $e['position_id'] !== '' ? (int)$e['position_id'] : null,
            'department_id' => $e['department_id'] !== '' ? (int)$e['department_id'] : null,
            'manager_id'    => $e['manager_id'] !== '' ? (int)$e['manager_id'] : null,
        ];
    }
    respond($out);
});

$router->get('/api/reports/payroll', function () {
    $rows = readCsv('payroll.csv');
    $gross = $net = 0;
    foreach ($rows as $r) { $gross += (float)$r['gross_pay']; $net += (float)$r['net_pay']; }
    respond([
        'total_payroll_records' => count($rows),
        'total_gross_pay'  => round($gross, 2),
        'total_deductions' => round($gross - $net, 2),
        'total_net_pay'    => round($net, 2),
    ]);
});

$router->get('/api/payslips/(\d+)', function ($id) {
    $s = buildPayslip($id);
    $s ? respond($s) : respond('Payroll record not found', 404);
});

$router->post('/api/payslips/(\d+)/generate', function ($id) {
    $s = buildPayslip($id);
    if (!$s) { respond('Payroll record not found', 404); return; }

    $name = htmlspecialchars($s['employee_name']);
    $html = "<h1>Payslip</h1>
      <p><b>Payroll ID:</b> {$s['payroll_id']}</p>
      <p><b>Employee:</b> $name (ID {$s['employee_id']})</p>
      <p><b>Pay period:</b> {$s['pay_period_start']} to {$s['pay_period_end']}</p>
      <table border='1' cellpadding='6' cellspacing='0'>
        <tr><td>Gross pay</td><td>" . number_format($s['gross_pay'], 2) . "</td></tr>
        <tr><td>Deductions</td><td>" . number_format($s['deductions'], 2) . "</td></tr>
        <tr><td>Net pay</td><td>" . number_format($s['net_pay'], 2) . "</td></tr>
      </table>";

    // Lambda is read-only except /tmp
    $opts = new Options();
    $opts->set('tempDir', '/tmp');
    $opts->set('fontCache', '/tmp');
    $opts->set('chroot', __DIR__);
    $pdf = new Dompdf($opts);
    $pdf->loadHtml($html);
    $pdf->render();

    $key = "payslips/$id.pdf";
    $s3 = new S3Client(['version' => 'latest', 'region' => getenv('BUCKET_REGION') ?: getenv('AWS_REGION')]);
    $s3->putObject([
        'Bucket' => getenv('BUCKET'),
        'Key' => $key,
        'Body' => $pdf->output(),
        'ContentType' => 'application/pdf',
    ]);

    respond(['payroll_id' => $s['payroll_id'], 'payslip_file' => $key], 200, 'Payslip generated and uploaded.');
});

$router->run();

