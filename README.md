# Mi Album Virtual - Mundial 2026

> Proyecto academico para la materia **Programacion Orientada a la Web (NRC: 26577)**.  
> Profesor: Luis Fuentes.
> Integrantes:
> Jose Berroteran 
> Luigi Ravelli 
> Javier Garcia 

## Descripcion del Proyecto

Esta aplicacion web es un simulador interactivo del clasico album de barajitas del Mundial de Futbol 2026. 
Los usuarios pueden gestionar su coleccion personal, abrir sobres para conseguir nuevas figuritas y 
negociar intercambios en tiempo real con otros grupos del salon, replicando la experiencia fisica del album 
en un entorno digital.

El sistema se basa en una arquitectura **Cliente-Servidor**, donde el frontend (esta interfaz) consume una 
API central y se comunica via WebSockets para las transacciones en vivo.

## Tecnologias Utilizadas

- **HTML5 Semantico**: Estructura accesible y bien definida (`<header>`, `<nav>`, `<section>`, `<article>`, `<figure>`).
- **CSS3**: Diseño responsivo con enfoque **Mobile-First** utilizando **Flexbox** y **CSS Grid**.
- **JavaScript (ES6+)**: Logica de negocio, manipulacion del DOM (SPA) y consumo de APIs.
- **REST API**: Para acciones transaccionales (apertura de sobres, consulta de estado).
- **Socket.IO (CDN)**: Para la negociacion en vivo de intercambios (ofertas y respuestas en tiempo real).

## Estructura del Proyecto
/mi-album-mundial/
│
├── index.html                  # Punto de entrada (SPA)
├── README.md                   # Este archivo
│
├── /css/
│   └── styles.css              # Estilos globales (Mobile-First)
│
├── /js/
│   ├── app.js                  # Orquestador principal
│   ├── api-client.js           # Llamadas a la API REST (con API Key)
│   ├── socket-client.js        # Configuracion y eventos de Socket.IO
│   ├── state-manager.js        # Estado global del album (memoria RAM)
│   └── ui-renderer.js          # Renderizado dinamico del DOM
│
└── /assets/
    └── /img/
        ├── /escudos/           # Imagenes locales de los escudos
        └── /jugadores/         # Imagenes locales de los jugadores


## Autenticacion (API Key)

Para identificar a cada grupo, la aplicacion solicita una **API Key** al iniciar sesion.

- La clave se ingresa manualmente en el campo del `<header>`.
- Se almacena de forma segura en **`sessionStorage`** para persistir solo durante la sesion activa (desaparece al cerrar la pestaña).
- Se envia en los **headers** de cada peticion HTTP (`Authorization: Bearer {apiKey}`) y en el **handshake** de Socket.IO.

## Funcionalidades Principales

1.  **Visualizacion del Album**
    - Organizado por paises participantes (12 barajitas por pais: 1 escudo + 11 jugadores).
    - Diferenciacion visual clara entre barajitas **poseidas**, **faltantes** (siluetas) y **repetidas** (destacadas en amarillo/duplicado).

2.  **Apertura de Sobres**
    - Boton interactivo para solicitar un sobre a la API.
    - Cada sobre contiene **7 barajitas aleatorias**.
    - Animacion visual que muestra las figuras obtenidas antes de integrarlas al inventario general.

3.  **Mercado de Intercambios (Tiempo Real)**
    - Visualizacion del inventario de barajitas repetidas disponibles.
    - Propuesta de intercambios a otros grupos seleccionando una repetida propia a cambio de una necesitada.
    - Negociacion en vivo: Recepcion y respuesta (Aceptar/Rechazar) de ofertas entrantes mediante **Socket.IO**.

## Como Ejecutar la Aplicacion

Este proyecto es 100% **Frontend estatico**. No requiere instalacion de Node.js ni dependencias complejas.

1.  Clona este repositorio:
    ```bash
    git clone [URL_DEL_REPOSITORIO]