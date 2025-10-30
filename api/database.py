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


from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from urllib.parse import quote_plus

# Render PostgreSQL connection (URL encode password if needed)
password = "fKkpz9P2OV6elTjfcZmhwTQuImo3Vj6E"
encoded_password = quote_plus(password)  # Handles special chars in password

DATABASE_URL = f"postgresql://gabondb_user:{encoded_password}@dpg-d0dn3qjuibrs73cvfj5g-a.frankfurt-postgres.render.com:5432/gabondb"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"sslmode": "require"}  # Render requires SSL
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()