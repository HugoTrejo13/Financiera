# Financiera App 🚀

<p align="center">
  <!-- TODO: Inserta aquí la imagen principal, logo o screenshot del dashboard de tu app -->
  <img src="/assets/demo.jpeg" alt="Financiera App Cover" width="100%">
</p>

**Financiera App** es un SaaS moderno para gestión financiera personal y colaborativa. Diseñado con una interfaz minimalista, limpia y fluida (estilo _Apple-like_), permite a los usuarios llevar un control exhaustivo de sus finanzas, gastos a meses sin intereses, y presupuestos de manera inteligente.

## 🌟 Funcionalidades Principales

- **Gestión Avanzada:** Registro de compras de contado y a crédito (cálculo de meses sin intereses).
- **Control de Presupuestos:** Asignación de límites mensuales por categoría con alertas automáticas.
- **Entorno Colaborativo (Próximamente):** Comparte cuentas y metas con roomies, pareja o familia.
- **IA Integrada (Próximamente):** Escaneo inteligente de recibos por cámara y gráficas predictivas del futuro financiero.

## 🛠️ Stack Tecnológico

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Zustand.
- **Backend:** FastAPI (Python), PostgreSQL, SQLModel.
- **Seguridad:** Autenticación JWT (JSON Web Tokens) con cifrado bcrypt puro.
- **Infraestructura:** Docker & Docker Compose.

---

## 📚 Arquitectura y Documentación

Para decisiones técnicas, flujos, y arquitectura profunda de la base de datos, por favor lee los documentos maestros ubicados en la carpeta `/docs` (PRD, TRD, Schema, etc.). Todo nuevo desarrollo debe apegarse al `/docs/Implementation_Plan.md`.

---

## ⚙️ Requisitos Previos (Para Desarrolladores)

1. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** instalado y corriendo.
2. **[Node.js](https://nodejs.org/)** (v18 o superior).

---

## 🏃 Cómo levantar el proyecto localmente

Cualquier desarrollador que clone este repositorio puede ejecutar la app en segundos:

### Paso 1: Levantar Backend y Base de Datos (Docker)

Abre la terminal en la raíz del proyecto y ejecuta:

```bash
docker compose up --build -d
```

> Esto descarga PostgreSQL, compila el servidor de FastAPI y los conecta internamente. La API quedará corriendo en `http://localhost:8000`.

### Paso 2: Levantar el Frontend (React)

Abre otra terminal, entra a la carpeta del frontend e inicia la interfaz:

```bash
cd frontend
npm install
npm run dev
```

> La interfaz web estará disponible en `http://localhost:5173`.

---

## 🗄️ Acceso a la Base de Datos (GUI)

Si necesitas administrar las tablas visualmente usando clientes como TablePlus o DBeaver, conéctate con estas credenciales:

- **Host:** `localhost` | **Port:** `5432`
- **User:** `financiera_user` | **Password:** `admin` | **Database:** `financiera_db`
