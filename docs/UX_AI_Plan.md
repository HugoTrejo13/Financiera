# Plan de Experiencia de Usuario (IA)

> Este documento contiene la evaluación arquitectónica y estratégica de las funcionalidades basadas en Inteligencia Artificial (Carrusel de Prompts), diseñado para su futura implementación.

## 1. Viabilidad Arquitectónica (LLM Integration)
* **Estado:** Excelente.
* **Estrategia:** Los 7 prompts tienen una estructura clara de *System Prompt* (Rol, Contexto, Tarea, Formato de Salida). Serán integrados vía API (OpenAI/Anthropic) en la fase correspondiente.

## 2. Mitigación de Fricción UX
* **Problema:** Alta carga cognitiva si se solicita *data entry* manual (ingresos, deudas, etc.) en cada interacción.
* **Solución Requerida:** Inyección de Contexto Dinámico (RAG). El sistema extraerá los datos financieros directamente de PostgreSQL y presentará un resumen pre-calculado al usuario para confirmación ("*Detectamos $2,500 en ingresos...*"). El payload se enviará de forma transparente al LLM.

## 3. Flujo de Usuario y Persistencia de Datos
* **Regla de Diseño:** La aplicación no debe actuar como un simple "chat de texto".
* **Implementación Estructurada:** Las respuestas del LLM se solicitarán en formato `JSON` estructurado (Structured Outputs). Esto permitirá que las recomendaciones (ej. plan de pago de deudas) se conviertan en elementos accionables (botones de "Aplicar Estrategia") que creen registros reales en la base de datos (Presupuestos, Metas).

## 4. Seguridad y Cumplimiento (SecOps)
* **Directriz:** Obligatorio anonimizar PII (Personally Identifiable Information) en el backend (FastAPI) antes de enviar la solicitud al proveedor LLM, garantizando la privacidad de los datos financieros.

---

## Anexo: Prompts Diseñados (Carrusel)

1. **Mapa de flujos de ingresos:** Diversificación de fuentes de ingreso según capital, tiempo y habilidades. Plan de 12 meses.
2. **Motor de destrucción de deudas:** Comparativa de estrategias (Bola de nieve, Avalancha, Híbrida) con plan de pagos estructurado.
3. **Detector de fugas de gastos:** Auditoría para encontrar gastos ocultos (suscripciones, comisiones) con plan de reducción de 30 días.
4. **Presupuesto sin vergüenza:** Presupuesto realista (regla 50/30/20 adaptada) con guiones de rechazo social sin culpa.
5. **Generador de guiones de negociación salarial:** Guiones y contraofertas según sector y experiencia, incluyendo compensaciones alternativas.
6. **Sistema de ahorro automático:** Jerarquía de ahorro sin esfuerzo, reglas de retención y simulaciones de aportación.
7. **Validador de trabajo secundario:** Matriz de evaluación de ideas de negocio/freelance y plan de lanzamiento a 30 días.
