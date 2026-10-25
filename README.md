# EventPilot AI 🎯

Autonomous, production-ready Event Planning SaaS Platform powered by Next.js 15, Prisma SQLite, and Local Ollama AI (`gemma:2b`).

---

## 🚀 Quick Start (Docker - Recommended)

The fastest and most reliable way to run EventPilot AI on **Windows, macOS, or Linux** without installing Node.js or database tools.

### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- [Ollama](https://ollama.ai/) installed and running locally with the `gemma:2b` model:
  ```bash
  ollama run gemma:2b
  ```
  *(Keep Ollama running in the background).*

### 2. Launch the Application
In your terminal, navigate to the cloned project folder and run:

```bash
docker compose up -d
```
*(Or `npm run docker:up` if npm is installed)*

### 3. Access EventPilot AI
Open your web browser and go to:
👉 **[http://localhost:3001](http://localhost:3001)**

---

## 🛠️ Alternative: Local Development (Without Docker)

If you prefer to run the application directly with Node.js on your machine:

### 1. Prerequisites
- **Node.js**: v20.0.0 or higher
- **npm**: v10+
- **Ollama**: running locally with `ollama run gemma:2b`

### 2. Setup & Installation
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Synchronize SQLite database
npx prisma db push

# 4. Start Next.js development server
npm run dev
```

### 3. Access
Open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

## 📦 Key Architecture & Features

- **Local Ollama AI Engine**: Powered by Google Gemma 2B via Ollama (`http://localhost:11434`). Zero cloud API keys required.
- **Fail-Safe Deterministic Fallback**: If Ollama is offline or busy, the engine automatically uses the high-fidelity heuristic planner with zero crashes.
- **Dual-Tier Data Storage**:
  - **SQLite Database**: Persisted in Docker named volume (`eventpilot_ai_data`) across reboots, restarts, and container updates.
  - **Browser LocalStorage**: Instant client-side offline mirroring (`eventpilot_event_history`) for zero-latency retrieval.
- **Event Lifecycle & Audit History**: Cancel, reactivate, or delete events with recorded audit log timestamps.
- **Export & Print Ready**: Generate printable Run Sheets, Catering Specs, and Guest Invitation lists.

---

## ⚙️ Useful Commands

| Command | Action |
| --- | --- |
| `docker compose up -d` | Launch application in background via Docker |
| `docker compose down` | Stop Docker container |
| `docker compose logs -f` | Stream live container logs |
| `npm test` | Run full Vitest test suite |
| `npm run db:studio` | Open interactive Prisma Studio SQLite GUI |
| `npm run db:clean` | Reset SQLite database to clean state |

---

## 🔧 Troubleshooting

- **Port Conflict (`3000` or `3001` already in use)**:
  You can customize the host port anytime in `.env` or prefixing Docker:
  ```bash
  HOST_PORT=3005 docker compose up -d
  ```
- **Ollama Connection**:
  Ensure Ollama is running and accessible on port 11434 (`curl http://localhost:11434`). On Linux hosts, the `extra_hosts` bridge automatically routes container requests to `host.docker.internal`.
