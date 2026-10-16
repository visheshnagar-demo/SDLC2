from server.services.validation_engine import MissingInfoValidationEngine
from server.schemas import AttachedDocumentCreate, RiskCategory


def test_validation_engine_cyber_all_docs_present():
    docs = [
        AttachedDocumentCreate(
            document_type="CYBER_QUESTIONNAIRE",
            file_name="cyber_q.pdf",
            file_size_bytes=1000,
            storage_uri="gs://bucket/cyber_q.pdf",
        ),
        AttachedDocumentCreate(
            document_type="PRIMARY_POLICY_SCHEDULE",
            file_name="sched.pdf",
            file_size_bytes=2000,
            storage_uri="gs://bucket/sched.pdf",
        ),
        AttachedDocumentCreate(
            document_type="INCIDENT_HISTORY",
            file_name="loss_run.pdf",
            file_size_bytes=3000,
            storage_uri="gs://bucket/loss_run.pdf",
        ),
    ]

    flags = MissingInfoValidationEngine.evaluate_missing_information(
        risk_category=RiskCategory.CYBER,
        attached_documents=docs,
    )
    assert len(flags) == 0


def test_validation_engine_cyber_missing_questionnaire():
    docs = [
        AttachedDocumentCreate(
            document_type="PRIMARY_POLICY",
            file_name="sched.pdf",
            file_size_bytes=2000,
            storage_uri="gs://bucket/sched.pdf",
        ),
    ]

    flags = MissingInfoValidationEngine.evaluate_missing_information(
        risk_category="CYBER",
        attached_documents=docs,
    )
    assert len(flags) == 2
    field_names = [f["field_name"] for f in flags]
    assert "CYBER_QUESTIONNAIRE" in field_names
    assert "INCIDENT_HISTORY" in field_names


def test_validation_engine_do_missing_financials():
    docs = [
        AttachedDocumentCreate(
            document_type="BOARD_OWNERSHIP",
            file_name="board.pdf",
            file_size_bytes=1500,
            storage_uri="gs://bucket/board.pdf",
        ),
        AttachedDocumentCreate(
            document_type="LOSS_RUN",
            file_name="loss_run.pdf",
            file_size_bytes=2500,
            storage_uri="gs://bucket/loss_run.pdf",
        ),
    ]

    flags = MissingInfoValidationEngine.evaluate_missing_information(
        risk_category=RiskCategory.DO,
        attached_documents=docs,
    )
    assert len(flags) == 1
    assert flags[0]["field_name"] == "AUDITED_FINANCIALS"
    assert flags[0]["is_blocking"] is True
