# Financiera

Bienvenido a Financiera! Gestionar el dinero no debería ser un dolor de cabeza ni una tarea exclusiva de expertos. Este proyecto nació con un propósito claro: crear una herramienta digital, intuitiva y realmente efectiva para ayudarte a tomar el control de tus finanzas personales.

Diseñada originalmente como una aplicación de escritorio. En el futuro para visualizar desde cualquier dispositivo.

# ¿Cómo te ayuda esta App?

La mayoría de las herramientas financieras son confusas o aburridas. Financiera se enfoca en resolver problemas reales mediante tres pilares:

- **Lobby de Entrada:** Una pantalla de bienvenida minimalista, preparándote para registrar tus datos.

- **Simulador de Planes de Inversión:** Te permite proyectar cuánto dinero tendrás en el futuro. Lo mejor es que no solo calcula el interés compuesto básico, sino que desglosa de forma realista los impactos fiscales (como retenciones de ISR), mostrándote tus ganancias netas reales.

- **Gestión Efectiva de Deudas:** Una sección diseñada para registrar tus créditos, tarjetas o préstamos. Te ayuda a visualizar el monto total, el saldo restante y el impacto de las tasas de interés (incluyendo el IVA sobre intereses cuando aplica), permitiéndote planificar pagos mensuales estratégicos para salir de deudas más rápido.

# Arquitectura y Stack Tecnológico

Para lograr que la aplicación sea rápida, segura y fácil de modificar, dividimos el sistema en dos partes independientes (arquitectura desacoplada). Aquí te explicamos qué hace cada componente en lenguaje sencillo:

# Diagrama de Arquitectura Visual

graph TD
subgraph Frontend ["Frontend (React + Vite)"]
UI[Interfaz de Usuario]
Lobby[Lobby / Idiomas]
Debts[Gestión de Deudas]
Invest[Simulador de Inversiones]
UI --> Lobby
UI --> Debts
UI --> Invest
end

    subgraph Backend ["Backend (FastAPI)"]
        API[API Endpoints]
        Auth[Autenticación JWT]
        Logic[Lógica Matemática y Fiscal]
        ORM[SQLAlchemy ORM]
        API --> Auth
        API --> Logic
        Logic --> ORM
    end

    subgraph Database ["🔒 Bóveda de Datos"]
        DB[(PostgreSQL - Neon/Supabase)]
    end

    Frontend -- "Peticiones HTTP (Axios)" --> API
    ORM -- "Consultas Seguras" --> DB

````

### Frontend

- **React + TypeScript:** Usamos React para que la página sea ultra-reactiva (se actualice al instante sin recargar la pantalla). TypeScript nos asegura que el código no tenga errores de datos al escribirlo.
- **Tailwind CSS & Shadcn/ui:** Herramientas de diseño que nos permiten aplicar estilos visuales modernos, bordes redondeados, modos oscuros (Dark Mode) y transiciones fluidas directamente en los componentes de forma ágil.
- **Lucide React:** Iconografía limpia y ligera en formato vectorial (SVG) para que los botones y paneles se vean nítidos en cualquier pantalla (Mac, iPhone, Monitor 4K).

### Backend

- **FastAPI (Python):** Un framework de alta velocidad encargado de recibir las peticiones del Frontend, hacer las operaciones matemáticas pesadas (fórmulas de inversión/deudas) y devolver los resultados en segundos de forma segura.
- **SQLAlchemy & Alembic:** El mapeador (ORM) que nos permite hablar con la base de datos usando código Python seguro, protegiendo el sistema de hackeos (como inyecciones SQL), mientras que Alembic controla el historial de cambios en las tablas.

### Base de Datos

- **PostgreSQL (Neon / Supabase):** Una base de datos relacional de nivel empresarial. Aquí se guardan los usuarios, las inversiones y las deudas de forma organizada y permanente.
- **JWT (JSON Web Tokens):** Sistema de llaves digitales. Cuando inicias sesión, el servidor te da un token seguro que tu navegador usará para demostrar quién eres en cada petición, protegiendo tu información financiera sensible.

---

# Guía de Inicio Rápido
Si eres colaborador del proyecto, sigue estos pasos en tu terminal para levantar el entorno de desarrollo en tu Mac:

### 1. Clonar el Repositorio
```bash
git clone https://github.com/HugoTrejo13/Financiera.git
cd Financiera
````

### 2. Encender el Backend (Servidor)

Abre la terminal y ejecuta:
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

```
> [!NOTE]
> Accede a la documentación automática de las rutas de tu API en: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Encender el Frontend (Interfaz Web)
Abre una nueva pestaña de la Terminal y ejecuta:
cd frontend
npm install
npm run dev
```

> [!TIP]
> Abre tu navegador en: [http://localhost:5173](http://localhost:5173) para empezar a interactuar con la plataforma.
