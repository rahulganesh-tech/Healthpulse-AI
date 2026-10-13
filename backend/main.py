import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.config import settings
from backend.routers import (
    auth, checks, reports, cards, care, pulse,
    zones, rules, models, audit, users, whatsapp,
    consent, compliance
)

app = FastAPI(
    title="HealthPulse AI API",
    description="Tamil-first safety-engineered health navigator and syndromic surveillance platform for rural Tamil Nadu (SEVA First Innovation Challenge 2026).",
    version="1.0.0"
)

# CORS allow-list configuration (Prompt 10 Part D)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all feature routers
app.include_router(consent.router)
app.include_router(checks.router)
app.include_router(reports.router)
app.include_router(cards.router)
app.include_router(care.router)
app.include_router(whatsapp.router)
app.include_router(auth.router)
app.include_router(pulse.router)
app.include_router(zones.router)
app.include_router(rules.router)
app.include_router(models.router)
app.include_router(audit.router)
app.include_router(users.router)
app.include_router(compliance.router)

@app.get("/")
def health_check():
    return {
        "status": "online",
        "app": "HealthPulse AI",
        "version": "1.0.0",
        "district": "Tirunelveli, Tamil Nadu",
        "documentation": "/docs"
    }

@app.get("/api/health")
def api_status():
    return {"status": "ok", "app": "HealthPulse AI", "timestamp": "2026-10-13T20:30:00Z"}
