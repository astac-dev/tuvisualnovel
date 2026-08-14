# Changelog

## [0.1.1] - 2026-08-13
### Added
- Herramienta de Eliminación de Fondos para *sprites* de personajes, implementada con `@imgly/background-removal` (procesamiento local por IA) y un fallback mediante Chroma/Canvas. Accesible mediante clic derecho sobre sprites importados.
- Script automatizado de post-instalación para transferir estáticos WebAssembly / ONNX del paquete `imgly` y posibilitar ejecución *Client-Side* en GitHub Pages.
- Configuración de GitHub Actions (`deploy.yml`) para el despliegue automático en GitHub Pages sin afectar el entorno offline.
### Fixed
- Resolución de errores de tipado de TypeScript en los nodos AST dentro de `parser.ts` y `generator.ts`.
- Corrección del error 404 en minijuegos y assets locales al publicarse en GitHub Pages mediante el uso dinámico de `import.meta.env.BASE_URL`.
- Actualización de la versión de Node.js a la 22 en el flujo de trabajo de despliegue para evitar advertencias de obsolescencia.

## [0.1.0] - 2026-08-09
### Added
- Scaffolding inicial con Vite, React y TypeScript.
- Configuración de Tailwind CSS v4 para diseño Glassmorphism ("Google Antigravity Premium").
- Gestor de Estado (Runtime y Rollback) implementado con Zustand (`gameStore.ts`).
- `StageManager` implementado usando PixiJS (incluye transición crossfade).
- `AudioManager` integrado (BGM y SFX HTML5).
- Layout Dual-binding en `EditorLayout.tsx` (Monaco Editor + React Flow para nodos visuales).
- Parser bi-direccional usando `acorn` para transformar DSL a AST (`parser.ts`) y serializador `generator.ts`.
- Bridge API para sandboxing de Minijuegos y soporte de exportación PWA con JSZip (`exporter.ts`).