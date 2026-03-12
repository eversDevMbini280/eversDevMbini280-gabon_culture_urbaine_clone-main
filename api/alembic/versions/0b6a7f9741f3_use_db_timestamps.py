"""use-db-timestamps

Revision ID: 0b6a7f9741f3
Revises: 81f6295a5822
Create Date: 2026-03-12 17:54:47.494366

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0b6a7f9741f3'
down_revision: Union[str, Sequence[str], None] = '81f6295a5822'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "users",
        "last_activity",
        existing_type=sa.DateTime(),
        type_=sa.DateTime(timezone=True),
        server_default=sa.text("now()"),
        existing_nullable=True,
        postgresql_using="last_activity AT TIME ZONE 'UTC'",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "users",
        "last_activity",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.DateTime(),
        server_default=None,
        existing_nullable=True,
        postgresql_using="last_activity AT TIME ZONE 'UTC'",
    )
