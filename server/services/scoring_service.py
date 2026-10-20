import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from server.models.submission import Submission
from server.models.risk_score import RiskScore
from server.models.scoring_config import ScoringRuleConfig
from server.models.user import User
from server.services.audit_service import log_submission_action


def calculate_risk_score(
    db: Session,
    submission_id: str,
    factors_input: Optional[Dict[str, Any]] = None,
    notes: Optional[str] = None,
    actor: Optional[User] = None,
) -> RiskScore:
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission with ID {submission_id} not found",
        )

    lob = submission.line_of_business.upper()
    # Normalize common abbreviations
    if lob in ["CYBER", "CYBER_RISK", "CYBER RISK"]:
        lob = "CYBER"
    elif lob in ["DO", "D&O", "DIRECTORS AND OFFICERS"]:
        lob = "DO"
    elif lob in ["EO", "E&O", "ERRORS AND OMISSIONS"]:
        lob = "EO"
    elif lob in ["EPLI", "EMPLOYMENT PRACTICES"]:
        lob = "EPLI"
    elif lob in [
        "MEDMAL",
        "MEDICAL_MALPRACTICE",
        "MEDICAL PROFESSIONAL LIABILITY",
        "MED_MAL",
    ]:
        lob = "MEDMAL"

    rule_config = (
        db.query(ScoringRuleConfig)
        .filter(ScoringRuleConfig.line_of_business == lob)
        .first()
    )

    factors_data = factors_input or {}
    if not factors_data and submission.additional_data:
        factors_data = submission.additional_data.get("risk_factors", {})

    total_score = 0
    max_possible_score = 100
    breakdown_list = []

    if rule_config and rule_config.rules_json and "factors" in rule_config.rules_json:
        for factor_def in rule_config.rules_json["factors"]:
            key = factor_def.get("key")
            name = factor_def.get("name", key)
            max_pts = factor_def.get("max_points", 20)

            # Check user input or default pass
            # If factor provided in factors_data as bool or score
            val = factors_data.get(key)
            if val is None:
                # If not provided, check if key is in additional_data or default pass based on good baseline
                val = factor_def.get("default_pass", True)

            if isinstance(val, bool):
                awarded = max_pts if val else int(max_pts * 0.2)
                passed = val
            elif isinstance(val, (int, float)):
                awarded = min(max_pts, max(0, int(val)))
                passed = awarded >= (max_pts * 0.7)
            else:
                awarded = max_pts
                passed = True

            total_score += awarded
            breakdown_list.append(
                {
                    "factor_key": key,
                    "factor_name": name,
                    "max_points": max_pts,
                    "awarded_points": awarded,
                    "passed": passed,
                    "description": factor_def.get(
                        "description", f"Evaluation for {name}"
                    ),
                }
            )
    else:
        # Fallback scoring per LOB
        if lob == "CYBER":
            default_factors = [
                {
                    "key": "mfa_enforced",
                    "name": "MFA Enforcement",
                    "max_points": 20,
                    "val": factors_data.get("mfa_enforced", True),
                },
                {
                    "key": "edr_coverage",
                    "name": "EDR Coverage > 95%",
                    "max_points": 20,
                    "val": factors_data.get("edr_coverage", True),
                },
                {
                    "key": "immutable_backups",
                    "name": "Air-Gapped & Immutable Backups",
                    "max_points": 15,
                    "val": factors_data.get("immutable_backups", True),
                },
                {
                    "key": "loss_ratio_low",
                    "name": "3-Yr Prior Loss Ratio < 30%",
                    "max_points": 25,
                    "val": factors_data.get("loss_ratio_low", True),
                },
                {
                    "key": "revenue_stability",
                    "name": "Revenue Band & Controls Stability",
                    "max_points": 20,
                    "val": factors_data.get("revenue_stability", True),
                },
            ]
        elif lob == "DO":
            default_factors = [
                {
                    "key": "current_ratio_healthy",
                    "name": "Current Ratio > 1.5",
                    "max_points": 25,
                    "val": factors_data.get("current_ratio_healthy", True),
                },
                {
                    "key": "clean_claims_history",
                    "name": "5-Yr Clean Securities / Claims History",
                    "max_points": 30,
                    "val": factors_data.get("clean_claims_history", True),
                },
                {
                    "key": "board_independence",
                    "name": "Independent Board Majority",
                    "max_points": 20,
                    "val": factors_data.get("board_independence", True),
                },
                {
                    "key": "profitability",
                    "name": "Operating Profitability & Strength",
                    "max_points": 25,
                    "val": factors_data.get("profitability", True),
                },
            ]
        elif lob == "EO":
            default_factors = [
                {
                    "key": "standard_contracts",
                    "name": "Standardized Client Contracts",
                    "max_points": 30,
                    "val": factors_data.get("standard_contracts", True),
                },
                {
                    "key": "qa_peer_review",
                    "name": "Formal QA & Peer Review",
                    "max_points": 25,
                    "val": factors_data.get("qa_peer_review", True),
                },
                {
                    "key": "clean_loss_record",
                    "name": "Clean 3-Yr Loss Record",
                    "max_points": 25,
                    "val": factors_data.get("clean_loss_record", True),
                },
                {
                    "key": "client_concentration_low",
                    "name": "Low Client Revenue Concentration",
                    "max_points": 20,
                    "val": factors_data.get("client_concentration_low", True),
                },
            ]
        elif lob == "EPLI":
            default_factors = [
                {
                    "key": "written_hr_policies",
                    "name": "Written HR Policies & Handbooks",
                    "max_points": 30,
                    "val": factors_data.get("written_hr_policies", True),
                },
                {
                    "key": "mandatory_training",
                    "name": "Mandatory Anti-Harassment Training",
                    "max_points": 25,
                    "val": factors_data.get("mandatory_training", True),
                },
                {
                    "key": "low_turnover_rate",
                    "name": "Annual Turnover < 15%",
                    "max_points": 25,
                    "val": factors_data.get("low_turnover_rate", True),
                },
                {
                    "key": "clean_eeoc_record",
                    "name": "Zero Open EEOC Filings",
                    "max_points": 20,
                    "val": factors_data.get("clean_eeoc_record", True),
                },
            ]
        else:  # MEDMAL
            default_factors = [
                {
                    "key": "board_certified_staff",
                    "name": "100% Board Certified Attending Physicians",
                    "max_points": 30,
                    "val": factors_data.get("board_certified_staff", True),
                },
                {
                    "key": "incident_reporting_system",
                    "name": "Active Clinical Incident Reporting",
                    "max_points": 25,
                    "val": factors_data.get("incident_reporting_system", True),
                },
                {
                    "key": "favorable_claims_frequency",
                    "name": "Favorable Claims Frequency",
                    "max_points": 25,
                    "val": factors_data.get("favorable_claims_frequency", True),
                },
                {
                    "key": "accreditation_standing",
                    "name": "Full Hospital/Clinic Accreditation",
                    "max_points": 20,
                    "val": factors_data.get("accreditation_standing", True),
                },
            ]

        for item in default_factors:
            val = item["val"]
            max_pts = item["max_points"]
            if isinstance(val, bool):
                awarded = max_pts if val else int(max_pts * 0.2)
                passed = val
            elif isinstance(val, (int, float)):
                awarded = min(max_pts, max(0, int(val)))
                passed = awarded >= (max_pts * 0.7)
            else:
                awarded = max_pts
                passed = True

            total_score += awarded
            breakdown_list.append(
                {
                    "factor_key": item["key"],
                    "factor_name": item["name"],
                    "max_points": max_pts,
                    "awarded_points": awarded,
                    "passed": passed,
                    "description": f"Evaluation for {item['name']}",
                }
            )

    total_score = min(100, max(0, total_score))

    # Determine risk tier
    if total_score >= 80:
        risk_tier = "LOW"  # Preferred
    elif total_score >= 60:
        risk_tier = "MEDIUM"  # Standard
    elif total_score >= 40:
        risk_tier = "HIGH"  # Caution
    else:
        risk_tier = "CRITICAL"  # Substandard

    score_record = RiskScore(
        id=str(uuid.uuid4()),
        submission_id=submission.id,
        total_score=total_score,
        risk_tier=risk_tier,
        score_breakdown={
            "total_score": total_score,
            "max_possible_score": max_possible_score,
            "risk_tier": risk_tier,
            "factors": breakdown_list,
            "notes": notes or f"Automated rules-based scoring for {lob}",
        },
        evaluator_user_id=actor.id if actor else None,
        evaluated_at=datetime.now(timezone.utc),
    )
    db.add(score_record)

    # Update submission
    prev_state = {
        "risk_score_value": submission.risk_score_value,
        "risk_tier": submission.risk_tier,
    }
    submission.risk_score_value = total_score
    submission.risk_tier = risk_tier
    db.flush()

    new_state = {
        "risk_score_value": total_score,
        "risk_tier": risk_tier,
    }

    log_submission_action(
        db=db,
        submission_id=submission.id,
        action_type="SCORED",
        actor=actor,
        previous_state=prev_state,
        new_state=new_state,
        change_reason=f"Calculated risk score: {total_score}/100 ({risk_tier})",
    )

    db.commit()
    db.refresh(score_record)
    return score_record
