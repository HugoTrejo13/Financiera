from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa



revision: str = '3993b05555ae'
down_revision: Union[str, Sequence[str], None] = '4d0579c5b55a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    
    op.add_column('debts', sa.Column('paid_months', sa.Integer(), nullable=True))
    


def downgrade() -> None:
   
    op.drop_column('debts', 'paid_months')
    
