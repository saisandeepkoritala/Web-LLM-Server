# ⚙️ Backend README (`/server/README.md`)

```markdown
# AI Chat Assistant - Backend API Server

The core engine of the application built on **Node.js** and **Express**. This server orchestrates user verification via the **Firebase Admin SDK**, structures and persists contextual history logs in **MongoDB**, and runs an intelligent Agent workflow powered by **LangChain** with real-time web-search capabilities.

---

## ✨ Key Capabilities

- **Firebase Token Verification:** Middleware that intercepts requests, extracts Bearer tokens, and validates user identities using the Firebase Admin SDK.
- **LangChain Tool Agent:** An AI orchestrator configured to run custom tools. When an user's prompt demands up-to-date knowledge, it executes a live web-search workflow before constructing the final response.
- **Session & History Storage:** Structured MongoDB schemas that safely map and record message objects tied uniquely to individual user UUIDs.

## 🛠️ Tech Stack

- **Runtime & Framework:** Node.js, Express.js
- **Database Layer:** MongoDB, Mongoose ODM
- **AI Framework:** LangChain, OpenAI / Gemini API
- **Auth Validation:** Firebase Admin SDK

## 📦 Local Development Setup

### Prerequisites
- Node.js (v18+)
- A running instance of MongoDB (Local or Atlas)

### 1. Installation
Navigate to the server directory and install dependencies:
```bash
cd server
npm install

