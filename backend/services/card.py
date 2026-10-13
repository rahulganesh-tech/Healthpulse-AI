import io
import qrcode
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_qr_bytes(card_url: str) -> bytes:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=6,
        border=2,
    )
    qr.add_data(card_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0F6E6E", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf.getvalue()

def generate_doctor_card_pdf(card_data: dict, card_url: str) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        textColor=colors.HexColor('#0F6E6E'),
        spaceAfter=4
    )
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10,
        textColor=colors.HexColor('#777777'),
        spaceAfter=12
    )
    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=colors.HexColor('#1E3A8A'),
        spaceBefore=8,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14
    )

    story = []

    # Header
    story.append(Paragraph("HealthPulse AI — 30-Second Doctor Handoff Card", title_style))
    story.append(Paragraph("Patient-reported information. Not a diagnosis.", disclaimer_style))

    # Meta Table: Card Code, Date, Urgency
    urgency = card_data.get("urgency", "PHC_VISIT")
    urg_color = "#DC2626" if urgency in ["EMERGENCY", "CRISIS"] else ("#EA580C" if urgency == "URGENT" else ("#CA8A04" if urgency == "PHC_VISIT" else "#16A34A"))

    meta_table_data = [
        [
            Paragraph(f"<b>Card Code:</b> {card_data.get('card_code')}", body_style),
            Paragraph(f"<b>Generated:</b> {card_data.get('created_at', '')[:10]}", body_style),
            Paragraph(f"<b>Triage Urgency:</b> <font color='{urg_color}'><b>{urgency}</b></font>", body_style)
        ]
    ]
    meta_table = Table(meta_table_data, colWidths=[150, 150, 200])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # Patient Profile
    story.append(Paragraph("Patient Demographics & Clinical Profile", section_style))
    preg_str = "Yes (Pregnant)" if card_data.get("pregnant") else "No"
    conds_str = ", ".join(card_data.get("conditions", [])) or "None reported"

    demo_data = [
        ["Age Band", card_data.get("age_band", "18-39"), "Sex", card_data.get("sex", "M")],
        ["Pregnancy Status", preg_str, "Chronic Conditions", conds_str],
        ["Channel / Source", card_data.get("channel", "web").capitalize(), "Language", card_data.get("language", "ta").upper()]
    ]
    demo_table = Table(demo_data, colWidths=[120, 140, 120, 140])
    demo_table.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F1F5F9')),
        ('BACKGROUND', (2,0), (2,-1), colors.HexColor('#F1F5F9')),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(demo_table)
    story.append(Spacer(1, 10))

    # Symptoms and Danger Answers
    story.append(Paragraph("Reported Symptoms & Danger Signs Screening", section_style))
    syms_str = ", ".join([s.replace("_", " ") for s in card_data.get("symptoms", [])]) or "None specified"
    dur_str = f"{card_data.get('duration_days', 1)} day(s)"
    
    danger_ans = card_data.get("danger_answers", {})
    pos_dangers = [k.replace("_", " ") for k, v in danger_ans.items() if v is True or v == "yes" or v == 1]
    danger_str = ", ".join(pos_dangers) if pos_dangers else "No red flags reported positively by citizen"

    sym_data = [
        [Paragraph(f"<b>Symptoms:</b> {syms_str}", body_style)],
        [Paragraph(f"<b>Duration:</b> {dur_str}", body_style)],
        [Paragraph(f"<b>Red-Flag Answers:</b> {danger_str}", body_style)],
        [Paragraph(f"<b>Reasoning / Top Factors:</b> {card_data.get('urgency_reason', '')}", body_style)]
    ]
    sym_table = Table(sym_data, colWidths=[520])
    sym_table.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FFFFFF')),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(sym_table)
    story.append(Spacer(1, 10))

    # Lab Reports if present
    labs = card_data.get("report_values", [])
    if labs:
        story.append(Paragraph("Laboratory Biomarkers (from uploaded report)", section_style))
        lab_headers = [["Test", "Value", "Unit", "Reference", "Flag"]]
        for l in labs:
            lab_headers.append([
                l.get("test_code", ""),
                str(l.get("value", "")),
                l.get("unit", ""),
                f"{l.get('ref_low', '')} - {l.get('ref_high', '')}",
                l.get("flag", "NORMAL")
            ])
        lab_table = Table(lab_headers, colWidths=[100, 80, 100, 120, 120])
        lab_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E2E8F0')),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 9),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(lab_table)
        story.append(Spacer(1, 10))

    # QR Code and Footer
    story.append(Paragraph("Scan to Open Live Record in PHC EMR / Mobile Portal", section_style))
    qr_img_bytes = generate_qr_bytes(card_url)
    qr_img = Image(io.BytesIO(qr_img_bytes), width=1.4*inch, height=1.4*inch)

    footer_data = [
        [
            qr_img,
            Paragraph(
                f"<b>HealthPulse AI Clinical Safety System</b><br/>"
                f"Rules Version: {card_data.get('rules_version', '0.3-draft')}<br/>"
                f"Calibrated Triage Model: {card_data.get('model_version', 'triage-0.1')}<br/>"
                f"Cards expire automatically after 30 days pursuant to DPDP Act 2023 retention schedule.<br/>"
                f"Portal link: {card_url}",
                body_style
            )
        ]
    ]
    footer_table = Table(footer_data, colWidths=[120, 400])
    footer_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(footer_table)

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
