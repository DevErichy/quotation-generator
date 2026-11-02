/* Quotation + invoice layouts for pdfmake. Works in the browser and in Node. */
(function (root) {
  const NAVY = "#2e3192", SKY = "#4aa8e0", BLUE = "#4a7fd0", GREY = "#e6e6e6";
  const W = 595.28, H = 841.89, CW = 505; // page size and content width (pt)

  const lines = (s) => String(s || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const fmtDate = (iso) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    return m ? `${m[3]}/${m[2]}/${m[1]}` : iso || "";
  };
  const money = (n, fixed) =>
    Number(n || 0).toLocaleString("en-US", {
      minimumFractionDigits: fixed ? 2 : 0,
      maximumFractionDigits: 2,
    });

  const header = (label) => [
    {
      columns: [
        { image: root.PF_LOGO, width: 200 },
        {
          width: "*", alignment: "right", fontSize: 9.5, lineHeight: 1.15,
          stack: [
            { text: "PF Cleaning Services Ltd\nP.O Box 23680-0100\nWestlands Mashin House Ground Floor", margin: [0, 0, 0, 8] },
            { text: "Phone: +254752302780\nEmail: pfcleaningservicesinternationa@gmail.com\nwebsite: www.pfcleaningkenya.co.ke" },
          ],
        },
      ],
    },
    { canvas: [{ type: "line", x1: 0, y1: 0, x2: CW, y2: 0, lineWidth: 0.8, lineColor: GREY }], margin: [0, 12, 0, 0] },
    // Pill: two end caps + a rectangle, with the label overlaid using a negative margin
    {
      canvas: [
        { type: "ellipse", x: 20, y: 18, r1: 20, r2: 18, color: NAVY },
        { type: "ellipse", x: 140, y: 18, r1: 20, r2: 18, color: NAVY },
        { type: "rect", x: 20, y: 0, w: 120, h: 36, color: NAVY },
      ],
      margin: [(CW - 160) / 2, 22, 0, 0],
    },
    { text: label, alignment: "center", bold: true, color: "#fff", fontSize: 15, margin: [0, -27, 0, 22] },
  ];

  const th = (t) => ({ text: t, bold: true, color: "#fff", fillColor: SKY, alignment: "center", fontSize: 10.5, margin: [0, 7, 0, 7] });

  const sigRow = (label) => ({
    columns: [
      { text: label + ":", width: 62, fontSize: 10.5 },
      { width: 165, canvas: [{ type: "line", x1: 0, y1: 14, x2: 165, y2: 14, lineWidth: 0.8 }] },
    ],
    margin: [0, 0, 0, 5],
  });
  const sigBlock = (who) => ({
    width: "*",
    stack: [{ text: "SIGNED BY/FOR " + who, bold: true, fontSize: 10.5, margin: [0, 0, 0, 8] },
      ...["Signature", "Name", "Position", "Stamp"].map(sigRow)],
  });

  function buildQuotation(d) {
    const cur = d.currency || "KES";
    const amount = `${cur} ${money(d.amount)}`;
    const bold = (t) => ({ text: t, bold: true });
    return {
      pageSize: "A4",
      pageMargins: [45, 28, 45, 185],
      defaultStyle: { fontSize: 10, lineHeight: 1.2 },
      content: [
        ...header("QUOTATION"),
        {
          columns: [
            { width: "*", stack: [{ text: "BILL TO:", bold: true, characterSpacing: 1 }, ...lines(d.billTo).map((l) => ({ text: l }))] },
            {
              width: 200, alignment: "right", fontSize: 11, lineHeight: 1.4,
              stack: [{ text: [bold("Estimate Date: "), fmtDate(d.estimateDate)] }, { text: [bold("Expires On: "), fmtDate(d.expiresOn)] }],
            },
          ],
        },
        {
          margin: [0, 18, 0, 0],
          table: {
            headerRows: 1, widths: [150, 125, 105, "*"],
            body: [
              [th("SCOPE OF WORK"), th("QUANTITY"), th("EXECUTION DETAILS"), th("AMOUNT")],
              [
                { ol: lines(d.scope), margin: [0, 10, 0, 10] },
                { ul: lines(d.quantity), margin: [0, 10, 0, 10] },
                { margin: [0, 10, 0, 10], stack: [
                  { text: [bold("Duration: "), d.duration || ""] },
                  { text: [bold("Team Size: "), d.teamSize || ""], margin: [0, 6, 0, 0] } ] },
                { text: amount, bold: true, alignment: "center", margin: [0, 10, 0, 0] },
              ],
            ],
          },
          layout: {
            hLineWidth: () => 0,
            vLineWidth: (i, node) => (i > 0 && i < node.table.widths.length ? 1.5 : 0),
            vLineColor: () => "#fff",
            paddingLeft: () => 6, paddingRight: () => 6, paddingTop: () => 0, paddingBottom: () => 0,
          },
        },
        { canvas: [{ type: "line", x1: 0, y1: 0, x2: CW, y2: 0, lineWidth: 0.8, lineColor: GREY }], margin: [0, 6, 0, 8] },
        { text: "Total: " + amount, bold: true, fontSize: 10.5, alignment: "right", margin: [0, 0, 6, 0] },
      ],
      // Notes and signature blocks sit in the page footer (last page only)
      footer: (page, count) =>
        page !== count ? { text: "" } : {
          margin: [45, 0, 45, 0],
          stack: [
            { fontSize: 8.5, margin: [0, 0, 0, 14], stack: [
              { text: "Note/Terms", bold: true, margin: [0, 0, 0, 2] },
              ...lines(d.notes).map((l) => ({ text: l })) ] },
            { columnGap: 20, columns: [sigBlock("CLIENT"), sigBlock("SERVICE PROVIDER")] },
          ],
        },
    };
  }

  function buildInvoice(d) {
    const cur = d.currency || "KES";
    const items = Array.isArray(d.items) ? d.items : [];
    const sub = items.reduce((t, i) => t + (Number(i.price) || 0), 0);
    const nb = [false, false, false, false];
    const wb = ["#ffffff", "#ffffff", "#ffffff", "#ffffff"];
    const info = (t) => ({ text: t, bold: true, color: NAVY, fontSize: 10.5 });
    const rows = items.map((i) => [
      { ol: lines(i.service), margin: [0, 4, 0, 4] },
      { ul: lines(i.quantity), margin: [0, 4, 0, 4] },
      { text: money(i.price, true), alignment: "right", margin: [0, 4, 0, 0] },
      { text: money(i.price, true), alignment: "right", margin: [0, 4, 0, 0] },
    ]);
    const totalRow = (label) => [
      { text: "", colSpan: 2, border: nb }, {},
      { text: label, bold: true, color: NAVY, alignment: "right", margin: [0, 5, 0, 5] },
      { text: money(sub, true), bold: true, alignment: "right", margin: [0, 5, 0, 5] },
    ];
    return {
      pageSize: "A4",
      pageMargins: [45, 28, 45, 135],
      defaultStyle: { fontSize: 10, lineHeight: 1.25 },
      content: [
        ...header("INVOICE"),
        {
          margin: [0, 6, 0, 0],
          table: { widths: ["*", "*"], body: [
            [info("NAME: " + (d.clientName || "")), info("L.P.O No: " + (d.lpoNo || ""))],
            [info("INVOICE No: " + (d.invoiceNo || "")), info("DATE: " + fmtDate(d.date))],
          ] },
          layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => SKY, vLineColor: () => SKY,
            paddingLeft: () => 10, paddingRight: () => 10, paddingTop: () => 12, paddingBottom: () => 12 },
        },
        {
          margin: [0, 22, 0, 0],
          table: {
            headerRows: 1, widths: [135, 115, 95, "*"],
            body: [
              ["SERVICE", "QUANTITY", `PRICE (${cur})`, `TOTAL (${cur})`].map((t) => ({ ...th(t), borderColor: wb })),
              ...rows, totalRow("SUB-TOTAL"), totalRow("TOTAL"),
            ],
          },
          layout: { hLineWidth: () => 1, vLineWidth: () => 1, hLineColor: () => "#333", vLineColor: () => "#333",
            paddingLeft: () => 8, paddingRight: () => 8, paddingTop: () => 0, paddingBottom: () => 0 },
        },
      ],
      footer: () => ({
        margin: [45, 0, 45, 0],
        stack: [
          { width: 300, text: d.paymentNote || "", color: BLUE, bold: true, fontSize: 9.5, margin: [0, 0, 0, 22] },
          { columns: [
            { width: "*", text: `\u00A9 Point of Favour ${new Date().getFullYear()} All rights reserved`, color: BLUE, bold: true, fontSize: 9.5, margin: [0, 28, 0, 0] },
            { width: 175, stack: [
              { canvas: [{ type: "line", x1: 0, y1: 0, x2: 175, y2: 0, lineWidth: 0.8, lineColor: BLUE }] },
              { text: "With Thanks\nPoint of Favour", color: BLUE, bold: true, fontSize: 11, margin: [40, 6, 0, 0] } ] },
          ] },
        ],
      }),
    };
  }

  const api = { buildQuotation, buildInvoice };
  root.PFDocs = api;
  if (typeof module !== "undefined") module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
