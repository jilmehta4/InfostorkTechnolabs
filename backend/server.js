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

// Load transcript once at startup
let transcriptText = "";

async function initTranscript() {
  try {
    transcriptText = await loadTranscript();
  } catch (err) {
    console.error("[ERROR] Unable to load transcript:", err.message);
  }
}

await initTranscript();

// --- Chat Route ---
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    console.log(`[INFO] /api/chat ${new Date().toISOString()} prompt: ${prompt.slice(0, 80)}...`);

    const systemPrompt = transcriptText
      ? "You are an AI trained to answer only using the provided transcript of His Holiness Swamiji. Use the text to summarize or respond factually."
      : "You are a helpful assistant.";

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

    const answer = completion.choices?.[0]?.message?.content ?? "No answer generated.";
    res.json({ answer });
  } catch (err) {
    console.error("[ERROR] /api/chat", err);
    res.status(500).json({ error: err.message || "Internal error" });
  }
});

// --- Reload Transcript Route ---
app.post("/api/reload-transcript", async (req, res) => {
  try {
    transcriptText = await loadTranscript();
    res.json({ success: true, message: "Transcript reloaded successfully." });
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
