import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadTranscript } = require("./utils/transcriptLoader.cjs");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Load transcripts once at startup
let transcriptTexts = {
  en: "",
  hi: "",
  gu: "",
  mr: "",
  te: ""
};

async function initTranscripts() {
  try {
    transcriptTexts.en = await loadTranscript("en");
    transcriptTexts.hi = await loadTranscript("hi");
    transcriptTexts.gu = await loadTranscript("gu");
    transcriptTexts.mr = await loadTranscript("mr");
    transcriptTexts.te = await loadTranscript("te");
  } catch (err) {
    console.error("[ERROR] Unable to load transcripts:", err.message);
  }
}

await initTranscripts();

// --- Chat Route ---
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt, language = "en" } = req.body || {};
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    // Validate language - default to English if not supported
    const supportedLanguages = ["en", "hi", "gu", "mr", "te"];
    const lang = supportedLanguages.includes(language) ? language : "en";
    const transcriptText = transcriptTexts[lang] || "";

    console.log(`[INFO] /api/chat ${new Date().toISOString()} [${lang.toUpperCase()}] prompt: ${prompt.slice(0, 80)}...`);

    // Language-specific system prompts
    const systemPrompts = {
      en: transcriptText
        ? "You are an AI trained to answer only using the provided transcript of His Holiness Swamiji. Use the text to summarize or respond factually. Always respond in English."
        : "You are a helpful assistant. Always respond in English.",
      hi: transcriptText
        ? "आप एक AI हैं जो केवल प्रदान किए गए स्वामीजी के ट्रांसक्रिप्ट का उपयोग करके उत्तर देने के लिए प्रशिक्षित हैं। पाठ का उपयोग करके तथ्यात्मक रूप से सारांश या उत्तर दें। हमेशा हिंदी में उत्तर दें।"
        : "आप एक सहायक सहायक हैं। हमेशा हिंदी में उत्तर दें।",
      gu: transcriptText
        ? "તમે એક AI છો જે માત્ર પ્રદાન કરેલા સ્વામીજીના ટ્રાન્સક્રિપ્ટનો ઉપયોગ કરીને જવાબ આપવા માટે તાલીમ આપવામાં આવી છે. ટેક્સ્ટનો ઉપયોગ કરીને તથ્યાત્મક રીતે સારાંશ અથવા જવાબ આપો. હંમેશા ગુજરાતીમાં જવાબ આપો."
        : "તમે એક મદદગાર સહાયક છો. હંમેશા ગુજરાતીમાં જવાબ આપો.",
      mr: transcriptText
        ? "तुम्ही एक AI आहात जे फक्त प्रदान केलेल्या स्वामीजीच्या ट्रान्सक्रिप्टचा वापर करून उत्तर देण्यासाठी प्रशिक्षित आहात. मजकूर वापरून तथ्यात्मकपणे सारांश किंवा उत्तर द्या. नेहमी मराठीत उत्तर द्या."
        : "तुम्ही एक सहाय्यक सहाय्यक आहात. नेहमी मराठीत उत्तर द्या.",
      te: transcriptText
        ? "మీరు ఒక AI, ఇది అందించిన స్వామీజీ యొక్క ట్రాన్స్క్రిప్ట్‌ను మాత్రమే ఉపయోగించి సమాధానం ఇవ్వడానికి శిక్షణ పొందింది. వచనాన్ని ఉపయోగించి వాస్తవికంగా సారాంశం లేదా సమాధానం ఇవ్వండి. ఎల్లప్పుడూ తెలుగులో సమాధానం ఇవ్వండి."
        : "మీరు ఒక సహాయక సహాయకుడు. ఎల్లప్పుడూ తెలుగులో సమాధానం ఇవ్వండి."
    };

    const systemPrompt = systemPrompts[lang] || systemPrompts.en;

    const userMessage = transcriptText
      ? `Transcript:\n${transcriptText.slice(0, 12000)}\n\nQuestion: ${prompt}`
      : prompt;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.6,
      max_tokens: 500
    });

    // Language-specific error messages
    const errorMessages = {
      en: "No answer generated.",
      hi: "कोई उत्तर उत्पन्न नहीं हुआ।",
      gu: "કોઈ જવાબ જનરેટ થયો નથી.",
      mr: "कोणतेही उत्तर व्युत्पन्न झाले नाही.",
      te: "సమాధానం రూపొందించబడలేదు."
    };

    const answer = completion.choices?.[0]?.message?.content ?? (errorMessages[lang] || errorMessages.en);
    res.json({ answer });
  } catch (err) {
    console.error("[ERROR] /api/chat", err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

// --- Reload Transcript Route ---
app.post("/api/reload-transcript", async (req, res) => {
  try {
    const { language = "en" } = req.body || {};
    const supportedLanguages = ["en", "hi", "gu", "mr", "te"];
    const lang = supportedLanguages.includes(language) ? language : "en";
    const languageNames = { en: "English", hi: "Hindi", gu: "Gujarati", mr: "Marathi", te: "Telugu" };
    transcriptTexts[lang] = await loadTranscript(lang);
    res.json({ 
      success: true, 
      message: `${languageNames[lang]} transcript reloaded successfully.` 
    });
  } catch (err) {
    console.error("[ERROR] Reload transcript:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- Health Check ---
app.get("/health", (_req, res) =>
  res.json({ ok: true, time: new Date().toISOString() })
);

// --- Start Server ---
app.listen(port, () => {
  console.log(`[OK] Server running on http://localhost:${port}`);
});
