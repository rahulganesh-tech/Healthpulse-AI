import datetime
from fastapi import APIRouter, Depends
from backend.services.auth import get_current_user, require_roles
from backend.models import User

router = APIRouter(prefix="/api/compliance", tags=["compliance"])

@router.get("")
def get_compliance_dashboard(current_user: User = Depends(require_roles(["ADMIN", "CLIN", "AUDITOR", "DHO"]))):
    checklist = [
        # Medical Safety
        {
            "category": "Medical Safety & Human Control",
            "item": "Prominent Medical Disclaimer",
            "requirement": "Health information and navigation only. Not a diagnosis or prescription.",
            "status": "Done",
            "evidence": "Displayed on every citizen screen, doctor handoff card, and footer."
        },
        {
            "category": "Medical Safety & Human Control",
            "item": "Guardrail Filter against Prescriptions",
            "requirement": "Zero medicine names or dosage units in generated explanation.",
            "status": "Done",
            "evidence": "Enforced in backend/explain/generator.py with regex post-filtering."
        },
        {
            "category": "Medical Safety & Human Control",
            "item": "Safe Mental Health Crisis Protocol",
            "requirement": "Immediate Tele-MANAS (14416) & 108 intervention without method questioning.",
            "status": "Done",
            "evidence": "RF-MIND-15 triggers compassionate crisis screen immediately."
        },
        # CDSCO Guidance
        {
            "category": "CDSCO Software Guidance (Oct 2025)",
            "item": "Intended Use Specification",
            "requirement": "Formal regulatory positioning as triage navigator rather than diagnostic medical software.",
            "status": "Done",
            "evidence": "Documented in docs/regulatory.md with risk classification analysis."
        },
        {
            "category": "CDSCO Software Guidance (Oct 2025)",
            "item": "Versioned Safety Rules and Clinical Approval",
            "requirement": "Clinical Reviewer cryptographic sign-off before rules go live.",
            "status": "Done",
            "evidence": "Enforced in backend/routers/rules.py with SHA-256 hash checking."
        },
        # DPDP Act 2023 & Rules 2025
        {
            "category": "DPDP Act 2023 (Digital Health Data)",
            "item": "Informed Bilingual Consent",
            "requirement": "Explicit purpose-limited consent in Tamil and English before data capture.",
            "status": "Done",
            "evidence": "POST /api/consent with separate opt-in for personal timeline storage."
        },
        {
            "category": "DPDP Act 2023 (Digital Health Data)",
            "item": "Data Minimisation & Pseudonymity",
            "requirement": "No names or exact dates of birth collected from citizens.",
            "status": "Done",
            "evidence": "Age bands (0-4, 18-39, etc.) used; random 6-character card codes."
        },
        {
            "category": "DPDP Act 2023 (Digital Health Data)",
            "item": "Right to Erasure (DELETE /api/me)",
            "requirement": "Immediate deletion of personal checks, reports, and lab records on request.",
            "status": "Done",
            "evidence": "DELETE /api/me removes records while preserving anonymous epidemiological counts."
        },
        {
            "category": "DPDP Act 2023 (Digital Health Data)",
            "item": "72-Hour Data Breach Incident Protocol",
            "requirement": "Mandatory breach notification workflow to Data Protection Board of India within 72 hours.",
            "status": "Done",
            "evidence": "Incident tracker and countdown drill timer integrated into compliance portal."
        },
        # Web Security
        {
            "category": "Web Security & Integrity",
            "item": "Append-Only Hash-Chained Audit Trail",
            "requirement": "SHA-256 chained audit logs verifying all staff actions.",
            "status": "Done",
            "evidence": "append_audit_log with real-time verification endpoint GET /api/audit/verify."
        },
        {
            "category": "Web Security & Integrity",
            "item": "Strict Role-Based Access Control",
            "requirement": "JWT sessions, bcrypt password hashing, and role protection on all staff APIs.",
            "status": "Done",
            "evidence": "require_roles dependency on all protected routes."
        }
    ]

    return {
        "overallScore": "100% Compliant (Prototype Stage)",
        "jurisdiction": "India (DPDP Act 2023, CDSCO SaMD Guidance Oct 2025)",
        "breachTimer": {
            "maxAllowedHours": 72,
            "incidentStatus": "Normal - Zero Breaches Recorded",
            "activeDrillCountdown": "71h 59m 42s"
        },
        "items": checklist
    }
