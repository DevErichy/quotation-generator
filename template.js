const fs = require("fs");
const path = require("path");

const logo =
  "data:image/png;base64," +
  fs.readFileSync(path.join(__dirname, "public", "logo.png")).toString("base64");

const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const lines = (s = "") =>
  String(s)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

// 2026-10-26 -> 26/10/2026
const fmtDate = (iso = "") => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : esc(iso);
};

const money = (n) =>
  Number(n || 0).toLocaleString("en-KE", { maximumFractionDigits: 2 });

function renderQuotation(d) {
  const scope = lines(d.scope).map((l) => `<li>${esc(l)}</li>`).join("");
  const qty = lines(d.quantity).map((l) => `<li>${esc(l)}</li>`).join("");
  const notes = lines(d.notes).map((l) => `<div>${esc(l)}</div>`).join("");
  const billTo = lines(d.billTo).map((l) => `<div>${esc(l)}</div>`).join("");
  const currency = esc(d.currency || "KES");
  const amount = `${currency} ${money(d.amount)}`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Quotation</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; font-size: 12pt; }
  .page { position: relative; width: 210mm; height: 296.6mm; padding: 10mm 16mm 0; overflow: hidden; }
  header { display: flex; justify-content: space-between; align-items: flex-start;
           padding-bottom: 5mm; border-bottom: 1px solid #e6e6e6; }
  header img { width: 70mm; }
  .company { text-align: right; font-size: 10.5pt; line-height: 1.45; }
  .company p { margin: 0 0 4mm; }
  .pill { margin: 7mm auto 0; width: 56mm; height: 12mm; line-height: 12mm; text-align: center;
          background: #2e3192; color: #fff; font-weight: 700; font-size: 16pt; border-radius: 6mm; }
  .meta { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 4mm; }
  .billto { font-size: 10.5pt; line-height: 1.4; }
  .billto b { letter-spacing: 1px; }
  .dates { text-align: right; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; margin-top: 7mm; }
  th { background: #4aa8e0; color: #fff; padding: 3.5mm 2mm; font-size: 10.5pt; border-right: 2px solid #fff; }
  th:last-child { border-right: 0; }
  td { vertical-align: top; padding: 4mm 2mm; font-size: 10pt; line-height: 1.4; }
  td ol, td ul { margin: 0; padding-left: 7mm; }
  td.amount { text-align: center; font-weight: 700; white-space: nowrap; }
  .exec p { margin: 0 0 3mm; }
  .totalrow { border-top: 1px solid #e6e6e6; margin-top: 2mm; padding-top: 4mm;
              display: flex; justify-content: space-between; }
  .notes { font-size: 9.5pt; line-height: 1.4; }
  .notes b { display: block; margin-bottom: 1mm; }
  .total { font-weight: 700; font-size: 11.5pt; }
  .sign { display: flex; justify-content: space-between; gap: 10mm; margin-top: 8mm; }
  .sign div.col { width: 50%; }
  .sign h4 { margin: 0 0 3mm; font-size: 11.5pt; }
  .sign .row { display: flex; align-items: flex-end; margin-bottom: 3mm; font-size: 11pt; }
  .sign .row span.line { flex: 1; border-bottom: 1px solid #111; margin-left: 2mm; height: 5mm; }
  .bar1 { position: absolute; left: 0; bottom: 0; width: 72%; height: 12mm; background: #2e3192;
          clip-path: polygon(0 0, 96% 0, 100% 100%, 0 100%); }
  .bar2 { position: absolute; right: 0; bottom: 0; width: 30%; height: 17mm; background: #4aa8e0;
          clip-path: polygon(8% 0, 100% 0, 100% 100%, 0 100%); }
</style></head>
<body><div class="page">
  <header>
    <img src="${logo}" alt="PF Cleaning Services">
    <div class="company">
      <p>PF Cleaning Services Ltd<br>P.O Box 23680-0100<br>Westlands Mashin House Ground Floor</p>
      <p>Phone: +254752302780<br>Email: pfcleaningservicesinternationa@gmail.com<br>website: www.pfcleaningkenya.co.ke</p>
    </div>
  </header>

  <div class="pill">QUOTATION</div>

  <div class="meta">
    <div class="billto"><b>BILL TO:</b>${billTo}</div>
    <div class="dates">
      <div><b>Estimate Date:</b> ${fmtDate(d.estimateDate)}</div>
      <div><b>Expires On:</b> ${fmtDate(d.expiresOn)}</div>
    </div>
  </div>

  <table>
    <thead><tr>
      <th style="width:33%">SCOPE OF WORK</th>
      <th style="width:28%">QUANTITY</th>
      <th style="width:21%">EXECUTION DETAILS</th>
      <th style="width:18%">AMOUNT</th>
    </tr></thead>
    <tbody><tr>
      <td><ol>${scope}</ol></td>
      <td><ul>${qty}</ul></td>
      <td class="exec">
        <p><b>Duration:</b> ${esc(d.duration)}</p>
        <p><b>Team Size:</b> ${esc(d.teamSize)}</p>
      </td>
      <td class="amount">${amount}</td>
    </tr></tbody>
  </table>

  <div class="totalrow">
    <div class="notes"><b>Note/Terms</b>${notes}</div>
    <div class="total">Total: ${amount}</div>
  </div>

  <div class="sign">
    ${["CLIENT", "SERVICE PROVIDER"]
      .map(
        (who) => `<div class="col"><h4>SIGNED BY/FOR ${who}</h4>
        ${["Signature", "Name", "Position", "Stamp"]
          .map((f) => `<div class="row">${f}:<span class="line"></span></div>`)
          .join("")}</div>`
      )
      .join("")}
  </div>

  <div class="bar1"></div><div class="bar2"></div>
</div></body></html>`;
}

module.exports = { renderQuotation, esc, lines, fmtDate, money, logo };
