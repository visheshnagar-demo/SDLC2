from server.models import SubmissionDocument
from server.services.scoring_engine import calculate_risk_score
from server.services.validation_service import check_document_completeness


def test_cyber_scoring_factor_breakdown():
    attrs = {
        "hasMfa": True,
        "hasEdr": True,
        "hasBackups": True,
        "priorLossCount": 0,
        "hasTraining": True,
    }
    score, tier, factors = calculate_risk_score("Cyber Risk", attrs)
    assert score == 100
    assert tier == "LOW"
    assert len(factors) == 5

    # Check deficit scoring
    attrs_deficit = {
        "hasMfa": False,
        "hasEdr": False,
        "hasBackups": False,
        "priorLossCount": 3,
        "hasTraining": False,
    }
    score_def, tier_def, _ = calculate_risk_score("Cyber Risk", attrs_deficit)
    assert score_def == 0
    assert tier_def == "HIGH"


def test_do_scoring_breakdown():
    attrs = {
        "financialStrength": "Strong",
        "priorClaimsCount": 0,
        "independentBoard": True,
        "regulatoryInquiries": False,
    }
    score, tier, factors = calculate_risk_score("D&O", attrs)
    assert score == 100
    assert tier == "LOW"
    assert len(factors) == 4


def test_document_completeness_check():
    doc1 = SubmissionDocument(
        document_type="APPLICATION", file_name="app.pdf", storage_url="/path"
    )
    missing_cyber = check_document_completeness("Cyber Risk", [doc1])
    assert "LOSS_RUNS" in missing_cyber

    doc2 = SubmissionDocument(
        document_type="LOSS_RUNS", file_name="loss.xlsx", storage_url="/path"
    )
    missing_after_loss = check_document_completeness("Cyber Risk", [doc1, doc2])
    assert len(missing_after_loss) == 0
