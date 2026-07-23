# Database Schema

## Motor: PostgreSQL (Asíncrono)

El ORM utilizado es SQLModel. La base de datos es altamente relacional. A continuación, el diccionario de tablas y relaciones clave.

## Tablas Principales

### 1. `users`
Almacena la identidad de la persona. Todas las entidades financieras derivan de esta tabla.
- `id` (INT, PK)
- `email` (VARCHAR, Unique, Index)
- `hashed_password` (VARCHAR)
- `alias` (VARCHAR, Nullable) - Nombre público/alias de usuario.
- `photo_url` (TEXT, Nullable) - Avatar comprimido del usuario.
- `created_at` (DATETIME)

### 2. `categories`
Categorías globales del sistema (Ej. Comida, Gastos Hormiga, Transporte, Otro).
- `id` (INT, PK)
- `name` (VARCHAR, Unique)
- `icon` (VARCHAR)
- `color` (VARCHAR)

### 3. `debts` (Compras, Pasivos y Gastos)
Representa cualquier tipo de gasto registrado (contado o a meses).
- `id` (INT, PK)
- `owner_id` (INT, FK -> users.id)
- `category_id` (INT, FK -> categories.id)
- `description` (VARCHAR)
- `price` (FLOAT) - Costo base.
- `payment_type` (VARCHAR) - "contado" o "meses".
- `months` (INT, Nullable)
- `has_interest` (BOOLEAN, Nullable)
- `interest_rate` (FLOAT)
- `total_amount` (FLOAT) - Calculado.
- `monthly_payment` (FLOAT) - Calculado.
- `remaining_amount` (FLOAT) - Saldo pendiente.
- `purchase_date` (VARCHAR/DATE)
- `is_impulsive` (BOOLEAN, Nullable)

