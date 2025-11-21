// backend/utils/transcriptLoader.cjs
const fs = require("fs");
let pdfParse = require("pdf-parse-fixed");
if (pdfParse.default) pdfParse = pdfParse.default;

// Handle both module systems (some versions export as { default: fn })
if (pdfParse.default) {
  pdfParse = pdfParse.default;
}

const cachedTexts = {
  en: "",
  hi: ""
};

async function loadTranscript(language = "en") {
  // Validate language
  const lang = language === "hi" ? "hi" : "en";
  
  // Return cached if available
  if (cachedTexts[lang]) return cachedTexts[lang];

  const folder = "./transcripts";
  const files = fs.existsSync(folder) ? fs.readdirSync(folder) : [];
  
  let pdfFile;
  if (lang === "hi") {
    // Look for Hindi version
    pdfFile = files.find(f => 
      f.toLowerCase().includes("hindi") || 
      f.toLowerCase().includes("[hindi")
    );
  } else {
    // Look for English version (exclude Hindi)
    pdfFile = files.find(f => 
      f.toLowerCase().endsWith(".pdf") && 
      !f.toLowerCase().includes("hindi") &&
      !f.toLowerCase().includes("[hindi")
    );
  }

  if (!pdfFile) {
    console.warn(`[WARN] No ${lang === "hi" ? "Hindi" : "English"} PDF transcript found in /transcripts folder.`);
    return "";
  }

  console.log(`[INFO] Loading ${lang === "hi" ? "Hindi" : "English"} transcript from ${pdfFile} ...`);
  const dataBuffer = fs.readFileSync(`${folder}/${pdfFile}`);

  // ✅ robust version handles all exports properly
  const pdfData = await pdfParse(dataBuffer);
  cachedTexts[lang] = pdfData.text.replace(/\s+/g, " ").trim();

  console.log(`[OK] ${lang === "hi" ? "Hindi" : "English"} transcript loaded (${cachedTexts[lang].length} characters).`);
  return cachedTexts[lang];
}

module.exports = { loadTranscript };
