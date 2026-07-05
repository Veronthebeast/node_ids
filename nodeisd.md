# Proyecto: NodeIDs

Quiero desarrollar una aplicación web profesional llamada **NodeIDs**, inspirada en herramientas como Miro, FigJam, Obsidian Canvas y Excalidraw.

El objetivo es crear una pizarra infinita donde el usuario pueda construir flujos mediante nodos conectados entre sí. Cada nodo podrá almacenar información y una checklist de tareas.

---

# Directorio del proyecto

Crear el proyecto en:

`C:\Users\USER\nodeids`

Si la carpeta no existe, crearla automáticamente.

---

# Forma de trabajo (OBLIGATORIA)

Antes de escribir una sola línea de código debes trabajar como un arquitecto de software.

## Fase 1 — Arquitectura

Diseñar completamente:

* arquitectura del proyecto
* estructura de carpetas
* modelo de datos
* componentes
* gestión del estado
* flujo de datos
* rutas
* estrategia de autenticación
* comunicación con Supabase

No comenzar a programar hasta tener este diseño.

---

## Fase 2 — Planificación

Crear un roadmap dividido por etapas.

Ejemplo:

1. Inicialización
2. Autenticación
3. Canvas
4. Sistema de nodos
5. Conexiones
6. Checklist
7. Persistencia
8. Historial
9. Optimización
10. Testing

Cada etapa debe terminar completamente funcional antes de comenzar la siguiente.

---

## Fase 3 — Desarrollo

Implementar cada etapa.

Al finalizar cada una:

* ejecutar el proyecto
* corregir errores
* eliminar warnings
* revisar el código
* continuar con la siguiente etapa

Nunca avanzar dejando errores pendientes.

---

# Uso de subagentes (OBLIGATORIO)

Utilizar subagentes especializados.

## Arquitecto

Responsable de:

* arquitectura
* estructura del proyecto
* escalabilidad
* buenas prácticas

---

## Frontend

Responsable de:

* React
* componentes
* Tailwind
* experiencia de usuario

---

## Canvas

Responsable de:

* React Flow
* zoom
* pan
* selección
* conexiones
* rendimiento

---

## Base de datos

Responsable de:

* Supabase
* PostgreSQL
* consultas
* seguridad (RLS)
* diseño de tablas

---

## Estado global

Responsable de:

* Zustand
* TanStack Query
* sincronización de datos

---

## QA

Responsable de:

* pruebas
* revisión del código
* corrección de errores
* optimización

---

# Stack (OBLIGATORIO)

No elegir tecnologías distintas.

Utilizar exactamente este stack:

## Framework

* Next.js 15 (App Router)

## Lenguaje

* TypeScript

## UI

* Tailwind CSS

## Canvas

* React Flow

## Estado

* Zustand

## Fetching y caché

* TanStack Query

## Formularios

* React Hook Form

## Validación

* Zod

## Animaciones

* Framer Motion

## Iconos

* Lucide React

## Backend

Supabase

Utilizar:

* PostgreSQL
* Authentication
* Storage
* Realtime
* Row Level Security (RLS)

## Deploy

La aplicación será desplegada en **Vercel**.

Toda la arquitectura debe ser compatible con Vercel.

No utilizar servidores persistentes.

Si se necesita lógica backend utilizar:

* Supabase
* o Route Handlers de Next.js únicamente cuando sea necesario.

---

# Calidad del código

El código debe ser:

* limpio
* modular
* reutilizable
* escalable
* mantenible
* completamente tipado

No crear archivos gigantes.

Separar responsabilidades.

Seguir principios SOLID cuando corresponda.

Utilizar buenas prácticas de React y TypeScript.

---

# Funcionalidades

## Autenticación

Implementar autenticación con Supabase.

Debe permitir:

* registro
* login
* logout
* recuperación de contraseña

Preparar el sistema para múltiples usuarios.

---

# Dashboard

Después del login mostrar un dashboard.

Desde allí el usuario podrá:

* crear proyectos
* abrir proyectos
* eliminar proyectos
* renombrar proyectos

---

# Canvas

Crear un canvas infinito utilizando React Flow.

Debe soportar:

* zoom
* pan
* minimap
* controles
* selección múltiple
* drag and drop
* rendimiento con cientos de nodos

---

# Nodos

Crear nodos personalizados.

Cada nodo debe contener:

* título
* descripción
* notas
* color
* prioridad
* etiquetas
* fecha de creación
* fecha de modificación

---

# Checklist

Cada nodo tendrá una checklist integrada.

Debe permitir:

* agregar tareas
* editar tareas
* eliminarlas
* reordenarlas mediante drag & drop
* marcar completadas
* mostrar porcentaje de progreso

---

# Conexiones

Permitir conectar nodos.

Las conexiones deben admitir:

* curvas suaves
* flechas
* eliminar conexión
* reconectar
* etiquetas opcionales

---

# Panel izquierdo

Mostrar:

* proyectos
* botón crear nodo
* buscador
* filtros
* configuración

---

# Panel derecho

Mostrar las propiedades del nodo seleccionado.

Todos los cambios deben actualizarse automáticamente.

---

# Buscador

Buscar por:

* título
* descripción
* etiquetas
* contenido

---

# Historial

Implementar:

* Undo
* Redo

---

# Atajos

Implementar:

Ctrl + S

Ctrl + Z

Ctrl + Shift + Z

Ctrl + C

Ctrl + V

Delete

Ctrl + A

---

# Persistencia

Guardar automáticamente los cambios.

Utilizar Supabase como almacenamiento principal.

Implementar autoguardado.

---

# Diseño

Inspirarse en:

* Miro
* FigJam
* Obsidian Canvas
* Excalidraw

La interfaz debe ser:

* moderna
* minimalista
* profesional
* responsive
* modo claro y oscuro
* animaciones suaves

---

# Escalabilidad

Diseñar la arquitectura pensando en futuras funcionalidades como:

* colaboración en tiempo real
* compartir proyectos
* comentarios
* historial de versiones
* carpetas
* IA para generar flujos
* exportación a PDF
* exportación a PNG
* exportación a SVG
* PWA
* internacionalización

No es necesario implementarlas ahora, pero la arquitectura debe quedar preparada.

---

# Restricciones

* No cambiar el stack sin justificarlo.
* No instalar librerías innecesarias.
* No generar código duplicado.
* No avanzar si existen errores de compilación.
* Documentar las decisiones importantes.
* Mantener una arquitectura escalable desde el primer commit.

# Objetivo final

Construir una aplicación con calidad de producción, lista para desplegar en Vercel, con código mantenible, preparada para crecer y con una experiencia de usuario comparable a herramientas profesionales de diagramación y organización visual.
