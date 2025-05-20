# Servidor Proxy para CoinGecko API

Este servidor actúa como intermediario entre la aplicación web de CriptoPrecio y la API de CoinGecko, evitando problemas de CORS y proporcionando una capa adicional de abstracción.

## Requisitos

- Node.js (v14 o superior)
- npm (v6 o superior)

## Instalación

1. Instala las dependencias:
   ```
   npm install
   ```

2. Inicia el servidor:
   ```
   npm start
   ```

## Rutas disponibles

- `GET /api/coins` - Obtiene lista de criptomonedas
  - Parámetros opcionales:
    - `currency` (por defecto: 'usd')
    - `per_page` (por defecto: 100)
    - `page` (por defecto: 1)

- `GET /api/search?query=término` - Busca criptomonedas por nombre o símbolo
  - Parámetros requeridos:
    - `query`: Término de búsqueda

- `GET /api/coin/:id` - Obtiene detalles de una criptomoneda específica
  - Parámetros requeridos:
    - `id`: ID de la criptomoneda en CoinGecko

## Notas

- Este servidor está configurado para ejecutarse en el puerto 3000.
- Asegúrate de que no haya otro servicio utilizando este puerto.
- Para cambiar el puerto, modifica la constante `PORT` en `server.js`.
