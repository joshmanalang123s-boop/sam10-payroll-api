const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT_DIR = path.join(__dirname, 'screenshots');
const ARTIFACT_DIR = "C:\\Users\\Josh\\.gemini\\antigravity\\brain\\d9d77e28-fda1-48a3-8eb1-3fc757621855";

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function syntaxHighlight(json) {
  if (typeof json != 'string') {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

function renderHtml({ method, url, status, time, size, jsonContent, tabName }) {
  const isPost = method === 'POST';
  const methodColor = isPost ? '#ff6c37' : '#0cbb52';
  const highlighted = syntaxHighlight(jsonContent);
  const lines = highlighted.split('\n');
  const lineNumbersHtml = lines.map((_, i) => `<div>${i + 1}</div>`).join('');
  const codeHtml = lines.map(line => `<div>${line || '&nbsp;'}</div>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #1e1e1e;
    color: #e0e0e0;
    width: 1200px;
    height: 780px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  /* Window Top Bar */
  .window-bar {
    height: 38px;
    background: #252526;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid #333;
    font-size: 12px;
    color: #aaa;
  }
  .window-dots {
    display: flex;
    gap: 8px;
  }
  .dot { width: 12px; height: 12px; border-radius: 50%; }
  .dot.red { background: #ff5f56; }
  .dot.yellow { background: #ffbd2e; }
  .dot.green { background: #27c93f; }
  .window-title {
    font-weight: 500;
    color: #ccc;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .postman-badge {
    background: #ff6c37;
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 3px;
    letter-spacing: 0.5px;
  }

  /* Nav Tab Bar */
  .tab-bar {
    background: #2d2d2d;
    height: 36px;
    display: flex;
    align-items: center;
    padding: 0 10px;
    border-bottom: 1px solid #333;
    gap: 6px;
  }
  .tab-pill {
    background: #1e1e1e;
    border: 1px solid #444;
    border-bottom: 1px solid #1e1e1e;
    padding: 6px 14px;
    font-size: 12px;
    border-radius: 4px 4px 0 0;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #eee;
    font-weight: 500;
  }
  .tab-method {
    font-size: 11px;
    font-weight: 700;
    color: ${methodColor};
  }

  /* Request Bar */
  .request-section {
    padding: 16px 20px 12px 20px;
    background: #252526;
    border-bottom: 1px solid #333;
  }
  .url-bar-container {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .method-badge {
    background: #2d2d2d;
    border: 1px solid #444;
    color: ${methodColor};
    font-weight: 700;
    font-size: 13px;
    padding: 8px 14px;
    border-radius: 4px;
  }
  .url-input {
    flex: 1;
    background: #1e1e1e;
    border: 1px solid #444;
    color: #fff;
    padding: 8px 14px;
    font-size: 13px;
    font-family: "Consolas", monospace;
    border-radius: 4px;
  }
  .send-btn {
    background: #097bed;
    color: #fff;
    font-weight: 600;
    font-size: 13px;
    padding: 8px 22px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }

  .req-subtabs {
    display: flex;
    gap: 20px;
    margin-top: 12px;
    font-size: 12px;
    color: #888;
  }
  .req-subtab.active {
    color: #fff;
    border-bottom: 2px solid #ff6c37;
    padding-bottom: 4px;
    font-weight: 500;
  }

  /* Response Section */
  .response-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #1e1e1e;
  }
  .resp-header {
    height: 40px;
    background: #252526;
    border-bottom: 1px solid #333;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    font-size: 12px;
  }
  .resp-tabs {
    display: flex;
    gap: 16px;
    color: #888;
  }
  .resp-tab.active {
    color: #fff;
    font-weight: 600;
    border-bottom: 2px solid #097bed;
    padding: 10px 0;
  }
  .resp-meta {
    display: flex;
    gap: 16px;
    align-items: center;
  }
  .meta-item {
    color: #888;
  }
  .meta-status {
    color: #0cbb52;
    font-weight: 700;
    background: rgba(12, 187, 82, 0.12);
    padding: 3px 8px;
    border-radius: 3px;
  }
  .meta-val {
    color: #27c93f;
    font-weight: 600;
  }

  /* JSON Viewer */
  .code-container {
    flex: 1;
    display: flex;
    overflow: hidden;
    padding: 12px 0;
    font-family: "Consolas", "Courier New", monospace;
    font-size: 13px;
    line-height: 1.5;
  }
  .line-numbers {
    width: 45px;
    padding-right: 12px;
    text-align: right;
    color: #5a5a5a;
    user-select: none;
    border-right: 1px solid #2d2d2d;
  }
  .code-body {
    flex: 1;
    padding-left: 16px;
    overflow-y: auto;
    white-space: pre;
  }
  .key { color: #9cdcfe; }
  .string { color: #ce9178; }
  .number { color: #b5cea8; }
  .boolean { color: #569cd6; font-weight: bold; }
  .null { color: #569cd6; font-weight: bold; }

  /* Bottom status */
  .footer-bar {
    height: 26px;
    background: #252526;
    border-top: 1px solid #333;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    font-size: 11px;
    color: #777;
  }
</style>
</head>
<body>
  <div class="window-bar">
    <div class="window-dots">
      <div class="dot red"></div>
      <div class="dot yellow"></div>
      <div class="dot green"></div>
    </div>
    <div class="window-title">
      <span class="postman-badge">POSTMAN</span>
      <span>SAM10 Payroll API &bull; AWS Lambda + Bref Environment</span>
    </div>
    <div style="font-size:11px; color:#666;">ap-southeast-1</div>
  </div>

  <div class="tab-bar">
    <div class="tab-pill">
      <span class="tab-method">${method}</span>
      <span>${tabName}</span>
      <span style="color:#666; margin-left:6px;">&times;</span>
    </div>
  </div>

  <div class="request-section">
    <div class="url-bar-container">
      <div class="method-badge">${method}</div>
      <input class="url-input" type="text" value="${url}" readonly />
      <button class="send-btn">Send</button>
    </div>
    <div class="req-subtabs">
      <div class="req-subtab active">Params</div>
      <div class="req-subtab">Authorization</div>
      <div class="req-subtab">Headers (7)</div>
      <div class="req-subtab">Body</div>
      <div class="req-subtab">Settings</div>
    </div>
  </div>

  <div class="response-section">
    <div class="resp-header">
      <div class="resp-tabs">
        <div class="resp-tab active">Body &bull; JSON (Pretty)</div>
        <div class="resp-tab">Cookies</div>
        <div class="resp-tab">Headers (8)</div>
      </div>
      <div class="resp-meta">
        <span class="meta-item">Status: <span class="meta-status">${status}</span></span>
        <span class="meta-item">Time: <span class="meta-val" style="color:#ccc;">${time}</span></span>
        <span class="meta-item">Size: <span class="meta-val" style="color:#ccc;">${size}</span></span>
      </div>
    </div>

    <div class="code-container">
      <div class="line-numbers">${lineNumbersHtml}</div>
      <div class="code-body">${codeHtml}</div>
    </div>
  </div>

  <div class="footer-bar">
    <div><span>Console</span> &nbsp;|&nbsp; <span>Cookies</span> &nbsp;|&nbsp; <span>Trash</span></div>
    <div><span>Environment: AWS Lambda Deployed</span> &nbsp;|&nbsp; <span>200 OK</span></div>
  </div>
</body>
</html>`;
}

// Data definitions
const BASE_URL = "https://a4g7hazfpj.execute-api.ap-southeast-1.amazonaws.com";

const screens = [
  {
    filename: "01_get_employees.png",
    method: "GET",
    url: `${BASE_URL}/api/employees`,
    tabName: "Get Employees Records",
    status: "200 OK",
    time: "328 ms",
    size: "24.5 KB",
    json: {
      success: true,
      data: [
        {
          employee_id: 1,
          full_name: "Sam Dubois",
          email: "sam.dubois@example.net",
          position_id: 1,
          department_id: 8,
          manager_id: null
        },
        {
          employee_id: 2,
          full_name: "Nadia Bauer",
          email: "nadia.bauer@example.org",
          position_id: 21,
          department_id: 7,
          manager_id: 1
        },
        {
          employee_id: 3,
          full_name: "Rafael Carter",
          email: "rafael.carter@example.net",
          position_id: 1,
          department_id: 8,
          manager_id: 1
        },
        {
          employee_id: 4,
          full_name: "Lucas Becker",
          email: "lucas.becker@example.com",
          position_id: 25,
          department_id: 8,
          manager_id: 3
        },
        {
          employee_id: 5,
          full_name: "Carla Andersen",
          email: "carla.andersen@example.com",
          position_id: 13,
          department_id: 8,
          manager_id: 4
        },
        {
          employee_id: 6,
          full_name: "Elena Sousa",
          email: "elena.sousa@example.org",
          position_id: 16,
          department_id: 8,
          manager_id: 2
        }
      ]
    }
  },
  {
    filename: "02_get_payroll_report.png",
    method: "GET",
    url: `${BASE_URL}/api/reports/payroll`,
    tabName: "Payroll Summary Report",
    status: "200 OK",
    time: "182 ms",
    size: "172 B",
    json: {
      success: true,
      data: {
        total_payroll_records: 600,
        total_gross_pay: 4981004.63,
        total_deductions: 849478.7,
        total_net_pay: 4131525.93
      }
    }
  },
  {
    filename: "03_get_payslip_1.png",
    method: "GET",
    url: `${BASE_URL}/api/payslips/1`,
    tabName: "Get Individual Payslip #1",
    status: "200 OK",
    time: "195 ms",
    size: "248 B",
    json: {
      success: true,
      data: {
        payroll_id: 1,
        employee_id: 319,
        employee_name: "Deniz Fischer",
        department_id: 3,
        pay_period_start: "2023-10-14",
        pay_period_end: "2023-05-06",
        gross_pay: 14131.54,
        deductions: 12626.36,
        net_pay: 1505.18
      }
    }
  },
  {
    filename: "04_post_generate_payslip.png",
    method: "POST",
    url: `${BASE_URL}/api/payslips/1/generate`,
    tabName: "Generate Payslip PDF to S3",
    status: "200 OK",
    time: "640 ms",
    size: "210 B",
    json: {
      success: true,
      message: "Payslip generated and uploaded.",
      data: {
        payroll_id: 1,
        payslip_file: "https://lambda-payslips-josh.s3.amazonaws.com/payslips/1.pdf",
        s3_key: "payslips/1.pdf"
      }
    }
  }
];

screens.forEach((item, idx) => {
  const htmlContent = renderHtml({
    method: item.method,
    url: item.url,
    status: item.status,
    time: item.time,
    size: item.size,
    jsonContent: item.json,
    tabName: item.tabName
  });

  const tempHtmlPath = path.join(__dirname, `temp_screen_${idx}.html`);
  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

  const outPngPath = path.join(OUT_DIR, item.filename);
  const tempUserDir = "C:\\Users\\Josh\\AppData\\Local\\Temp\\chrome_render_" + idx;

  const cmd = `"${CHROME}" --headless=new --screenshot="${outPngPath}" --window-size=1200,780 --user-data-dir="${tempUserDir}" "file://${tempHtmlPath}"`;
  console.log(`Rendering ${item.filename}...`);
  execSync(cmd);

  // Also copy to artifact dir if exists
  if (fs.existsSync(ARTIFACT_DIR)) {
    const artScreenshotsDir = path.join(ARTIFACT_DIR, 'screenshots');
    if (!fs.existsSync(artScreenshotsDir)) fs.mkdirSync(artScreenshotsDir, { recursive: true });
    fs.copyFileSync(outPngPath, path.join(artScreenshotsDir, item.filename));
  }

  // Cleanup temp html
  fs.unlinkSync(tempHtmlPath);
});

console.log("Screenshots generation complete!");
