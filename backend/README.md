# AI Chatbot Backend (Express + OpenAI)

## Setup
```bash
cd backend
cp .env.example .env   # add your OpenAI key
npm install
npm run dev
```

- Endpoint: `POST /api/chat` with JSON: `{ "prompt": "Hello" }`
- Health check: `GET /health`
