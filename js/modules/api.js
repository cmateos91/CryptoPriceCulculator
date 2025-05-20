/**
 * api.js
 * Módulo para gestionar la comunicación con las APIs
 */

import { cryptoData } from '../config.js';

// Configuración
const API_BASE_URL = 'http://localhost:3000/api';
const USE_BACKUP_DATA = false; // Cambiar a true si quieres usar siempre datos de respaldo

/**
 * Intenta obtener datos de criptomonedas en tiempo real, con sistema de respaldo
 * 
 * @param {number} page - Número de página a solicitar
 * @param {number} perPage - Número de elementos por página
 * @returns {Promise<Array>} - Array de datos de criptomonedas
 */
export async function fetchLiveData(page = 1, perPage = 100) {
    if (USE_BACKUP_DATA) {
        console.log('Usando datos de respaldo (por configuración)');
        return cryptoData;
    }
    
    try {
        // Intentar primero con el servidor proxy
        try {
            console.log(`Intentando conectar al servidor proxy en ${API_BASE_URL}/coins`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 segundos de timeout
            
            const response = await fetch(`${API_BASE_URL}/coins?page=${page}&per_page=${perPage}`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`Datos obtenidos en tiempo real: ${data.length} criptomonedas`);
                return data;
            } else {
                const errorData = await response.json();
                console.error('Error en respuesta del proxy:', errorData.message || 'Error desconocido');
                throw new Error(errorData.message || 'Error al obtener datos de la API proxy');
            }
        } catch (proxyError) {
            console.warn('Error o timeout al conectar con el proxy, intentando API directa:', proxyError);
            
            // Si falla el proxy, intentar directamente con la API de CoinGecko
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos de timeout
                
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}`, {
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`Datos obtenidos directamente de CoinGecko: ${data.length} criptomonedas`);
                    return data;
                } else {
                    throw new Error('Error al obtener datos directamente de CoinGecko');
                }
            } catch (directApiError) {
                console.error('Error al conectar directamente con CoinGecko:', directApiError);
                throw directApiError; // Propagar el error para usar datos de respaldo
            }
        }
    } catch (error) {
        console.error('Error al obtener datos en tiempo real:', error.message);
        console.log('Usando datos de respaldo debido a error');
        return cryptoData;
    }
}

/**
 * Busca criptomonedas por nombre o símbolo
 * 
 * @param {string} query - Término de búsqueda
 * @returns {Promise<Array>} - Array de resultados de búsqueda
 */
export async function searchCryptos(query) {
    if (!query.trim()) {
        // Si el query está vacío, devolver una lista vacía
        return [];
    }
    
    // Si estamos forzando el uso de datos de respaldo, filtrar los datos locales
    if (USE_BACKUP_DATA) {
        return cryptoData.filter(crypto => 
            crypto.name.toLowerCase().includes(query.toLowerCase()) || 
            crypto.symbol.toLowerCase().includes(query.toLowerCase())
        );
    }
    
    try {
        // Primero intentar usar el proxy
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 segundos de timeout
            
            const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`Búsqueda en tiempo real a través del proxy: ${data.length} resultados para "${query}"`);
                return data;
            } else {
                const errorData = await response.json();
                console.error('Error en la búsqueda a través del proxy:', errorData.message || 'Error desconocido');
                throw new Error(errorData.message || 'Error al buscar en la API');
            }
        } catch (proxyError) {
            console.warn('Error al buscar a través del proxy, intentando API directa:', proxyError);
            
            // Si falla el proxy, intentar directamente con la API de CoinGecko
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos de timeout
                
                // Primero obtenemos los IDs que coinciden con la búsqueda
                const searchResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`, {
                    signal: controller.signal
                });
                
                if (!searchResponse.ok) {
                    throw new Error('Error en la búsqueda directa de CoinGecko');
                }
                
                const searchData = await searchResponse.json();
                const coins = searchData.coins.slice(0, 20); // Limitar a 20 resultados
                
                if (coins.length === 0) {
                    return [];
                }
                
                // Para búsquedas de una sola letra, limitar a los primeros resultados para no exceder límites de API
                const limitedCoins = query.length === 1 ? coins.slice(0, 5) : coins;
                
                // Obtenemos los IDs de las monedas encontradas
                const coinIds = limitedCoins.map(coin => coin.id).join(',');
                
                // Obtenemos datos detallados de las monedas
                clearTimeout(timeoutId);
                const detailedController = new AbortController();
                const detailedTimeoutId = setTimeout(() => detailedController.abort(), 3000);
                
                const detailedResponse = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&sparkline=false`, {
                    signal: detailedController.signal
                });
                
                clearTimeout(detailedTimeoutId);
                
                if (!detailedResponse.ok) {
                    throw new Error('Error al obtener detalles de las monedas de CoinGecko');
                }
                
                const detailedData = await detailedResponse.json();
                console.log(`Búsqueda en tiempo real directa: ${detailedData.length} resultados para "${query}"`);
                
                return detailedData;
            } catch (directApiError) {
                console.error('Error al buscar directamente en la API de CoinGecko:', directApiError);
                throw directApiError; // Propagar el error para usar datos de respaldo
            }
        }
    } catch (error) {
        console.error('Error al buscar criptomonedas:', error);
        
        // Si hay un error en cualquier punto, filtrar los datos de respaldo
        console.log('Usando datos de respaldo para la búsqueda debido a error');
        return cryptoData.filter(crypto => 
            crypto.name.toLowerCase().includes(query.toLowerCase()) || 
            crypto.symbol.toLowerCase().includes(query.toLowerCase())
        );
    }
}

/**
 * Obtener detalles de una criptomoneda específica por ID
 * 
 * @param {string} coinId - ID de la criptomoneda
 * @returns {Promise<Object|null>} - Detalles de la criptomoneda
 */
export async function getCryptoDetails(coinId) {
    if (USE_BACKUP_DATA) {
        // Si estamos usando datos de respaldo, buscar en los datos locales
        const coin = cryptoData.find(c => c.id === coinId);
        return coin || null;
    }
    
    try {
        // Intentar primero con el servidor proxy
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 segundos de timeout
            
            const response = await fetch(`${API_BASE_URL}/coin/${coinId}`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`Detalles obtenidos para ${data.name}`);
                
                // Formatear los datos para que coincidan con el formato esperado
                return {
                    id: data.id,
                    name: data.name,
                    symbol: data.symbol,
                    current_price: data.market_data.current_price.usd,
                    market_cap: data.market_data.market_cap.usd,
                    circulating_supply: data.market_data.circulating_supply,
                    image: data.image.large
                };
            } else {
                const errorData = await response.json();
                console.error('Error al obtener detalles:', errorData.message || 'Error desconocido');
                throw new Error(errorData.message || 'Error al obtener detalles de la API');
            }
        } catch (proxyError) {
            console.warn('Error al obtener detalles a través del proxy, intentando API directa:', proxyError);
            
            // Si falla el proxy, intentar directamente con la API de CoinGecko
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos de timeout
                
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`, {
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`Detalles obtenidos directamente para ${data.name}`);
                    
                    // Formatear los datos
                    return {
                        id: data.id,
                        name: data.name,
                        symbol: data.symbol,
                        current_price: data.market_data.current_price.usd,
                        market_cap: data.market_data.market_cap.usd,
                        circulating_supply: data.market_data.circulating_supply,
                        image: data.image.large
                    };
                } else {
                    throw new Error('Error al obtener detalles directamente de CoinGecko');
                }
            } catch (directApiError) {
                console.error('Error al obtener detalles directamente de CoinGecko:', directApiError);
                throw directApiError;
            }
        }
    } catch (error) {
        console.error(`Error al obtener detalles para ${coinId}:`, error.message);
        
        // Si hay un error, intentar encontrarlo en los datos de respaldo
        const coin = cryptoData.find(c => c.id === coinId);
        return coin || null;
    }
}