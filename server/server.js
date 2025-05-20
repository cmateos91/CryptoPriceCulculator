const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Habilitar CORS para todas las rutas
app.use(cors());

// Ruta para obtener lista de criptomonedas
app.get('/api/coins', async (req, res) => {
    try {
        // Obtener parámetros de consulta
        const currency = req.query.currency || 'usd';
        const perPage = req.query.per_page || 100;
        const page = req.query.page || 1;
        
        console.log(`Obteniendo ${perPage} criptomonedas en página ${page} con moneda ${currency}`);
        
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/markets`, {
            params: {
                vs_currency: currency,
                order: 'market_cap_desc',
                per_page: perPage,
                page: page,
                sparkline: false,
                locale: 'es'
            },
            headers: {
                'Accept': 'application/json'
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('Error al obtener datos de CoinGecko:', error.message);
        
        // Proporcionar un mensaje de error más detallado
        if (error.response) {
            // La solicitud se realizó y el servidor respondió con un código de estado
            // que cae fuera del rango de 2xx
            res.status(error.response.status).json({
                error: `Error de API (${error.response.status}): ${error.response.data.error || 'Error desconocido'}`,
                message: 'No se pudieron obtener los datos de CoinGecko.'
            });
        } else if (error.request) {
            // La solicitud se realizó pero no se recibió respuesta
            res.status(504).json({
                error: 'No se recibió respuesta de CoinGecko API.',
                message: 'Comprueba tu conexión a Internet o si la API está caída.'
            });
        } else {
            // Algo sucedió al configurar la solicitud que desencadenó un error
            res.status(500).json({
                error: error.message,
                message: 'Error al preparar la solicitud a CoinGecko API.'
            });
        }
    }
});

// Ruta para buscar criptomonedas por nombre o símbolo
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.query;
        
        if (!query) {
            return res.status(400).json({
                error: 'Se requiere un término de búsqueda.',
                message: 'Por favor, proporciona un término de búsqueda en el parámetro "query".'
            });
        }
        
        console.log(`Buscando criptomonedas con el término: ${query}`);
        
        const response = await axios.get(`https://api.coingecko.com/api/v3/search`, {
            params: {
                query: query
            },
            headers: {
                'Accept': 'application/json'
            }
        });
        
        // Obtener detalles completos de las primeras 10 monedas encontradas
        const coins = response.data.coins.slice(0, 10);
        
        if (coins.length === 0) {
            return res.json([]);
        }
        
        // Obtener los IDs de las monedas encontradas
        const coinIds = coins.map(coin => coin.id).join(',');
        
        // Obtener datos detallados de las monedas
        const detailedResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/markets`, {
            params: {
                vs_currency: 'usd',
                ids: coinIds,
                order: 'market_cap_desc',
                sparkline: false,
                locale: 'es'
            },
            headers: {
                'Accept': 'application/json'
            }
        });
        
        res.json(detailedResponse.data);
    } catch (error) {
        console.error('Error al buscar criptomonedas:', error.message);
        res.status(500).json({
            error: error.message,
            message: 'Error al buscar criptomonedas en CoinGecko API.'
        });
    }
});

// Ruta para obtener detalles de una criptomoneda específica
app.get('/api/coin/:id', async (req, res) => {
    try {
        const coinId = req.params.id;
        
        console.log(`Obteniendo detalles para la criptomoneda con ID: ${coinId}`);
        
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}`, {
            params: {
                localization: 'false',
                tickers: 'false',
                market_data: 'true',
                community_data: 'false',
                developer_data: 'false'
            },
            headers: {
                'Accept': 'application/json'
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('Error al obtener detalles de la criptomoneda:', error.message);
        res.status(500).json({
            error: error.message,
            message: 'Error al obtener detalles de la criptomoneda en CoinGecko API.'
        });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor proxy para CoinGecko ejecutándose en http://localhost:${PORT}`);
    console.log('Rutas disponibles:');
    console.log('  - GET /api/coins - Lista de criptomonedas');
    console.log('  - GET /api/search?query=término - Buscar criptomonedas');
    console.log('  - GET /api/coin/:id - Detalles de una criptomoneda específica');
});
