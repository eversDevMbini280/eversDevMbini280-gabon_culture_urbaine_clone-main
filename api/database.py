# from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker
# import os
# from dotenv import load_dotenv
# from urllib.parse import quote_plus

# load_dotenv()

# # URL encode the password
# raw_password = "...emanE.@37#"
# encoded_password = quote_plus(raw_password)

# # Construct the database URL
# default_db_url = f"postgresql://postgres:{encoded_password}@localhost:5432/gabon_culturedb"
# DATABASE_URL = os.getenv("DATABASE_URL", default_db_url)

# engine = create_engine(DATABASE_URL)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = declarative_base()

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load environment variables from api/.env
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# Supports DATABASE_URL and fallback to DATABAS_URL typo if present
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("DATABAS_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment variables.")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
