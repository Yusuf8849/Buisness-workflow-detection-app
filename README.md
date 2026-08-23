# ⚡ FlowIntel.AI — Autonomous Business Process Intelligence & Workflow Platform

<div align="center">

![FlowIntel.AI Banner](https://img.shields.io/badge/FlowIntel.AI-Autonomous_Process_Intelligence-00b4d8?style=for-the-badge&logo=fastapi&logoColor=white)
![React 18](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express_5.0-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8_RealTime-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8.9-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4_Dark%2FLight-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)

**Turn Complex Business Procedures into Deterministic 0-Cycle DAG Diagrams with Real-Time Multiplayer Collaboration, AI Process Partner, and Instant Straight-Through Processing (STP) Optimization.**

</div>

---

## 🌟 Key Capabilities

- 🔍 **Natural Language Business Process Detection**: Converts unstructured SOPs, business rules, and multi-actor procedures into structured DAG diagrams.
- 🎨 **Interactive React Flow Studio**: Drag-and-drop workflow canvas with custom nodes (Trigger, Action, Decision, Completion, Actor, Document, Milestone) and animated energetic edges.
- 🌐 **Real-Time Multiplayer Collaboration (Socket.io)**: Live teammate presence avatars, multiplayer cursor tracking, threaded node comments, and 4-stage approval governance (`Draft` → `In Review` → `Approved` → `Published`).
- 📊 **Dynamic Process Intelligence Analytics**: 5-Dimension Radar Topologies, Latency Crumble transformation, Hotspot Risk Heatmaps, and Kahn's 0-Cycle Topological Sort verification.
- 📤 **4-in-1 Export & Sharing Engine**: 
  - Transparent PNG & Vector SVG export
  - Clean AST JSON import/export
  - Executive branded PDF reports
  - Responsive `<iframe>` embed codes & social share links (LinkedIn, Twitter, Email)
- 🌓 **Premium Dark / Light Mode System**: Full theme persistence, fluid 300ms CSS transitions, and high-contrast accessibility across all components.
- 🤖 **Interactive AI Process Partner**: Contextual conversational chat assistant with text-to-speech voice readout and instant one-click DAG optimizations.

---

## 🏗️ Architecture & Project Structure

```
FlowIntel.AI/
├── .env.example              # Global environment configuration template
├── .gitignore                # Multi-tier git exclusion rules
├── README.md                 # Project documentation
├── package.json              # Root concurrent startup scripts
│
├── frontend/                 # React 18 + Vite + TailwindCSS Client
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── analytics/    # Radar charts, circular health score, latency comparison
│   │   │   ├── collaboration/# Live cursors, presence avatars, threaded comments, approval workflows
│   │   │   ├── common/       # AI companion, 3D backgrounds, toast notifications, tour
│   │   │   ├── discovery/    # NLP input editor, template selector, pipeline visualizer
│   │   │   ├── history/      # Version history drawer, visual diff modal
│   │   │   ├── landing/      # Hero 3D canvas, interactive demo, storytelling, social proof
│   │   │   ├── layout/       # Responsive navbar, theme switcher, footer
│   │   │   └── studio/       # React Flow canvas, custom nodes/edges, export modal, controls
│   │   ├── services/         # Socket.io client, REST API client
│   │   ├── types/            # TypeScript interfaces & AST workflow models
│   │   ├── utils/            # Audio effects, export helpers, audio synthesis
│   │   ├── App.tsx           # Primary application container & route switching
│   │   ├── index.css         # Tailwind directives, theme variables, glassmorphic tokens
│   │   └── main.tsx          # Client entrypoint
│   └── vite.config.ts        # Vite configuration & chunk optimization
│
└── backend/                  # Node.js + Express + Socket.io Server
    ├── config/               # MongoDB Mongoose connector & disk fallback storage
    ├── models/               # MongoDB Schemas (Workflow, Version, ProjectContext)
    ├── routes/               # REST API endpoints (Workflows, FormsEngine, Templates)
    ├── services/             # AST NLP Analyzer, Socket.io Engine, Topological Sorter
    └── server.js             # Express app & HTTP/WebSocket server entrypoint
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (Optional: resilient embedded storage automatically activates if MongoDB is offline)

---

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/FlowIntel.AI.git
cd FlowIntel.AI
```

### 2. Configure Environment Variables
```bash
# Copy example environment files
cp .env.example backend/.env
```

### 3. Install Dependencies
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 4. Run Development Servers
You can run both servers concurrently or in separate terminal windows:

**Terminal 1 (Backend API & Socket.io Engine):**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

---

## 📡 REST API & WebSocket Endpoints

### REST API (`http://localhost:5000/api`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/workflows/detect` | Discovers nodes, edges, conditions, and actors from text |
| `GET` | `/api/workflows` | Fetches all persisted workflows |
| `GET` | `/api/workflows/:id` | Fetches single workflow AST by ID |
| `POST` | `/api/workflows` | Persists or saves a new workflow DAG |
| `GET` | `/api/workflows/:id/versions` | Retrieves full version history and changelog |
| `POST` | `/api/workflows/apply-to-be-stp` | Applies AI Straight-Through Processing optimization |

### WebSockets (`ws://localhost:5000`)
- `join-workflow`: Connects client to real-time workflow room
- `cursor-move`: Broadcasts high-frequency collaborator pointer coordinates
- `workflow-update`: Broadcasts real-time node position / topology changes
- `node-comment`: Broadcasts threaded node comments & resolution status
- `approval-status-change`: Broadcasts approval governance lifecycle transitions

---

## 🛡️ License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
