# NodeIDs — Pizarra Interactiva de Nodos Colaborativos

**NodeIDs** es una herramienta web profesional de lienzo infinito (whiteboard) diseñada para organizar ideas, estructurar proyectos y colaborar con otros usuarios en tiempo real. Construido con **Next.js 15**, **React Flow (@xyflow/react)**, **Zustand** y **Supabase**.

---

## Características Principales

*   **Pizarra de Lienzo Infinito:** Zoom, paneo, rejilla interactiva y minimapa flotante.
*   **Gestión de Nodos Personalizados:**
    *   Bordes de color dinámicos según el tipo de nodo.
    *   Indicadores visuales de notas de texto libre y progreso de tareas.
    *   Fichas de prioridad (Baja, Media, Alta, Urgente) y etiquetas (`#tags`).
    *   Conectores (puertos) en las 4 direcciones cardinales.
*   **Editor de Propiedades Completo:** Panel lateral derecho que se abre automáticamente al hacer clic en un nodo para editar título, color, descripción, notas detalladas, tags y checklist.
*   **Checklist Inteligente:** Añade, marca y borra tareas de cada nodo con barra de progreso interactiva en tiempo real.
*   **Buscador Integrado con Enfoque:** Buscador en el panel izquierdo que filtra nodos por título o descripción y enfoca la pantalla suavemente (`setCenter`) al seleccionarlo.
*   **Atajos de Teclado Globales:**
    *   `Ctrl + Z` / `Ctrl + Y` (o `Ctrl + Shift + Z`): Deshacer y Rehacer cambios en el lienzo.
    *   `Ctrl + C` / `Ctrl + V`: Copiar y pegar nodos seleccionados.
    *   `Ctrl + A`: Seleccionar todos los nodos.
    *   `Ctrl + S`: Forzar guardado manual.
    *   `Delete` / `Backspace` o Botón Rojo Flotante: Eliminar nodos seleccionados.
*   **Compartir Pizarra por Correo (Nivel 1):** Sistema de invitaciones donde puedes compartir tus proyectos con otros usuarios registrados asignándoles permisos de "Solo Lectura (Ver)" o "Edición (Lectura y Escritura)", garantizado por políticas RLS en base de datos.
*   **Tema Claro/Oscuro Integrado:** Cambio de tema con adaptación de estilos del lienzo.

---

## Requisitos Previos

1.  Una cuenta en [Supabase](https://supabase.com).
2.  [Node.js](https://nodejs.org) (v18.x o superior) instalado localmente.
3.  Un repositorio en GitHub para el despliegue automático.

---

## Configuración de la Base de Datos (Supabase)

Para inicializar la base de datos de tu proyecto, ve al **SQL Editor** en tu panel de Supabase y ejecuta los scripts en el siguiente orden:

1.  **Esquema Inicial:** Copia y ejecuta el archivo [supabase_schema.sql](supabase_schema.sql) para crear las tablas base de proyectos, nodos y aristas.
2.  **Soporte de Compartir y Parche de Cuentas:** Copia y ejecuta el archivo [supabase_sharing_recursion_fix.sql](supabase_sharing_recursion_fix.sql) para implementar el sistema de invitaciones por correo y evitar problemas de recursión en las políticas RLS.
3.  **Manejador JWT (Si es requerido):** Si tu instancia de Supabase es antigua y arroja un error con `auth.jwt()`, ejecuta el archivo [supabase_sharing_fix.sql](supabase_sharing_fix.sql) para definirlo.
4.  **Políticas RLS Limpias:** Copia y ejecuta el archivo [supabase_sharing_clean_policies.sql](supabase_sharing_clean_policies.sql) para instalar las políticas definitivas de lectura/escritura de nodos y aristas sin colisiones.

---

## Instalación y Configuración Local

1.  Clona el repositorio en tu máquina local.
2.  Instala las dependencias del proyecto:
    ```bash
    npm install
    ```
3.  Crea un archivo `.env.local` en la raíz (puedes tomar como base el archivo `.env.example`) y configura tus claves de Supabase:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-publica-anon-real
    ```
4.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```
5.  Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Despliegue en Vercel

Sigue estos pasos para desplegar tu aplicación en producción utilizando **Vercel**:

### Paso 1: Subir código a GitHub
Asegúrate de inicializar Git y empujar tu proyecto a tu repositorio de GitHub:
```bash
git init
git remote add origin https://github.com/Veronthebeast/node_ids.git
git add .
git commit -m "feat: complete NodeIDs canvas and collaborative sharing"
git branch -M main
git push -u origin main
```

### Paso 2: Importar el Proyecto en Vercel
1.  Inicia sesión en [Vercel](https://vercel.com).
2.  Haz clic en **"Add New"** > **"Project"**.
3.  Importa el repositorio `node_ids` desde tu cuenta de GitHub conectada.

### Paso 3: Configurar Variables de Entorno
Antes de hacer clic en **"Deploy"**, ve a la sección **Environment Variables** y añade las siguientes claves con sus valores reales de Supabase:
*   `NEXT_PUBLIC_SUPABASE_URL`
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Paso 4: Desplegar
Haz clic en **"Deploy"**. Vercel compilará la aplicación y la desplegará en una URL pública optimizada en cuestión de segundos.
