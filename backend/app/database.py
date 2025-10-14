from sqlalchemy.engine import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy import create_engine
from .config import settings 

engine = create_engine(settings.database_url, echo=settings.database_echo)

SessionLocal = sessionmaker(bind=engine)

class Base(DeclarativeBase):
    pass 

def get_db():
    db = SessionLocal()
     
    try:
        yield db
    finally:
        db.close()

def create_tables():
    Base.metadata.create_all(bind=engine)

def drop_tables():
    Base.metadata.drop_all(bind=engine)