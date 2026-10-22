from datetime import UTC, datetime

from sqlalchemy.orm import Session

from server.models import Submission
from server.schemas import DashboardMetricsResponseSchema


def get_dashboard_metrics(db: Session) -> DashboardMetricsResponseSchema:
    submissions = db.query(Submission).all()
    total_submissions = len(submissions)

    subs_by_line: dict[str, int] = {}
    subs_by_status: dict[str, int] = {}
    total_exposed_limit: dict[str, float] = {}

    bound_count = 0
    quoted_count = 0
    total_hours = 0
    pending_referrals = 0

    now = datetime.now(UTC)

    for s in submissions:
        lob = s.line_of_business
        st = s.status

        subs_by_line[lob] = subs_by_line.get(lob, 0) + 1
        subs_by_status[st] = subs_by_status.get(st, 0) + 1

        curr_limit = total_exposed_limit.get(lob, 0.0)
        total_exposed_limit[lob] = round(curr_limit + (s.policy_limit or 0.0), 2)

        if st == "BOUND":
            bound_count += 1
        if st in ("QUOTED", "BOUND"):
            quoted_count += 1
        if s.is_referred:
            pending_referrals += 1

        created = (
            s.created_at if s.created_at.tzinfo else s.created_at.replace(tzinfo=UTC)
        )
        updated = (
            s.updated_at if s.updated_at.tzinfo else s.updated_at.replace(tzinfo=UTC)
        )
        diff_hours = max(1, int((updated - created).total_seconds() // 3600))
        total_hours += diff_hours

    quote_to_bind_ratio = (
        round((bound_count / quoted_count * 100.0), 1) if quoted_count > 0 else 0.0
    )
    avg_turnaround = (
        round((total_hours / total_submissions), 1) if total_submissions > 0 else 0.0
    )

    return DashboardMetricsResponseSchema(
        totalSubmissions=total_submissions,
        submissionsByLine=subs_by_line,
        submissionsByStatus=subs_by_status,
        quoteToBindRatioPercentage=quote_to_bind_ratio,
        averageTurnaroundHours=avg_turnaround,
        totalExposedLimitByLine=total_exposed_limit,
        pendingReferralCount=pending_referrals,
        generatedAt=now,
    )
