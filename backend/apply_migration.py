"""Script para aplicar la migración de categorías directamente a la base de datos"""
import sqlite3
import os

# Ruta a la base de datos
db_path = os.path.join(os.path.dirname(__file__), 'financiera.db')

# Conectar a la base de datos
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Crear tabla de categorías
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR NOT NULL UNIQUE,
            icon VARCHAR NOT NULL,
            color VARCHAR NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Agregar columna category_id a debts si no existe
    try:
        cursor.execute("ALTER TABLE debts ADD COLUMN category_id INTEGER")
    except sqlite3.OperationalError as e:
        if "duplicate column name" not in str(e).lower():
            raise
        print("Columna category_id ya existe en debts")
    
    # Insertar categorías predefinidas
    categories = [
        ('Comida y Restaurantes', '🍔', '#ef4444'),
        ('Transporte', '🚗', '#f59e0b'),
        ('Hogar y Servicios', '🏠', '#10b981'),
        ('Entretenimiento', '🎮', '#8b5cf6'),
        ('Ropa y Accesorios', '👕', '#ec4899'),
        ('Salud', '💊', '#06b6d4'),
        ('Educación', '📚', '#3b82f6'),
        ('Otros', '💰', '#6b7280')
    ]
    
    for name, icon, color in categories:
        try:
            cursor.execute(
                "INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)",
                (name, icon, color)
            )
        except sqlite3.IntegrityError:
            print(f"Categoría '{name}' ya existe, saltando...")
    
    # Commit cambios
    conn.commit()
    print("✅ Migración aplicada exitosamente!")
    print(f"✅ {len(categories)} categorías creadas")
    
    # Verificar categorías
    cursor.execute("SELECT COUNT(*) FROM categories")
    count = cursor.fetchone()[0]
    print(f"✅ Total de categorías en la base de datos: {count}")
    
except Exception as e:
    conn.rollback()
    print(f"❌ Error al aplicar migración: {e}")
    raise
finally:
    conn.close()

# Made with Bob
