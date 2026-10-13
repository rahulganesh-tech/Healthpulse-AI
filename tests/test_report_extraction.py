import os
import pytest
from backend.reports.extractor import parse_report_text
from data.generate_sample_reports import SAMPLE_REPORTS

def test_extraction_matches_sample_reports():
    for rep in SAMPLE_REPORTS:
        fp = os.path.join("data/sample_reports", rep["filename"])
        assert os.path.exists(fp)
        with open(fp, "r", encoding="utf-8") as f:
            text = f.read()
        
        extracted = parse_report_text(text)
        extracted_map = {item.test_code: item.value for item in extracted}
        
        for exp_code, exp_val in rep["expected"].items():
            assert exp_code in extracted_map, f"Failed to extract {exp_code} from {rep['filename']}"
            assert extracted_map[exp_code] == pytest.approx(exp_val, rel=1e-2), f"Value mismatch for {exp_code} in {rep['filename']}"
