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
  hi: ""
};

async function initTranscripts() {
  try {
    transcriptTexts.en = await loadTranscript("en");
    transcriptTexts.hi = await loadTranscript("hi");
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

    const lang = language === "hi" ? "hi" : "en";
    const transcriptText = transcriptTexts[lang];

    console.log(`[INFO] /api/chat ${new Date().toISOString()} [${lang.toUpperCase()}] prompt: ${prompt.slice(0, 80)}...`);

    const systemPrompt = transcriptText
      ? lang === "hi"
        ? "आप एक AI हैं जो केवल प्रदान किए गए स्वामीजी के ट्रांसक्रिप्ट का उपयोग करके उत्तर देने के लिए प्रशिक्षित हैं। पाठ का उपयोग करके तथ्यात्मक रूप से सारांश या उत्तर दें। हमेशा हिंदी में उत्तर दें।"
        : "You are an AI trained to answer only using the provided transcript of His Holiness Swamiji. Use the text to summarize or respond factually. Always respond in English."
      : lang === "hi"
        ? "आप एक सहायक सहायक हैं। हमेशा हिंदी में उत्तर दें।"
        : "You are a helpful assistant. Always respond in English.";

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

    const answer = completion.choices?.[0]?.message?.content ?? (lang === "hi" ? "कोई उत्तर उत्पन्न नहीं हुआ।" : "No answer generated.");
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
    const lang = language === "hi" ? "hi" : "en";
    transcriptTexts[lang] = await loadTranscript(lang);
    res.json({ 
      success: true, 
      message: `${lang === "hi" ? "Hindi" : "English"} transcript reloaded successfully.` 
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
