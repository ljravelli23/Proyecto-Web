# ⚽ Mi Álbum Virtual - Mundial 2026

> Proyecto académico para la materia **Programación Orientada a la Web (NRC: 26577)**.  
> Profesor: Luis Fuentes.
> Integrantes: José Berroterán, Luigi Ravelli y Javier García.

## 📝 Descripción del Proyecto

Esta aplicación web es un simulador interactivo del clásico álbum de barajitas del Mundial de Fútbol 2026. 
Los usuarios pueden gestionar su colección personal, abrir sobres para conseguir nuevas figuritas y 
negociar intercambios en tiempo real con otros grupos del salón, replicando la experiencia física del álbum 
en un entorno digital.

El sistema se basa en una arquitectura **Cliente-Servidor**, donde el frontend (esta interfaz) consume una 
API central y se comunica vía WebSockets para las transacciones en vivo.

## 🛠️ Tecnologías Utilizadas

- **HTML5 Semántico**: Estructura accesible y bien definida (`<header>`, `<nav>`, `<section>`, `<article>`, `<figure>`).
- **CSS3**: Diseño responsivo con enfoque **Mobile-First** utilizando **Flexbox** y **CSS Grid**.
- **JavaScript (ES6+)**: Lógica de negocio, manipulación del DOM (SPA) y consumo de APIs.
- **REST API**: Para acciones transaccionales (apertura de sobres, consulta de estado).
- **Socket.IO (CDN)**: Para la negociación en vivo de intercambios (ofertas y respuestas en tiempo real).

## 📂 Estructura del Proyecto
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
│   ├── socket-client.js        # Configuración y eventos de Socket.IO
│   ├── state-manager.js        # Estado global del álbum (memoria RAM)
│   └── ui-renderer.js          # Renderizado dinámico del DOM
│
└── /assets/
    └── /img/
        ├── /escudos/           # Imágenes locales de los escudos
        └── /jugadores/         # Imágenes locales de los jugadores


## 🔐 Autenticación (API Key)

Para identificar a cada grupo, la aplicación solicita una **API Key** al iniciar sesión.

- La clave se ingresa manualmente en el campo del `<header>`.
- Se almacena de forma segura en **`sessionStorage`** para persistir solo durante la sesión activa (desaparece al cerrar la pestaña).
- Se envía en los **headers** de cada petición HTTP (`Authorization: Bearer {apiKey}`) y en el **handshake** de Socket.IO.

## 🎯 Funcionalidades Principales

1.  **📖 Visualización del Álbum**
    - Organizado por países participantes (12 barajitas por país: 1 escudo + 11 jugadores).
    - Diferenciación visual clara entre barajitas **poseídas**, **faltantes** (siluetas) y **repetidas** (destacadas en amarillo/duplicado).

2.  **🎁 Apertura de Sobres**
    - Botón interactivo para solicitar un sobre a la API.
    - Cada sobre contiene **7 barajitas aleatorias**.
    - Animación visual que muestra las figuras obtenidas antes de integrarlas al inventario general.

3.  **🔄 Mercado de Intercambios (Tiempo Real)**
    - Visualización del inventario de barajitas repetidas disponibles.
    - Propuesta de intercambios a otros grupos seleccionando una repetida propia a cambio de una necesitada.
    - Negociación en vivo: Recepción y respuesta (Aceptar/Rechazar) de ofertas entrantes mediante **Socket.IO**.

## 🚀 Cómo Ejecutar la Aplicación

Este proyecto es 100% **Frontend estático**. No requiere instalación de Node.js ni dependencias complejas.

1.  Clona este repositorio:
    ```bash
    git clone [URL_DEL_REPOSITORIO]