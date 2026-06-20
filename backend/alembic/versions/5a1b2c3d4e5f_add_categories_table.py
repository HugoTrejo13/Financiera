"""add_categories_table

Revision ID: 5a1b2c3d4e5f
Revises: 3993b05555ae
Create Date: 2026-06-17 12:13:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5a1b2c3d4e5f'
down_revision = '3993b05555ae'
branch_labels = None
depends_on = None


def upgrade():
    # Crear tabla de categorías
    op.create_table('categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('icon', sa.String(), nullable=False),
        sa.Column('color', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_categories_id'), 'categories', ['id'], unique=False)
    
    # Agregar columna category_id a debts
    op.add_column('debts', sa.Column('category_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_debts_category_id', 'debts', 'categories', ['category_id'], ['id'])
    
    # Insertar categorías predefinidas
    op.execute("""
        INSERT INTO categories (name, icon, color) VALUES
        ('Comida y Restaurantes', '🍔', '#ef4444'),
        ('Transporte', '🚗', '#f59e0b'),
        ('Hogar y Servicios', '🏠', '#10b981'),
        ('Entretenimiento', '🎮', '#8b5cf6'),
        ('Ropa y Accesorios', '👕', '#ec4899'),
        ('Salud', '💊', '#06b6d4'),
        ('Educación', '📚', '#3b82f6'),
        ('Otros', '💰', '#6b7280')
    """)


def downgrade():
    op.drop_constraint('fk_debts_category_id', 'debts', type_='foreignkey')
    op.drop_column('debts', 'category_id')
    op.drop_index(op.f('ix_categories_id'), table_name='categories')
    op.drop_table('categories')

# Made with Bob
