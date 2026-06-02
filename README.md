# BusBuddy Backend

BusBuddy es una aplicación web pensada para facilitar el uso del transporte en colectivo a personas ciegas o con baja visión. Este repositorio contiene el backend de la plataforma, encargado de gestionar usuarios, líneas, paradas, solicitudes de viaje y notificaciones asociadas al recorrido.

## ¿Qué problema resuelve?

El objetivo de BusBuddy es ayudar al pasajero a viajar de forma más autónoma y segura. La app permite que la persona:

- indique en qué parada se sube,
- seleccione la línea en la que va a viajar,
- elija su destino final,
- y reciba apoyo durante todo el trayecto.

A partir de esa información, el sistema notifica al colectivo que hay un usuario esperando en la próxima parada, y luego avisa al pasajero una parada antes de su destino para recordarle que debe bajarse.

## Cómo funciona

### Flujo del usuario

1. El usuario abre la app.
2. Registra su punto de subida, la línea de colectivo y su destino.
3. La aplicación envía una solicitud al backend.
4. El backend guarda y procesa la información del viaje.
5. Se notifica al chofer que hay un pasajero en la siguiente parada.
6. Cuando el colectivo se aproxima al destino, el sistema notifica al usuario una parada antes para ayudarlo a prepararse para bajar.

### Flujo del backend

El backend expone una API construida con **Node.js** y **Express**. Además:

- utiliza **Prisma** para acceder a la base de datos,
- se conecta a **MySQL / PlanetScale** mediante variables de entorno,
- consulta coordenadas y paradas para calcular cercanía,
- y permite operaciones CRUD sobre usuarios y otros datos del sistema.

## Tecnologías utilizadas

- **Node.js**
- **Express**
- **Prisma ORM**
- **MySQL / PlanetScale**
- **dotenv**
- **Google Maps API**
- **nodemon** para desarrollo

## Endpoints principales

Según el código actual, la API incluye rutas como:

- `GET /` — mensaje de bienvenida.
- `POST /FindUser` — busca un usuario por email y contraseña.
- `GET /findLocation/:latlng` — obtiene una dirección a partir de coordenadas.
- `GET /user/:id` — obtiene un usuario por ID.
- `PUT /user/:id` — actualiza un usuario.
- `POST /CreateUser` — crea un usuario.
- `DELETE /user/:id` — elimina un usuario.

También existen funciones internas para:

- calcular distancia entre coordenadas,
- identificar la parada más cercana,
- obtener la próxima parada,
- y gestionar notificaciones relacionadas con el viaje.

## Estructura general

- `src/index.js` — servidor principal y definición de rutas.
- `src/database.js` — funciones auxiliares de acceso a datos y lógica de paradas / distancias.
- `package.json` — dependencias y scripts.

## Requisitos

- Node.js 18 o superior
- Variables de entorno configuradas para la base de datos y API de Google Maps

## Instalación

```bash
npm install
```

## Ejecución en desarrollo

```bash
npm run dev
```

## Variables de entorno

El proyecto utiliza variables como:

- `DATABASE_URL`
- `API_KEY`

Estas deben configurarse en un archivo `.env` antes de levantar el servidor.

## Nota sobre el proyecto

BusBuddy está orientado a mejorar la accesibilidad en el transporte público. El backend cumple un rol central, ya que conecta la información del usuario con las paradas, las líneas y las notificaciones necesarias para acompañar el trayecto.
