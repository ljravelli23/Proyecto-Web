# Mi Álbum Virtual - Mundial 2026

Proyecto académico de **Programación Orientada a la Web (NRC 26577)**.

Integrantes: José Berroterán, Luigi Ravelli y Javier García.

## Descripción

Aplicación web Mobile-First para consultar el álbum del Mundial 2026, abrir sobres de siete barajitas, pegar barajitas disponibles y gestionar el inventario de repetidas. Está construida con HTML5, CSS3 y JavaScript moderno, sin framework ni proceso de compilación.

## Funcionalidades implementadas

- Álbum organizado por 48 selecciones y 12 barajitas por país.
- Conexión con la API REST mediante el encabezado `x-api-key`.
- Estadísticas de obtenidas, faltantes y copias disponibles.
- Apertura de sobres reales y modo demo sin afectar la API.
- Acción para pegar una barajita disponible en el álbum.
- Inventario de repetidas.
- Fotografías progresivas de jugadores mediante Wikimedia y banderas externas.
- Interfaz responsive con navegación tipo SPA.

## Seguridad de la API Key

La URL base y la documentación de la API son públicas y pueden permanecer en el repositorio. La **API Key del grupo es privada** y nunca debe escribirse en el código, README, commits, issues o capturas.

- La clave se introduce manualmente en el navegador.
- Se mantiene únicamente en memoria mientras la página está abierta y conectada.
- Se elimina al desconectar, cambiar a la demo o recargar la página.
- No se guarda en `localStorage`, `sessionStorage`, cookies ni archivos del proyecto.
- Se envía solamente al servidor oficial mediante el encabezado `x-api-key`.

Importante: al ser un frontend estático, una clave usada por el navegador puede verse en las herramientas de desarrollo. Para ocultarla completamente sería necesario un backend propio que actúe como intermediario.

## Ejecución local

Debe servirse por HTTP; no conviene abrir `index.html` directamente.

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Después abre `http://127.0.0.1:8000/`.

No requiere `npm install`, Node.js ni Next.js.

## Estructura

```text
index.html
css/
  styles.css
js/
  app.js
  api-client.js
  image-service.js
  socket-client.js
  state-manager.js
  ui-renderer.js
```

## Pendiente

- Implementar Socket.IO y los eventos del mercado en tiempo real.
- Crear propuestas de intercambio desde la interfaz.
- Aceptar, rechazar y cancelar intercambios.
- Añadir pruebas automatizadas y validación de accesibilidad.
- Definir una estrategia estable para las imágenes de todos los jugadores.

Consulta [SECURITY.md](SECURITY.md) antes de publicar cambios.
