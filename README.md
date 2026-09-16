# 🎯 Lead Intelligence — Automated BD Prospecting Platform

> **Daily automated lead discovery engine** that identifies 50 high-growth companies (30 GCCs + 20 Startups) across India every working day — with zero manual research effort.

Built for the Business Development  to automate prospect identification, qualification, and report generation.

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| **🤖 Automated Daily Pipeline** | Runs every day at 06:00 AM IST — discovers, qualifies, scores, and generates Excel reports automatically |
| **📊 50 Leads/Day** | 30 GCCs + 20 Startups with 0 overlap, strict deduplication across days |
| **🛡️ 2-Level company Exclusion Engine** | Cross-checks against internal client database + public web evidence to avoid pitching existing clients |
| **📈 Lead Scoring (0–100)** | Weighted scoring across 4 pillars: Hiring Activity, Growth Signals, Zyoin Relevance, India Opportunity |
| **📥 Excel Report Downloads** | 4 professionally styled `.xlsx` reports generated per day (Startups, GCC, Summary, Exclusions) |
| **🗺️ Pan-India Coverage** | 90+ cities across Tier 1, 2, and 3 — not limited to just metros |
| **📁 Historical Archive** | Persistent report storage with date-wise browsing and re-download |
| **🏢 Client Master Database** | Upload & manage Zyoin's existing client list (CSV import supported) |
| **⚡ Manual Override** | Trigger research on-demand with a single click |

---

## 🏗️ Architecture

```
AutoLeadTool/
├── client/                    # React + Vite Frontend
│   ├── src/
│   │   ├── App.jsx           # Main app with tab navigation
│   │   ├── index.css         # company corporate design system
│   │   └── components/
│   │       ├── LeadsTab.jsx          # Dashboard leads table
│   │       ├── ExportsTab.jsx        # Excel download center
│   │       ├── ClientsTab.jsx        # company client database manager
│   │       ├── ExclusionsTab.jsx     # Rejected companies log
│   │       ├── SettingsTab.jsx       # Scheduler & pipeline settings
│   │       ├── CompanySlidePanel.jsx # Lead detail slide-over
│   │       ├── Header.jsx           # Top bar with status & actions
│   │       └── ...
│   └── vite.config.js        # Dev proxy → port 5000
│
├── server/                    # Express.js Backend
│   ├── server.js             # API routes & static file serving
│   ├── database.js           # File-backed JSON persistence
│   ├── services/
│   │   ├── scheduler.js          # Cron-style daily pipeline orchestrator
│   │   ├── discoveryEngine.js    # Company candidate generator (90+ India cities)
│   │   ├── zyoinChecker.js       # 2-level exclusion engine
│   │   ├── researchVerifier.js   # Fact vs inference separation
│   │   ├── scoringEngine.js      # 4-pillar lead scoring (0–100)
│   │   ├── excelExporter.js      # Styled ExcelJS report generator
│   │   └── normalization.js      # Company name fuzzy matching
│   └── data/                 # Persistent JSON data store
│       ├── qualified_leads.json
│       ├── research_runs.json
│       ├── zyoin_existing_clients.json
│       ├── excluded_companies.json
│       ├── company_history.json
│       └── settings.json
│
└── reports/                   # Generated Excel reports (date-stamped)
    ├── Company_Startups_YYYY-MM-DD.xlsx
    ├── Company_GCC_YYYY-MM-DD.xlsx
    ├── Company_Daily_Lead_Summary_YYYY-MM-DD.xlsx
    └── Company_Excluded_Companies_YYYY-MM-DD.xlsx
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Lucide Icons, Canvas Confetti |
| Backend | Node.js, Express.js |
| Reports | ExcelJS (styled `.xlsx` generation) |
| Data | File-backed JSON (no database required) |
| Styling | Vanilla CSS (Zyoin corporate design system) |

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** v18+ installed
- **npm** v9+

### 1. Clone the Repository

```bash
git clone https://github.com/hepsi33/AutoLeadTool.git
cd AutoLeadTool
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Build the Frontend

```bash
cd client
npm run build
```

### 4. Start the Server

```bash
# From the project root
node server/server.js
```

The app will be available at **http://localhost:5000**

> 💡 On startup, the server automatically runs the daily research pipeline if today's research hasn't been completed yet.

### Development Mode (Optional)

To run with hot-reload during development:

```bash
# Terminal 1: Start backend
cd server && npm run dev

# Terminal 2: Start frontend dev server
cd client && npm run dev
```

Frontend dev server runs on `http://localhost:3000` and proxies API calls to port 5000.

---

## 📊 Daily Research Pipeline

The automated pipeline executes every day at **06:00 AM IST** and performs these steps:

```
Step 1 → Discover 100+ candidate companies (date-rotated, deduplicated)
Step 2 → Run 2-level COmpany Exclusion Engine (Internal DB + Public Web)
Step 3 → Verify hiring & growth signals, calculate lead scores
Step 4 → Generate 4 styled Excel reports and persist to disk
Step 5 → Archive results with full audit trail
```

### Output: 4 Excel Reports

| Report | Contents |
|--------|----------|
| **Company Startups** | 28 columns: Company details, hiring data, growth evidence, BD angles, TA contacts |
| **Company GCC** | 34 columns: Parent MNC, GCC establishment details, expansion evidence |
| **Daily Manager Summary** | Executive overview stats + full prospect table with website links |
| **Excluded Companies** | Audit log of rejected companies with exclusion reasons |

---

## 🔧 Configuration

Edit `server/data/settings.json` to customize:

```json
{
  "scheduledTime": "06:00",
  "timezone": "Asia/Kolkata",
  "dailyTargetLeads": 50,
  "targetGccs": 30,
  "targetStartups": 20,
  "autoRunEnabled": true,
  "retryAttempts": 3
}
```

Or use the **Settings** tab in the UI.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats` | Dashboard statistics |
| `GET` | `/api/leads` | Qualified leads (filterable) |
| `GET` | `/api/research/status` | Current pipeline status |
| `POST` | `/api/research/run` | Trigger manual research |
| `GET` | `/api/reports/archive` | Historical report archive |
| `GET` | `/api/reports/download/:date/:type` | Download Excel report |
| `GET` | `/api/clients` | Company client database |
| `POST` | `/api/clients` | Add new client |
| `POST` | `/api/clients/upload` | CSV bulk import |
| `GET` | `/api/exclusions` | Excluded companies log |
| `GET` | `/api/review-queue` | Ambiguous matches for review |
| `GET/POST` | `/api/settings` | System settings |

---

## 🛡️ Lead Scoring System

Each lead is scored on a **0–100 scale** across 4 weighted pillars:

| Pillar | Max Score | Factors |
|--------|-----------|---------|
| **Hiring Activity** | 40 | Number of active tech openings |
| **Growth Signals** | 25 | Funding, expansion, acquisitions |
| **Company Relevance** | 20 | Role alignment with Company's strengths |
| **India Opportunity** | 15 | Presence in key India tech markets |

### Priority Classification
- 🔥 **HOT** → Score 85–100
- 🟠 **HIGH** → Score 70–84
- 🔵 **MEDIUM** → Score 55–69

---

## 📄 License

This project is proprietary software built for **Hephzibah**.

---

<p align="center">
  Built with ❤️ for Zyoin Business Development
</p>
