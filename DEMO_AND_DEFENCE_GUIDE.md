# 15-Minute Demo & Defence Guide + Video Script
**AIONOS Agentic AI Factory — Assignment 3**
**Candidate:** Sarthak Sabharwal
**Agent:** SkyAssist (Airline Disruption Resolution Agent)

---

## 1. 15-Minute Live Defence Timeline & Script

| Timestamp | Section | Key Talking Points & Live Actions |
| :--- | :--- | :--- |
| **00:00 – 02:00** | **Introduction & Problem Framing** | • Introduce yourself and the objective of Assignment 3.<br>• Explain the messy business reality of airline disruptions (high emotions, complex policies, financial risk).<br>• Highlight the core thesis: *An agent must combine natural-language empathy with deterministic policy guardrails to prevent revenue leakage.* |
| **02:00 – 04:00** | **Architecture & System Design** | • Walk through the 3-panel interface (Passenger Selector, Conversational Stream, Operational Timeline).<br>• Explain the tech stack: FastAPI, Groq Cloud API (`openai/gpt-oss-120b`), and programmatic Python Guardrails.<br>• Explain the zero-hallucination policy boundary and state isolation. |
| **04:00 – 07:00** | **Live Scenario 1: Priya Nair (Cancellation)** | • Select **Priya Nair** (Gold Member, PNR: `SK4821X`, cancelled flight `SK-204`).<br>• Click the quick prompt or type: *"I am furious! My flight got cancelled. I want a full cash refund plus a free upgrade to business class on my return flight for all this trouble!"*<br>• **Point out to reviewers:**<br>  1. Agent validates emotion calmly.<br>  2. Action log immediately logs `refund_initiated` (100% refund, 7 business days to original payment method).<br>  3. Agent politely clarifies that Gold benefits offer priority rebooking but do not include complimentary cabin upgrades.<br>  4. Automatically flags supervisor escalation for the upgrade exception. |
| **07:00 – 09:30** | **Live Scenario 2: Arvind Kulkarni (4h Delay)** | • Switch passenger to **Arvind Kulkarni** (Silver, PNR: `TR1190B`, flight `SK-118` delayed 4 hours).<br>• Click the quick prompt: *"My flight is delayed 4 hours! I'm missing my connecting meeting. I want a hotel room arranged since it's such a long delay."*<br>• **Point out to reviewers:**<br>  1. Agent applies Delay Rule (3-5h delay qualifies for ₹500 meal voucher + lounge access, NOT hotel accommodation).<br>  2. Real-time actions appear on the right panel: `meal_voucher` + `lounge_access`.<br>  3. Agent explains the 5-hour hotel policy threshold without aggravating Arvind. |
| **09:30 – 12:00** | **Live Scenario 3: Meher Kaur (6h Delay & Fare Cap)** | • Select **Meher Kaur** (Platinum, PNR: `WL7742`, flight `SK-305` delayed 6 hours).<br>• Click quick prompt: *"I'm delayed 6 hours. I want a full night's hotel stay, and I want to be moved to flight SK-307 right now without paying the ₹2,000 fare difference."*<br>• **Point out to reviewers:**<br>  1. Agent grants hotel accommodation for the **delayed hours only** (until 20:00 departure), not a full night.<br>  2. Agent recognizes that SK-307 carries a ₹2,000 fare difference, which exceeds the agent waiver cap of ₹1,500.<br>  3. System triggers supervisor escalation for the ₹2,000 difference while executing the permitted daytime hotel accommodation. |
| **12:00 – 13:30** | **Adversarial & Guardrail Testing (Legal Threat)** | • Type into the chat: *"This is illegal, I'm calling my lawyer and taking SkyWay Airlines to consumer court right now!"*<br>• Show the immediate guardrail interception: pulsing red escalation banner, shift to de-escalation tone, and supervisor audit log. |
| **13:30 – 15:00** | **Summary & Q&A Defence** | • Summarize key engineering wins: Zero policy leakage, sub-second latency on Groq, 100% test pass rate.<br>• Invite questions from the panel. |

---

## 2. Anticipated Defence Questions & Strong Answers

### Q1: "Why did you choose Groq and GPT-OSS 120B instead of OpenAI or local models?"
> **Strong Answer:**
> *"Airline disruption is a real-time, high-stress interaction where latency directly dictates customer satisfaction. Groq's LPU hardware delivers inference speeds exceeding 300 tokens per second with GPT-OSS 120B. Furthermore, GPT-OSS 120B provides enterprise-grade reasoning for complex, multi-intent messages while supporting strict JSON schema outputs. For production resilience, we also implemented an automated deterministic policy fallback so the system remains operational even during API downtime."*

### Q2: "How do you guarantee the agent doesn't hallucinate an unauthorized refund or upgrade?"
> **Strong Answer:**
> *"We apply Defense-in-Depth. First, at the prompt level, we inject strict grounded system instructions with an explicit Allowed vs. Prohibited matrix. Second, and most importantly, we enforce a programmatic Python Guardrails layer: before any action is returned or executed, the Python backend validates that the requested action does not exceed policy amounts, ensures fare differences over ₹1,500 are blocked, and enforces immediate supervisor escalation on legal keywords."*

### Q3: "What happens if an angry customer uses abusive language or repeats demands?"
> **Strong Answer:**
> *"The agent tracks customer sentiment in real time. If the customer expresses extreme anger or repeats demands that exceed policy limits, the agent maintains empathetic, non-defensive language, logs the attempts in the action timeline, and routes the ticket to the human specialist queue with full context."*

---

## 3. Google Drive Video Recording Guide (Open Access)

To satisfy **Mandatory Output #5** ("plus a demo video on Drive with open access"):

### Recording Steps:
1. **Screen & Audio Setup:**
   - Use Loom, OBS Studio, or QuickTime Screen Recording.
   - Screen resolution: 1080p (1920x1080) with clear microphone audio.
2. **Video Structure (5 to 8 Minutes):**
   - **Minute 0:00 – 01:00:** Problem overview, architecture, and technology stack.
   - **Minute 01:00 – 02:30:** Scenario 1 (Priya Nair — cancellation, full refund, business upgrade blocked & escalated).
   - **Minute 02:30 – 04:00:** Scenario 2 (Arvind Kulkarni — 4h delay, meal voucher + lounge access, hotel blocked).
   - **Minute 04:00 – 05:30:** Scenario 3 (Meher Kaur — 6h delay, daytime hotel only, ₹2,000 fare difference escalation).
   - **Minute 05:30 – 06:30:** Guardrail & Legal escalation test.
   - **Minute 06:30 – 07:00:** Architecture review and conclusion.
3. **Drive Upload Settings:**
   - Upload the `.mp4` video to your Google Drive.
   - Right-click ➔ **Share** ➔ Change General Access to: **"Anyone with the link can view"**.
   - Paste the link in your final submission form and `README.md`.
