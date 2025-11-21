// backend/utils/transcriptLoader.cjs
const fs = require("fs");
let pdfParse = require("pdf-parse-fixed");
if (pdfParse.default) pdfParse = pdfParse.default;

// Handle both module systems (some versions export as { default: fn })
if (pdfParse.default) {
  pdfParse = pdfParse.default;
}

// Language mapping: code -> exact filenames and search terms
const languageFileMap = {
  en: {
    exact: ["hisholinessswamiji.pdf"],
    contains: ["english", "en"]
  },
  hi: {
    exact: [],
    contains: ["hindi", "hi", "[hindi"]
  },
  gu: {
    exact: ["gujarati.pdf"],
    contains: ["gujarati", "gu", "[gujarati"]
  },
  mr: {
    exact: ["marathi.pdf"],
    contains: ["marathi", "mr", "[marathi"]
  },
  te: {
    exact: ["telugu.pdf"],
    contains: ["telugu", "te", "[telugu"]
  }
};

const languageNames = {
  en: "English",
  hi: "Hindi",
  gu: "Gujarati",
  mr: "Marathi",
  te: "Telugu"
};

const cachedTexts = {
  en: "",
  hi: "",
  gu: "",
  mr: "",
  te: ""
};

async function loadTranscript(language = "en") {
  // Validate language - default to English if not supported
  const supportedLanguages = Object.keys(languageFileMap);
  const lang = supportedLanguages.includes(language) ? language : "en";
  
  // Return cached if available
  if (cachedTexts[lang]) return cachedTexts[lang];

  const folder = "./transcripts";
  const files = fs.existsSync(folder) ? fs.readdirSync(folder) : [];
  
  let pdfFile;
  const langConfig = languageFileMap[lang];
  
  // First, try to find exact filename matches
  if (langConfig.exact.length > 0) {
    pdfFile = files.find(f => {
      const lower = f.toLowerCase();
      return langConfig.exact.some(exactName => lower === exactName);
    });
  }
  
  // If no exact match, try contains search
  if (!pdfFile && langConfig.contains.length > 0) {
    pdfFile = files.find(f => {
      const lower = f.toLowerCase();
      return lower.endsWith(".pdf") && 
        langConfig.contains.some(term => lower.includes(term));
    });
  }
  
  // For English, if still not found, look for files without language indicators
  if (!pdfFile && lang === "en") {
    pdfFile = files.find(f => {
      const lower = f.toLowerCase();
      return lower.endsWith(".pdf") && 
        !lower.includes("hindi") && 
        !lower.includes("gujarati") &&
        !lower.includes("marathi") &&
        !lower.includes("telugu") &&
        !lower.includes("[hindi") &&
        !lower.includes("[gujarati") &&
        !lower.includes("[marathi") &&
        !lower.includes("[telugu");
    });
  }

  if (!pdfFile) {
    console.warn(`[WARN] No ${languageNames[lang]} PDF transcript found in /transcripts folder.`);
    return "";
  }

  console.log(`[INFO] Loading ${languageNames[lang]} transcript from ${pdfFile} ...`);
  const dataBuffer = fs.readFileSync(`${folder}/${pdfFile}`);

  // ✅ robust version handles all exports properly
  const pdfData = await pdfParse(dataBuffer);
  cachedTexts[lang] = pdfData.text.replace(/\s+/g, " ").trim();

  console.log(`[OK] ${languageNames[lang]} transcript loaded (${cachedTexts[lang].length} characters).`);
  return cachedTexts[lang];
}

module.exports = { loadTranscript };
