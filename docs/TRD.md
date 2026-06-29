# Technical Requirements Document (TRD)

## 1. Arquitectura del Sistema
Financiera App sigue una arquitectura Cliente-Servidor separada (Frontend SPA + Backend API RESTful).

## 2. Stack Tecnológico
### Frontend
- **Framework:** React 19 con TypeScript, empaquetado con Vite.
- **Enrutamiento:** React Router DOM v7.
- **Gestor de Estado:** Zustand (estado global y persistencia de sesión) y TanStack Query (caché y sincronización asíncrona).
- **Estilos:** Tailwind CSS v4, componentes de shadcn/ui.
- **Iconografía:** Lucide React.
- **Formularios:** React Hook Form + Zod para validación.

### Backend
- **Framework:** FastAPI (Python 3.14).
- **Servidor ASGI:** Uvicorn.
- **Base de Datos:** PostgreSQL.
- **ORM:** SQLModel y SQLAlchemy (con drivers asíncronos `asyncpg`).
- **Migraciones:** Alembic.
- **Seguridad y Auth:** JWT (JSON Web Tokens) con encriptación de contraseñas mediante la librería nativa `bcrypt` (bypass de passlib).

## 3. Decisiones Técnicas y Patrones
- **Async/Await Backend:** Todo el backend está diseñado de manera asíncrona para soportar alta concurrencia.
- **Autenticación Stateless:** El estado de la sesión no se guarda en el servidor. El cliente almacena el JWT en `localStorage` (vía Zustand) y lo inyecta en cada petición Axios.
- **Protección de Rutas:** Se utiliza inyección de dependencias en FastAPI (`Depends(get_current_user)`) para extraer el ID del usuario directamente del token firmado.

## 4. Arquitectura Evolutiva (Web a Móvil)
- Actualmente el desarrollo es **100% Web (React)**.
- El backend en FastAPI servirá como base centralizada (API Restful) preparada para conectar sin modificaciones a las futuras aplicaciones nativas (iOS/Android).

## 5. Requisitos de Infraestructura y Despliegue
- La base de datos relacional y el backend requieren despliegue en contenedores (Docker) o PaaS especializado para soportar el tráfico del SaaS público.
