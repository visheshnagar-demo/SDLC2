import uuid
from typing import List, Optional
from server.models.submission import Submission
from server.models.risk_profile import CyberRiskProfile, DoRiskProfile
from server.models.evaluation import MissingInfoFlag


class FlaggingEngine:
    @staticmethod
    def evaluate_flags(
        submission: Submission,
        cyber_profile: Optional[CyberRiskProfile] = None,
        do_profile: Optional[DoRiskProfile] = None,
    ) -> List[MissingInfoFlag]:
        flags: List[MissingInfoFlag] = []
        risk_type = (submission.risk_type or "").upper()

        if risk_type == "CYBER":
            if not cyber_profile:
                flags.append(
                    MissingInfoFlag(
                        id=str(uuid.uuid4()),
                        submission_id=submission.id,
                        field_name="cyber_profile",
                        flag_code="MISSING_CYBER_PROFILE",
                        description="Complete Cyber risk disclosure profile is missing from submission",
                        severity="HIGH",
                        is_resolved=False,
                    )
                )
            else:
                if not cyber_profile.mfa_enabled:
                    flags.append(
                        MissingInfoFlag(
                            id=str(uuid.uuid4()),
                            submission_id=submission.id,
                            field_name="mfa_enabled",
                            flag_code="MISSING_MFA_DETAILS",
                            description="Missing MFA confirmation across enterprise administrative access",
                            severity="HIGH",
                            is_resolved=False,
                        )
                    )

                if not cyber_profile.offline_backups:
                    flags.append(
                        MissingInfoFlag(
                            id=str(uuid.uuid4()),
                            submission_id=submission.id,
                            field_name="offline_backups",
                            flag_code="MISSING_BACKUP_CONTROLS",
                            description="Offline immutable backup strategy disclosure required",
                            severity="MEDIUM",
                            is_resolved=False,
                        )
                    )

                if not cyber_profile.edr_implemented:
                    flags.append(
                        MissingInfoFlag(
                            id=str(uuid.uuid4()),
                            submission_id=submission.id,
                            field_name="edr_implemented",
                            flag_code="MISSING_EDR_CONTROLS",
                            description="Endpoint Detection and Response (EDR) implementation status missing",
                            severity="MEDIUM",
                            is_resolved=False,
                        )
                    )

                if cyber_profile.record_count is None:
                    flags.append(
                        MissingInfoFlag(
                            id=str(uuid.uuid4()),
                            submission_id=submission.id,
                            field_name="record_count",
                            flag_code="MISSING_RECORD_VOLUME",
                            description="Sensitive data record count not specified",
                            severity="MEDIUM",
                            is_resolved=False,
                        )
                    )

                if not cyber_profile.encryption_at_rest:
                    flags.append(
                        MissingInfoFlag(
                            id=str(uuid.uuid4()),
                            submission_id=submission.id,
                            field_name="encryption_at_rest",
                            flag_code="MISSING_ENCRYPTION_DISCLOSURE",
                            description="Data encryption at rest disclosure missing",
                            severity="LOW",
                            is_resolved=False,
                        )
                    )

                if cyber_profile.prior_ransomware_claims is True and (
                    cyber_profile.prior_claims_amount is None
                    or cyber_profile.prior_claims_amount == 0
                ):
                    flags.append(
                        MissingInfoFlag(
                            id=str(uuid.uuid4()),
                            submission_id=submission.id,
                            field_name="prior_claims_amount",
                            flag_code="INCOMPLETE_CLAIM_HISTORY",
                            description="Prior ransomware claim amount not disclosed",
                            severity="HIGH",
                            is_resolved=False,
                        )
                    )

        elif risk_type == "DO":
            if not do_profile:
                flags.append(
                    MissingInfoFlag(
                        id=str(uuid.uuid4()),
                        submission_id=submission.id,
                        field_name="do_profile",
                        flag_code="MISSING_DO_PROFILE",
                        description="Complete D&O risk disclosure profile is missing from submission",
                        severity="HIGH",
                        is_resolved=False,
                    )
                )
            else:
                if do_profile.leverage_ratio is None:
                    flags.append(
                        MissingInfoFlag(
                            id=str(uuid.uuid4()),
                            submission_id=submission.id,
                            field_name="leverage_ratio",
                            flag_code="MISSING_FINANCIAL_LEVERAGE",
                            description="Corporate debt-to-equity leverage ratio disclosure required",
                            severity="HIGH",
                            is_resolved=False,
                        )
                    )

                if do_profile.executive_turnover_rate is None:
                    flags.append(
                        MissingInfoFlag(
                            id=str(uuid.uuid4()),
                            submission_id=submission.id,
                            field_name="executive_turnover_rate",
                            flag_code="MISSING_EXECUTIVE_TURNOVER",
                            description="Executive leadership turnover rate disclosure missing",
                            severity="MEDIUM",
                            is_resolved=False,
                        )
                    )

                if do_profile.active_litigation is True and not (
                    do_profile.litigation_details
                    and do_profile.litigation_details.strip()
                ):
                    flags.append(
                        MissingInfoFlag(
                            id=str(uuid.uuid4()),
                            submission_id=submission.id,
                            field_name="litigation_details",
                            flag_code="MISSING_LITIGATION_DETAILS",
                            description="Active litigation disclosures require supporting case summary",
                            severity="HIGH",
                            is_resolved=False,
                        )
                    )

                if (
                    do_profile.independent_board_charter is None
                    or do_profile.independent_board_charter is False
                ):
                    flags.append(
                        MissingInfoFlag(
                            id=str(uuid.uuid4()),
                            submission_id=submission.id,
                            field_name="independent_board_charter",
                            flag_code="MISSING_BOARD_GOVERNANCE",
                            description="Independent board charter disclosure missing",
                            severity="MEDIUM",
                            is_resolved=False,
                        )
                    )

                if do_profile.annual_revenue is None:
                    flags.append(
                        MissingInfoFlag(
                            id=str(uuid.uuid4()),
                            submission_id=submission.id,
                            field_name="annual_revenue",
                            flag_code="MISSING_ANNUAL_REVENUE",
                            description="Annual enterprise gross revenue not provided",
                            severity="MEDIUM",
                            is_resolved=False,
                        )
                    )

        return flags
