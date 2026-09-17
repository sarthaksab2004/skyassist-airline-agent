/**
 * SkyAssist — Modern Aviation Disruption Cockpit Frontend
 * Manages customer lifecycle, digital boarding pass, digital wallet, and chat stream.
 */

let state = {
    customers: [],
    currentCustomer: null,
    sessionId: null,
    isLoading: false,
    groqConfigured: false,
    issuedVouchers: []
};

const API = "";

// ──────────────────────────────────────────
// Initialization
// ──────────────────────────────────────────
window.addEventListener("resize", () => {
    if (!isMobileViewport()) {
        closeDrawers();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    checkSystemStatus();
    loadCustomers();
});

async function checkSystemStatus() {
    try {
        const res = await fetch(`${API}/api/status`);
        const data = await res.json();
        state.groqConfigured = data.groq_configured;
        updateModelBadge(data.groq_configured, data.model);
    } catch (err) {
        console.warn("Status check warning:", err);
    }
}

function updateModelBadge(isGroq, modelName) {
    const badgeText = document.getElementById("modelBadgeText");
    const badge = document.getElementById("sidebarModelBadge");
    if (isGroq) {
        badgeText.textContent = "Groq GPT-OSS · 120B";
        badge.style.borderColor = "rgba(16, 185, 129, 0.4)";
        badge.style.background = "rgba(16, 185, 129, 0.08)";
    } else {
        badgeText.textContent = "Policy Engine · Ready";
        badge.style.borderColor = "rgba(255, 255, 255, 0.08)";
        badge.style.background = "rgba(255, 255, 255, 0.03)";
    }
}

// ──────────────────────────────────────────
// Customer Data & Rendering
// ──────────────────────────────────────────
async function loadCustomers() {
    try {
        const res = await fetch(`${API}/api/customers`);
        const data = await res.json();
        state.customers = data.customers;
        renderCustomerList();
    } catch (err) {
        console.error("Failed to load customers:", err);
    }
}

function renderCustomerList() {
    const list = document.getElementById("customerList");
    list.innerHTML = "";

    state.customers.forEach((c) => {
        const card = document.createElement("div");
        card.className = `customer-card ${
            state.currentCustomer?.id === c.id ? "active" : ""
        }`;
        card.onclick = () => selectCustomer(c);

        const flight = c.flights?.[0];
        const statusClass = flight
            ? flight.status.toLowerCase().replace(/\s/g, "-")
            : "";

        card.innerHTML = `
            <div class="customer-card-header">
                <div class="customer-avatar">${c.name.charAt(0)}</div>
                <div class="customer-meta">
                    <div class="customer-name">${c.name}</div>
                    <span class="tier-pill tier-${c.loyalty_tier.toLowerCase()}">${c.loyalty_tier}</span>
                </div>
            </div>
            <div class="flight-info">
                <div class="flight-route">${flight ? flight.route : "N/A"}</div>
                <div class="flight-number">${flight ? flight.flight_number : ""} · ${c.booking_reference}</div>
            </div>
            <div class="status-badge status-${statusClass}">
                ${flight ? flight.status : "Unknown"}
                ${flight?.delay_hours ? ` (${flight.delay_hours}h)` : ""}
            </div>
        `;
        list.appendChild(card);
    });
}

// ──────────────────────────────────────────
// Mobile Drawer Controls (sidebar & cockpit panel)
// ──────────────────────────────────────────
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("drawerOverlay");
    const isOpen = sidebar.classList.contains("drawer-open");
    closeDrawers();
    if (!isOpen) {
        sidebar.classList.add("drawer-open");
        overlay.classList.add("visible");
    }
}

function toggleActionPanel() {
    const panel = document.getElementById("actionPanel");
    const overlay = document.getElementById("drawerOverlay");
    const isOpen = panel.classList.contains("drawer-open");
    closeDrawers();
    if (!isOpen) {
        panel.classList.add("drawer-open");
        overlay.classList.add("visible");
    }
}

function closeDrawers() {
    document.getElementById("sidebar").classList.remove("drawer-open");
    document.getElementById("actionPanel").classList.remove("drawer-open");
    document.getElementById("drawerOverlay").classList.remove("visible");
}

function isMobileViewport() {
    return window.matchMedia("(max-width: 900px)").matches;
}

function selectCustomerById(id) {
    const target = state.customers.find(c => c.id === id);
    if (target) {
        selectCustomer(target);
    }
}

// ──────────────────────────────────────────
// Customer Selection & Session Setup
// ──────────────────────────────────────────
async function selectCustomer(customer) {
    if (state.currentCustomer?.id === customer.id && state.sessionId) return;

    state.currentCustomer = customer;
    state.issuedVouchers = [];
    renderCustomerList();

    // On mobile, close the passenger drawer once a selection is made
    if (isMobileViewport()) {
        closeDrawers();
    }

    // Toggle panels
    document.getElementById("welcomeScreen").style.display = "none";
    document.getElementById("chatContainer").style.display = "flex";
    document.getElementById("panelEmpty").style.display = "none";

    // Update Header
    document.getElementById("headerAvatar").textContent = customer.name.charAt(0);
    document.getElementById("headerName").textContent = customer.name;
    const tierBadge = document.getElementById("headerTierBadge");
    tierBadge.textContent = customer.loyalty_tier.toUpperCase();
    tierBadge.className = `tier-pill tier-${customer.loyalty_tier.toLowerCase()}`;

    const flight0 = customer.flights[0];
    document.getElementById("headerDetails").textContent =
        `PNR: ${customer.booking_reference} · ${flight0.flight_number} (${flight0.route})`;

    document.getElementById("sessionStatusLabel").textContent = "Agent Active";
    document.getElementById("headerStatus").className = "session-active-pill";

    // Show cockpit panels
    ["flightSection", "walletSection", "sentimentSection", "actionSection"].forEach(
        (id) => (document.getElementById(id).style.display = "block")
    );

    // Clear previous state
    document.getElementById("chatMessages").innerHTML = "";
    document.getElementById("actionTimeline").innerHTML =
        '<div class="empty-state" id="emptyActions"><span class="empty-icon">📋</span><p>No policy actions executed yet</p></div>';
    document.getElementById("escalationBanner").style.display = "none";
    updateSentiment("neutral");
    updateWallet([]);

    // Render Boarding Pass & Quick Prompts
    renderBoardingPass(customer);
    renderQuickPrompts(customer.id, false);

    // Create session on server
    try {
        const res = await fetch(`${API}/api/session/new`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customer_id: customer.id }),
        });
        const data = await res.json();
        state.sessionId = data.session_id;

        const firstName = customer.name.split(" ")[0];
        let disruptionDesc = "";
        if (flight0.status === "Cancelled") {
            disruptionDesc = `I can see flight ${flight0.flight_number} from ${flight0.route} was cancelled due to operational reasons.`;
        } else if (flight0.status === "Delayed") {
            disruptionDesc = `I see your flight ${flight0.flight_number} is delayed by ${flight0.delay_hours} hours, with new departure at ${flight0.new_departure}.`;
        }

        addMessage(
            "agent",
            `Hello ${firstName}! 👋 I am SkyAssist from SkyWay Airlines support. ${disruptionDesc} I am here to help you with immediate resolution, rebooking, vouchers, and any questions you have today.`
        );
    } catch (err) {
        console.error("Failed to create session:", err);
        addMessage("agent", "I'm sorry, I encountered a temporary connection issue. Please try clicking Reset Session.");
    }
}

// ──────────────────────────────────────────
// Digital Boarding Pass Rendering
// ──────────────────────────────────────────
function renderBoardingPass(customer) {
    const container = document.getElementById("flightDetails");
    container.innerHTML = "";

    const flight = customer.flights[0];
    const parts = flight.route.split("→").map(s => s.trim());
    const origin = parts[0] || "DEL";
    const dest = parts[1] || "GOI";

    const codeMap = {
        "Delhi": "DEL",
        "Goa": "GOI",
        "Mumbai": "BOM",
        "Bengaluru": "BLR",
        "Hyderabad": "HYD"
    };

    const origCode = codeMap[origin] || origin.substring(0, 3).toUpperCase();
    const destCode = codeMap[dest] || dest.substring(0, 3).toUpperCase();
    const statusClass = flight.status.toLowerCase().replace(/\s/g, "-");

    const card = document.createElement("div");
    card.className = "boarding-pass-card";
    card.innerHTML = `
        <div class="bp-top">
            <span class="bp-flight-pill">${flight.flight_number}</span>
            <span class="status-badge status-${statusClass}">${flight.status}</span>
        </div>
        <div class="bp-body">
            <div class="bp-route-hero">
                <div>
                    <div class="bp-airport-code">${origCode}</div>
                    <div class="bp-airport-city">${origin}</div>
                </div>
                <div class="bp-flight-plane">✈</div>
                <div style="text-align: right;">
                    <div class="bp-airport-code">${destCode}</div>
                    <div class="bp-airport-city">${dest}</div>
                </div>
            </div>
            <div class="bp-grid">
                <div>
                    <div class="bp-col-label">Date</div>
                    <div class="bp-col-val">${flight.date.split(" ").slice(0, 3).join(" ")}</div>
                </div>
                <div>
                    <div class="bp-col-label">Scheduled</div>
                    <div class="bp-col-val">${flight.scheduled_departure}</div>
                </div>
                ${flight.new_departure ? `
                <div>
                    <div class="bp-col-label">New Time</div>
                    <div class="bp-col-val bp-rescheduled">${flight.new_departure}</div>
                </div>` : ""}
                <div>
                    <div class="bp-col-label">Tier Seating</div>
                    <div class="bp-col-val" style="color:var(--accent-cyan)">${customer.loyalty_tier} Priority</div>
                </div>
            </div>
        </div>
    `;
    container.appendChild(card);
}

// ──────────────────────────────────────────
// Digital Wallet & Vouchers
// ──────────────────────────────────────────
function updateWallet(actions) {
    const container = document.getElementById("walletContainer");

    // Extract newly issued vouchers or benefits
    actions.forEach(a => {
        if (a.type === "meal_voucher" && !state.issuedVouchers.some(v => v.type === "meal_voucher")) {
            state.issuedVouchers.push({
                type: "meal_voucher",
                icon: "🍽️",
                title: "₹500 Digital Meal Voucher",
                desc: "Valid at all airport dining & cafés"
            });
        }
        if (a.type === "lounge_access" && !state.issuedVouchers.some(v => v.type === "lounge_access")) {
            state.issuedVouchers.push({
                type: "lounge_access",
                icon: "🛋️",
                title: "Executive Lounge Pass",
                desc: "Mezzanine Level · Complimentary Entry"
            });
        }
        if (a.type === "hotel_accommodation" && !state.issuedVouchers.some(v => v.type === "hotel_accommodation")) {
            state.issuedVouchers.push({
                type: "hotel_accommodation",
                icon: "🏨",
                title: "Day-Use Hotel Voucher",
                desc: "Covers 6-hour delay window"
            });
        }
        if (a.type === "refund_initiated" && !state.issuedVouchers.some(v => v.type === "refund_initiated")) {
            state.issuedVouchers.push({
                type: "refund_initiated",
                icon: "💰",
                title: "100% Sector Refund Initiated",
                desc: "7 Business Days · Original Payment Method"
            });
        }
        if (a.type === "rebook" && !state.issuedVouchers.some(v => v.type === "rebook")) {
            state.issuedVouchers.push({
                type: "rebook",
                icon: "🔄",
                title: "Rebooking Confirmed (SK-206)",
                desc: "Departure 21:30 tonight · Priority Seat"
            });
        }
    });

    if (state.issuedVouchers.length === 0) {
        container.innerHTML = '<div class="empty-wallet-note">No vouchers or compensation issued yet</div>';
        return;
    }

    container.innerHTML = "";
    state.issuedVouchers.forEach(v => {
        const item = document.createElement("div");
        item.className = "voucher-pill-card";
        item.innerHTML = `
            <div class="voucher-left">
                <span class="voucher-icon">${v.icon}</span>
                <div>
                    <div class="voucher-title">${v.title}</div>
                    <div class="voucher-subtitle">${v.desc}</div>
                </div>
            </div>
            <span class="voucher-status-tag">ACTIVE</span>
        `;
        container.appendChild(item);
    });
}

// ──────────────────────────────────────────
// Quick Prompts (Includes Normal Questions Post-Escalation)
// ──────────────────────────────────────────
function renderQuickPrompts(customerId, isEscalated) {
    const container = document.getElementById("qpContainer");
    container.innerHTML = "";

    let prompts = [];

    if (customerId === "priya_nair") {
        prompts = [
            { label: "⚡ Scenario 1: Demand Refund + Upgrade", text: "I am furious! My flight got cancelled. I want a full cash refund plus a free upgrade to business class on my return flight for all this trouble!" },
            { label: "🏢 What terminal do you depart from?", text: "What terminal does my flight operate from at the airport?" },
            { label: "🔁 Is my return flight confirmed?", text: "Is my return flight SK-204R on Friday still confirmed?" },
            { label: "🍽️ Where can I use my meal voucher?", text: "Where can I use my meal voucher at the airport?" },
            { label: "⚖️ Legal Threat Test", text: "This is unacceptable! I am contacting my lawyer and taking legal action in consumer court!" }
        ];
    } else if (customerId === "arvind_kulkarni") {
        prompts = [
            { label: "⚡ Scenario 2: 4h Delay Hotel Request", text: "My flight is delayed 4 hours! I'm missing my connecting meeting. I want a hotel room arranged since it's such a long delay." },
            { label: "🛋️ Where is the lounge located?", text: "Where is the executive lounge located in the airport?" },
            { label: "🏢 Which terminal is flight SK-118?", text: "Which terminal and gate should I go to for flight SK-118?" },
            { label: "🍽️ How to redeem meal voucher?", text: "How do I redeem my ₹500 meal voucher?" },
            { label: "⚖️ Formal Complaint Test", text: "I am going to file a formal complaint against SkyWay Airlines for this delay." }
        ];
    } else if (customerId === "meher_kaur") {
        prompts = [
            { label: "⚡ Scenario 3: Full Night Hotel + ₹2,000 Waiver", text: "I'm delayed 6 hours. I want a full night's hotel stay, and I want to be moved to flight SK-307 right now without paying the ₹2,000 fare difference." },
            { label: "🏢 Where can I rest during the delay?", text: "Where is the day hotel accommodation located and what terminal?" },
            { label: "🕒 When will the supervisor contact me?", text: "What time will the supervisor contact me about the fare difference?" },
            { label: "🍽️ Meal voucher instructions?", text: "Where can I use my meal voucher at Delhi airport?" }
        ];
    }

    prompts.forEach(p => {
        const btn = document.createElement("button");
        btn.className = "qp-chip";
        btn.textContent = p.label;
        btn.title = p.text;
        btn.onclick = () => {
            const input = document.getElementById("messageInput");
            input.value = p.text;
            input.focus();
            sendMessage();
        };
        container.appendChild(btn);
    });
}

// ──────────────────────────────────────────
// Chat Messaging
// ──────────────────────────────────────────
function addMessage(role, text) {
    const container = document.getElementById("chatMessages");
    const msg = document.createElement("div");
    msg.className = `message ${role}`;

    const now = new Date();
    const time = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const avatarContent =
        role === "agent"
            ? "✈"
            : state.currentCustomer?.name?.charAt(0) || "U";

    msg.innerHTML = `
        <div class="message-avatar ${role}">${avatarContent}</div>
        <div class="message-content">
            <div class="message-bubble">${formatMessage(text)}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

function formatMessage(text) {
    return text
        .replace(/\n/g, "<br>")
        .replace(/₹(\d[\d,]*)/g, '<span class="currency">₹$1</span>');
}

function showTyping() {
    const container = document.getElementById("chatMessages");
    const typing = document.createElement("div");
    typing.className = "message agent";
    typing.id = "typingIndicator";
    typing.innerHTML = `
        <div class="message-avatar agent">✈</div>
        <div class="message-content">
            <div class="typing-indicator">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
        </div>
    `;
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
}

function hideTyping() {
    const el = document.getElementById("typingIndicator");
    if (el) el.remove();
}

// ──────────────────────────────────────────
// Send Message
// ──────────────────────────────────────────
async function sendMessage() {
    const input = document.getElementById("messageInput");
    const text = input.value.trim();
    if (!text || state.isLoading || !state.sessionId) return;

    input.value = "";
    input.style.height = "auto";
    addMessage("user", text);

    state.isLoading = true;
    document.getElementById("sendBtn").disabled = true;
    showTyping();

    try {
        const res = await fetch(`${API}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_id: state.sessionId,
                message: text,
            }),
        });

        const data = await res.json();
        hideTyping();

        if (data.message) {
            addMessage("agent", data.message);
        }

        // Update actions and digital wallet
        if (data.actions && data.actions.length > 0) {
            renderActions(data.actions);
            updateWallet(data.actions);
        }

        // Update sentiment
        if (data.sentiment) {
            updateSentiment(data.sentiment);
        }

        // Handle Non-Blocking Escalation
        if (data.needs_escalation) {
            showEscalation(data.escalation_reason);
            // Re-render quick prompts to include normal follow-up inquiries
            renderQuickPrompts(state.currentCustomer.id, true);
        }
    } catch (err) {
        hideTyping();
        console.error("Chat error:", err);
        addMessage(
            "agent",
            "I apologize, I encountered a temporary connection issue. Please retry your question."
        );
    } finally {
        state.isLoading = false;
        document.getElementById("sendBtn").disabled = false;
        input.focus();
    }
}

function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

// Auto-expand input textarea
document.addEventListener("DOMContentLoaded", () => {
    const textarea = document.getElementById("messageInput");
    if (textarea) {
        textarea.addEventListener("input", function () {
            this.style.height = "auto";
            this.style.height = Math.min(this.scrollHeight, 120) + "px";
        });
    }
});

// ──────────────────────────────────────────
// Policy Actions Audit Timeline
// ──────────────────────────────────────────
function renderActions(actions) {
    const container = document.getElementById("actionTimeline");
    container.innerHTML = "";

    actions.forEach((a) => {
        const item = document.createElement("div");
        item.className = "action-item";

        const icon = getActionIcon(a.type);
        const color = getActionColor(a.type);

        item.innerHTML = `
            <div class="action-dot" style="background:${color}20; color:${color}; border:1px solid ${color}60;">
                <span>${icon}</span>
            </div>
            <div class="action-body">
                <div class="action-type" style="color:${color}">${formatActionType(a.type)}</div>
                <div class="action-text">${a.description}</div>
                <div class="action-time">${a.timestamp}</div>
            </div>
        `;
        container.appendChild(item);
    });
}

function getActionIcon(type) {
    const icons = {
        rebook: "🔄",
        meal_voucher: "🍽️",
        lounge_access: "🛋️",
        hotel_accommodation: "🏨",
        refund_initiated: "💰",
        escalate: "🚨",
        info_provided: "ℹ️",
        none: "·",
    };
    return icons[type] || "📋";
}

function getActionColor(type) {
    const colors = {
        rebook: "#38bdf8",
        meal_voucher: "#34d399",
        lounge_access: "#c084fc",
        hotel_accommodation: "#fbbf24",
        refund_initiated: "#22d3ee",
        escalate: "#fb7185",
        info_provided: "#94a3b8",
    };
    return colors[type] || "#94a3b8";
}

function formatActionType(type) {
    return type
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
}

// ──────────────────────────────────────────
// Sentiment Radar
// ──────────────────────────────────────────
function updateSentiment(sentiment) {
    const emojis = {
        neutral: "😐",
        frustrated: "😤",
        angry: "😠",
        satisfied: "😊",
        confused: "😕",
    };
    const labels = {
        neutral: "Neutral Passenger",
        frustrated: "Frustrated Passenger",
        angry: "Agitated / Distressed",
        satisfied: "Reassured / Satisfied",
        confused: "Confused",
    };
    const descriptions = {
        neutral: "Standard inquiry state",
        frustrated: "Disruption impact acknowledged",
        angry: "High-priority de-escalation active",
        satisfied: "Resolution accepted by customer",
        confused: "Clarification provided",
    };

    document.getElementById("sentimentEmoji").textContent = emojis[sentiment] || "😐";
    document.getElementById("sentimentLabel").textContent = labels[sentiment] || "Neutral Passenger";
    document.getElementById("sentimentDesc").textContent = descriptions[sentiment] || "Inquiry state";

    const indicator = document.getElementById("sentimentIndicator");
    indicator.className = `sentiment-indicator sentiment-${sentiment}`;
}

// ──────────────────────────────────────────
// Non-Blocking Supervisor Escalation Banner
// ──────────────────────────────────────────
function showEscalation(reason) {
    const banner = document.getElementById("escalationBanner");
    banner.style.display = "flex";
    document.getElementById("escalationReason").textContent =
        reason || "This case has been logged for supervisor authorization.";

    // Update status badge
    const statusLabel = document.getElementById("sessionStatusLabel");
    statusLabel.textContent = "Supervisor Case Logged (Chat Open)";
    const statusPill = document.getElementById("headerStatus");
    statusPill.style.background = "rgba(244, 63, 94, 0.15)";
    statusPill.style.borderColor = "rgba(244, 63, 94, 0.4)";
    statusPill.style.color = "#fb7185";
}

// ──────────────────────────────────────────
// Session Reset & Key Modal
// ──────────────────────────────────────────
async function resetSession() {
    if (state.sessionId) {
        try {
            await fetch(`${API}/api/session/reset`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id: state.sessionId }),
            });
        } catch {}
    }

    state.sessionId = null;
    state.currentCustomer = null;
    state.issuedVouchers = [];

    document.getElementById("welcomeScreen").style.display = "flex";
    document.getElementById("chatContainer").style.display = "none";
    document.getElementById("panelEmpty").style.display = "flex";
    document.getElementById("escalationBanner").style.display = "none";

    ["flightSection", "walletSection", "sentimentSection", "actionSection"].forEach(
        (id) => (document.getElementById(id).style.display = "none")
    );

    renderCustomerList();
}

function toggleKeyModal() {
    const modal = document.getElementById("keyModal");
    modal.style.display = modal.style.display === "none" ? "flex" : "none";
    if (modal.style.display === "flex") {
        document.getElementById("groqKeyInput").focus();
    }
}

function closeKeyModalOnOverlay(e) {
    if (e.target.id === "keyModal") {
        toggleKeyModal();
    }
}

async function saveGroqKey() {
    const key = document.getElementById("groqKeyInput").value.trim();
    if (!key) return;

    try {
        const res = await fetch(`${API}/api/set-key`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groq_api_key: key })
        });
        const data = await res.json();
        if (data.success || data.groq_configured) {
            updateModelBadge(true, "openai/gpt-oss-120b");
            toggleKeyModal();
            alert("Groq API key activated successfully! GPT-OSS 120B is now active.");
        } else {
            alert("Could not activate key. Please verify your Groq key format.");
        }
    } catch (e) {
        alert("Failed to connect to server: " + e.message);
    }
}
