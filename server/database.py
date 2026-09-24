import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(engine_override=None):
    target_engine = engine_override or engine
    Base.metadata.create_all(bind=target_engine)


def seed_database(db=None):
    from server.seeds.seed_data import seed_data

    if db is not None:
        seed_data(db)
    else:
        with SessionLocal() as session:
            seed_data(session)
