# 🌿 Sistema de Indicadores · Dirección de Bienestar Humano
### H. Ayuntamiento de Mérida 2024–2027

Dashboard interactivo, animado y responsivo para visualizar la productividad de los módulos médicos de la Dirección de Bienestar Humano. Funciona en **PC y dispositivos móviles**, con mapa interactivo de la ciudad, captura mensual de información, gráficas dinámicas, partículas animadas y sistema de usuarios.

---

## ✨ Características

- 🔐 **Login con 4 usuarios** (Alejandra, Chucho, Sandra, Clarisa)
- 🎨 **Logo oficial** de la Dirección integrado (`logo.png` + `logo-icon.png`)
- 📊 **6 KPI animados** con contadores y comparación contra el mes anterior
- 🗺️ **Mapa interactivo** con la ubicación de cada módulo en Mérida (Leaflet + OpenStreetMap, **sin API key**) y el mapa "Espacios físicos 2026" de Google My Maps
- 📈 **Tendencias** legibles: selector de indicador y rango, resumen del período, lectura en lenguaje llano, comparativo año contra año, composición por servicio y tabla mes por mes
- 📝 **Captura mensual** con barra de progreso para mantener la información al 100%
- 🌐 **Persistencia local** (LocalStorage) + opción de **sincronización a Google Sheets** vía Apps Script
- 📥 **Exportar / Importar JSON** de respaldo
- ⭐ **Temas Prioritarios** (Salud, Mujeres, Salud Mental) ya cargados con datos al 31 de marzo de 2026
- 📅 **21 períodos mensuales reales** precargados (enero 2025 → agosto 2026 completos; septiembre 2026 en captura) extraídos del Excel oficial `MODULOS2025_2`
- 🎨 **Identidad gráfica oficial** del Manual del Gobierno Municipal de Mérida 2024-2027 (azul `#002C72`, verde `#9DEF0F`/`#74BA47`, tipografía Poppins, lema _"Mérida, contigo es mejor"_)
- ✨ **Animaciones**: partículas de fondo, splash, transiciones, gráficas animadas
- 📱 **100% Responsive**: optimizado para teléfono, tablet y escritorio

---

## 🔑 Usuarios y contraseñas iniciales

| Usuaria/o  | Contraseña      |
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
├── vendor/                  → Chart.js y Leaflet incluidos (sin CDN)
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
| Mapa (id de My Maps, llave opcional) | `data.js` → `MAP_CONFIG`          |
| Versión de los datos oficiales | `data.js` → `DATA_VERSION`              |
| Logo                         | Reemplaza `logo.png` y `logo-icon.png`    |

---

## 🆘 Solución de problemas

- **"No me deja entrar"**: revisa que escribiste bien la contraseña (respeta mayúsculas).
- **El mapa no carga**: revisa tu conexión a internet (usa Leaflet desde CDN). El mapa **no necesita API key**: usa OpenStreetMap y, si esa capa falla, cambia solo a CARTO. Con el ícono de capas puedes pasar a vista satelital (Esri).
- **No se ve "Espacios físicos 2026"**: ese mapa vive en Google My Maps; debe estar compartido como _"Cualquier persona con el enlace"_. El id del mapa está en `data.js` → `MAP_CONFIG.myMapsId`.
- **Actualicé el Excel y no veo los datos nuevos**: sube `DATA_VERSION` en `data.js` (p. ej. de 2 a 3). Al abrir la app, cada navegador reemplaza los meses oficiales guardados y conserva los capturados a mano.
- **Las gráficas se ven en blanco**: actualiza la página (Ctrl+Shift+R). Desde la versión 4 las librerías de gráficas y mapa viven en la carpeta `vendor/` del repositorio, así que ya no las puede bloquear un bloqueador de anuncios ni dependen de un CDN.
- **El logo no aparece**: verifica que subiste `logo.png` y `logo-icon.png` a GitHub junto con los demás archivos. El sistema usa un fallback SVG si los PNG no se encuentran.
- **Quiero recuperar datos borrados**: usa el JSON exportado más reciente con _"Importar"_.
- **Apps Script da error de CORS**: re-publica con _"Quién tiene acceso: Cualquier usuario"_.
- **No aparece la sincronización**: verifica que pegaste la URL completa terminada en `/exec`.

---

## 📄 Créditos

Desarrollado para la **Dirección de Bienestar Humano · H. Ayuntamiento de Mérida 2024–2027**.

Datos mensuales al 31 de agosto de 2026 (septiembre 2026 en captura). Temas prioritarios al 31 de marzo de 2026.

---

> _Mérida Contigo es Mejor_ 🌿

---

## 🆕 Versión 3 · Mejoras visuales

- **Resumen rediseñado**: el mes seleccionado, el total de atenciones, la tendencia de 8 meses y una barra que muestra cómo se reparten las atenciones entre servicios.
- **6 indicadores parejos** (se agregó Nutrición) con el % que representa cada servicio.
- **Atenciones por sexo con datos reales** del Excel (antes era una proporción fija).
- **Nuevo panel "Módulos activos sin registros este mes"** para detectar quién no reportó.
- **Módulos ordenables** por más atenciones o alfabético; los ceros se ven atenuados.
- Logos recortados y sin fondo; menú reordenado (consulta arriba, captura abajo).
- Respeta "reducir movimiento" del sistema y tiene foco visible con teclado.
- Todas las mejoras visuales están en un bloque al final de `styles.css` marcado como **v3**: si quieres volver al diseño anterior, basta con borrar ese bloque.

---

## 🆕 Versión 4 · Datos a agosto 2026, Tendencias legibles y mapa sin API key

- **Datos actualizados** desde `MODULOS2025_2.xlsx`: 20 meses completos (enero 2025 → agosto 2026) y septiembre 2026 marcado como *en captura*. Se corrigió la psicología en comisarías de febrero a junio de 2025 (filas sin nombre en el Excel) y el desglose hombres/mujeres se calcula desde las columnas por servicio, que sí cuadran con los totales.
- **Tendencias rediseñadas**: elige el indicador (total o un servicio) y el rango (6, 12 meses o todo); arriba ves total, promedio, mejor mes y comparación con el mismo mes del año anterior; la gráfica principal trae los valores escritos y la línea de promedio; debajo, un párrafo que explica el mes en palabras, el comparativo 2025 vs 2026, el cambio mes a mes, la composición por servicio y la tabla mes por mes.
- **Mapa**: ya no depende de ninguna llave. Capas OpenStreetMap, CARTO y satélite Esri; si OpenStreetMap falla cambia solo. Botón para ver el mapa "Espacios físicos 2026" de Google My Maps. Los módulos que comparten sede (matutino/vespertino) se separan un poco y los servicios sin sede fija (a domicilio, ferias, comisarías) se listan debajo del mapa.
- **Móvil**: el menú lateral ya se puede usar (el fondo oscuro lo tapaba) y la pantalla ya no se desborda a lo ancho.
- Todas las reglas visuales nuevas están al final de `styles.css` en el bloque **v4**.
