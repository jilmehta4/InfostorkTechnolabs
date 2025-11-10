import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3001;

if (!process.env.OPENAI_API_KEY) {
  console.warn("[WARN] OPENAI_API_KEY is not set. Requests will fail.");
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Missing prompt" });
    }
    console.log(`[INFO] /api/chat ${new Date().toISOString()} prompt: ${prompt.slice(0, 80)}...`);

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant embedded in a web app." },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 300
    });

    const answer = completion.choices?.[0]?.message?.content ?? "";
    return res.json({ answer });
  } catch (err) {
    console.error("[ERROR] /api/chat", err);
    const message = err?.message || "Unknown error";
    return res.status(500).json({ error: message });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.listen(port, () => {
  console.log(`[OK] Server listening on http://localhost:${port}`);
});
