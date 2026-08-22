"""merge heads

Revision ID: eb2d8ffeba48
Revises: be7c78f03f12, d413f639b451
Create Date: 2026-08-22 12:25:38.136752

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eb2d8ffeba48'
down_revision: Union[str, None] = ('be7c78f03f12', 'd413f639b451')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
