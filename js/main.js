/**
 * main.js
 * Archivo principal que inicializa la aplicación y conecta todos los módulos
 */

import { fetchLiveData } from './modules/api.js';
import { formatNumber, formatMarketCap } from './modules/formatters.js';
import { renderCryptoList, updateApiStatus, showTargetPriceSection, 
         updateCryptoSelection, displayResults, showError, hideError, 
         clearCustomFields, clearResults } from './modules/ui.js';
import { calculateProjection, createCustomCrypto, validatePrice } from './modules/calculator.js';
import { initSearch, isSearchModeActive, resetSearch } from './modules/search.js';
import { cryptoData, appConfig } from './config.js';

// Estado de la aplicación
const state = {
    selectedCrypto: null,
    cryptoListData: [],
    currentPage: 1,
    perPage: appConfig.itemsPerPage
};

// Elementos del DOM
const elements = {
    // API y lista de criptomonedas
    apiStatus: document.getElementById('api-status'),
    cryptoList: document.getElementById('crypto-list'),
    errorMessage: document.getElementById('error-message'),
    loadMoreContainer: document.getElementById('load-more-container'),
    loadMoreBtn: document.getElementById('load-more-btn'),
    
    // Búsqueda
    searchInput: document.getElementById('crypto-search'),
    searchButton: document.getElementById('search-button'),
    searchResults: document.getElementById('search-results'),
    
    // Sección de precio objetivo
    targetPriceSection: document.getElementById('target-price-section'),
    selectedCryptoInfo: document.getElementById('selected-crypto-info'),
    targetPrice: document.getElementById('target-price'),
    calculateBtn: document.getElementById('calculate-btn'),
    
    // Resultados
    resultsSection: document.getElementById('results-section'),
    resultsGrid: document.getElementById('results-grid'),
    interpretation: document.getElementById('interpretation'),
    
    // Datos personalizados
    customName: document.getElementById('custom-name'),
    customSymbol: document.getElementById('custom-symbol'),
    customPrice: document.getElementById('custom-price'),
    customSupply: document.getElementById('custom-supply'),
    useCustomBtn: document.getElementById('use-custom-btn'),
    customConfirmation: document.getElementById('custom-confirmation')
};

/**
 * Seleccionar una criptomoneda
 * @param {Object} crypto - Datos de la criptomoneda
 */
function selectCrypto(crypto) {
    // Actualizar el estado
    state.selectedCrypto = crypto;
    
    // Actualizar la UI
    updateCryptoSelection(crypto, elements);
    
    // Limpiar campos personalizados
    clearCustomFields(elements);
    
    // Limpiar resultados anteriores
    clearResults(elements);
    
    // Mostrar sección de precio objetivo
    showTargetPriceSection(crypto, elements);
}

/**
 * Manejar la criptomoneda personalizada
 */
function handleCustomCrypto() {
    try {
        // Obtener valores
        const name = elements.customName.value.trim();
        const symbol = elements.customSymbol.value.trim();
        const price = parseFloat(elements.customPrice.value);
        const supply = parseFloat(elements.customSupply.value);
        
        // Validar datos
        if (!name || !symbol) {
            showError('Por favor, introduce un nombre y un símbolo para la criptomoneda personalizada.', elements.errorMessage);
            return;
        }
        
        if (isNaN(price) || price <= 0 || isNaN(supply) || supply <= 0) {
            showError('Por favor, introduce valores numéricos válidos para precio y suministro.', elements.errorMessage);
            return;
        }
        
        // Crear objeto personalizado
        const customCrypto = createCustomCrypto(name, symbol, price, supply);
        
        // Seleccionar la criptomoneda personalizada
        selectCrypto(customCrypto);
        
        // Mostrar confirmación
        elements.customConfirmation.innerHTML = `<p>Usando datos personalizados para: <strong>${name}</strong></p>`;
        elements.customConfirmation.style.display = 'block';
        
        // Limpiar mensaje de error si existe
        hideError(elements.errorMessage);
    } catch (error) {
        showError(error.message, elements.errorMessage);
    }
}

/**
 * Manejar el cálculo de proyección de precio
 */
function handleCalculateProjection() {
    // Validar que haya una criptomoneda seleccionada
    if (!state.selectedCrypto) {
        showError('Por favor, selecciona primero una criptomoneda.', elements.errorMessage);
        return;
    }
    
    // Obtener y validar precio objetivo
    const targetPriceValidation = validatePrice(elements.targetPrice.value);
    if (!targetPriceValidation.valid) {
        showError(targetPriceValidation.message, elements.errorMessage);
        return;
    }
    
    // Calcular proyección
    const result = calculateProjection(state.selectedCrypto, targetPriceValidation.value);
    
    // Mostrar resultados
    displayResults(result, elements);
    
    // Limpiar mensaje de error si existe
    hideError(elements.errorMessage);
}

/**
 * Cargar más criptomonedas
 */
async function loadMoreCryptos() {
    // Solo cargar más si no estamos en modo búsqueda
    if (isSearchModeActive()) {
        return;
    }
    
    // Actualizar estado
    updateApiStatus('loading', 'Cargando más criptomonedas...', elements.apiStatus);
    
    // Incrementar página
    state.currentPage++;
    
    try {
        // Obtener más datos
        const moreData = await fetchLiveData(state.currentPage, state.perPage);
        
        // Añadir a los datos existentes
        state.cryptoListData = [...state.cryptoListData, ...moreData];
        
        // Renderizar las nuevas criptomonedas
        renderCryptoList(moreData, true, elements.cryptoList, selectCrypto);
        
        // Actualizar estado
        updateApiStatus('success', 'Datos adicionales cargados correctamente.', elements.apiStatus);
        
        // Si no hay más datos, ocultar el botón de cargar más
        if (moreData.length < state.perPage) {
            elements.loadMoreContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Error al cargar más criptomonedas:', error);
        updateApiStatus('error', 'Error al cargar más criptomonedas.', elements.apiStatus);
    }
}

/**
 * Inicialización de la aplicación
 */
async function initApp() {
    // Inicializar con el modo de carga
    updateApiStatus('loading', 'Conectando con la API de criptomonedas...', elements.apiStatus);
    
    // Configurar un timeout para limitar el tiempo de espera de la API
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tiempo de espera agotado')), appConfig.apiTimeout)
    );
    
    // Configurar event listeners para la aplicación
    elements.useCustomBtn.addEventListener('click', handleCustomCrypto);
    elements.calculateBtn.addEventListener('click', handleCalculateProjection);
    elements.loadMoreBtn.addEventListener('click', loadMoreCryptos);
    
    // Inicializar el módulo de búsqueda
    initSearch(
        {
            searchInput: elements.searchInput,
            searchButton: elements.searchButton,
            searchResults: elements.searchResults,
            cryptoList: elements.cryptoList,
            loadMoreContainer: elements.loadMoreContainer,
            apiStatus: elements.apiStatus
        }, 
        {
            selectCryptoCallback: selectCrypto,
            renderCryptoListCallback: (data) => renderCryptoList(data, false, elements.cryptoList, selectCrypto),
            updateStatusCallback: (status, message) => updateApiStatus(status, message, elements.apiStatus),
            cryptoListData: () => state.cryptoListData
        }
    );
    
    // Inicializar la aplicación con datos de respaldo para mostrar algo rápidamente
    renderCryptoList(cryptoData, false, elements.cryptoList, selectCrypto);
    
    // Intentar obtener datos en tiempo real en segundo plano
    try {
        const dataPromise = fetchLiveData(state.currentPage, state.perPage);
        // Usar Promise.race para limitar el tiempo de espera
        const data = await Promise.race([dataPromise, timeoutPromise]);
        
        // Actualizar el estado con los datos obtenidos
        state.cryptoListData = data;
        
        // Renderizar la lista de criptomonedas con datos en tiempo real
        renderCryptoList(data, false, elements.cryptoList, selectCrypto);
        
        // Mostrar el botón "Cargar más" si hay suficientes criptomonedas
        if (data.length >= state.perPage) {
            elements.loadMoreContainer.style.display = 'flex';
        }
        
        // Actualizar el estado de la API
        updateApiStatus('success', '¡Conectado! Datos obtenidos en tiempo real.', elements.apiStatus);
    } catch (error) {
        console.error('Error al cargar datos en tiempo real:', error);
        updateApiStatus('error', 'No se pudo conectar a la API. Usando datos de respaldo.', elements.apiStatus);
        
        // Ya hemos renderizado los datos de respaldo, así que actualizamos el estado
        state.cryptoListData = cryptoData;
    }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);
