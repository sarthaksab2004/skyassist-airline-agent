# SkyAssist — Architecture & Process Flow
**Autonomous Disruption Resolution Agent for SkyWay Airlines**

---

## 1. System Architecture Overview

SkyAssist is designed as a **Policy-Governed Agentic Architecture**. It bridges unstructured natural-language passenger interactions with deterministic enterprise business policies and structured transactional execution.

```mermaid
graph TD
    User([Passenger / UI Client]) -->|1. Chat Message| API[FastAPI Gateway]
    API -->|2. Route to Session| Agent[Airline Resolution Agent]
    
    subgraph "Context Assembly Layer"
        Agent -->|3a. Fetch Profile & PNR| DB[(Customer & Booking DB)]
        Agent -->|3b. Fetch Disruption Rules| Policy[(Service Policy Store)]
        Agent -->|3c. Fetch Flight Alternatives| FlightDB[(Flight Inventory DB)]
    end

    subgraph "Reasoning Engine"
        Agent -->|4. Dynamic Grounded Prompt| Groq[Groq Cloud LLM: GPT-OSS 120B]
        Groq -->|5. Structured JSON Output| Guardrails[Policy Guardrails Validator]
    end

    subgraph "Enterprise Action Layer"
        Guardrails -->|6a. Permitted Action| ActionLog[(Action Execution & State Store)]
        Guardrails -->|6b. Prohibited / Limit Exceeded| Escalation[(Supervisor Escalation Queue)]
    end

    ActionLog -->|7. Verified Actions & State| UI[Interactive Dashboard]
    Escalation -->|8. Alert & Priority Handover| UI
```

---

## 2. End-to-End Process Flow

```mermaid
sequenceDiagram
    autonumber
    actor Passenger
    participant UI as Web Dashboard
    participant API as FastAPI Gateway
    participant Engine as Policy Guardrails & Agent
    participant LLM as Groq GPT-OSS 120B
    participant Supervisor as Specialist Supervisor Team

    Passenger->>UI: Selects Profile & Enters Message
    UI->>API: POST /api/chat {session_id, message}
    API->>Engine: process_message(session_id, message)
    
    rect rgb(240, 248, 255)
        Note over Engine: Pre-Processing & Context Injection
        Engine->>Engine: Inject Customer Tier, Booking, Flight Status, Strict Policies
    end

    alt Live Groq API Active
        Engine->>LLM: Inference Request (temperature=0.2, json_object)
        LLM-->>Engine: Structured JSON: {message, actions, needs_escalation, sentiment}
    else Offline Fallback / Deterministic
        Engine->>Engine: Deterministic Grounded Policy Engine
    end

    rect rgb(255, 245, 245)
        Note over Engine: Guardrail Validation Layer
        alt Legal Threat Detected ("lawyer", "court", "formal complaint")
            Engine->>Engine: Enforce needs_escalation=True (Rule 4.4)
        else Fare Difference > ₹1,500 Requested to be Waived
            Engine->>Engine: Block waiver & Trigger Escalation (Rule 4.2)
        else Business Class Upgrade Requested
            Engine->>Engine: Block complimentary upgrade & Route to Supervisor (Rule 3.5)
        end
    end

    Engine-->>API: Response Payload {message, actions, needs_escalation, sentiment}
    API-->>UI: Update Chat Stream, Action Timeline, Sentiment Badge
    opt If Escalated
        UI->>Supervisor: Render Pulsing Escalation Alert & Case Context
    end
```

---

## 3. Core Architectural Layers

### Layer 1: Passenger Experience & Interaction (Frontend)
- **Three-Panel Cockpit**:
  1. **Left Sidebar**: Real-time Passenger Selector displaying Loyalty Tiers (Gold, Silver, Platinum), PNRs, routes, and live disruption status.
  2. **Center Panel**: Conversational interface with empathetic responses, typing indicators, quick-evaluation prompt chips, and instant scenario triggers.
  3. **Right Panel**: Real-time operational context displaying ticket details, delay times, sentiment tracking, and a live timeline of automated policy actions.
- **Glassmorphism Design**: High-contrast, clean typography (`Inter`), airline navy palette with status indicators (Red for Cancelled, Amber for Delayed, Green for Confirmed).

### Layer 2: API Gateway & Session Lifecycle (FastAPI)
- **Asynchronous Execution**: High-throughput FastAPI application running with Uvicorn.
- **State Isolation**: Memory-isolated per-session conversation contexts.
- **Dynamic Configuration**: Supports real-time Groq API Key injection via `/api/set-key` without requiring server restarts.

### Layer 3: Reasoning & Grounded Policy Engine (Groq + GPT-OSS 120B)
- **Prompt Engineering**: The prompt strictly confines the model to the provided Data Pack. All rules, customer history, booking references, and departure dates (Wednesday, 23 September 2026) are injected.
- **Low Temperature (0.2)**: Ensures deterministic, non-hallucinatory compliance with airline disruption policies.
- **Strict JSON Mode**: Guarantees structured output format parsing directly into transactional actions.

### Layer 4: Hard Guardrails & Policy Interceptor
- **Defense in Depth**: Even if a large language model attempts to grant unauthorized compensation, the Python Guardrails layer programmatically validates actions against prohibited policies:
  1. **Prohibited Compensation Rule**: Rejects unapproved class upgrades or cash compensation beyond stated policies.
  2. **Fare Difference Cap**: Intercepts requests to waive fare differences exceeding ₹1,500 (e.g. Meher Kaur's ₹2,000 difference for SK-307) and triggers supervisor escalation.
  3. **Mandatory Legal Escalation**: Real-time pattern matching for keywords (`lawyer`, `legal action`, `court`, `formal complaint`, `consumer forum`) immediately routes the case to human specialists.
  4. **Hotel Stay Bounds**: Enforces that hotel accommodation covers **only the delayed hours** (e.g., 6 hours until departure) and never an unauthorized full-night stay.

---

## 4. State Transition Model

```
[Session Created]
        │
        ▼
[Disruption Context Loaded]
        │
        ▼
[Passenger Message Received]
        │
        ├── Legal / Formal Threat? ─────► [IMMEDIATE ESCALATION]
        │
        ├── Policy-Allowed Action? ─────► [EXECUTE ACTION] ──► [LOG TIMELINE] ──► [UPDATE CHAT]
        │
        └── Policy Limit Exceeded? ────► [PARTIAL ACTION] ──► [SUPERVISOR ESCALATION]
```
