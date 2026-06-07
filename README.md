# Financiera

Financiera es una aplicación web moderna Full-Stack diseñada para la gestión financiera personal. Permite a los usuarios administrar sus pasivos (Gestión de Deudas) y simular planes de pago e inversión de manera eficiente.

Actualmente, el proyecto utiliza una "Micro-Arquitectura" limpia y totalmente desacoplada entre el Backend y el Frontend, enfocada en la velocidad, el rendimiento y un diseño visual atractivo (Dark Mode).

---

## 🛠️ Stack Tecnológico

El proyecto está construido utilizando las siguientes herramientas modernas:

### Frontend (Interfaz Gráfica)

_Ubicación: `/frontend`_

- **React 19:** Biblioteca principal para la construcción de interfaces de usuario.
- **TypeScript:** Tipado estático para un código más robusto y seguro.
- **Vite:** Entorno de desarrollo ultrarrápido y empaquetador (bundler).
- **Tailwind CSS v4:** Framework de CSS utilitario para un estilizado rápido, moderno y responsivo (implementado de forma nativa sin exceso de componentes).
- **Axios:** Cliente HTTP para conectar con la API del backend.
- **Lucide React:** Colección de iconos vectoriales hermosos y ligeros.

### Backend (API REST)

_Ubicación: `/backend`_

- **FastAPI:** Framework web moderno y ultrarrápido para construir APIs con Python.
- **SQLAlchemy (ORM):** Mapeo objeto-relacional para interactuar con la base de datos de forma segura.
- **Alembic:** Herramienta para manejar las migraciones de la base de datos.
- **Pydantic v2:** Validación de datos automatizada y tipado estricto.
- **SQLite:** Base de datos relacional ligera (fácilmente migrable a PostgreSQL/Supabase en el futuro).

---

## 🚀 Cómo ejecutar el proyecto en local

Para visualizar y editar la aplicación en tu máquina local, debes levantar ambos servidores de forma simultánea en la terminal.

### 1. Iniciar el Backend (API)

Abre una terminal y ejecuta:

```bash
cd backend
../.venv/bin/uvicorn app.main:app --reload
```

_El backend estará disponible en `http://localhost:8000`. Puedes ver la documentación interactiva de la API (Swagger UI) ingresando a `http://localhost:8000/docs`._

### 2. Iniciar el Frontend (Web)

Abre una nueva pestaña en la terminal y ejecuta:

```bash
cd frontend
npm run dev
```

_La aplicación web estará disponible en `http://localhost:5173`. Ábrela en tu navegador para interactuar con el sistema._

---

## 🏗️ Arquitectura de Archivos

La aplicación ha sido optimizada para mantener el menor número de archivos posibles ("cero boilerplate"):

```text
Financiera/
├── backend/
│   ├── app/
│   │   ├── main.py        # Corazón de la API (Rutas y Pydantic)
│   │   ├── database.py    # Conexión SQLAlchemy y variables de entorno
│   │   └── models.py      # Tablas de base de datos
│   ├── alembic/           # Migraciones de base de datos
│   └── financiera.db      # Base de datos local
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── DebtsView.tsx # Vista interactiva de deudas (Form + Tabla)
    │   ├── lib/
    │   │   └── api.ts        # Cliente Axios
    │   ├── App.tsx           # Punto de entrada de la UI
    │   └── index.css         # Configuración global y colores de Tailwind
    ├── package.json
    └── vite.config.ts
```

---

_Este documento se mantendrá actualizado conforme se agreguen nuevos módulos (como los Planes de Inversión) o se integren nuevos servicios externos (Auth, PostgreSQL en la nube)._
