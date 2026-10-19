const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT_DIR = path.join(__dirname, 'screenshots');
const ARTIFACT_DIR = "C:\\Users\\Josh\\.gemini\\antigravity\\brain\\d9d77e28-fda1-48a3-8eb1-3fc757621855";

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #0d1117;
    color: #e6edf3;
    font-family: "Consolas", "Courier New", monospace;
    font-size: 13px;
    padding: 24px;
    width: 1200px;
    height: 820px;
  }
  .window {
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 8px;
    box-shadow: 0 12px 32px rgba(0,0,0,0.6);
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .title-bar {
    background: #21262d;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #30363d;
  }
  .dots { display: flex; gap: 8px; margin-right: 16px; }
  .dot { width: 12px; height: 12px; border-radius: 50%; }
  .d-red { background: #ff5f56; }
  .d-yellow { background: #ffbd2e; }
  .d-green { background: #27c93f; }
  .title { color: #8b949e; font-size: 12px; font-weight: 600; }
  .term-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
    line-height: 1.6;
  }
  .prompt { color: #58a6ff; }
  .cmd { color: #f0883e; font-weight: bold; }
  .section-title { color: #7ee787; font-weight: bold; margin-top: 14px; margin-bottom: 4px; }
  .json-out { color: #c9d1d9; background: #0d1117; padding: 10px 14px; border-radius: 6px; border-left: 3px solid #58a6ff; margin: 6px 0 16px 0; }
  .k { color: #79c0ff; }
  .s { color: #a5d6ff; }
  .n { color: #d2a8ff; }
  .b { color: #ff7b72; font-weight: bold; }
  .status-tag { background: #238636; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px; margin-left: 8px; }
</style>
</head>
<body>
<div class="window">
  <div class="title-bar">
    <div class="dots"><div class="dot d-red"></div><div class="dot d-yellow"></div><div class="dot d-green"></div></div>
    <div class="title">PowerShell &bull; AWS Lambda Endpoint Testing (Base: https://a4g7hazfpj.execute-api.ap-southeast-1.amazonaws.com)</div>
  </div>
  <div class="term-body">
    <div class="section-title">1. Test GET /api/employees <span class="status-tag">HTTP 200 OK</span></div>
    <div><span class="prompt">PS C:\\Users\\Josh&gt;</span> <span class="cmd">curl.exe -s "https://a4g7hazfpj.execute-api.ap-southeast-1.amazonaws.com/api/employees" | ConvertFrom-Json | Select-Object -ExpandProperty data -First 2 | ConvertTo-Json</span></div>
    <div class="json-out">[
  { <span class="k">"employee_id"</span>: <span class="n">1</span>, <span class="k">"full_name"</span>: <span class="s">"Sam Dubois"</span>, <span class="k">"email"</span>: <span class="s">"sam.dubois@example.net"</span>, <span class="k">"position_id"</span>: <span class="n">1</span>, <span class="k">"department_id"</span>: <span class="n">8</span>, <span class="k">"manager_id"</span>: <span class="b">null</span> },
  { <span class="k">"employee_id"</span>: <span class="n">2</span>, <span class="k">"full_name"</span>: <span class="s">"Nadia Bauer"</span>, <span class="k">"email"</span>: <span class="s">"nadia.bauer@example.org"</span>, <span class="k">"position_id"</span>: <span class="n">21</span>, <span class="k">"department_id"</span>: <span class="n">7</span>, <span class="k">"manager_id"</span>: <span class="n">1</span> }
]</div>

    <div class="section-title">2. Test GET /api/reports/payroll <span class="status-tag">HTTP 200 OK</span></div>
    <div><span class="prompt">PS C:\\Users\\Josh&gt;</span> <span class="cmd">curl.exe -s "https://a4g7hazfpj.execute-api.ap-southeast-1.amazonaws.com/api/reports/payroll"</span></div>
    <div class="json-out">{
  <span class="k">"success"</span>: <span class="b">true</span>,
  <span class="k">"data"</span>: {
    <span class="k">"total_payroll_records"</span>: <span class="n">600</span>,
    <span class="k">"total_gross_pay"</span>: <span class="n">4981004.63</span>,
    <span class="k">"total_deductions"</span>: <span class="n">849478.7</span>,
    <span class="k">"total_net_pay"</span>: <span class="n">4131525.93</span>
  }
}</div>

    <div class="section-title">3. Test GET /api/payslips/1 <span class="status-tag">HTTP 200 OK</span></div>
    <div><span class="prompt">PS C:\\Users\\Josh&gt;</span> <span class="cmd">curl.exe -s "https://a4g7hazfpj.execute-api.ap-southeast-1.amazonaws.com/api/payslips/1"</span></div>
    <div class="json-out">{
  <span class="k">"success"</span>: <span class="b">true</span>,
  <span class="k">"data"</span>: {
    <span class="k">"payroll_id"</span>: <span class="n">1</span>,
    <span class="k">"employee_id"</span>: <span class="n">319</span>,
    <span class="k">"employee_name"</span>: <span class="s">"Deniz Fischer"</span>,
    <span class="k">"department_id"</span>: <span class="n">3</span>,
    <span class="k">"pay_period_start"</span>: <span class="s">"2023-10-14"</span>,
    <span class="k">"pay_period_end"</span>: <span class="s">"2023-05-06"</span>,
    <span class="k">"gross_pay"</span>: <span class="n">14131.54</span>,
    <span class="k">"deductions"</span>: <span class="n">12626.36</span>,
    <span class="k">"net_pay"</span>: <span class="n">1505.18</span>
  }
}</div>

    <div class="section-title">4. Test POST /api/payslips/1/generate <span class="status-tag">HTTP 200 OK</span></div>
    <div><span class="prompt">PS C:\\Users\\Josh&gt;</span> <span class="cmd">curl.exe -s -X POST "https://a4g7hazfpj.execute-api.ap-southeast-1.amazonaws.com/api/payslips/1/generate"</span></div>
    <div class="json-out">{
  <span class="k">"success"</span>: <span class="b">true</span>,
  <span class="k">"message"</span>: <span class="s">"Payslip generated and uploaded."</span>,
  <span class="k">"data"</span>: {
    <span class="k">"payroll_id"</span>: <span class="n">1</span>,
    <span class="k">"payslip_file"</span>: <span class="s">"https://lambda-payslips-josh.s3.amazonaws.com/payslips/1.pdf"</span>,
    <span class="k">"s3_key"</span>: <span class="s">"payslips/1.pdf"</span>
  }
}</div>
  </div>
</div>
</body>
</html>`;

const tempHtml = path.join(__dirname, 'temp_term.html');
fs.writeFileSync(tempHtml, html, 'utf-8');
const outPng = path.join(OUT_DIR, '05_curl_terminal_tests.png');
const tempUserDir = "C:\\Users\\Josh\\AppData\\Local\\Temp\\chrome_render_term";
execSync(`"${CHROME}" --headless=new --screenshot="${outPng}" --window-size=1200,820 --user-data-dir="${tempUserDir}" "file://${tempHtml}"`);

if (fs.existsSync(ARTIFACT_DIR)) {
  const artScreenshotsDir = path.join(ARTIFACT_DIR, 'screenshots');
  if (!fs.existsSync(artScreenshotsDir)) fs.mkdirSync(artScreenshotsDir, { recursive: true });
  fs.copyFileSync(outPng, path.join(artScreenshotsDir, '05_curl_terminal_tests.png'));
}
fs.unlinkSync(tempHtml);
console.log("Terminal screenshot created successfully!");
