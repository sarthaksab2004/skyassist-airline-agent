# SkyAssist — Customer-Facing Disruption Resolution Agent ✈️
> **AIONOS Agentic AI Factory · Assignment 3: Customer-Facing Resolution Agent (Airline Disruption)**  
> **Candidate:** Sarthak Sabharwal  
> **Scenario Date:** Wednesday, 23 September 2026  
> **Powered by:** Groq Cloud API (`openai/gpt-oss-120b`) + Deterministic Policy Guardrails + FastAPI  

---

## 📋 Executive Summary & Deliverables Mapping

| Assignment Requirement | Deliverable / File Location | Status |
| :--- | :--- | :--- |
| **1. Working Agent / Clickable Prototype** | Full-stack interactive web application running locally on port 8000 | ✅ Complete |
| **2. Architecture & Process Flow** | [`ARCHITECTURE.md`](./ARCHITECTURE.md) with Mermaid diagrams | ✅ Complete |
| **3. Inputs, Sources & Assumptions** | Strictly grounded in Data Pack: [`app/data.py`](./app/data.py) & Section 4 below | ✅ Complete |
| **4. AI Tools Used & How They Were Used** | Documented in Section 5 below (Groq, GPT-OSS 120B, subagents) | ✅ Complete |
| **5. 15-Min Demo & Defence Guide + Video** | [`DEMO_AND_DEFENCE_GUIDE.md`](./DEMO_AND_DEFENCE_GUIDE.md) | ✅ Complete |
| **6. GitHub Link of Project** | Full Git repository initialized with clean commits & push guide | ✅ Ready to push |
| **7. 10-Slide PPT Presentation** | [`PRESENTATION_SLIDES.md`](./PRESENTATION_SLIDES.md) | ✅ Complete |

---

## 🌐 Live Demo (One-Click, No Setup)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/<your-username>/airline-resolution-agent)

Click the button above (after pushing this repo to GitHub — see **GitHub Setup** below) to deploy a live, shareable link. Anyone — including a recruiter — can then open that URL and use the app instantly, with zero local setup. The app runs perfectly with **no Groq key at all**, using its built-in deterministic Policy Engine, so it works out of the box.

---

## 🚀 Quickstart: One-Command Run

Follow these simple steps to run the interactive agent locally:

### 1. Clone & Navigate to Repository
```bash
git clone https://github.com/<your-username>/airline-resolution-agent.git
cd airline-resolution-agent
```

### 2. Set Up Virtual Environment & Dependencies
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Configure Groq API Key (Optional but Recommended)
Copy the example environment file and add your Groq API key:
```bash
cp .env.example .env
# Edit .env and replace with your key:
# GROQ_API_KEY=gsk_your_actual_key_here
```
*(Note: You can also enter your Groq API Key directly inside the web UI by clicking the 🔑 key icon, or run without a key using the built-in deterministic Policy Engine!)*

### 4. Launch the Application
```bash
uvicorn app.main:app --port 8000 --reload
```
Open your browser at **`http://localhost:8000`** to experience the SkyAssist Cockpit!

### 5. Run Automated Tests
```bash
python3 tests/test_scenarios.py
```

---

## 🎨 Interactive Dashboard Features

1. **Passenger Selector (Left Panel):**
   - Live view of disrupted passengers (Priya Nair, Arvind Kulkarni, Meher Kaur).
   - Loyalty Tier indicators (Gold, Silver, Platinum).
   - Real-time flight status tags (Cancelled in Red, Delayed in Amber, Unaffected in Green).
2. **Conversational Stream (Center Panel):**
   - Empathetic responses addressing passengers respectfully by name.
   - Quick Prompt evaluation chips for 1-click scenario verification.
   - Typing indicator, message timestamps, and currency auto-formatting.
3. **Operational Context & Audit Trail (Right Panel):**
   - Real-time Itinerary & Flight details.
   - Live Passenger sentiment analysis (Neutral, Frustrated, Angry, Satisfied).
   - Automated Policy Execution log tracking every voucher, refund, or rebooking.
   - Pulsing Supervisor Escalation alert upon policy violation or legal threat.

---

## 📊 Grounding & Data Pack Coverage

All data is strictly grounded in the Assignment 3 Data Pack:

### 1. Customer Profiles & Scenarios
- **Scenario 1 — Priya Nair (Gold Tier, PNR: `SK4821X`):**
  - **Disruption:** Flight SK-204 (Delhi → Goa, 23 Sep 18:40) **Cancelled** due to operational reasons. Return flight SK-204R (25 Sep 16:20) unaffected.
  - **User Conflict:** Priya is furious and demands a full cash refund **plus a free business class upgrade** on her return flight.
  - **Agent Action:** Processes 100% refund to original payment method (7 business days); blocks business class upgrade (prohibited by policy) and escalates the upgrade exception to supervisor.
- **Scenario 2 — Arvind Kulkarni (Silver Tier, PNR: `TR1190B`):**
  - **Disruption:** Flight SK-118 (Mumbai → Bengaluru, 23 Sep 07:10) **Delayed 4 hours** (new departure 11:10).
  - **User Conflict:** Frustrated about missing connecting meeting and asks for hotel accommodation.
  - **Agent Action:** Applies 3-5h delay rule by immediately issuing ₹500 meal voucher + lounge access; politely clarifies hotel accommodation strictly requires a >5h delay.
- **Scenario 3 — Meher Kaur (Platinum Tier, PNR: `WL7742`):**
  - **Disruption:** Flight SK-305 (Delhi → Hyderabad, 23 Sep 14:00) **Delayed 6 hours** (new departure 20:00).
  - **User Conflict:** Asks for full night's hotel stay (rather than delayed hours only), and asks to be moved to flight SK-307 where the fare difference is **₹2,000**.
  - **Agent Action:** Issues ₹500 meal voucher + day hotel covering delayed hours only (until 20:00 departure); recognizes that ₹2,000 fare difference exceeds agent waiver limit (max ₹1,500) and triggers supervisor escalation.

### 2. Disruption Service Policy Rules
- **Cancellation Rebooking Rule:** Free rebooking on next flight within 24h OR full refund to original payment method (7 business days).
- **Delay Compensation Rule:**
  - Delay < 3 hours: ₹500 meal voucher.
  - Delay 3+ hours: Meal voucher + Lounge access.
  - Delay 5+ hours: Meal voucher + Hotel accommodation covering **delayed hours only** (not a full night's stay).
- **Fare Difference Rule:** Agents cannot waive fare differences above **₹1,500** without supervisor approval.
- **Loyalty Tier Rule:** Gold & Platinum members receive priority rebooking (first access to seats) but **no extra compensation** beyond standard policy.
- **Immediate Escalation Rule:** Threats of legal action or formal complaints must be escalated immediately.

---

## 🛠️ AI Tools Used & Engineering Methodology

1. **Groq Cloud API & GPT-OSS 120B:**
   - Used as the primary reasoning engine for natural language parsing, emotional intent extraction, and structured JSON output.
   - Selected for its ultra-low inference latency (>300 tokens/second), enabling instantaneous passenger resolution.
2. **Strict System Prompt Engineering:**
   - Grounded context injection incorporating the fixed exercise date (23 September 2026), full customer history, and strict allowed/prohibited boundaries.
3. **Hard Programmatic Guardrails (Defense-in-Depth):**
   - Python-level interceptor inspecting proposed actions before execution.
   - Prevents model hallucinations from granting unapproved upgrades or waiving fare differences > ₹1,500.
4. **Autonomous Subagents:**
   - Leveraged specialized subagents during development for UI glassmorphism CSS styling and test suite creation.

---

## 🚢 Pushing to GitHub

To publish this project to your GitHub account:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Add files and commit
git add .
git commit -m "feat: complete SkyAssist airline resolution agent with Groq & UI"

# 3. Create a new repository on GitHub (e.g. named airline-resolution-agent)

# 4. Link and push
git remote add origin https://github.com/<your-username>/airline-resolution-agent.git
git branch -M main
git push -u origin main
```

---

## 📁 Repository Structure

```
airline-resolution-agent/
├── app/
│   ├── __init__.py           # Package indicator
│   ├── data.py               # Grounded Data Pack (Customers, Bookings, Policies)
│   ├── agent.py              # Groq agent reasoning, policy engine, and guardrails
│   ├── main.py               # FastAPI gateway & static server
│   └── static/
│       ├── index.html        # Interactive 3-panel cockpit dashboard
│       ├── styles.css        # Premium glassmorphic airline theme
│       └── app.js            # Frontend session manager & quick-test prompts
├── tests/
│   └── test_scenarios.py     # Automated test suite for Scenarios 1, 2, 3 & Guardrails
├── ARCHITECTURE.md           # Detailed architecture & process flow with diagrams
├── PRESENTATION_SLIDES.md    # 10-slide PowerPoint presentation deck
├── DEMO_AND_DEFENCE_GUIDE.md # 15-minute demo script & video recording instructions
├── requirements.txt          # Python dependencies
├── .env.example              # Environment template
└── README.md                 # Project documentation
```

---
*Built with ❤️ for the AIONOS Agentic AI Factory Assignment 3.*
