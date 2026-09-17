"""
FastAPI server for SkyAssist — SkyWay Airlines Resolution Agent.
Serves the chat API and the static frontend.
"""
from __future__ import annotations

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

from .agent import AirlineAgent
from .data import CUSTOMERS, BOOKINGS

agent: AirlineAgent | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global agent
    agent = AirlineAgent()
    print("✈  SkyAssist agent initialised")
    yield
    print("✈  SkyAssist shutting down")


app = FastAPI(
    title="SkyAssist — Airline Resolution Agent",
    description="AI-powered customer support for SkyWay Airlines disruptions",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────
# Request / response models
# ──────────────────────────────────────────
class ChatRequest(BaseModel):
    session_id: str
    message: str


class SessionRequest(BaseModel):
    customer_id: str


class ConfigKeyRequest(BaseModel):
    groq_api_key: str


# ──────────────────────────────────────────
# API routes
# ──────────────────────────────────────────
@app.get("/api/customers")
def list_customers():
    """Return all customer profiles with their flight status."""
    customers = []
    for cid, c in CUSTOMERS.items():
        booking = BOOKINGS.get(c["booking_reference"], {})
        customers.append({
            "id": cid,
            "name": c["name"],
            "loyalty_tier": c["loyalty_tier"],
            "booking_reference": c["booking_reference"],
            "email": c["email"],
            "flights": booking.get("flights", [])
        })
    return {"customers": customers}


@app.post("/api/session/new")
def create_session(request: SessionRequest):
    """Start a new support session for a customer."""
    if not agent:
        raise HTTPException(status_code=500, detail="Agent not ready")
    result = agent.create_session(request.customer_id)
    if not result:
        raise HTTPException(status_code=404, detail="Customer not found")
    session_id, customer, booking = result
    return {
        "session_id": session_id,
        "customer": customer,
        "booking": booking,
        "groq_active": agent.is_groq_active()
    }


@app.post("/api/chat")
def chat(request: ChatRequest):
    """Process a customer message and return the agent's response."""
    if not agent:
        raise HTTPException(status_code=500, detail="Agent not ready")
    result = agent.process_message(request.session_id, request.message)
    if not result:
        raise HTTPException(
            status_code=404,
            detail="Session not found. Please start a new session."
        )
    return {
        "session_id": request.session_id,
        "groq_active": agent.is_groq_active(),
        **result
    }


@app.post("/api/session/reset")
def reset_session(request: dict):
    """Reset / end a support session."""
    if not agent:
        return {"success": False}
    session_id = request.get("session_id", "")
    agent.reset_session(session_id)
    return {"success": True}


@app.get("/api/status")
def get_status():
    """Check Groq API status and system health."""
    return {
        "status": "online",
        "groq_configured": agent.is_groq_active() if agent else False,
        "model": "openai/gpt-oss-120b" if (agent and agent.is_groq_active()) else "deterministic-policy-engine"
    }


@app.post("/api/set-key")
def set_groq_key(request: ConfigKeyRequest):
    """Dynamically configure or update the Groq API key."""
    if not agent:
        raise HTTPException(status_code=500, detail="Agent not ready")
    success = agent.set_api_key(request.groq_api_key.strip())
    return {
        "success": success,
        "groq_configured": agent.is_groq_active()
    }


@app.get("/api/health")
def health_check():
    return {"status": "ok", "agent_ready": agent is not None}


# ──────────────────────────────────────────
# Serve static frontend
# ──────────────────────────────────────────
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")


class NoCacheStaticFiles(StaticFiles):
    """Static file server that tells browsers/CDNs not to cache CSS/JS,
    so a redeploy is always reflected immediately (avoids stale mobile CSS)."""
    async def get_response(self, path, scope):
        response = await super().get_response(path, scope)
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response


app.mount("/static", NoCacheStaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
def serve_index():
    """Serve the main chat interface."""
    return FileResponse(os.path.join(STATIC_DIR, "index.html"), headers={
        "Cache-Control": "no-cache, no-store, must-revalidate"
    })
