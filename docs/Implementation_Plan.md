# Implementation Plan (Master Roadmap)

Este documento es la brújula técnica. Define en qué orden se deben construir y mejorar las características para mantener la estabilidad estructural.

## Fases Completadas ✅

1. **Infraestructura Base:** Migración total a PostgreSQL.
2. **Backend API Core:** FastAPI + SQLModel (Asíncrono).
3. **Módulo de Seguridad:** Autenticación JWT y encriptación nativa bcrypt.
4. **UI Core:** Creación de modales elegantes.
5. **Integración Auth:** El frontend se comunica de manera privada protegiendo rutas.
6. **Arquitectura Documental:** Establecimiento de la base para escalar a SaaS.

## Fases Actuales / Futuras 🚧

### Fase 7: Estabilización Backend

- Creación de `Dockerfile` y `docker-compose.yml` para evitar caídas en el entorno local.

### Fase 8: Dashboard, UI Clean y Analíticas

- Aplicar diseño minimalista tipo Apple (blanco, redondeado, claro).
- Implementar gráficos (Recharts) en el frontend:
  - Gastos por categoría.
  - Progreso del presupuesto vs Gasto real.

### Fase 9: Metas de Inversión (Individual y Compartidas)

- Construir modelo y rutas para Metas de ahorro.
- Modo colaborativo: Lógica para compartir "Espacios" (Roomies, familia, pareja).

### Fase 10: IA y Reconocimiento Visual

- Añadir sección para abrir cámara, tomar foto a recibos/productos, y autocompletar gastos usando IA de Visión.
- Gráficas predictivas (estimar gastos a futuro).

### Fase 11: Notificaciones y Móvil

- Alertas Push para excedentes de presupuesto.
- Empaquetar y construir clientes para iOS (App Store) y Android.
