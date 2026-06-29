# Database Schema

## Motor: PostgreSQL (Asíncrono)

El ORM utilizado es SQLModel. La base de datos es altamente relacional. A continuación, el diccionario de tablas y relaciones clave.

## Tablas Principales

### 1. `users`
Almacena la identidad de la persona. Todas las entidades financieras derivan de esta tabla.
- `id` (INT, PK)
- `email` (VARCHAR, Unique, Index)
- `hashed_password` (VARCHAR)
- `created_at` (DATETIME)

### 2. `categories`
Categorías globales del sistema (Ej. Comida, Transporte, Gastos Hormiga).
- `id` (INT, PK)
- `name` (VARCHAR, Unique)
- `icon` (VARCHAR)
- `color` (VARCHAR)

### 3. `debts` (Transacciones y Gastos)
Representa cualquier tipo de gasto (contado o a crédito).
- `id` (INT, PK)
- `owner_id` (INT, FK -> users.id)
- `category_id` (INT, FK -> categories.id)
- `description` (VARCHAR)
- `price` (FLOAT) - Costo base.
- `payment_type` (VARCHAR) - "contado" o "meses".
- `months` (INT, nullable)
- `interest_rate` (FLOAT)
- `total_amount` (FLOAT) - Calculado.
- `monthly_payment` (FLOAT) - Calculado.
- `purchase_date` (VARCHAR/DATE)

### 4. `monthly_budgets`
Presupuestos asignados por el usuario a categorías específicas por mes.
- `id` (INT, PK)
- `owner_id` (INT, FK -> users.id)
- `category_id` (INT, FK -> categories.id)
- `month` (VARCHAR) - Formato "YYYY-MM".
- `budget_amount` (FLOAT)
- `spent_amount` (FLOAT) - Recalculado automáticamente desde `debts`.
- `alert_threshold` (FLOAT) - Default 0.8 (80%).

### 5. `investment_plans` (Futuro)
Metas de ahorro e inversión.
- `id` (INT, PK)
- `owner_id` (INT, FK -> users.id)
- `name` (VARCHAR)
- `target_amount` (FLOAT)
- `current_amount` (FLOAT)
- `expected_return_rate` (FLOAT)
