/**
 * ui.js
 * Módulo para gestionar la interfaz de usuario
 */

import { formatNumber, formatMarketCap } from './formatters.js';

/**
 * Renderiza la lista de criptomonedas en la interfaz
 * 
 * @param {Array} data - Array de datos de criptomonedas
 * @param {boolean} append - Si se deben añadir a los existentes o reemplazar
 * @param {HTMLElement} cryptoListEl - Elemento DOM donde mostrar la lista
 * @param {Function} selectCryptoCallback - Función para manejar la selección
 */
export function renderCryptoList(data, append = false, cryptoListEl, selectCryptoCallback) {
    // Si no estamos añadiendo, limpiar la lista actual
    if (!append) {
        cryptoListEl.innerHTML = '';
    }
    
    // Si no hay datos, mostrar mensaje
    if (data.length === 0) {
        cryptoListEl.innerHTML = '<p class="no-results">No se encontraron criptomonedas.</p>';
        return;
    }
    
    data.forEach(crypto => {
        const cryptoCard = document.createElement('div');
        cryptoCard.classList.add('crypto-card');
        cryptoCard.dataset.id = crypto.id;
        
        // Crear imagen predeterminada si no existe
        const imageUrl = crypto.image || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%236b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 8l-8 8M8 8l8 8"></path></svg>';
        
        cryptoCard.innerHTML = `
            <div class="crypto-header">
                <img src="${imageUrl}" alt="${crypto.name}" class="crypto-image">
                <div>
                    <div class="crypto-name">${crypto.name}</div>
                    <div class="crypto-symbol">${crypto.symbol}</div>
                </div>
            </div>
            <div class="crypto-price">$${formatNumber(crypto.current_price)}</div>
            <div class="crypto-market-cap">Cap: ${formatMarketCap(crypto.market_cap)}</div>
        `;
        
        // Evento para seleccionar criptomoneda
        cryptoCard.addEventListener('click', () => {
            selectCryptoCallback(crypto);
        });
        
        cryptoListEl.appendChild(cryptoCard);
    });
}

/**
 * Actualiza el estado visual de la API en la interfaz
 * 
 * @param {string} status - Estado ('loading', 'success', 'error')
 * @param {string} message - Mensaje a mostrar
 * @param {HTMLElement} apiStatusEl - Elemento DOM para mostrar estado
 */
export function updateApiStatus(status, message, apiStatusEl) {
    apiStatusEl.className = 'api-status ' + status;
    
    // Actualizar el contenido según el estado
    if (status === 'loading') {
        apiStatusEl.innerHTML = `<div class="spinner"></div><span>${message}</span>`;
    } else if (status === 'success') {
        apiStatusEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg><span>${message}</span>`;
    } else if (status === 'error') {
        apiStatusEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><span>${message}</span>`;
    }
}

/**
 * Actualiza la UI para reflejar la selección de criptomoneda
 * 
 * @param {Object} selectedCrypto - Criptomoneda seleccionada
 * @param {Object} elements - Elementos DOM relacionados
 */
export function updateCryptoSelection(selectedCrypto, elements) {
    // Eliminar la clase 'selected' de todas las tarjetas
    document.querySelectorAll('.crypto-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Añadir la clase 'selected' a la tarjeta seleccionada
    if (selectedCrypto.id !== 'custom') {
        const selectedCard = document.querySelector(`.crypto-card[data-id="${selectedCrypto.id}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            
            // Hacer scroll a la tarjeta seleccionada si está fuera de la vista
            selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    // Actualizar el mensaje de confirmación personalizada
    elements.customConfirmationEl.style.display = 'none';
}

/**
 * Muestra la sección de precio objetivo con la criptomoneda seleccionada
 * 
 * @param {Object} selectedCrypto - Criptomoneda seleccionada
 * @param {Object} elements - Elementos DOM relacionados
 */
export function showTargetPriceSection(selectedCrypto, elements) {
    // Actualizar la información de la criptomoneda seleccionada
    elements.selectedCryptoInfoEl.innerHTML = `
        <p class="selected-name">Criptomoneda seleccionada: <strong>${selectedCrypto.name} (${selectedCrypto.symbol.toUpperCase()})</strong></p>
        <p class="selected-price">Precio actual: <strong>$${formatNumber(selectedCrypto.current_price)}</strong></p>
        <p class="selected-market-cap">Capitalización actual: <strong>${formatMarketCap(selectedCrypto.market_cap)}</strong></p>
        <p class="selected-supply">Suministro circulante: <strong>${formatNumber(selectedCrypto.circulating_supply, 0)} ${selectedCrypto.symbol.toUpperCase()}</strong></p>
    `;
    
    // Mostrar la sección
    elements.targetPriceSectionEl.style.display = 'block';
    
    // Limpiar el campo de precio objetivo
    elements.targetPriceEl.value = '';
    
    // Hacer scroll a la sección de precio objetivo
    elements.targetPriceSectionEl.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Muestra los resultados del cálculo en la interfaz
 * 
 * @param {Object} result - Resultados del cálculo
 * @param {Object} elements - Elementos DOM relacionados
 */
export function displayResults(result, elements) {
    // Construir grid de resultados
    elements.resultsGridEl.innerHTML = `
        <div class="result-card">
            <div class="result-label">Precio actual de ${result.crypto.symbol.toUpperCase()}</div>
            <div class="result-value">$${formatNumber(result.currentPrice)}</div>
        </div>
        
        <div class="result-card">
            <div class="result-label">Precio objetivo</div>
            <div class="result-value">$${formatNumber(result.targetPrice)}</div>
        </div>
        
        <div class="result-card">
            <div class="result-label">Capitalización actual</div>
            <div class="result-value">${formatMarketCap(result.currentMarketCap)}</div>
        </div>
        
        <div class="result-card">
            <div class="result-label">Capitalización necesaria</div>
            <div class="result-value">${formatMarketCap(result.targetMarketCap)}</div>
        </div>
        
        <div class="result-card">
            <div class="result-label">Suministro circulante</div>
            <div class="result-value">${formatNumber(result.supply, 0)} ${result.crypto.symbol.toUpperCase()}</div>
        </div>
        
        <div class="result-card multiplier-card">
            <div class="result-label">Multiplicador necesario</div>
            <div class="result-value multiplier-value">${formatNumber(result.multiplier)}x</div>
        </div>
    `;
    
    // Construir interpretación
    let interpretation = `
        <h3>Interpretación</h3>
        <p>
            Para que ${result.crypto.name} (${result.crypto.symbol.toUpperCase()}) alcance un precio de $${formatNumber(result.targetPrice)}, 
            su capitalización de mercado tendría que crecer ${formatNumber(result.multiplier)}x hasta ${formatMarketCap(result.targetMarketCap)}.
        </p>
    `;
    
    // Añadir comentario sobre la viabilidad
    if (result.multiplier > 1) {
        interpretation += `
            <p style="margin-top: 0.5rem;">
                ${result.multiplier > 10 
                    ? 'Este objetivo de precio representa un crecimiento muy significativo y podría ser difícil de alcanzar en el corto plazo.'
                    : 'Este objetivo parece estar dentro de un rango de crecimiento posible, dependiendo de las condiciones del mercado.'}
            </p>
        `;
    }
    
    elements.interpretationEl.innerHTML = interpretation;
    
    // Mostrar sección de resultados
    elements.resultsSectionEl.style.display = 'block';
    
    // Desplazarse a la sección de resultados
    elements.resultsSectionEl.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Muestra un mensaje de error en la interfaz
 * 
 * @param {string} message - Mensaje de error
 * @param {HTMLElement} errorMessageEl - Elemento DOM para mostrar error
 */
export function showError(message, errorMessageEl) {
    errorMessageEl.textContent = message;
    errorMessageEl.style.display = 'block';
    
    // Desplazarse al mensaje de error
    errorMessageEl.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Oculta el mensaje de error
 * 
 * @param {HTMLElement} errorMessageEl - Elemento DOM del mensaje de error
 */
export function hideError(errorMessageEl) {
    errorMessageEl.style.display = 'none';
}

/**
 * Limpia los campos del formulario de criptomoneda personalizada
 * 
 * @param {Object} elements - Elementos DOM relacionados
 */
export function clearCustomFields(elements) {
    elements.customNameEl.value = '';
    elements.customSymbolEl.value = '';
    elements.customPriceEl.value = '';
    elements.customSupplyEl.value = '';
    elements.customConfirmationEl.style.display = 'none';
}

/**
 * Limpia los resultados mostrados
 * 
 * @param {Object} elements - Elementos DOM relacionados
 */
export function clearResults(elements) {
    elements.resultsSectionEl.style.display = 'none';
    elements.resultsGridEl.innerHTML = '';
    elements.interpretationEl.innerHTML = '';
}
