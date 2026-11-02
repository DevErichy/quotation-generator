// Optional: tiny static server for local use. The app is plain static files in /public,
// so you can also upload that folder to any static host (Netlify, GitHub Pages, cPanel...).
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "public")));
app.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));
