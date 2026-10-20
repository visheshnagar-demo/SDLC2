from sqlalchemy.orm import Session
from server.database import seed_data


def ensure_seed_data(db: Session) -> None:
    seed_data(db)
