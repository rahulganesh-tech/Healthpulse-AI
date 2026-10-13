import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey
)
from sqlalchemy.orm import relationship
from backend.database import Base

class PHC(Base):
    __tablename__ = "phcs"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    block = Column(String(100), nullable=False)
    district = Column(String(100), default="Tirunelveli")
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    phone = Column(String(50), nullable=False)
    is_aam = Column(Boolean, default=True)  # Ayushman Arogya Mandir
    zone_id = Column(String(50), nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True)
    phone_or_email = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False)  # ASHA, MO, DHO, CLIN, ADMIN, AUDITOR
    phc_id = Column(String(50), ForeignKey("phcs.id"), nullable=True)
    password_hash = Column(String(255), nullable=False)
    active = Column(Boolean, default=True)
    failed_logins = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)

class Check(Base):
    __tablename__ = "checks"

    id = Column(String(50), primary_key=True)  # "CHK-000123"
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    channel = Column(String(20), default="web")  # web, whatsapp, asha
    language = Column(String(10), default="ta")
    age_band = Column(String(20), nullable=False)  # 0-4, 5-17, 18-39, 40-59, 60+
    sex = Column(String(10), nullable=False)
    pregnant = Column(Boolean, default=False)
    conditions = Column(JSON, default=list)
    phc_id = Column(String(50), ForeignKey("phcs.id"), nullable=True)
    structured_input = Column(JSON, default=dict)
    minimising_phrases = Column(JSON, default=list)
    rule_hits = Column(JSON, default=list)
    rule_level = Column(String(20), default="SELF_CARE")
    model_level = Column(String(20), default="SELF_CARE")
    model_probs = Column(JSON, default=dict)
    model_top_factors = Column(JSON, default=list)
    final_level = Column(String(20), nullable=False)  # SELF_CARE, PHC_VISIT, URGENT, EMERGENCY, CRISIS
    explanation = Column(Text, nullable=True)
    rules_version = Column(String(50), default="0.3-draft")
    model_version = Column(String(50), default="triage-0.1")
    card_code = Column(String(10), index=True, nullable=False)  # 6-character
    asha_id = Column(String(50), nullable=True)
    owner_token = Column(String(100), index=True, nullable=True)
    expires_at = Column(DateTime, nullable=True)

class Report(Base):
    __tablename__ = "reports"

    id = Column(String(50), primary_key=True)
    check_id = Column(String(50), ForeignKey("checks.id"), nullable=True)
    owner_token = Column(String(100), index=True, nullable=False)
    uploaded_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    report_date = Column(String(50), nullable=True)
    source = Column(String(20), default="photo")  # photo, pdf
    extracted = Column(JSON, default=dict)
    confirmed = Column(JSON, default=dict)
    file_key = Column(String(255), nullable=True)

class LabValue(Base):
    __tablename__ = "lab_values"

    id = Column(String(50), primary_key=True)
    report_id = Column(String(50), ForeignKey("reports.id"), nullable=False)
    owner_token = Column(String(100), index=True, nullable=False)
    test_code = Column(String(20), nullable=False)  # HB, PLT, WBC, HBA1C, FBS, etc.
    value = Column(Float, nullable=False)
    unit = Column(String(20), default="")
    ref_low = Column(Float, nullable=True)
    ref_high = Column(Float, nullable=True)
    flag = Column(String(20), default="NORMAL")  # LOW, NORMAL, HIGH, CRITICAL
    recorded_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class PulseCount(Base):
    __tablename__ = "pulse_counts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    week_start = Column(String(20), nullable=False, index=True)
    phc_id = Column(String(50), ForeignKey("phcs.id"), nullable=False, index=True)
    syndrome = Column(String(50), nullable=False, index=True)  # FEVER, FEVER_BLEED_RASH, DIARRHOEA_VOMIT, COUGH_BREATH, HEAT
    count = Column(Integer, default=0)

class PulseAlert(Base):
    __tablename__ = "pulse_alerts"

    id = Column(String(50), primary_key=True)
    phc_id = Column(String(50), ForeignKey("phcs.id"), nullable=False)
    syndrome = Column(String(50), nullable=False)
    week_start = Column(String(20), nullable=False)
    ewma = Column(Float, nullable=False)
    ucl = Column(Float, nullable=False)
    baseline_mean = Column(Float, nullable=False)
    baseline_sd = Column(Float, nullable=False)
    status = Column(String(20), default="Open")  # Open, Acknowledged, Closed
    acknowledged_by = Column(String(100), nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class RulesVersion(Base):
    __tablename__ = "rules_versions"

    version = Column(String(50), primary_key=True)
    yaml_text = Column(Text, nullable=False)
    sha256 = Column(String(64), nullable=False)
    proposed_by = Column(String(100), nullable=False)
    approved_by = Column(String(100), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    vignette_results = Column(JSON, default=dict)
    active = Column(Boolean, default=False)

class ModelRegistry(Base):
    __tablename__ = "model_registry"

    model_version = Column(String(50), primary_key=True)
    trained_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    dataset = Column(String(100), default="synthetic_vignettes")
    metrics = Column(JSON, default=dict)
    approved_by = Column(String(100), nullable=True)
    active = Column(Boolean, default=False)

class Consent(Base):
    __tablename__ = "consents"

    id = Column(String(50), primary_key=True)
    owner_token = Column(String(100), unique=True, index=True, nullable=False)
    language = Column(String(10), default="ta")
    purposes = Column(JSON, default=list)
    given_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    withdrawn_at = Column(DateTime, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ts = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    actor = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False)
    action = Column(String(100), nullable=False)
    detail = Column(Text, nullable=False)
    prev_hash = Column(String(64), nullable=False)
    hash = Column(String(64), nullable=False)

# District View / ARC Healthcare Zones
class RuralHealthZone(Base):
    __tablename__ = "rural_health_zones"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    block = Column(String(100), nullable=False)
    population = Column(Integer, default=50000)
    vulnerability_score = Column(Float, nullable=False)
    infrastructure_gap = Column(Float, nullable=False)
    staffing_shortage = Column(Float, nullable=False)
    medicine_stock_pct = Column(Float, nullable=False)
    ambulance_coverage_pct = Column(Float, nullable=False)
    maternal_high_risk_count = Column(Integer, default=12)
    child_malnutrition_pct = Column(Float, default=14.0)
    phc_id = Column(String(50), nullable=True)

class InterventionRequest(Base):
    __tablename__ = "intervention_requests"

    id = Column(String(50), primary_key=True)
    zone_id = Column(String(50), ForeignKey("rural_health_zones.id"), nullable=False)
    intervention_type = Column(String(100), nullable=False)
    status = Column(String(20), default="Pending")  # Pending, Approved, In-Progress, Completed
    requested_by = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    notes = Column(Text, nullable=True)
