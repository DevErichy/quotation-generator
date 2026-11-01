const { esc, lines, fmtDate, money, logo } = require("./template");

function renderInvoice(d) {
  const m = (n) => money(n) + (Number.isInteger(n) ? ".00" : "");
  const items = Array.isArray(d.items) ? d.items : [];
  const sub = items.reduce((t, i) => t + (Number(i.price) || 0), 0);
  const rows = items
    .map(
      (i) => `<tr>
        <td><ol>${lines(i.service)
          .map((l) => `<li>${esc(l)}</li>`)
          .join("")}</ol></td>
        <td><ul>${lines(i.quantity)
          .map((l) => `<li>${esc(l)}</li>`)
          .join("")}</ul></td>
        <td class="num">${m(+i.price || 0)}</td>
        <td class="num">${m(+i.price || 0)}</td></tr>`,
    )
    .join("");
  const currency = esc(d.currency || "KES");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Invoice</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; }
  .page { position: relative; width: 210mm; height: 296.6mm; padding: 10mm 16mm 0; overflow: hidden;
          display: flex; flex-direction: column; }
  header { display: flex; justify-content: space-between; align-items: flex-start;
           padding-bottom: 5mm; border-bottom: 1px solid #e6e6e6; }
  header img { width: 70mm; }
  .company { text-align: right; font-size: 10.5pt; line-height: 1.45; }
  .company p { margin: 0 0 4mm; }
  .pill { margin: 8mm auto 0; width: 56mm; height: 12mm; line-height: 12mm; text-align: center;
          background: #2e3192; color: #fff; font-weight: 700; font-size: 16pt; border-radius: 6mm; }
  .info { width: 100%; border-collapse: collapse; margin-top: 10mm; border: 1px solid #4aa8e0; }
  .info td { width: 50%; padding: 4.5mm 4mm; border: 1px solid #4aa8e0; color: #2e3192; font-weight: 700; font-size: 11pt; }
  table.items { width: 100%; border-collapse: collapse; margin-top: 8mm; }
  .items th { background: #4aa8e0; color: #fff; padding: 3.5mm 2mm; font-size: 11pt; border-right: 2px solid #fff; }
  .items th:last-child { border-right: 0; }
  .items td { border: 1px solid #333; padding: 3mm; vertical-align: top; font-size: 10.5pt; line-height: 1.5; }
  .items td ol, .items td ul { margin: 0; padding-left: 6mm; }
  .items td.num { text-align: right; }
  .items td.blank { border: 0; }
  .items td.lbl { text-align: right; color: #2e3192; font-weight: 700; }
  .items td.amt { text-align: right; font-weight: 700; }
  .grow { flex: 1; }
  .pay { color: #4a7fd0; font-weight: 700; font-size: 10pt; max-width: 110mm; line-height: 1.4; margin-bottom: 16mm; }
  .foot { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 21mm; color: #4a7fd0;
          font-weight: 700; font-size: 10pt; }
  .thanks { border-top: 1px solid #4a7fd0; padding: 3mm 0 0 14mm; width: 62mm; font-size: 11pt; line-height: 1.4; }
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
  <div class="pill">INVOICE</div>

  <table class="info">
    <tr><td>NAME: ${esc(d.clientName)}</td><td>L.P.O No: ${esc(d.lpoNo)}</td></tr>
    <tr><td>INVOICE No: ${esc(d.invoiceNo)}</td><td>DATE: ${fmtDate(d.date)}</td></tr>
  </table>

  <table class="items">
    <thead><tr><th style="width:33%">SERVICE</th><th style="width:27%">QUANTITY</th>
      <th style="width:20%">PRICE (${currency})</th><th style="width:20%">TOTAL (${currency})</th></tr></thead>
    <tbody>
      ${rows}
      <tr><td class="blank" colspan="2"></td><td class="lbl">SUB-TOTAL</td><td class="amt">${m(sub)}</td></tr>
      <tr><td class="blank" colspan="2"></td><td class="lbl">TOTAL</td><td class="amt">${m(sub)}</td></tr>
    </tbody>
  </table>

  <div class="grow"></div>
  <div class="pay">${esc(d.paymentNote)}</div>
  <div class="foot">
    <div>&copy; Point of Favour ${new Date().getFullYear()} All rights reserved</div>
    <div class="thanks">With Thanks<br>Point of Favour</div>
  </div>
  
</div></body></html>`;
}

module.exports = { renderInvoice };
