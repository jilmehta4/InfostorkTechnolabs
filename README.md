# AI Integration Prototype — Phase 2 (React + Express + OpenAI API)

This repository contains a minimal full‑stack prototype to demonstrate AI chat integration.

## Structure
- `backend/` — Express server exposing `/api/chat` and calling OpenAI.
- `frontend/` — React (Vite) app with a simple chat UI.

## Prerequisites
- Node.js 18+
- An OpenAI API key

## Quick Start

### 1) Backend
```bash
cd backend
cp .env.example .env    # put your OPENAI_API_KEY
npm install
npm run dev
```

### 2) Frontend (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173) and start chatting.
