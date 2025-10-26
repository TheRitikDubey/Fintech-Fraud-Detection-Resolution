# 🧠 Internal Support System – Transaction Intelligence Dashboard

A production-ready **full-stack system** built for internal support agents to:

- 🧾 **Ingest and explore** transaction data (bulk or live stream)
- 🤖 **Generate AI insights** and human-readable fraud reports
- ⚙️ **Auto-resolve cases** like freezing cards, opening disputes, or contacting customers
- 🧩 **Operate locally/offline** with deterministic rule-based fallbacks
- 📊 **Emit metrics, traces, and audit logs** for transparency and compliance

This project is designed with **production thinking**, yet fully runnable on a **single machine using Docker Compose** (no cloud dependency).

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React + TypeScript (Vite) + Tailwind CSS |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | PostgreSQL (via Prisma ORM) |
| **Cache & Jobs** | Redis |
| **Infra** | Docker Compose (pg + redis + api + web) |
| **Optional AI** | LLM agent behind a feature flag, with deterministic fallback |

---

## ⚡ Features

- 📥 **Transaction ingestion:** Upload JSON or stream data
- 🧮 **Rule-based + AI insights:** Detect anomalies and fraud patterns
- 🧰 **Multi-agent pipeline:** Ingest → Analyze → Decide → Act → Audit
- 🧍 **Agent dashboard:** Review cases, approve/override actions
- 🕵️ **Deterministic offline mode:** Works without network or external API
- 🧾 **Audit + metrics:** Every decision logged and traceable

---

## 🚀 Quick Start

```bash
git clone https://github.com/<your-username>/internal-support-system.git
cd internal-support-system
docker-compose up --build
