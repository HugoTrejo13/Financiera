"""add monthly budgets

Revision ID: 6f7g8h9i0j1k
Revises: 3993b05555ae
Create Date: 2026-06-24 10:52:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '6f7g8h9i0j1k'
down_revision: Union[str, None] = '3993b05555ae'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create monthly_budgets table
    op.create_table(
        'monthly_budgets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('month', sa.String(), nullable=False),
        sa.Column('budget_amount', sa.Float(), nullable=False),
        sa.Column('spent_amount', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('alert_threshold', sa.Float(), nullable=False, server_default='0.8'),
        sa.Column('owner_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create index for faster queries
    op.create_index('ix_monthly_budgets_owner_month', 'monthly_budgets', ['owner_id', 'month'])
    op.create_index('ix_monthly_budgets_category_month', 'monthly_budgets', ['category_id', 'month'])


def downgrade() -> None:
    op.drop_index('ix_monthly_budgets_category_month', table_name='monthly_budgets')
    op.drop_index('ix_monthly_budgets_owner_month', table_name='monthly_budgets')
    op.drop_table('monthly_budgets')

# Made with Bob
