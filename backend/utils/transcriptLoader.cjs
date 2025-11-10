// backend/utils/transcriptLoader.cjs
const fs = require("fs");
let pdfParse = require("pdf-parse-fixed");
if (pdfParse.default) pdfParse = pdfParse.default;

// Handle both module systems (some versions export as { default: fn })
if (pdfParse.default) {
  pdfParse = pdfParse.default;
}

let cachedText = "";

async function loadTranscript() {
  if (cachedText) return cachedText;

  const folder = "./transcripts";
  const files = fs.existsSync(folder) ? fs.readdirSync(folder) : [];
  const pdfFile = files.find(f => f.toLowerCase().endsWith(".pdf"));

  if (!pdfFile) {
    console.warn("[WARN] No PDF transcript found in /transcripts folder.");
    return "";
  }

  console.log(`[INFO] Loading transcript from ${pdfFile} ...`);
  const dataBuffer = fs.readFileSync(`${folder}/${pdfFile}`);

  // ✅ robust version handles all exports properly
  const pdfData = await pdfParse(dataBuffer);
  cachedText = pdfData.text.replace(/\s+/g, " ").trim();

  console.log(`[OK] Transcript loaded (${cachedText.length} characters).`);
  return cachedText;
}

module.exports = { loadTranscript };
