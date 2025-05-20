/**
 * calculator.js
 * Módulo para realizar cálculos de proyecciones de precios
 */

/**
 * Calcula la proyección de precio para una criptomoneda
 * 
 * @param {Object} crypto - Datos de la criptomoneda
 * @param {number} targetPrice - Precio objetivo
 * @returns {Object} Resultado del cálculo
 */
export function calculateProjection(crypto, targetPrice) {
    // Realizar cálculos
    const currentPrice = crypto.current_price;
    const currentMarketCap = crypto.market_cap;
    const supply = crypto.circulating_supply;
    
    // Calcular nueva capitalización de mercado necesaria
    const targetMarketCap = supply * targetPrice;
    
    // Multiplicador desde la capitalización actual
    const multiplier = targetMarketCap / currentMarketCap;
    
    // Devolver resultados
    return {
        crypto: crypto,
        targetPrice: targetPrice,
        currentPrice: currentPrice,
        currentMarketCap: currentMarketCap,
        targetMarketCap: targetMarketCap,
        multiplier: multiplier,
        supply: supply
    };
}

/**
 * Valida un precio objetivo
 * 
 * @param {string|number} price - Precio a validar
 * @returns {Object} Resultado de la validación {valid: boolean, message: string}
 */
export function validatePrice(price) {
    const numericPrice = parseFloat(price);
    
    if (isNaN(numericPrice)) {
        return {
            valid: false,
            message: 'El precio debe ser un número válido.'
        };
    }
    
    if (numericPrice <= 0) {
        return {
            valid: false,
            message: 'El precio debe ser mayor que cero.'
        };
    }
    
    return {
        valid: true,
        value: numericPrice
    };
}

/**
 * Crea una criptomoneda personalizada con los datos proporcionados
 * 
 * @param {string} name - Nombre de la criptomoneda
 * @param {string} symbol - Símbolo de la criptomoneda
 * @param {number} price - Precio actual
 * @param {number} supply - Suministro circulante
 * @returns {Object} Objeto de criptomoneda
 */
export function createCustomCrypto(name, symbol, price, supply) {
    // Validar entradas
    if (!name || !symbol) {
        throw new Error('Se requiere nombre y símbolo');
    }
    
    const numericPrice = parseFloat(price);
    const numericSupply = parseFloat(supply);
    
    if (isNaN(numericPrice) || numericPrice <= 0) {
        throw new Error('El precio debe ser un número positivo');
    }
    
    if (isNaN(numericSupply) || numericSupply <= 0) {
        throw new Error('El suministro debe ser un número positivo');
    }
    
    // Crear y devolver objeto
    return {
        id: 'custom',
        name: name,
        symbol: symbol.toLowerCase(),
        current_price: numericPrice,
        circulating_supply: numericSupply,
        market_cap: numericPrice * numericSupply
    };
}

/**
 * Evalúa la viabilidad del multiplicador
 * 
 * @param {number} multiplier - Multiplicador calculado
 * @returns {Object} Evaluación {difficulty: string, message: string}
 */
export function evaluateMultiplier(multiplier) {
    if (multiplier <= 1) {
        return {
            difficulty: 'achieved',
            message: 'Este precio ya ha sido alcanzado o superado.'
        };
    } else if (multiplier <= 2) {
        return {
            difficulty: 'easy',
            message: 'Este objetivo parece razonablemente alcanzable en condiciones favorables del mercado.'
        };
    } else if (multiplier <= 5) {
        return {
            difficulty: 'moderate',
            message: 'Este objetivo requiere un crecimiento notable pero está dentro de lo posible.'
        };
    } else if (multiplier <= 10) {
        return {
            difficulty: 'challenging',
            message: 'Este objetivo representa un crecimiento considerable y podría ser difícil de alcanzar a corto plazo.'
        };
    } else if (multiplier <= 100) {
        return {
            difficulty: 'very_challenging',
            message: 'Este objetivo de precio representa un crecimiento muy significativo y probablemente requeriría cambios fundamentales en la percepción del mercado.'
        };
    } else {
        return {
            difficulty: 'extreme',
            message: 'Este objetivo es extremadamente ambicioso y supondría un crecimiento sin precedentes para llegar a esta capitalización.'
        };
    }
}
