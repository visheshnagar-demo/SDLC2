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

        if "CYBER" in risk_type:
            if not cyber_profile:
                flags.append(
                    MissingInfoFlag(
                        id=str(uuid.uuid4()),
                        submission_id=submission.id,
                        field_name="cyber_profile",
                        flag_code="MISSING_CYBER_PROFILE",
                        description="Missing Info: Cyber Risk Profile - Complete Cyber risk disclosure profile is missing from submission",
                        severity="HIGH",
                        is_resolved=False,
                    )
                )
                flags.append(
                    MissingInfoFlag(
                        id=str(uuid.uuid4()),
                        submission_id=submission.id,
                        field_name="mfa_enabled",
                        flag_code="MISSING_MFA_DETAILS",
                        description="Missing Info: MFA Details - MFA confirmation across enterprise administrative access required",
                        severity="HIGH",
                        is_resolved=False,
                    )
                )
                flags.append(
                    MissingInfoFlag(
                        id=str(uuid.uuid4()),
                        submission_id=submission.id,
                        field_name="offline_backups",
                        flag_code="MISSING_BACKUP_CONTROLS",
                        description="Missing Info: Backup Controls & Ransomware Protection - Offline immutable backup strategy disclosure required",
                        severity="MEDIUM",
                        is_resolved=False,
                    )
                )
                flags.append(
                    MissingInfoFlag(
                        id=str(uuid.uuid4()),
                        submission_id=submission.id,
                        field_name="edr_implemented",
                        flag_code="MISSING_EDR_CONTROLS",
                        description="Missing Info: EDR Controls - Endpoint Detection and Response implementation status required",
                        severity="MEDIUM",
                        is_resolved=False,
                    )
                )
                flags.append(
                    MissingInfoFlag(
                        id=str(uuid.uuid4()),
                        submission_id=submission.id,
                        field_name="record_count",
                        flag_code="MISSING_RECORD_VOLUME",
                        description="Missing Info: Record Volume - Sensitive data record count disclosure required",
                        severity="MEDIUM",
                        is_resolved=False,
                    )
                )
                flags.append(
                    MissingInfoFlag(
                        id=str(uuid.uuid4()),
                        submission_id=submission.id,
                        field_name="encryption_at_rest",
                        flag_code="MISSING_ENCRYPTION_DISCLOSURE",
                        description="Missing Info: Encryption Disclosure - Data encryption at rest disclosure required",
                        severity="LOW",
                        is_resolved=False,
                    )
                )
            else:
                if (
                    cyber_profile.mfa_enabled is False
                    or cyber_profile.mfa_enabled is None
                ):
                    flags.append(
                        MissingInfoFlag(
                            id=str(uuid.uuid4()),
                            submission_id=submission.id,
                            field_name="mfa_enabled",
                            flag_code="MISSING_MFA_DETAILS",
                            description="Missing Info: MFA Details - MFA confirmation across enterprise administrative access required",
                            severity="HIGH",
                            is_resolved=False,
                        )
                    )

                if (
                    cyber_profile.offline_backups is False
                    or cyber_profile.offline_backups is None
                ):
                    flags.append(
                        MissingInfoFlag(
                            id=str(uuid.uuid4()),
                            submission_id=submission.id,
                            field_name="offline_backups",
                            flag_code="MISSING_BACKUP_CONTROLS",
                            description="Missing Info: Backup Controls & Ransomware Protection - Offline immutable backup strategy disclosure required",
                            severity="MEDIUM",
                            is_resolved=False,
                        )
                    )

                if (
                    cyber_profile.edr_implemented is False
                    or cyber_profile.edr_implemented is None
                ):
                    flags.append(
                        MissingInfoFlag(
                            id=str(uuid.uuid4()),
                            submission_id=submission.id,
                            field_name="edr_implemented",
                            flag_code="MISSING_EDR_CONTROLS",
                            description="Missing Info: EDR Controls - Endpoint Detection and Response implementation status required",
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
                            description="Missing Info: Record Volume - Sensitive data record count disclosure required",
                            severity="MEDIUM",
                            is_resolved=False,
                        )
                    )

                if (
                    cyber_profile.encryption_at_rest is False
                    or cyber_profile.encryption_at_rest is None
                ):
                    flags.append(
                        MissingInfoFlag(
                            id=str(uuid.uuid4()),
                            submission_id=submission.id,
                            field_name="encryption_at_rest",
                            flag_code="MISSING_ENCRYPTION_DISCLOSURE",
                            description="Missing Info: Encryption Disclosure - Data encryption at rest disclosure required",
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
                            description="Missing Info: Claim History & Loss History - Prior ransomware claim amount required",
                            severity="HIGH",
                            is_resolved=False,
                        )
                    )

                if cyber_profile.prior_ransomware_claims is None:
                    flags.append(
                        MissingInfoFlag(
                            id=str(uuid.uuid4()),
                            submission_id=submission.id,
                            field_name="prior_ransomware_claims",
                            flag_code="MISSING_RANSOMWARE_HISTORY",
                            description="Missing Info: Ransomware Controls & Loss History - Prior ransomware loss history disclosure required",
                            severity="MEDIUM",
                            is_resolved=False,
                        )
                    )

                if (
                    cyber_profile.security_training is None
                    or cyber_profile.security_training is False
                ):
                    flags.append(
                        MissingInfoFlag(
                            id=str(uuid.uuid4()),
                            submission_id=submission.id,
                            field_name="security_training",
                            flag_code="MISSING_SECURITY_TRAINING",
                            description="Missing Info: Security Training - Employee cybersecurity awareness training required",
                            severity="LOW",
                            is_resolved=False,
                        )
                    )

        else:  # D&O
            if not do_profile:
                flags.append(
                    MissingInfoFlag(
                        id=str(uuid.uuid4()),
                        submission_id=submission.id,
                        field_name="do_profile",
                        flag_code="MISSING_DO_PROFILE",
                        description="Missing Info: D&O Profile - Complete D&O risk disclosure profile is missing from submission",
                        severity="HIGH",
                        is_resolved=False,
                    )
                )
                flags.append(
                    MissingInfoFlag(
                        id=str(uuid.uuid4()),
                        submission_id=submission.id,
                        field_name="leverage_ratio",
                        flag_code="MISSING_FINANCIAL_LEVERAGE",
                        description="Missing Info: Financial Leverage - Corporate debt-to-equity leverage ratio disclosure required",
                        severity="HIGH",
                        is_resolved=False,
                    )
                )
                flags.append(
                    MissingInfoFlag(
                        id=str(uuid.uuid4()),
                        submission_id=submission.id,
                        field_name="executive_turnover_rate",
                        flag_code="MISSING_EXECUTIVE_TURNOVER",
                        description="Missing Info: Executive Turnover - Executive leadership turnover rate disclosure required",
                        severity="MEDIUM",
                        is_resolved=False,
                    )
                )
                flags.append(
                    MissingInfoFlag(
                        id=str(uuid.uuid4()),
                        submission_id=submission.id,
                        field_name="independent_board_charter",
                        flag_code="MISSING_BOARD_GOVERNANCE",
                        description="Missing Info: Board Oversight & Governance - Independent board charter disclosure required",
                        severity="MEDIUM",
                        is_resolved=False,
                    )
                )
                flags.append(
                    MissingInfoFlag(
                        id=str(uuid.uuid4()),
                        submission_id=submission.id,
                        field_name="annual_revenue",
                        flag_code="MISSING_ANNUAL_REVENUE",
                        description="Missing Info: Annual Revenue - Annual enterprise gross revenue required",
                        severity="MEDIUM",
                        is_resolved=False,
                    )
                )
                flags.append(
                    MissingInfoFlag(
                        id=str(uuid.uuid4()),
                        submission_id=submission.id,
                        field_name="active_litigation",
                        flag_code="MISSING_LITIGATION_DISCLOSURE",
                        description="Missing Info: Litigation History - Active litigation disclosure status required",
                        severity="MEDIUM",
                        is_resolved=False,
                    )
                )
                flags.append(
                    MissingInfoFlag(
                        id=str(uuid.uuid4()),
                        submission_id=submission.id,
                        field_name="regulatory_investigations",
                        flag_code="MISSING_REGULATORY_DISCLOSURE",
                        description="Missing Info: Regulatory Inquiries - Regulatory investigation history required",
                        severity="LOW",
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
                            description="Missing Info: Financial Leverage - Corporate debt-to-equity leverage ratio disclosure required",
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
                            description="Missing Info: Executive Turnover - Executive leadership turnover rate disclosure required",
                            severity="MEDIUM",
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
                            description="Missing Info: Board Oversight & Governance - Independent board charter disclosure required",
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
                            description="Missing Info: Litigation Details & History - Active litigation disclosure requires supporting case summary",
                            severity="HIGH",
                            is_resolved=False,
                        )
                    )

                if do_profile.active_litigation is None:
                    flags.append(
                        MissingInfoFlag(
                            id=str(uuid.uuid4()),
                            submission_id=submission.id,
                            field_name="active_litigation",
                            flag_code="MISSING_LITIGATION_DISCLOSURE",
                            description="Missing Info: Litigation History - Active litigation disclosure status required",
                            severity="MEDIUM",
                            is_resolved=False,
                        )
                    )

                if do_profile.regulatory_investigations is None:
                    flags.append(
                        MissingInfoFlag(
                            id=str(uuid.uuid4()),
                            submission_id=submission.id,
                            field_name="regulatory_investigations",
                            flag_code="MISSING_REGULATORY_DISCLOSURE",
                            description="Missing Info: Regulatory Inquiries - Regulatory investigation history required",
                            severity="LOW",
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
                            description="Missing Info: Annual Revenue - Annual enterprise gross revenue required",
                            severity="MEDIUM",
                            is_resolved=False,
                        )
                    )

        return flags
