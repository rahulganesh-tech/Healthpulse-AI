import os
from backend.reports.extractor import parse_report_text

SAMPLE_REPORTS = [
    {
        "filename": "sample_01_cbc_lakshmi_jan.txt",
        "content": """
        NELLAI DIAGNOSTICS & RESEARCH LAB
        PATIENT: DEMO CITIZEN | AGE: 45 | SEX: F
        DATE: 15-JAN-2026
        ------------------------------------------
        COMPLETE BLOOD COUNT (CBC)
        Haemoglobin (Hb)              : 11.2 g/dL     (12.0 - 16.0)
        Platelet Count (PLT)          : 260,000 /µL   (150,000 - 450,000)
        Total Leucocyte Count (TLC)   : 6,400 /µL     (4,000 - 11,000)
        ------------------------------------------
        """,
        "expected": {"HB": 11.2, "PLT": 260000, "WBC": 6400}
    },
    {
        "filename": "sample_02_cbc_lakshmi_apr.txt",
        "content": """
        NELLAI DIAGNOSTICS & RESEARCH LAB
        PATIENT: DEMO CITIZEN | AGE: 45 | SEX: F
        DATE: 10-APR-2026
        ------------------------------------------
        Haemoglobin (Hb)              : 10.1 g/dL     (12.0 - 16.0)
        Platelet Count (PLT)          : 245,000 /µL   (150,000 - 450,000)
        White Blood Cells (WBC)       : 6,100 /µL     (4,000 - 11,000)
        ------------------------------------------
        """,
        "expected": {"HB": 10.1, "PLT": 245000, "WBC": 6100}
    },
    {
        "filename": "sample_03_cbc_lakshmi_jul.txt",
        "content": """
        NELLAI DIAGNOSTICS & RESEARCH LAB
        PATIENT: DEMO CITIZEN | AGE: 45 | SEX: F
        DATE: 20-JUL-2026
        ------------------------------------------
        Haemoglobin (Hb)              : 8.9 g/dL      (12.0 - 16.0)  LOW
        Platelet Count (PLT)          : 230,000 /µL   (150,000 - 450,000)
        Total WBC Count               : 5,900 /µL     (4,000 - 11,000)
        ------------------------------------------
        """,
        "expected": {"HB": 8.9, "PLT": 230000, "WBC": 5900}
    },
    {
        "filename": "sample_04_critical_thrombocytopenia.txt",
        "content": """
        TIRUNELVELI CLINICAL PATHOLOGY
        Platelet Count                : 18,000 /µL    (150,000 - 450,000) CRITICAL
        Haemoglobin                   : 12.5 g/dL     (12.0 - 16.0)
        """,
        "expected": {"PLT": 18000, "HB": 12.5}
    },
    {
        "filename": "sample_05_severe_anaemia.txt",
        "content": """
        GOVERNMENT HEADQUARTERS HOSPITAL LAB
        Hb (Haemoglobin)              : 6.4 g/dL      (12.0 - 16.0) CRITICAL
        Total Leucocyte Count         : 7,200 /µL     (4,000 - 11,000)
        """,
        "expected": {"HB": 6.4, "WBC": 7200}
    },
    {
        "filename": "sample_06_diabetic_profile.txt",
        "content": """
        COMMUNITY HEALTH SCREENING LAB
        Fasting Blood Sugar (FBS)     : 184 mg/dL     (70 - 100) HIGH
        HbA1c                         : 9.2 %         (4.0 - 5.6) HIGH
        """,
        "expected": {"FBS": 184.0, "HBA1C": 9.2}
    },
    {
        "filename": "sample_07_renal_profile.txt",
        "content": """
        NELLAI RENAL CARE CLINIC
        Serum Creatinine              : 3.4 mg/dL     (0.6 - 1.2) HIGH
        Blood Urea                    : 68 mg/dL      (15 - 40) HIGH
        """,
        "expected": {"CREAT": 3.4, "UREA": 68.0}
    },
    {
        "filename": "sample_08_acute_infection.txt",
        "content": """
        PHC SATELLITE LABORATORY
        Total Leukocyte Count (TLC)   : 18,500 /µL    (4,000 - 11,000) HIGH
        Platelet Count                : 310,000 /µL   (150,000 - 450,000)
        """,
        "expected": {"WBC": 18500, "PLT": 310000}
    },
    {
        "filename": "sample_09_thyroid_profile.txt",
        "content": """
        DISTRICT ENDOCRINE CENTER
        Serum TSH                     : 8.6 µIU/mL    (0.4 - 4.5) HIGH
        Haemoglobin                   : 12.0 g/dL     (12.0 - 16.0)
        """,
        "expected": {"TSH": 8.6, "HB": 12.0}
    },
    {
        "filename": "sample_10_routine_health_check.txt",
        "content": """
        AYUSHMAN AROGYA MANDIR LAB
        Haemoglobin (Hb)              : 13.8 g/dL     (12.0 - 16.0)
        Platelets                     : 280,000 /µL   (150,000 - 450,000)
        Random Blood Sugar (RBS)      : 110 mg/dL     (70 - 140)
        Serum Cholesterol             : 175 mg/dL     (125 - 200)
        """,
        "expected": {"HB": 13.8, "PLT": 280000, "RBS": 110.0, "CHOL": 175.0}
    }
]

def create_sample_reports():
    os.makedirs("data/sample_reports", exist_ok=True)
    for rep in SAMPLE_REPORTS:
        fp = os.path.join("data/sample_reports", rep["filename"])
        with open(fp, "w", encoding="utf-8") as f:
            f.write(rep["content"].strip())
    print("10 synthetic lab reports created in data/sample_reports/")

if __name__ == "__main__":
    create_sample_reports()
