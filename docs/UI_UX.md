# User Interface & User Experience (UI/UX)

## 1. Identidad Visual y Tema (Apple-like Design)
- **Sensación:** Limpia, minimalista, fácil de leer y sumamente intuitiva.
- **Efectos:** Uso de "Glassmorphism" (desenfoque de fondo tipo `backdrop-blur`), sombras difusas muy sutiles, y bordes redondeados amplios (`rounded-2xl`, `rounded-3xl`). Mucho uso de "White space" (espacio en blanco) para que la información respire.
- **Paleta de Colores:** Neutra y elegante. Fondos claros, con acentos de color para acciones críticas. Contraste alto para facilitar la lectura inmediata de números y estadísticas.

## 2. Sistema de Componentes
- **Base:** Se utiliza Tailwind CSS para utilidad pura.
- **Componentes Pre-fabricados:** shadcn/ui provee la base accesible (Radix UI) para componentes interactivos (Diálogos, Alertas).
- **Iconografía:** Lucide React (líneas limpias y peso constante).

## 3. Comportamiento (Micro-interacciones)
- **Animaciones:** Se requiere el paquete `tailwindcss-animate`. Entradas de modales con `animate-in zoom-in-95 fade-in slide-in-from-top-2`.
- **Feedbacks Táctiles:** Botones con transición de color y escala al hacer clic (`active:scale-[0.98] hover:scale-[1.02]`).

## 4. Estructura de Pantallas
- **Lobby (No autenticado):** Hero section claro, propuesta de valor directa, y un Modal de Login/Registro unificado.
- **Dashboard (Autenticado):** Navegación lateral o superior con acceso rápido a "Gastos", "Presupuestos", "Estadísticas".
