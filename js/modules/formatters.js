/**
 * formatters.js
 * Módulo para formatear números, monedas y otros datos
 */

/**
 * Formatea un número con separadores y decimales apropiados
 * Maneja especialmente los precios muy pequeños para mostrar dígitos significativos
 * 
 * @param {number} num - El número a formatear
 * @param {number} decimals - Cantidad de decimales a mostrar para números normales
 * @returns {string} El número formateado
 */
export function formatNumber(num, decimals = 2) {
    if (num === null || num === undefined) return 'N/A';
    
    // Para precios muy pequeños (menores a 0.01), mostrar más decimales
    if (num > 0 && num < 0.01) {
        // Encuentra el primer dígito no cero después del punto decimal
        const numStr = num.toString();
        const decimalPart = numStr.split('.')[1] || '';
        
        // Cuenta cuántos ceros hay antes del primer dígito no cero
        let leadingZeros = 0;
        for (let i = 0; i < decimalPart.length; i++) {
            if (decimalPart[i] === '0') {
                leadingZeros++;
            } else {
                break;
            }
        }
        
        // Ajusta los decimales a mostrar: al menos 3 dígitos significativos después de los ceros
        const significantDecimals = leadingZeros + 3;
        
        // Si es extremadamente pequeño, usar notación científica
        if (significantDecimals > 8) {
            return num.toExponential(2);
        }
        
        return new Intl.NumberFormat('es-ES', { 
            minimumFractionDigits: significantDecimals,
            maximumFractionDigits: significantDecimals
        }).format(num);
    }
    
    // Para números muy pequeños, usar notación científica
    if (num < 0.0000001) {
        return num.toExponential(2);
    }
    
    // Para números normales, usar formato con separadores de miles
    return new Intl.NumberFormat('es-ES', { 
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals 
    }).format(num);
}

/**
 * Formatea una capitalización de mercado en un formato legible
 * Convierte grandes números a billones, mil millones o millones según corresponda
 * 
 * @param {number} marketCap - La capitalización de mercado a formatear
 * @returns {string} Capitalización formateada
 */
export function formatMarketCap(marketCap) {
    if (marketCap === null || marketCap === undefined) return 'N/A';
    
    if (marketCap >= 1e12) {
        return `$${(marketCap / 1e12).toFixed(2)} billones`;
    } else if (marketCap >= 1e9) {
        return `$${(marketCap / 1e9).toFixed(2)} mil millones`;
    } else if (marketCap >= 1e6) {
        return `$${(marketCap / 1e6).toFixed(2)} millones`;
    } else {
        return `$${formatNumber(marketCap)}`;
    }
}
