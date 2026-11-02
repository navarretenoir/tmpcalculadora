# TMP Calculadora
Calculadora de dosificación para los productos de **Tu Mundo Pet** (tiendatumundopet.cl). Dices los litros de tu acuario, estanque o pileta y te dice cuánto producto usar, cuánto rinde cada envase y cuál conviene más. Funciona sin internet.
- `app/` — interfaz web (HTML/CSS/JS, Archivo + IBM Plex Mono, paleta de la tienda) + `datos/productos.js` (169 productos) + miniaturas.
- `android/` — proyecto Gradle (minSdk 21, sin permisos) → `TMP-Calculadora-1.0.apk`.
- `windows/` — anfitrión WebView2 + instalador NSIS (`windows/dist/`).
- `herramientas/construir_datos.py` — regenera los datos desde `datos/` (descargado de la tienda) con las correcciones de la auditoría.
- `AUDITORIA.md` — revisión del código y de los cálculos de la calculadora de la tienda · `PRODUCTOS.md/.csv` — los 723 productos.
Licencia: GPL-3.0-or-later (código). Logotipo, fotos, precios y datos de productos © Tu Mundo Pet. Desarrollada por **Javiera Navarrete** para Tu Mundo Pet con asistencia de IA generativa (ver `AI-USO.md`). Privacidad: `PRIVACY.md`.

## Descargas
Ver *Releases*: APK de Android, instalador de Windows, RPM, DEB y AppImage de Linux. macOS/iOS: proyecto Xcode en `apple/` (compilar en un Mac).
