"""add conversation name column

Revision ID: add_conversation_name
Revises: initial_migration
Create Date: 2024-03-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_conversation_name'
down_revision = 'initial_migration'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('conversations', sa.Column('name', sa.String(), nullable=True))

def downgrade() -> None:
    op.drop_column('conversations', 'name') 