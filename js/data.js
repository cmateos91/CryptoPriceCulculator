// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';
const USE_BACKUP_DATA = false; // Cambiar a true si quieres usar siempre datos de respaldo

// Datos predefinidos de criptomonedas (respaldo)
const cryptoData = [
    { 
        id: "bitcoin", 
        symbol: "btc", 
        name: "Bitcoin", 
        current_price: 65000, 
        market_cap: 1280000000000, 
        circulating_supply: 19600000,
        image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
    },
    { 
        id: "ethereum", 
        symbol: "eth", 
        name: "Ethereum", 
        current_price: 3500, 
        market_cap: 420000000000, 
        circulating_supply: 120000000,
        image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
    },
    { 
        id: "tether", 
        symbol: "usdt", 
        name: "Tether", 
        current_price: 1, 
        market_cap: 92000000000, 
        circulating_supply: 92000000000,
        image: "https://assets.coingecko.com/coins/images/325/large/Tether.png"
    },
    { 
        id: "binancecoin", 
        symbol: "bnb", 
        name: "BNB", 
        current_price: 580, 
        market_cap: 85000000000, 
        circulating_supply: 146000000,
        image: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png"
    },
    { 
        id: "solana", 
        symbol: "sol", 
        name: "Solana", 
        current_price: 150, 
        market_cap: 65000000000, 
        circulating_supply: 430000000,
        image: "https://assets.coingecko.com/coins/images/4128/large/solana.png"
    },
    { 
        id: "xrp", 
        symbol: "xrp", 
        name: "XRP", 
        current_price: 0.55, 
        market_cap: 31000000000, 
        circulating_supply: 56000000000,
        image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png"
    },
    { 
        id: "cardano", 
        symbol: "ada", 
        name: "Cardano", 
        current_price: 0.45, 
        market_cap: 15800000000, 
        circulating_supply: 35200000000,
        image: "https://assets.coingecko.com/coins/images/975/large/cardano.png"
    },
    { 
        id: "dogecoin", 
        symbol: "doge", 
        name: "Dogecoin", 
        current_price: 0.12, 
        market_cap: 15600000000, 
        circulating_supply: 130000000000,
        image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png"
    },
    { 
        id: "avalanche", 
        symbol: "avax", 
        name: "Avalanche", 
        current_price: 30, 
        market_cap: 11000000000, 
        circulating_supply: 367000000,
        image: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png"
    },
    { 
        id: "polkadot", 
        symbol: "dot", 
        name: "Polkadot", 
        current_price: 7.2, 
        market_cap: 10500000000, 
        circulating_supply: 1460000000,
        image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png"
    },
    { 
        id: "shiba-inu", 
        symbol: "shib", 
        name: "Shiba Inu", 
        current_price: 0.000015, 
        market_cap: 8700000000, 
        circulating_supply: 589390000000000,
        image: "https://assets.coingecko.com/coins/images/11939/large/shiba.png"
    },
    { 
        id: "polygon", 
        symbol: "matic", 
        name: "Polygon", 
        current_price: 0.65, 
        market_cap: 6500000000, 
        circulating_supply: 10000000000,
        image: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png"
    },
    // Más criptomonedas populares con nombres que empiezan con P para mejorar búsquedas locales
    { 
        id: "pancakeswap", 
        symbol: "cake", 
        name: "PancakeSwap", 
        current_price: 2.5, 
        market_cap: 750000000, 
        circulating_supply: 300000000,
        image: "https://assets.coingecko.com/coins/images/12632/large/pancakeswap-cake-logo.png"
    },
    { 
        id: "pax-gold", 
        symbol: "paxg", 
        name: "PAX Gold", 
        current_price: 2300, 
        market_cap: 460000000, 
        circulating_supply: 200000,
        image: "https://assets.coingecko.com/coins/images/9519/large/paxg.png"
    },
    { 
        id: "perpetual-protocol", 
        symbol: "perp", 
        name: "Perpetual Protocol", 
        current_price: 0.85, 
        market_cap: 127500000, 
        circulating_supply: 150000000,
        image: "https://assets.coingecko.com/coins/images/12381/large/perp.png"
    },
    { 
        id: "parsiq", 
        symbol: "prq", 
        name: "PARSIQ", 
        current_price: 0.15, 
        market_cap: 30000000, 
        circulating_supply: 200000000,
        image: "https://assets.coingecko.com/coins/images/11973/large/parsiq.png"
    }
];

// Intento de obtener datos en tiempo real
async function fetchLiveData(page = 1, perPage = 100) {
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

// Buscar criptomonedas por nombre o símbolo
async function searchCryptos(query) {
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

// Obtener detalles de una criptomoneda específica por ID
async function getCryptoDetails(coinId) {
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