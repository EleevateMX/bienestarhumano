# 🌿 Sistema de Indicadores · Dirección de Bienestar Humano
### H. Ayuntamiento de Mérida 2024–2027

Dashboard interactivo, animado y responsivo para visualizar la productividad de los módulos médicos de la Dirección de Bienestar Humano. Funciona en **PC y dispositivos móviles**, con mapa interactivo de la ciudad, captura mensual de información, gráficas dinámicas, partículas animadas y sistema de usuarios.

---

## ✨ Características

- 🔐 **Login con 4 usuarios** (Alejandra, Chucho, Sandra, Clarisa)
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

| Usuario    | Contraseña      |
|------------|-----------------|
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
└── README.md                → Esta guía
```

---

## 🚀 Paso a paso: subir el proyecto a GitHub

### 1. Crear el repositorio en GitHub
1. Entra a https://github.com → click en **"+" → "New repository"**
2. Nombre del repo: `bienestar-humano-merida` (o el que prefieras)
3. Marca **Public** (para usar GitHub Pages gratis)
4. **NO** marques "Add a README" (ya lo tenemos)
5. Click en **"Create repository"**

### 2. Subir los archivos (la forma más fácil)
1. En la página del repo recién creado, click en **"uploading an existing file"**
2. Arrastra los 5 archivos: `index.html`, `styles.css`, `data.js`, `app.js`, `README.md`
3. Escribe un mensaje como _"Versión inicial del sistema"_ y click en **"Commit changes"**

### 3. Activar GitHub Pages para tener URL pública
1. En el repo, ve a **Settings → Pages**
2. En **Source**, selecciona **"Deploy from a branch"**
3. **Branch**: `main` · **Folder**: `/ (root)` → Save
4. Espera ~1 minuto y refresca. GitHub mostrará tu URL pública:
   `https://<tu-usuario>.github.io/bienestar-humano-merida/`
5. ¡Listo! Comparte esa URL con el equipo y se abre desde celular o computadora.

---

## ☁️ Paso a paso: conectar Google Apps Script (opcional)

Esto permite que **los datos cargados se guarden en una hoja de Google Sheets** y todas las usuarias vean lo mismo en tiempo real.

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

> 🛟 **Respaldo**: usa el botón **"Exportar JSON"** para descargar un respaldo completo cada cierto tiempo. Si pasara algo, se restaura con **"Importar JSON"**.

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

---

## 🆘 Solución de problemas

- **"No me deja entrar"**: revisa que escribiste bien la contraseña (respeta mayúsculas).
- **El mapa no carga**: revisa tu conexión a internet (usa Leaflet desde CDN).
- **Quiero recuperar datos borrados**: usa el JSON exportado más reciente con _"Importar"_.
- **Apps Script da error de CORS**: re-publica con _"Quién tiene acceso: Cualquier usuario"_.
- **No aparece la sincronización**: verifica que pegaste la URL completa terminada en `/exec`.

---

## 📄 Créditos

Desarrollado para la **Dirección de Bienestar Humano · H. Ayuntamiento de Mérida 2024–2027**.

Datos del concentrado al 31 de marzo de 2026.

---

> _Mérida Contigo es Mejor_ 🌿
