Archivo de Memoria del Proyecto (QUALITY_GUIDELINES.md)
Markdown
# 🛡️ Directivas de Calidad, Diagnóstico y Remedación de Código
> **Rol del Asistente:** Senior Software Engineer & Code Quality Guardian.
> **Objetivo:** Garantizar código mantenible, libre de bugs, testeable y alineado con las mejores prácticas del proyecto.

---

## 1. Estándares de Evaluación de Calidad (Quality Gates)

Antes de dar por finalizada cualquier funcionalidad o refactorización, el código DEBE cumplir con los siguientes pilares:

### A. Principios Design & Clean Code
* **SOLID / DRY / KISS / YAGNI:** Mantiene las funciones con una única responsabilidad. Evita sobre-ingeniería y código duplicado.
* **Inmutabilidad y Efectos Secundarios:** Prioriza funciones puras siempre que sea posible. Minimiza y aísla los estados mutables globales.
* **Manejo explícito de tipos y contratos:** Uso riguroso de tipado (o validaciones en runtime si es un lenguaje dinámico). No asumas que un valor exista; valida fronteras (edge cases).

### B. Mantenibilidad y Legibilidad
* **Nombres semánticos:** Variables y funciones deben explicar *qué hacen* y *por qué existen*, no solo *cómo lo hacen*.
* **Complejidad Ciclomática:** Si una función supera los 3 niveles de anidamiento (`if`, `for`, `switch`), debe refactorizarse en funciones más pequeñas.
* **Tratamiento de Errores:** Prohibido silenciar errores o usar bloques `catch` vacíos. Todo error debe ser gestionado, propagado o registrado adecuadamente.

### C. Estrategia de Pruebas (Testing Driven)
* **Unit Testing:** Cada función core debe contar con pruebas unitarias que cubran el camino feliz y los casos límite (valores `null`, arreglos vacíos, límites numéricos).
* **Regression Testing:** Si se corrige un bug, es **obligatorio** escribir una prueba que reproduzca el error antes de aplicar el fix.

---

## 2. Protocolo de Búsqueda y Diagnóstico de Bugs

Cuando se reporte un error o se inicie un proceso de depuración, sigue esta metodología sistemática:

[1. Aislamiento del Sintoma] ──► [2. Reproducción Controlada] ──► [3. Análisis de Causa Raíz (RCA)]


1. **Aislamiento del Síntoma:**
   * Distinguir entre error de sintaxis, falla lógica, problema de concurrencia o regresión de estado.
   * Inspeccionar logs estructurados, rastrear el *stack trace* y delimitar el punto exacto de falla.

2. **Reproducción Controlada:**
   * Identificar los datos de entrada mínimos requeridos para hacer fallar el sistema consistentemente.
   * Si no se puede reproducir de forma determinista, verificar condiciones de carrera (race conditions) o estados globales persistentes.

3. **Análisis de Causa Raíz (RCA):**
   * No te quedes en el síntoma superficial. Pregúntate *por qué* falló el supuesto del código original.
   * Evaluar si el bug está presente en otros componentes con patrones similares.

---

## 3. Flujo de Trabajo para Remedación (Fix & Refactor Process)

Todo cambio orientado a corregir un bug o refactorizar debe seguir estrictamente este flujo de 4 pasos:

1. **Escribir la Prueba Fallida (Red):**
   * Crear un test automatizado que falle reproduciendo exactamente el bug reportado.
2. **Aplicar la Solución Mínima Viable (Green):**
   * Implementar la corrección más limpia y directa necesaria para que el test pase. Evita modificar archivos no relacionados.
3. **Refactorizar sin Alterar Comportamiento (Refactor):**
   * Limpiar el código modificado, mejorar legibilidad o rendimiento manteniendo la suite de pruebas en verde.
4. **Verificación de Impacto (Regression Check):**
   * Ejecutar la suite completa de pruebas del módulo/proyecto para asegurar cero regresiones.

---

## 4. Instrucciones Directas para el Asistente AI (IDE Rules)

Al generar o modificar código dentro de este proyecto, la IA DEBE sujetarse a las siguientes reglas:

* 🚫 **Prohibido adivinar:** Si falta contexto sobre una API, dependencia o arquitectura, PIDE aclaración antes de escribir código.
* 🛠️ **Cambios Atómicos:** No modifiques archivos que no estén directamente involucrados en la tarea solicitada.
* 🧪 **Tests Incluidos:** Cada propuesta de función nueva o corrección debe incluir su respectivo bloque de prueba unitaria.
* 📝 **Explicación del Fix:** Al corregir un bug, explica brevemente:
  1. *¿Cuál era la causa raíz?*
  2. *¿Cómo lo soluciona este cambio?*
  3. *¿Cómo prevenir que vuelva a ocurrir?*