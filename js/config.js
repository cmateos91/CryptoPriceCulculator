/**
 * config.js
 * Configuración y datos de respaldo para la aplicación
 */

// Datos predefinidos de criptomonedas (respaldo)
export const cryptoData = [
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
    },
    {
        id: "pi-network",
        symbol: "pi",
        name: "Pi Network",
        current_price: 0.0012,
        market_cap: 5510000,
        circulating_supply: 4591666666,
        image: "https://assets.coingecko.com/coins/images/24949/large/pi-network.png"
    },
    {
        id: "the-balkan-dwarf",
        symbol: "kekec",
        name: "The Balkan Dwarf",
        current_price: 0.0001219,
        market_cap: 4760000,
        circulating_supply: 39000000000,
        image: "https://assets.coingecko.com/coins/images/30615/large/kekec.png"
    }
];

// Configuración de la aplicación
export const appConfig = {
    // API
    useBackupData: false,       // Forzar uso de datos locales
    apiBaseUrl: 'http://localhost:3000/api',
    apiTimeout: 3000,           // Tiempo de espera para llamadas a la API (ms)
    
    // Paginación
    itemsPerPage: 20,
    
    // UI
    defaultDecimals: 2,         // Número de decimales por defecto
    smallNumberThreshold: 0.01, // Umbral para considerarse número pequeño
    scientificNotationThreshold: 0.0000001, // Umbral para notación científica
};
