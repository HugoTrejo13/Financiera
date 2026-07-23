# Implementation Plan (Master Roadmap)

Este documento es la brújula técnica. Define en qué orden se deben construir y mejorar las características para mantener la estabilidad estructural.

## Fases Completadas ✅

1. **Infraestructura Base:** Migración total a PostgreSQL.
2. **Backend API Core:** FastAPI + SQLModel (Asíncrono).
3. **Módulo de Seguridad:** Autenticación JWT y encriptación nativa bcrypt.
4. **UI Core:** Modales elegantes, componentes reutilizables y estilo minimalista Apple.
5. **Integración Auth:** Rutas protegidas en el frontend.
6. **Arquitectura Documental:** Documentación maestra en `/docs`.
7. **Clean Code & Simplificación de Alcance:** Eliminación total de Presupuestos y Metas de Inversión; enfoque 100% en Gestión de Compras/Pasivos.
8. **UX & Analytics Consolidados:** Desglose porcentual visible por categoría, métricas consolidadas en perfil (Gasto Total, Gasto Promedio/Compra, Deuda Activa) y selector de categoría híbrido (Chips + Grid Popover).
9. **Performance de Perfil:** Compresión de imágenes de perfil con Canvas HTML5 (reducción >99%).

## Fases Actuales / Futuras 🚧

### Fase 10: Contenedorización e Infraestructura (Docker) ✅
- Creación de `Dockerfile` para Backend FastAPI.
- Creación de `docker-compose.yml` para orquestar PostgreSQL y API Backend.

### Fase 11: IA y Reconocimiento Visual (Próxima)
- Apertura de cámara / subida de recibos y autocompletado de compras mediante Gemini Vision API (OCR inteligente).
- Predicción de compras e impulsos financieros.

### Fase 12: Funcionalidades de Escritorio Avanzadas (Enfoque Desktop-Only)
- Exportación de reportes financieros a PDF/Excel.
- Simulador avanzado de amortización de créditos (Hipotecario / Automotriz) con tabla de pagos y aportaciones a capital.
- Gráficos interactivos de proyección financiera de escritorio.

