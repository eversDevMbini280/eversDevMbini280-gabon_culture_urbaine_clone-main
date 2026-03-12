import os
from pathlib import Path
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
from dotenv import load_dotenv

from models import Base

# Alembic Config object
config = context.config

# Load DATABASE_URL from api/.env and inject it into Alembic config
env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=env_path)
database_url = os.getenv("DATABASE_URL") or os.getenv("DATABAS_URL")

if not database_url:
    raise RuntimeError("DATABASE_URL is not set. Add it to api/.env.")

# Render injecte parfois postgres:// ; SQLAlchemy 1.4+ exige postgresql://
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

config.set_main_option("sqlalchemy.url", database_url)

# Setup loggers
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,           # détecte les changements de type de colonne
        compare_server_default=True, # détecte les changements de valeur par défaut
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,           # détecte les changements de type de colonne
            compare_server_default=True, # détecte les changements de valeur par défaut
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()