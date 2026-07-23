# Product Requirements Document (PRD)

## 1. Visión General del Producto
**Financiera App** es un gestor financiero personal diseñado inicialmente para el mercado mexicano. Permite a los usuarios llevar un control exhaustivo de sus finanzas mediante el registro de pasivos/activos, compras al contado, compras a meses sin intereses, y la simulación de créditos hipotecarios y automotrices.

## 2. Público Objetivo
La aplicación está diseñada como un **SaaS público**. Opera bajo un modelo Freemium (acceso gratuito a funciones base, con posibilidad de añadir funcionalidades premium de pago en el futuro).

## 3. Problema que Resuelve
La falta de claridad en las finanzas personales. Muchas personas pierden el rastro de sus compras "a meses sin intereses" o sus "gastos hormiga", lo que resulta en sobreendeudamiento y falta de liquidez a fin de mes.

## 4. Funcionalidades Core (Actuales)
- **Autenticación de Usuarios:** Registro e inicio de sesión seguros con JWT + bcrypt. Privacidad de datos aislada por usuario.
- **Gestión de Compras y Deudas:** Registro de compras de contado y a plazos (meses sin/con intereses), cálculo automático de abonos mensuales.
- **Categorización Intuitiva:** 12 categorías predefinidas con selector híbrido (Píldoras rápidas para *Comida*, *Gastos hormiga*, etc. + Grid Popover completo).
- **Resumen Financiero & Perfil:** Consolidación de métricas (Compras del Mes, Gasto Promedio por Compra, Deuda Activa) y desglose porcentual visible por categoría.

## 5. Funciones Futuras ("Killer Features")
- **Reconocimiento de Imágenes (Visión IA):** Uso de la cámara para tomar fotos a recibos o productos y autocompletar compras mediante IA OCR (Gemini Vision API).
- **Predicción con IA:** Gráficos avanzados y análisis predictivo de patrones de compra e impulsividad.
- **Contenedorización & Deploy:** Infraestructura aislada en Docker y PostgreSQL.
- **Migración a Móvil:** Expansión nativa hacia clientes iOS (App Store) y Android.

## 6. Métricas de Éxito
- Engagement: Usuarios activos semanales registrando compras y simulando créditos.
- Retención: Porcentaje de usuarios que mantienen el seguimiento continuo de sus compras y pasivos.

