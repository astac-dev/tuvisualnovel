# Changelog

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