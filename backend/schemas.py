from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional, Any
from datetime import datetime

def to_camel(string: str) -> str:
    components = string.split("_")
    return components[0] + "".join(x.title() for x in components[1:])

class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )

# Structured Record Schema (Prompt 3 & 4)
class LabItem(CamelModel):
    test: str
    value: float
    unit: str = ""

class StructuredRecord(CamelModel):
    age_band: str = "18-39"
    sex: str = "M"
    pregnant: bool = False
    child_under5: bool = False
    conditions: List[str] = Field(default_factory=list)
    duration_days: int = 1
    symptoms: List[str] = Field(default_factory=list)
    danger_answers: Dict[str, Any] = Field(default_factory=dict)
    vitals: Dict[str, Any] = Field(default_factory=dict)
    lab: List[LabItem] = Field(default_factory=list)
    minimising_phrases: List[str] = Field(default_factory=list)
    context: Dict[str, Any] = Field(default_factory=dict)
    hb_drop_amount: float = 0.0

# Citizen Schemas
class ConsentRequest(CamelModel):
    language: str = "ta"
    save_timeline: bool = False
    purposes: List[str] = Field(default_factory=lambda: ["symptom_triage", "anonymous_public_health"])

class ConsentResponse(CamelModel):
    owner_token: str
    message: str

class CheckParseRequest(CamelModel):
    text: str
    language: str = "ta"
    age_band: str = "18-39"
    sex: str = "M"
    pregnant: bool = False
    child_under5: bool = False
    conditions: List[str] = Field(default_factory=list)

class DangerQuestion(CamelModel):
    id: str
    question_en: str
    question_ta: str
    group: str

class CheckParseResponse(CamelModel):
    cleaned_text: str
    extracted_symptoms: List[str]
    duration_days: int
    minimising_phrases_found: List[str]
    read_back_sentence_en: str
    read_back_sentence_ta: str
    danger_questions: List[DangerQuestion]
    structured_record: StructuredRecord

class CareOption(CamelModel):
    name: str
    type: str  # phc, aam, hospital, tele_manas, esanjeevani
    distance_km: Optional[float] = None
    phone: str
    action_text: str

class CheckCreateRequest(CamelModel):
    channel: str = "web"
    language: str = "ta"
    phc_id: Optional[str] = None
    asha_id: Optional[str] = None
    owner_token: Optional[str] = None
    record: StructuredRecord

class CheckResultResponse(CamelModel):
    check_id: str
    card_code: str
    final_level: str  # SELF_CARE, PHC_VISIT, URGENT, EMERGENCY, CRISIS
    rule_level: str
    model_level: str
    reason: str
    rule_hits: List[Dict[str, Any]]
    model_top_factors: List[str]
    next_step: str
    next_step_ta: str
    care_options: List[CareOption]
    explanation: str
    explanation_ta: str
    doctor_questions: List[str]
    rules_version: str
    model_version: str
    minimising_warning: Optional[str] = None

# Lab Reports
class LabValueSchema(CamelModel):
    test_code: str
    value: float
    unit: str
    ref_low: Optional[float] = None
    ref_high: Optional[float] = None
    flag: str  # LOW, NORMAL, HIGH, CRITICAL
    meaning_en: str = ""
    meaning_ta: str = ""

class ReportConfirmRequest(CamelModel):
    report_id: str
    owner_token: str
    report_date: Optional[str] = None
    confirmed_values: List[LabValueSchema]

class ReportResponse(CamelModel):
    report_id: str
    uploaded_at: str
    source: str
    values: List[LabValueSchema]
    overall_urgency: str
    trend_notes: List[str]
    questions_for_doctor: List[str]
    explanation_en: str
    explanation_ta: str

class TimelineItem(CamelModel):
    report_id: str
    report_date: str
    values: List[LabValueSchema]

# Doctor Handoff Card
class DoctorCardResponse(CamelModel):
    card_code: str
    created_at: str
    channel: str
    language: str
    age_band: str
    sex: str
    pregnant: bool
    child_under5: bool
    conditions: List[str]
    symptoms: List[str]
    duration_days: int
    danger_answers: Dict[str, Any]
    report_values: List[LabValueSchema]
    urgency: str
    urgency_reason: str
    rules_version: str
    model_version: str
    qr_url: str
    pdf_url: str
    disclaimer: str = "Patient-reported information. Not a diagnosis."

# PHC and Zones
class PHCSchema(CamelModel):
    id: str
    name: str
    block: str
    district: str
    lat: float
    lng: float
    phone: str
    is_aam: bool
    zone_id: Optional[str] = None

# Typed Pydantic ZoneData - Crucial for ARC Fix (Prompt 7)
class ZoneData(CamelModel):
    id: str
    name: str
    block: str
    population: int
    vulnerability_score: float
    infrastructure_gap: float
    staffing_shortage: float
    medicine_stock_pct: float
    ambulance_coverage_pct: float
    maternal_high_risk_count: int
    child_malnutrition_pct: float
    phc_id: Optional[str] = None

class InterventionItem(CamelModel):
    id: str
    title: str
    category: str
    target_block: str
    priority_rank: int
    description: str
    rationale: str

class ZoneDetailResponse(CamelModel):
    zone: ZoneData
    gap_category: str  # Critical, High, Moderate, Low
    top_interventions: List[InterventionItem]
    explanation: str

# Resource What-If
class ResourceWhatIfRequest(CamelModel):
    mobile_medical_units: int = 0
    medicine_kits: int = 0
    temporary_nurses: int = 0
    emergency_ambulances: int = 0

class ZoneImpact(CamelModel):
    zone_id: str
    zone_name: str
    original_score: float
    simulated_score: float
    score_reduction: float
    allocated_resources: List[str]

class ResourceWhatIfResponse(CamelModel):
    assumptions_reference: str = "docs/assumptions.md"
    zone_impacts: List[ZoneImpact]
    district_average_before: float
    district_average_after: float
    net_improvement: float

# Community Pulse Schemas
class PulseAlertSchema(CamelModel):
    id: str
    phc_id: str
    phc_name: str
    syndrome: str
    week_start: str
    ewma: float
    ucl: float
    baseline_mean: float
    baseline_sd: float
    status: str
    acknowledged_by: Optional[str] = None
    note: Optional[str] = None

class SyndromeCount(CamelModel):
    week_start: str
    count: str  # formatted (e.g. "<10" or "24")
    raw_count: int
    ewma: float
    ucl: float

class PulsePHCDetail(CamelModel):
    phc_id: str
    phc_name: str
    syndrome: str
    history: List[SyndromeCount]
    active_alert: Optional[PulseAlertSchema] = None
    baseline_mean: float
    baseline_sd: float
    current_ucl: float
    current_ewma: float

# Auth & Users
class LoginRequest(CamelModel):
    phone_or_email: str
    password: str
    otp: Optional[str] = None

class TokenResponse(CamelModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    role: str
    phc_id: Optional[str] = None

class UserSchema(CamelModel):
    id: str
    phone_or_email: str
    name: str
    role: str
    phc_id: Optional[str] = None
    active: bool

# Audit Trail
class AuditLogSchema(CamelModel):
    id: int
    ts: str
    actor: str
    role: str
    action: str
    detail: str
    prev_hash: str
    hash: str

class AuditVerifyResponse(CamelModel):
    intact: bool
    total_entries: int
    first_broken_entry: Optional[int] = None
    message: str
