# Spur AI Live Chat Agent

A mini AI customer support chat widget built as a take-home assignment for Spur's Founding Full-Stack Engineer role. This project simulates a real customer support chat where an AI agent answers user questions using OpenAI's GPT-4o-mini, with full conversation persistence via SQLite.

**Live Demo**: [Deployment URL — add after deploying]

---

## Features

- **Real-time AI chat** — Messages are sent to a backend that calls OpenAI's GPT-4o-mini with a tailored support agent prompt
- **Contextual conversations** — The AI remembers up to 10 previous messages for contextually relevant replies
- **Session persistence** — Conversations are saved to SQLite and can be resumed via session ID (stored in localStorage)
- **FAQ domain knowledge** — The AI is seeded with knowledge about a fictional store (ShopSpur) including shipping, returns, support hours, and payment info
- **Robust error handling** — Graceful handling of LLM failures, rate limits, network errors, and invalid input with user-friendly messages
- **Clean, responsive UI** — Works on desktop and mobile with auto-scroll, typing indicators, and optimistic message updates

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js 20 + TypeScript + Express 4 |
| Database | SQLite 3 via `better-sqlite3` (WAL mode) |
| LLM | OpenAI GPT-4o-mini |
| Validation | Zod (backend & frontend) |
| Frontend | SvelteKit 2 + Svelte 5 + TypeScript |
| Styling | Tailwind CSS 3 |

---

## How to Run Locally

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ (LTS recommended)
- An [OpenAI API key](https://platform.openai.com/api-keys)

### 1. Clone & Install

```bash
git clone <repo-url>
cd spur-ai-chat

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

```bash
# In the backend folder
cd backend
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
PORT=3001
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4o-mini
MAX_TOKENS=500
DB_PATH=./chat.db
NODE_ENV=development
```

For the frontend, create a `.env` file:

```bash
cd ../frontend
```

```env
VITE_API_URL=http://localhost:3001
```

> **Note**: Never commit `.env` files to git. They are already in `.gitignore`.

### 3. Set Up the Database

The database is created automatically when the server starts — no manual migration needed. The backend runs `CREATE TABLE IF NOT EXISTS` statements on startup.

Optionally, seed the database with a sample conversation for testing:

```bash
cd backend
npm run seed
```

### 4. Start the Backend

```bash
cd backend
npm run dev
```

The API server will start on `http://localhost:3001`. You should see:

```
Server running on port 3001
Database connected and migrations applied
```

### 5. Start the Frontend (new terminal)

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is taken).

### 6. Open the App

Navigate to `http://localhost:5173` and start chatting with the AI support agent!

---

## Project Structure

```
spur-ai-chat/
├── backend/
│   ├── src/
│   │   ├── index.ts                    # Server entry point
│   │   ├── config.ts                   # Environment configuration
│   │   ├── db.ts                       # Database connection & migrations
│   │   ├── types.ts                    # Shared TypeScript types
│   │   ├── routes/
│   │   │   └── chat.ts                 # POST /message, GET /history/:sessionId
│   │   ├── services/
│   │   │   ├── llm.ts                  # OpenAI integration (generateReply)
│   │   │   ├── conversation.ts         # Database operations
│   │   │   └── faq.ts                  # FAQ knowledge base & prompt builder
│   │   └── middleware/
│   │       └── errorHandler.ts         # Global error handler
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api.ts                  # API client (fetch wrapper)
│   │   │   ├── types.ts                # Frontend types
│   │   │   ├── stores/
│   │   │   │   └── chat.ts             # Chat state store (Svelte)
│   │   │   └── components/
│   │   │       ├── ChatWidget.svelte   # Main chat container
│   │   │       ├── MessageList.svelte  # Scrollable message list
│   │   │       ├── MessageBubble.svelte # User/AI message bubbles
│   │   │       ├── ChatInput.svelte    # Input field + send button
│   │   │       └── TypingIndicator.svelte
│   │   └── routes/
│   │       ├── +page.svelte            # Main page
│   │       ├── +layout.svelte          # Root layout
│   │       └── +page.ts                # Page config (ssr=false)
│   ├── package.json
│   ├── svelte.config.js
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md
```

---

## Architecture Overview

### Backend Design

The backend follows a **layered architecture** with clear separation of concerns:

1. **Routes layer** (`routes/chat.ts`) — Handles HTTP concerns: parsing request bodies, validating input with Zod, calling services, and returning JSON responses. Contains zero business logic.

2. **Services layer** (`services/`) — Contains all business logic:
   - `llm.ts` — Encapsulates the OpenAI integration behind a clean `generateReply(history, userMessage)` interface. This makes it trivial to swap LLM providers later (e.g., add Claude, Groq, or a self-hosted model).
   - `conversation.ts` — All database operations using prepared statements. Abstracts SQLite details so the route handlers don't touch SQL directly.
   - `faq.ts` — FAQ knowledge and prompt engineering. The system prompt is built here, making it easy to update store policies or add new knowledge.

3. **Middleware layer** (`middleware/errorHandler.ts`) — Centralized error handling that maps internal errors to appropriate HTTP status codes and user-friendly messages. This prevents auth errors from leaking to users and ensures consistent error formatting.

### Data Flow

```
User types message
    → Frontend POST /api/chat/message { message, sessionId }
    → Backend validates with Zod
    → Persist user message to SQLite
    → Build OpenAI prompt (system + last 10 messages + user message)
    → Call OpenAI API (30s timeout)
    → Persist AI reply to SQLite
    → Return { reply, sessionId }
    → Frontend displays reply
```

### Database Schema

SQLite with WAL mode for better concurrent read performance:

- **conversations** — `id` (UUID PK), `created_at`, `updated_at`
- **messages** — `id` (auto-increment), `conversation_id` (FK), `sender` (user|ai), `text`, `created_at`
- Index on `messages.conversation_id` for fast history lookups

### Frontend Design

- **Svelte 5 Runes** — All components use `$props()`, `$derived()`, and `$effect()` for reactive state
- **Optimistic UI** — User messages appear immediately while the API call is in flight, replaced with the persisted version on success
- **Session management** — `sessionId` is saved to `localStorage`; chat history is automatically loaded on page reload
- **Component decomposition** — Each UI concern (bubble, input, list, typing indicator) is a separate component for testability and reuse

---

## LLM Integration Notes

### Provider
**OpenAI GPT-4o-mini** — chosen for its excellent cost-to-performance ratio. For a support chat use case, it reliably follows instructions, stays concise, and handles the seeded FAQ knowledge well.

### Prompt Design

The system prompt includes:
- Role definition ("helpful, friendly customer support agent for ShopSpur")
- Structured FAQ knowledge (shipping, returns, support hours, payment)
- A constraint to be honest when it doesn't know something
- A max length hint ("keep responses under 150 words")

Conversation history is included as context — the last 10 messages are sent with each request to keep token usage reasonable while maintaining conversational coherence.

### Error Handling

The LLM service catches and categorizes errors:

| OpenAI Error | HTTP Status | User Message |
|-------------|-------------|--------------|
| Rate limit (429) | 429 | "We're experiencing high demand. Please try again in a moment." |
| Auth failure (401) | 500 (masked) | "Something went wrong on our end." |
| Network timeout | 503 | "Our AI assistant is temporarily unavailable." |
| Other API errors | 500 | "Something went wrong on our end. Please try again." |

### Cost Controls

- **Model**: `gpt-4o-mini` (cheapest capable model)
- **Max tokens**: 500 per response
- **Context window**: Last 10 messages only
- **Max message length**: 2000 characters from users

At OpenAI's current pricing, a typical conversation costs less than $0.01.

---

## API Reference

### `POST /api/chat/message`

Send a message and get an AI reply.

**Body:**
```json
{
  "message": "What's your return policy?",
  "sessionId": "optional-existing-uuid"
}
```

**Response (200):**
```json
{
  "reply": "You can return any item within 30 days...",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### `GET /api/chat/history/:sessionId`

Fetch conversation history.

**Response (200):**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "messages": [
    { "id": 1, "sender": "user", "text": "...", "timestamp": "2026-06-03T10:00:00.000Z" },
    { "id": 2, "sender": "ai", "text": "...", "timestamp": "2026-06-03T10:00:02.000Z" }
  ]
}
```

### `GET /health`

Health check. Returns `{ "status": "ok" }`.

---

## Deployment

### Option 1: Render (Recommended — Free Tier)

**Backend (Web Service):**
1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repo
3. Set root directory to `backend/`
4. Build Command: `npm install && npm run build` (or leave blank)
5. Start Command: `npm start`
6. Add environment variables (`OPENAI_API_KEY`, `NODE_ENV=production`)
7. Deploy

**Frontend (Static Site):**
1. Create a new Static Site on Render
2. Connect the same repo
3. Set root directory to `frontend/`
4. Build Command: `npm install && npm run build`
5. Publish directory: `build/`
6. Add environment variable: `VITE_API_URL=https://your-backend-url.onrender.com`
7. Deploy

### Option 2: Railway

Both frontend and backend can deploy to [Railway](https://railway.app) with minimal configuration. Add a `railway.json` or use the Railway CLI.

### Option 3: Vercel (Frontend) + Render (Backend)

Deploy the SvelteKit frontend to [Vercel](https://vercel.com) and the Express backend to Render. Set `VITE_API_URL` to point to your Render backend.

> **Note on SQLite**: SQLite writes to the local filesystem. On platforms with ephemeral storage (like Render's free tier), the database will reset on each deploy. For a production deployment, consider migrating to PostgreSQL (e.g., via Render's managed PostgreSQL or Supabase). For this exercise, SQLite is acceptable.

---

## Testing

### Manual End-to-End Test

1. Open the app and send: "What's your return policy?"
   - Expect: AI explains the 30-day return policy
2. Follow up: "How do I ship it back?"
   - Expect: AI responds contextually, referencing the return process
3. Refresh the page
   - Expect: Chat history reloads from the persisted session
4. Send a very long message (2000+ chars)
   - Expect: Frontend blocks it with validation, backend rejects with 400
5. Send an empty message
   - Expect: Send button is disabled, backend rejects with 400
6. Stop the backend server and send a message
   - Expect: Frontend shows "Connection lost" error with retry button

### FAQ Test Questions

- "Do you ship internationally?"
- "What are your support hours?"
- "How do I get a refund?"
- "What payment methods do you accept?"

---

## Trade-offs & "If I Had More Time..."

### What's intentionally simple

1. **SQLite instead of PostgreSQL** — SQLite requires zero configuration and is perfect for a single-instance demo. For multi-instance deployments or high concurrency, I'd switch to PostgreSQL with connection pooling.

2. **No authentication** — The spec explicitly said no auth required. In production, I'd add anonymous sessions (what we have) plus optional user authentication for cross-device history sync.

3. **No rate limiting middleware** — I documented cost controls (max tokens, max message length) but didn't implement API-level rate limiting. In production, I'd add `express-rate-limit` or a Redis-backed rate limiter per session.

4. **No WebSocket / real-time push** — The frontend polls via HTTP requests. For a real product, I'd use Server-Sent Events (SSE) or WebSockets for streaming LLM responses word-by-word.

### What I'd add with more time

1. **Streaming responses** — Show the AI response being typed out in real-time using OpenAI's streaming API with SSE. This dramatically improves perceived responsiveness.

2. **Multi-channel support** — The architecture (service layer, conversation model) is designed to make it easy to add WhatsApp, Instagram DM, and Facebook Messenger channels. Each channel would have an adapter that normalizes messages to the internal format.

3. **Tool use / function calling** — Give the AI access to tools like "check order status" or "initiate return" by calling actual functions. This would require order/return data models.

4. **Admin dashboard** — A separate UI for human agents to monitor conversations, take over from the AI, and view analytics (response times, satisfaction, common questions).

5. **Caching layer** — Cache common FAQ responses in Redis to reduce LLM costs and improve response times for repeated questions.

6. **Proper testing** — Unit tests for services (using an in-memory SQLite DB), integration tests for API routes, and component tests for the frontend.

7. **Docker setup** — A `docker-compose.yml` with the backend, frontend, and optionally PostgreSQL + Redis for local development consistency.

8. **CI/CD pipeline** — GitHub Actions for running tests, type checking, and automated deployment on merge to main.

9. **Conversation feedback** — Thumbs up/down buttons on AI messages to collect training data for improving the prompt.

10. **Multiple LLM provider fallback** — If OpenAI is down, automatically fall back to Anthropic Claude or another provider.

---

## Why I Built It This Way

The goal was to demonstrate **production-ready thinking within a weekend timebox**. Every decision prioritizes:

- **Clarity over cleverness** — The code is straightforward and well-organized. A new engineer can understand the entire system in 10 minutes.
- **Extensibility** — The service layer pattern means adding new channels (WhatsApp, etc.) or swapping LLM providers requires changing only one file.
- **Robustness** — Every error case is handled. The app never crashes on bad input or API failures.
- **Realism** — This is genuinely close to what I'd ship as a founding engineer: a working core loop with clean architecture that can grow into a real product.

---

*Built with care for Spur. Looking forward to discussing the architecture in person!*
