import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from server.models import (
    Case,
    ExtractedField,
    Quote,
    StageStatus,
    AuditLog,
    BindChecklist,
    PricingScenario,
)

STAGES_DEFINITION = [
    ("SUBMISSION_INTAKE", "Intake & Classification", 1, "IntakeAgent"),
    ("DOCUMENT_EXTRACTION", "Data Extraction", 2, "DocumentIntelligenceAgent"),
    ("COMPLETENESS_VALIDATION", "Completeness Validation", 3, "ValidationAgent"),
    ("RISK_ASSESSMENT", "Underwriting Risk Assessment", 4, "RiskAssessmentAgent"),
    ("PORTFOLIO_EVALUATION", "Portfolio & Capacity View", 5, "PortfolioAgent"),
    ("ACTUARIAL_PRICING", "Actuarial Pricing Studio", 6, "PricingAgent"),
    ("QUOTE_STRUCTURING", "Quote Structuring", 7, "QuoteAgent"),
    ("REVIEW_APPROVAL", "Review & Governance Approval", 8, "LegalComplianceAgent"),
    ("NEGOTIATION", "Negotiation Comparison", 9, "NegotiationAgent"),
    ("BIND_READINESS", "Bind Readiness Verification", 10, "BindReadinessAgent"),
    ("BIND_DECISION", "Bind Decision & Confirmation", 11, "HumanUnderwriter"),
    (
        "CONTRACT_HANDOFF",
        "Contract Handoff & Downstream PAS",
        12,
        "ContractHandoffAgent",
    ),
]

DEMO_SCENARIOS = {
    "SCENARIO_A": {
        "scenario_id": "SCENARIO_A",
        "name": "Scenario A: Low-Risk Renewal",
        "description": "Standard treaty renewal with 100% complete documentation, low historical loss ratio (58.2%), within Underwriter authority ($5M limit). Auto-approval path with high confidence.",
        "case_number": "QTB-2026-8891",
        "cedent_name": "Apex Mutual Insurance Co.",
        "line_of_business": "Property & Casualty",
        "treaty_type": "Property Catastrophe Treaty Quota Share",
        "requested_limit": 5000000.0,
        "retention_amount": 1000000.0,
        "historical_loss_ratio": 58.2,
        "completeness_score": 1.0,
        "overall_confidence": 0.96,
        "expected_behavior": "Seamless progression through all stages with high AI confidence and instant clearance.",
        "tags": ["Low Risk", "P&C", "Auto-Approval", "Renewal"],
        "extracted_fields": [
            {
                "field_name": "Cedent Legal Entity",
                "extracted_value": "Apex Mutual Insurance Company (NAIC #21415)",
                "confidence_score": 0.98,
                "source_document": "Treaty_Wording_Apex_2026.pdf",
                "source_citation_page": 1,
            },
            {
                "field_name": "Treaty Structure & Type",
                "extracted_value": "50% Quota Share Treaty Reinsurance",
                "confidence_score": 0.97,
                "source_document": "Treaty_Wording_Apex_2026.pdf",
                "source_citation_page": 2,
            },
            {
                "field_name": "Territory & Jurisdiction",
                "extracted_value": "United States (Excluding Tier-1 Wind Counties)",
                "confidence_score": 0.95,
                "source_document": "Underwriting_Slip_2026.pdf",
                "source_citation_page": 3,
            },
            {
                "field_name": "Treaty Limit per Occurrence",
                "extracted_value": "$5,000,000 Part of $10,000,000",
                "confidence_score": 0.99,
                "source_document": "Underwriting_Slip_2026.pdf",
                "source_citation_page": 4,
            },
            {
                "field_name": "Cedent Retention",
                "extracted_value": "$1,000,000 Ultimate Net Loss",
                "confidence_score": 0.96,
                "source_document": "Underwriting_Slip_2026.pdf",
                "source_citation_page": 4,
            },
            {
                "field_name": "5-Year Cumulative Loss Ratio",
                "extracted_value": "58.2% (Historical Loss Runs Clean)",
                "confidence_score": 0.94,
                "source_document": "Loss_Runs_2021_2025.xlsx",
                "source_citation_page": 1,
            },
        ],
        "quotes": [
            {
                "option_name": "Option 1: 50% Quota Share (Recommended)",
                "structure_type": "Quota Share",
                "limit_amount": 5000000.0,
                "retention_amount": 1000000.0,
                "ceded_premium": 420000.0,
                "rate_on_line": 8.4,
                "commission_rate": 22.5,
                "expected_loss_ratio": 58.2,
                "combined_ratio": 88.5,
                "status": "APPROVED",
                "is_selected": True,
            },
            {
                "option_name": "Option 2: Excess of Loss ($5M xs $1M)",
                "structure_type": "Excess of Loss",
                "limit_amount": 5000000.0,
                "retention_amount": 1000000.0,
                "ceded_premium": 485000.0,
                "rate_on_line": 9.7,
                "commission_rate": 15.0,
                "expected_loss_ratio": 55.0,
                "combined_ratio": 82.0,
                "status": "DRAFT",
                "is_selected": False,
            },
        ],
        "bind_checklist": {
            "sanctions_cleared": True,
            "pricing_hurdle_cleared": True,
            "capacity_approved": True,
            "financial_rating_confirmed": True,
            "wording_approved": True,
            "hitl_signed_off": True,
        },
        "pricing_scenario": {
            "model_name": "AIR Touchstone v10 Cat Simulation",
            "technical_premium": 420000.0,
            "recommended_rate": 8.4,
            "expected_loss": 244440.0,
            "combined_ratio": 88.5,
            "loss_distribution": [
                {
                    "return_period": "10-Year",
                    "loss_estimate": 120000,
                    "probability": 0.10,
                },
                {
                    "return_period": "25-Year",
                    "loss_estimate": 280000,
                    "probability": 0.04,
                },
                {
                    "return_period": "50-Year",
                    "loss_estimate": 550000,
                    "probability": 0.02,
                },
                {
                    "return_period": "100-Year",
                    "loss_estimate": 1100000,
                    "probability": 0.01,
                },
                {
                    "return_period": "250-Year",
                    "loss_estimate": 2400000,
                    "probability": 0.004,
                },
            ],
        },
    },
    "SCENARIO_B": {
        "scenario_id": "SCENARIO_B",
        "name": "Scenario B: Incomplete Submission Exception",
        "description": "Life & Health Group Excess of Loss submission missing 3-year loss runs. Low extraction confidence (64%), triggered BR-01 completeness exception requiring Human-In-The-Loop override.",
        "case_number": "QTB-2026-4412",
        "cedent_name": "Horizon Health & Life Group",
        "line_of_business": "Life & Health",
        "treaty_type": "Group Medical Stop-Loss Excess of Loss",
        "requested_limit": 8000000.0,
        "retention_amount": 2000000.0,
        "historical_loss_ratio": None,
        "completeness_score": 0.65,
        "overall_confidence": 0.64,
        "expected_behavior": "Blocks at Stage 3 (Completeness Validation) until Underwriter provides exception override.",
        "tags": ["Incomplete", "Life & Health", "HITL Exception", "Validation Blocker"],
        "extracted_fields": [
            {
                "field_name": "Cedent Legal Entity",
                "extracted_value": "Horizon Healthcare Mutual Holding Co.",
                "confidence_score": 0.91,
                "source_document": "Submission_Email_Horizon.msg",
                "source_citation_page": 1,
            },
            {
                "field_name": "Treaty Structure & Type",
                "extracted_value": "Group Aggregate & Specific Stop-Loss",
                "confidence_score": 0.72,
                "source_document": "Draft_Summary_Horizon.docx",
                "source_citation_page": 1,
            },
            {
                "field_name": "Treaty Limit per Occurrence",
                "extracted_value": "$8,000,000 Specific Stop Loss",
                "confidence_score": 0.85,
                "source_document": "Draft_Summary_Horizon.docx",
                "source_citation_page": 2,
            },
            {
                "field_name": "Cedent Retention",
                "extracted_value": "$2,000,000 Attachment Point",
                "confidence_score": 0.82,
                "source_document": "Draft_Summary_Horizon.docx",
                "source_citation_page": 2,
            },
            {
                "field_name": "3-Year Detailed Claims & Loss Runs",
                "extracted_value": "MISSING / NOT PROVIDED BY BROKER",
                "confidence_score": 0.40,
                "source_document": "Submission_Manifest.json",
                "source_citation_page": 1,
            },
        ],
        "quotes": [
            {
                "option_name": "Provisional Option 1: Stop-Loss Layer 1",
                "structure_type": "Excess of Loss",
                "limit_amount": 8000000.0,
                "retention_amount": 2000000.0,
                "ceded_premium": 680000.0,
                "rate_on_line": 8.5,
                "commission_rate": 10.0,
                "expected_loss_ratio": 62.0,
                "combined_ratio": 92.0,
                "status": "DRAFT",
                "is_selected": True,
            }
        ],
        "bind_checklist": {
            "sanctions_cleared": True,
            "pricing_hurdle_cleared": False,
            "capacity_approved": True,
            "financial_rating_confirmed": True,
            "wording_approved": False,
            "hitl_signed_off": False,
        },
        "pricing_scenario": {
            "model_name": "Milliman Health Cost Guidelines Model",
            "technical_premium": 680000.0,
            "recommended_rate": 8.5,
            "expected_loss": 421600.0,
            "combined_ratio": 92.0,
            "loss_distribution": [
                {
                    "return_period": "5-Year",
                    "loss_estimate": 210000,
                    "probability": 0.20,
                },
                {
                    "return_period": "10-Year",
                    "loss_estimate": 390000,
                    "probability": 0.10,
                },
                {
                    "return_period": "25-Year",
                    "loss_estimate": 780000,
                    "probability": 0.04,
                },
                {
                    "return_period": "50-Year",
                    "loss_estimate": 1450000,
                    "probability": 0.02,
                },
            ],
        },
    },
    "SCENARIO_C": {
        "scenario_id": "SCENARIO_C",
        "name": "Scenario C: High-Exposure Referral",
        "description": "Commercial Catastrophe Excess of Loss submission requesting $50,000,000 limit. Exceeds standard Underwriter authority ($10M) and triggers BR-02/BR-04 multi-signoff Portfolio Manager referral.",
        "case_number": "QTB-2026-9934",
        "cedent_name": "Atlantic & Pacific Property Syndicate",
        "line_of_business": "Property & Casualty",
        "treaty_type": "Commercial Catastrophe Excess of Loss Layer 2",
        "requested_limit": 50000000.0,
        "retention_amount": 10000000.0,
        "historical_loss_ratio": 74.5,
        "completeness_score": 0.98,
        "overall_confidence": 0.92,
        "expected_behavior": "Routes to Portfolio / Capacity Manager at Review & Approval stage due to $50M limit (> $10M threshold).",
        "tags": ["High Exposure", "Catastrophe", "Manager Referral", "Dual Signoff"],
        "extracted_fields": [
            {
                "field_name": "Cedent Legal Entity",
                "extracted_value": "Atlantic & Pacific Lloyd's Syndicate 4022",
                "confidence_score": 0.99,
                "source_document": "Syndicate_Slip_2026.pdf",
                "source_citation_page": 1,
            },
            {
                "field_name": "Treaty Structure & Type",
                "extracted_value": "Excess of Loss Layer 2 ($50M xs $10M)",
                "confidence_score": 0.96,
                "source_document": "Syndicate_Slip_2026.pdf",
                "source_citation_page": 2,
            },
            {
                "field_name": "Treaty Limit per Occurrence",
                "extracted_value": "$50,000,000 Aggregate Cat Limit",
                "confidence_score": 0.98,
                "source_document": "Syndicate_Slip_2026.pdf",
                "source_citation_page": 3,
            },
            {
                "field_name": "Cedent Retention",
                "extracted_value": "$10,000,000 Underlying Layer 1",
                "confidence_score": 0.95,
                "source_document": "Syndicate_Slip_2026.pdf",
                "source_citation_page": 3,
            },
            {
                "field_name": "Historical Cat Loss Ratio (5-Yr)",
                "extracted_value": "74.5% (High Windstorm & Convective Storm Activity)",
                "confidence_score": 0.92,
                "source_document": "Cat_Exposure_Schedule_2026.xlsx",
                "source_citation_page": 2,
            },
        ],
        "quotes": [
            {
                "option_name": "Structured Option 1: Full $50M Layer 2",
                "structure_type": "Excess of Loss",
                "limit_amount": 50000000.0,
                "retention_amount": 10000000.0,
                "ceded_premium": 4250000.0,
                "rate_on_line": 8.5,
                "commission_rate": 12.0,
                "expected_loss_ratio": 74.5,
                "combined_ratio": 94.2,
                "status": "PENDING_APPROVAL",
                "is_selected": True,
            },
            {
                "option_name": "Alternative Option 2: Co-reinsurance 50% ($25M Part of $50M)",
                "structure_type": "Excess of Loss",
                "limit_amount": 25000000.0,
                "retention_amount": 10000000.0,
                "ceded_premium": 2180000.0,
                "rate_on_line": 8.72,
                "commission_rate": 12.0,
                "expected_loss_ratio": 74.5,
                "combined_ratio": 93.8,
                "status": "DRAFT",
                "is_selected": False,
            },
        ],
        "bind_checklist": {
            "sanctions_cleared": True,
            "pricing_hurdle_cleared": True,
            "capacity_approved": False,
            "financial_rating_confirmed": True,
            "wording_approved": True,
            "hitl_signed_off": False,
        },
        "pricing_scenario": {
            "model_name": "RMS RiskLink v23 North America Hurricane & Severe Convective Storm",
            "technical_premium": 4250000.0,
            "recommended_rate": 8.5,
            "expected_loss": 3166250.0,
            "combined_ratio": 94.2,
            "loss_distribution": [
                {
                    "return_period": "20-Year",
                    "loss_estimate": 4500000,
                    "probability": 0.05,
                },
                {
                    "return_period": "50-Year",
                    "loss_estimate": 14200000,
                    "probability": 0.02,
                },
                {
                    "return_period": "100-Year",
                    "loss_estimate": 31000000,
                    "probability": 0.01,
                },
                {
                    "return_period": "250-Year",
                    "loss_estimate": 50000000,
                    "probability": 0.004,
                },
            ],
        },
    },
}


def load_scenario_into_db(db: Session, scenario_id: str) -> Case:
    """Populates or resets a case in the database for the given scenario ID."""
    spec = DEMO_SCENARIOS.get(scenario_id)
    if not spec:
        raise ValueError(f"Unknown scenario ID: {scenario_id}")

    # Remove existing case with same scenario_id if present
    existing_case = db.query(Case).filter(Case.scenario_id == scenario_id).first()
    if existing_case:
        db.delete(existing_case)
        db.commit()

    # Create new Case
    case = Case(
        case_number=spec["case_number"],
        scenario_id=spec["scenario_id"],
        cedent_name=spec["cedent_name"],
        line_of_business=spec["line_of_business"],
        treaty_type=spec["treaty_type"],
        requested_limit=spec["requested_limit"],
        retention_amount=spec["retention_amount"],
        historical_loss_ratio=spec["historical_loss_ratio"],
        current_stage="SUBMISSION_INTAKE",
        status="IN_PROGRESS",
        completeness_score=spec["completeness_score"],
        overall_confidence=spec["overall_confidence"],
    )
    db.add(case)
    db.flush()

    # Add Extracted Fields
    for field in spec["extracted_fields"]:
        ef = ExtractedField(
            case_id=case.id,
            field_name=field["field_name"],
            extracted_value=field["extracted_value"],
            confidence_score=field["confidence_score"],
            source_document=field["source_document"],
            source_citation_page=field["source_citation_page"],
            is_overridden=False,
        )
        db.add(ef)

    # Add Quotes
    for q in spec["quotes"]:
        quote = Quote(
            case_id=case.id,
            option_name=q["option_name"],
            structure_type=q["structure_type"],
            limit_amount=q["limit_amount"],
            retention_amount=q["retention_amount"],
            ceded_premium=q["ceded_premium"],
            rate_on_line=q["rate_on_line"],
            commission_rate=q["commission_rate"],
            expected_loss_ratio=q["expected_loss_ratio"],
            combined_ratio=q["combined_ratio"],
            status=q["status"],
            is_selected=q["is_selected"],
        )
        db.add(quote)

    # Add Stages
    for stage_key, stage_name, order, agent_name in STAGES_DEFINITION:
        stage_status = StageStatus(
            case_id=case.id,
            stage_key=stage_key,
            stage_name=stage_name,
            stage_order=order,
            status="COMPLETED" if order == 1 else "PENDING",
            agent_name=agent_name,
            agent_reasoning=(
                f"Initial intake received and classified for {spec['cedent_name']}. Ready for document extraction."
                if order == 1
                else ""
            ),
            confidence_score=spec["overall_confidence"],
        )
        db.add(stage_status)

    # Add Initial Audit Log
    audit = AuditLog(
        case_id=case.id,
        stage_key="SUBMISSION_INTAKE",
        agent_name="IntakeAgent",
        action_type="CASE_INITIALIZED",
        confidence_score=spec["overall_confidence"],
        rationale=f"Case initialized for scenario '{spec['name']}' with cedent {spec['cedent_name']}.",
        actor_persona="SYSTEM",
        timestamp=datetime.now(timezone.utc),
    )
    db.add(audit)

    # Add Bind Checklist
    chk = spec["bind_checklist"]
    bind_chk = BindChecklist(
        case_id=case.id,
        sanctions_cleared=chk["sanctions_cleared"],
        pricing_hurdle_cleared=chk["pricing_hurdle_cleared"],
        capacity_approved=chk["capacity_approved"],
        financial_rating_confirmed=chk["financial_rating_confirmed"],
        wording_approved=chk["wording_approved"],
        hitl_signed_off=chk["hitl_signed_off"],
    )
    db.add(bind_chk)

    # Add Pricing Scenario
    ps = spec["pricing_scenario"]
    pricing_scen = PricingScenario(
        case_id=case.id,
        model_name=ps["model_name"],
        technical_premium=ps["technical_premium"],
        recommended_rate=ps["recommended_rate"],
        expected_loss=ps["expected_loss"],
        combined_ratio=ps["combined_ratio"],
        loss_distribution_json=json.dumps(ps["loss_distribution"]),
    )
    db.add(pricing_scen)

    db.commit()
    db.refresh(case)
    return case


def seed_initial_scenarios(db: Session) -> None:
    """Seeds default scenarios on application startup if missing."""
    for scen_id in ["SCENARIO_A", "SCENARIO_B", "SCENARIO_C"]:
        existing = db.query(Case).filter(Case.scenario_id == scen_id).first()
        if not existing:
            load_scenario_into_db(db, scen_id)
