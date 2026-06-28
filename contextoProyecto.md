Lee al completo este documento antees de hacer cualquier cambio a la app.
"Actúa como un optimizador de tokens. Restringe tus respuestas exclusivamente al grano. Elimina saludos, cortesías, explicaciones paso a paso de lo evidente y redundancias. Ve directo a la solución, código o resultado. Usa frases cortas y palabras precisas. Entrega el formato más compacto posible sin perder el contexto ni la calidad técnica de lo solicitado."

# Contexto Maestro y Reglas de IA: Financiera App

Este documento es la "Biblia" del proyecto. Centraliza las instrucciones de comportamiento para la IA, así como toda la información técnica y de negocio para que cualquier asistente pueda entender rápidamente la estructura, las reglas y el estado actual de la aplicación.

> **⚠️ IMPORTANTE PARA LA IA:** DEBES LEER ESTE ARCHIVO ANTES DE HACER CUALQUIER CAMBIO EN EL CÓDIGO.

## 1. Identidad y Enfoque del Asistente (Instrucciones)

- Eres un ingeniero full stack con 40 años de experiencia en la industria, actualizado con las tecnologías actuales y siempre proponiendo las mejores prácticas de código.
- Siempre prioriza soluciones limpias, mantenibles y eficientes.

## 2. Flujo de Trabajo Obligatorio (¡Atención IA!)

1. **Leer:** Siempre inicia leyendo este archivo (`contextoProyecto.md`).
2. **Ejecutar:** Realiza los cambios solicitados.
3. **Actualizar:** Al finalizar, vuelve a este archivo y **ACTUALÍZALO** si se añadió, quitó o cambió alguna tecnología, funcionalidad o regla. Si no hubo cambios estructurales, déjalo igual. Si quitaste algo, quitalo de aqui.

## 3. ¿Qué es Financiera App?

Es un gestor financiero personal construido para el mercado mexicano. Permite a los usuarios registrar deudas, compras de contado, compras a meses sin intereses y gestionar un presupuesto mensual con alertas automatizadas.

## 3. Arquitectura y Stack Tecnológico

### Frontend (`/frontend`)

- **Core:** React 19, TypeScript, Vite.
- **Enrutamiento:** React Router DOM v7.
- **Estado Global:** Zustand y TanStack Query (React Query) para caché de API.
- **Estilos:** Tailwind CSS v4, Lucide React (iconos SVG), componentes de shadcn/ui.
- **Formularios:** React Hook Form + Zod.
- **Navegación:** Single Page Application (SPA).

### Backend (`/backend`)

- **Core:** FastAPI (Python 3.14), Uvicorn.
- **Base de Datos:** PostgreSQL (Local).
- **ORM:** SQLModel y SQLAlchemy. Alembic para migraciones.
- **Autenticación:** JWT con contraseñas encriptadas en bcrypt.
- **Validación:** Pydantic y pydantic-settings.

## 4. Estructura de la Base de Datos

Las tablas principales son:

1. `users`: Usuarios del sistema.
2. `categories`: 12 categorías predefinidas de gastos (incluyendo la categoría ID 15: "Gastos hormiga" con el emoji 🐜 y color rojo).
3. `debts`: Almacena transacciones (compras y deudas). Soporta `payment_type = "contado"` y `"meses"`.
4. `monthly_budgets`: Presupuestos mensuales por categoría que definen límites de gasto y umbrales de alerta. Relacionada directamente a `categories`.

## 5. Funcionalidades Clave

### A. Gestión de Compras y Deudas

- Al crear una compra a meses, la UI genera "relojes" (íconos interactivos) que permiten al usuario marcar individualmente cuántos meses ya ha pagado de manera manual (`paid_months`).
- La barra de progreso de pago avanza conforme se actualiza `paid_months`.

### B. Sistema de Presupuesto Mensual (`/presupuesto`)

- **Alertas Visuales:** Las barras de progreso indican Verde (< 80%), Amarillo (≥ 80%) y Rojo (> 100%).
- **Notificaciones en el Header:** Existe un ícono de campana (🔔) con un punto rojo que se ilumina si un presupuesto rebasa su umbral (default 80%).
- **Recálculo Automático:** Cada transacción nueva ajusta el `spent_amount` del presupuesto correspondiente.

## 6. Reglas de Negocio Críticas (¡Atención IA!)

- **Cálculo de Reportes de Gastos:** Para sumar los gastos, el backend diferencia estrictamente entre el tipo de pago:
  - Si `payment_type == "contado"`, se suma el `price` (precio total).
  - Si `payment_type == "meses"`, se suma ÚNICAMENTE el `monthly_payment` (pago mensual), NO el precio total. Esto evita distorsionar los reportes mensuales de gasto.
- **Categorías Únicas:** Evitar duplicar categorías (se arregló un bug histórico donde "Comida" y "Comida y Restaurantes" coexistían). Usar los IDs existentes.
- **Relaciones SQLModel:** `MonthlyBudget` requiere `category: Optional[Category] = Relationship()` para que el frontend pueda pintar los iconos y colores en los presupuestos.

## 7. Comandos de Desarrollo

- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && source .venv/bin/activate && python3 -m uvicorn app.main:app --reload --port 8000`
