# Sistema de Indicadores V8 · Dirección de Bienestar Humano

Incluye Salud, Educación y Deporte, con restricciones de acceso por usuario.



## ✅ Actualización V4 estable

- Se eliminaron módulos reconvertidos y cerrados.
- La base queda organizada con **23 módulos de Salud** y **5 unidades AlmaNova**: Norte, Oriente, Sur, Pensiones y Caucel.
- AlmaNova queda separado visualmente de los módulos médicos.
- Se agregó selector inicial de tablero: **Salud / Educación / Deporte**. Por ahora Salud queda activo; Educación y Deporte están listos para integrarse cuando se reciban sus indicadores.
- Se agregó `mobile.html` para teléfonos. `index.html` redirige automáticamente a `mobile.html` en iPhone/Android.
- Las gráficas y tendencias se renderizan de forma nativa, sin depender de Chart.js.
- Al hacer click en cualquier módulo se abre una ventana de tendencias mensuales del módulo y servicio más usado.

### Archivos nuevos o importantes

- `index.html`: versión escritorio, redirige a móvil cuando detecta teléfono.
- `mobile.html`: versión especial para teléfono con navegación inferior.
- `data.js`: base depurada con 23 módulos + 5 AlmaNova.
- `app.js`: motor V4 estable con gráficas nativas y detalle por módulo.
# 🌿 Sistema de Indicadores · Dirección de Bienestar Humano
### H. Ayuntamiento de Mérida 2024–2027

Dashboard interactivo, animado y responsivo para visualizar la productividad de los módulos médicos de la Dirección de Bienestar Humano. Funciona en **PC y dispositivos móviles**, con mapa interactivo de la ciudad, captura mensual de información, gráficas dinámicas, partículas animadas y sistema de usuarios.

---

## ✨ Características

- 🔐 **Login con 4 usuarios** (Alejandra, Chucho, Sandra, Clarisa)
- 🎨 **Logo oficial** de la Dirección integrado (`logo.png` + `logo-icon.png`)
- 📊 **6 KPI animados** con contadores y comparación contra el mes anterior
- 🗺️ **Mapa interactivo** con la ubicación de cada módulo en Mérida (Leaflet + OpenStreetMap)
- 📈 **Tendencias históricas** (atenciones por mes, multi-servicio, % de crecimiento)
- 📝 **Captura mensual** con barra de progreso para mantener la información al 100%
- 🌐 **Persistencia local** (LocalStorage) + opción de **sincronización a Google Sheets** vía Apps Script
- 📥 **Exportar / Importar JSON** de respaldo
- ⭐ **Temas Prioritarios** (Salud, Mujeres, Salud Mental) ya cargados con datos al 31 de marzo de 2026
- 🎨 **Identidad visual** del Ayuntamiento de Mérida (verde lima `#8DC63F` + azul marino `#0E2A6B`)
- ✨ **Animaciones**: partículas de fondo, splash, transiciones, gráficas animadas
- 📱 **100% Responsive**: optimizado para teléfono, tablet y escritorio

---

## 🔑 Usuarios y contraseñas iniciales

| Usuaria/o  | Contraseña |
|------------|------------|
| Alejandra Mejía | `AlejandraBH2026` |
| Jesús Pérez | `JesusBH2026` |
| Alfonso Ávila | `AlfonsoBH2026` |
| Cresencio Gutiérrez | `CresencioBH2026` |
| Iván Herrera | `IvanBH2026` |

------------|-----------------|
| Alejandra  | `Alejandra2026` |
| Chucho     | `Chucho2026`    |
| Sandra     | `Sandra2026`    |
| Clarisa    | `Clarisa2026`   |

> 🔒 **Para cambiarlas**: edita el archivo `data.js` → objeto `USERS` y cambia el campo `password` de cada usuaria/o. Después haz `commit + push` en GitHub y los cambios se reflejan inmediatamente.

---

## 📁 Estructura del proyecto

```
bienestar-humano/
├── index.html               → Estructura de la app
├── styles.css               → Estilos e identidad visual
├── data.js                  → Usuarios, módulos, datos iniciales
├── app.js                   → Lógica principal (login, charts, mapa, carga)
├── google-apps-script.gs    → Motor de datos en la nube (opcional)
├── logo.png                 → Logo completo (Dirección de Bienestar Humano)
├── logo-icon.png            → Logo solo ícono (para topbar y splash)
└── README.md                → Esta guía
```

> 💡 **Importante sobre el logo**: el sistema busca `logo.png` y `logo-icon.png` por defecto. Si por algún motivo no se cargan, automáticamente muestra un ícono SVG de respaldo (la hoja verde) para que la app nunca se vea rota.

---

## 🚀 Paso a paso: subir el proyecto a GitHub

### 1. Crear el repositorio en GitHub
1. Entra a https://github.com → click en **"+" → "New repository"**
2. Nombre del repo: `bienestar-humano-merida` (o el que prefieras)
3. Marca **Public** (para usar GitHub Pages gratis)
4. **NO** marques "Add a README" (ya lo tenemos)
5. Click en **"Create repository"**

### 2. Subir TODOS los archivos
1. En la página del repo recién creado, click en **"uploading an existing file"**
2. Arrastra los **8 archivos** del proyecto:
   - `index.html`
   - `styles.css`
   - `data.js`
   - `app.js`
   - `google-apps-script.gs`
   - `logo.png` ⬅️ **importante: el logo completo**
   - `logo-icon.png` ⬅️ **importante: el logo solo ícono**
   - `README.md`
3. Escribe un mensaje como _"Versión inicial del sistema"_ y click en **"Commit changes"**

### 3. Activar GitHub Pages para tener URL pública
1. En el repo, ve a **Settings → Pages**
2. En **Source**, selecciona **"Deploy from a branch"**
3. **Branch**: `main` · **Folder**: `/ (root)` → Save
4. Espera ~1 minuto y refresca. GitHub mostrará tu URL pública:
   `https://<tu-usuario>.github.io/bienestar-humano-merida/`
5. ¡Listo! Comparte esa URL con el equipo y se abre desde celular o computadora.

---

## 💾 ¿Qué es el JSON y para qué sirve?

El **JSON** es un archivo de respaldo de toda la información cargada. Piénsalo como una "fotografía completa" de la base de datos: contiene todos los meses, todos los módulos, todos los números.

### ¿Para qué sirve?
- 🛟 **Respaldo**: por si algo se borra accidentalmente o se daña la sincronización
- 📤 **Compartir**: si quieres enviarle a alguien todos los datos sin darle acceso al sistema
- 🔄 **Migrar**: si cambias de navegador o de PC, puedes mover toda la info con un solo archivo
- 📦 **Archivo histórico**: para guardar la información de un período cerrado

### ¿Cómo se usa?

**Para EXPORTAR (guardar respaldo)**:
1. Inicia sesión
2. Ve a la sección **"Cargar datos"**
3. Click en el botón **"Exportar JSON"** (arriba a la derecha)
4. Se descarga un archivo llamado `bienestar_humano_2026-05-06.json` (con la fecha del día)
5. Guárdalo en una carpeta segura (Drive, Dropbox, OneDrive, etc.)

**Para IMPORTAR (restaurar)**:
1. En la misma sección **"Cargar datos"**, click en **"Importar JSON"**
2. Selecciona el archivo `.json` que tenías guardado
3. Te pregunta si quieres reemplazar todo (te muestra cuántos períodos vas a importar)
4. Click en aceptar y todos los datos se restauran

### ¿Cuándo conviene exportarlo?
Recomiendo **exportar al menos una vez al mes**, justo después de cargar la información del mes nuevo. Esa rutina te garantiza que nunca pierdas datos.

> ⚠️ **Importante**: el JSON **no es** el archivo del sistema. El sistema sigue siendo los archivos `.html`, `.css`, `.js` que ya subiste a GitHub. El JSON es solo el respaldo de los **datos** (los números cargados).

---

## ☁️ Paso a paso: conectar Google Apps Script (opcional pero recomendado)

Esto permite que **los datos cargados se guarden en una hoja de Google Sheets** y todas las usuarias vean lo mismo en tiempo real, no solo en su navegador.

### 1. Crear el proyecto de Apps Script
1. Entra a https://script.google.com → **"Proyecto nuevo"**
2. Borra el contenido por defecto y pega TODO el contenido de `google-apps-script.gs`
3. Click en el icono de disco 💾 para guardar. Ponle nombre _"Bienestar Humano API"_

### 2. Publicar como Web App
1. Click en **"Implementar" → "Nueva implementación"**
2. Click en el engranaje ⚙️ de "Seleccionar tipo" → elige **"Aplicación web"**
3. Configura:
   - **Descripción**: `BH API v1`
   - **Ejecutar como**: _Yo (tu cuenta)_
   - **Quién tiene acceso**: _Cualquier usuario_
4. Click en **"Implementar"** → autoriza con tu cuenta de Google
5. Copia la **URL del Web App** (algo como `https://script.google.com/macros/s/AKfy.../exec`)

### 3. Conectar la URL al frontend
1. Abre el archivo `data.js`
2. Busca la línea: `const APPS_SCRIPT_URL = '';`
3. Pega tu URL: `const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfy.../exec';`
4. Guarda, haz commit y push a GitHub
5. La app empezará a sincronizar a la nube automáticamente. En la barra lateral verás el estado: _"Conectado a la nube"_ 🟢

> 💡 **Importante**: si en algún punto cambias el código del Apps Script, necesitas hacer **"Implementar → Gestionar implementaciones"** y crear una **nueva versión** para que los cambios surtan efecto.

---

## 📝 ¿Cómo cargar la información del mes?

1. Inicia sesión con tu usuaria
2. Click en la sección **"Cargar datos"** del menú
3. Selecciona el **año** y **mes** que estás capturando
4. Llena los números de cada módulo (médicos, odontología, enfermería, rehabilitación, salud mental, nutrición)
5. La barra superior te muestra el avance (1 → 4 etapas)
6. Click en **"Guardar mes"**: si ya existía, te pregunta si quieres reemplazar
7. Automáticamente:
   - Se guarda en LocalStorage (siempre)
   - Se sincroniza a Google Sheets (si configuraste Apps Script)
   - Aparece en el histórico y en todas las gráficas y el mapa

---

## 🎨 Personalizar

| ¿Qué quieres cambiar?       | Archivo y sección                         |
|------------------------------|-------------------------------------------|
| Contraseñas                  | `data.js` → `USERS`                       |
| Lista de módulos             | `data.js` → `MODULES`                     |
| Coordenadas en el mapa       | `data.js` → `MODULES` (`lat`, `lng`)      |
| Datos del concentrado anual  | `data.js` → `PRIORITY_DATA`               |
| Colores                      | `styles.css` → variables `:root`          |
| Endpoint de Apps Script      | `data.js` → `APPS_SCRIPT_URL`             |
| Logo                         | Reemplaza `logo.png` y `logo-icon.png`    |

---

## 🆘 Solución de problemas

- **"No me deja entrar"**: revisa que escribiste bien la contraseña (respeta mayúsculas).
- **El mapa no carga**: revisa tu conexión a internet (usa Leaflet desde CDN).
- **Las gráficas se ven en blanco**: actualiza la página (F5). Si persiste, revisa la conexión a internet: la librería de gráficas se carga desde un CDN público.
- **El logo no aparece**: verifica que subiste `logo.png` y `logo-icon.png` a GitHub junto con los demás archivos. El sistema usa un fallback SVG si los PNG no se encuentran.
- **Quiero recuperar datos borrados**: usa el JSON exportado más reciente con _"Importar"_.
- **Apps Script da error de CORS**: re-publica con _"Quién tiene acceso: Cualquier usuario"_.
- **No aparece la sincronización**: verifica que pegaste la URL completa terminada en `/exec`.

---

## 📄 Créditos

Desarrollado para la **Dirección de Bienestar Humano · H. Ayuntamiento de Mérida 2024–2027**.

Datos del concentrado al 31 de marzo de 2026.

---

> _Mérida Contigo es Mejor_ 🌿


## V7 · Ajustes incorporados

- Catálogo de 23 módulos activos de Salud y 5 AlmaNova, sin módulos cerrados ni reconvertidos.
- Cada módulo médico incluye servicios reales disponibles y horario base según el archivo de módulos activos de abril 2026.
- AlmaNova se maneja únicamente como atenciones de salud mental / total de atenciones, con nomenclatura AN en mapa.
- Catálogo inicial de Educación cargado: acompañamiento académico, educación artística, ludotecas/bibliotecas e inglés.
- Indicador inicial de Inglés septiembre 2024: 7 sedes, 1,350 alumnos inscritos.
- Gráficas nativas multicolor corregidas para PC y móvil.
