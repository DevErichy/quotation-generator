const express = require("express");
const path = require("path");
const puppeteer = require("puppeteer");
const { renderQuotation } = require("./template");
const { renderInvoice } = require("./invoice");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

let browserPromise;
const getBrowser = () =>
  (browserPromise ||= (async () => {
    if (process.env.VERCEL) {
      const chromium = require("@sparticuz/chromium");
      return puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    }

    return puppeteer.launch({
      headless: "new",
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  })());

app.post(["/api/quotation.pdf", "/api/pdf"], async (req, res) => {
  let page;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    await page.setContent((req.body?.type === "invoice" ? renderInvoice : renderQuotation)(req.body || {}), { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    const safe = String(req.body?.fileName || req.body?.type || "quotation")
      .replace(/[^a-z0-9-_ ]/gi, "")
      .trim() || "quotation";

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${safe}.pdf"`,
    });
    res.send(Buffer.from(pdf));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not generate the PDF." });
  } finally {
    if (page) await page.close();
  }
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Quotation app running at http://localhost:${PORT}`));

  process.on("SIGINT", async () => {
    if (browserPromise) await (await browserPromise).close();
    process.exit(0);
  });
}

module.exports = app;
