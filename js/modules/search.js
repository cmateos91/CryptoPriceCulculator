/**
 * search.js
 * Módulo para la funcionalidad de búsqueda de criptomonedas
 */

import { searchCryptos } from './api.js';
import { formatNumber, formatMarketCap } from './formatters.js';
import { cryptoData } from '../config.js';

// Elementos del DOM
let searchInputEl;
let searchButtonEl;
let searchResultsEl;
let cryptoListEl;
let loadMoreContainerEl;
let apiStatusEl;

// Variables
let isSearchActive = false;
let searchTimeout = null;

/**
 * Inicializa el módulo de búsqueda
 * 
 * @param {Object} elements - Elementos DOM necesarios
 * @param {Function} selectCryptoCallback - Función para seleccionar una criptomoneda
 * @param {Function} renderCryptoListCallback - Función para renderizar la lista de criptomonedas
 * @param {Function} updateStatusCallback - Función para actualizar el estado de la API
 */
export function initSearch(elements, { selectCryptoCallback, renderCryptoListCallback, updateStatusCallback, cryptoListData }) {
    // Asignar elementos DOM
    searchInputEl = elements.searchInput;
    searchButtonEl = elements.searchButton;
    searchResultsEl = elements.searchResults;
    cryptoListEl = elements.cryptoList;
    loadMoreContainerEl = elements.loadMoreContainer;
    apiStatusEl = elements.apiStatus;
    
    // Configurar event listeners
    setupSearchEventListeners(selectCryptoCallback, renderCryptoListCallback, updateStatusCallback, cryptoListData);
}

/**
 * Configura los event listeners para la búsqueda
 */
function setupSearchEventListeners(selectCryptoCallback, renderCryptoListCallback, updateStatusCallback, cryptoListData) {
    // Eventos para búsqueda
    searchInputEl.addEventListener('input', () => handleSearchInput(renderCryptoListCallback, updateStatusCallback, cryptoListData));
    searchButtonEl.addEventListener('click', () => performSearch(renderCryptoListCallback, updateStatusCallback, cryptoListData));
    searchInputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(renderCryptoListCallback, updateStatusCallback, cryptoListData);
        }
    });
    
    // Cerrar resultados de búsqueda al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!searchInputEl.contains(e.target) && !searchButtonEl.contains(e.target) && !searchResultsEl.contains(e.target)) {
            searchResultsEl.style.display = 'none';
        }
    });
}

/**
 * Maneja la entrada de búsqueda con debounce
 */
function handleSearchInput(renderCryptoListCallback, updateStatusCallback, cryptoListData) {
    // Cancelar cualquier búsqueda pendiente
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // No mostrar resultados si el campo está vacío
    if (searchInputEl.value.trim() === '') {
        searchResultsEl.style.display = 'none';
        
        // Si estábamos en modo búsqueda, volver a mostrar la lista normal
        if (isSearchActive) {
            isSearchActive = false;
            renderCryptoListCallback(cryptoListData());
            loadMoreContainerEl.style.display = cryptoListData().length >= 20 ? 'flex' : 'none';
        }
        return;
    }
    
    // Establecer un retraso para no hacer demasiadas solicitudes
    searchTimeout = setTimeout(() => {
        performSearch(renderCryptoListCallback, updateStatusCallback, cryptoListData);
    }, 300);
}

/**
 * Realiza la búsqueda de criptomonedas
 */
async function performSearch(renderCryptoListCallback, updateStatusCallback, cryptoListData) {
    const query = searchInputEl.value.trim();
    
    if (!query) {
        searchResultsEl.style.display = 'none';
        return;
    }
    
    try {
        // Actualizar estado
        updateStatusCallback('loading', 'Buscando criptomonedas...');
        
        // Intentar realizar la búsqueda en la API, incluso si la búsqueda es corta (1-2 caracteres)
        let results = [];
        
        // Siempre intentar buscar en la API primero, sin importar la longitud del query
        try {
            results = await searchCryptos(query);
            
            // Si la búsqueda es exitosa, actualizar estado
            updateStatusCallback('success', 'Búsqueda completada.');
        } catch (error) {
            console.error('Error al buscar en la API:', error);
            updateStatusCallback('error', 'Error al buscar en la API. Usando datos locales.');
            
            // Solo si falla la API, buscar en datos locales como respaldo
            results = cryptoData.filter(crypto => 
                crypto.name.toLowerCase().includes(query.toLowerCase()) || 
                crypto.symbol.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        // Mostrar resultados en el dropdown
        renderSearchResults(results, selectCryptoCallback);
        
        // Si hay resultados, mostrar el dropdown
        if (results.length > 0) {
            searchResultsEl.style.display = 'block';
        } else {
            searchResultsEl.innerHTML = '<div class="search-result-item">No se encontraron resultados</div>';
            searchResultsEl.style.display = 'block';
        }
        
        // Marcar como modo búsqueda activo
        isSearchActive = true;
        
        // Ocultar el botón de cargar más en modo búsqueda
        loadMoreContainerEl.style.display = 'none';
        
        // También actualizar la vista principal
        renderCryptoListCallback(results);
    } catch (error) {
        console.error('Error al buscar:', error);
        updateStatusCallback('error', 'Error al realizar la búsqueda.');
        
        searchResultsEl.innerHTML = '<div class="search-result-item">Error al realizar la búsqueda</div>';
        searchResultsEl.style.display = 'block';
    }
}

/**
 * Renderiza los resultados de búsqueda en el dropdown
 * 
 * @param {Array} results - Resultados de la búsqueda
 * @param {Function} selectCryptoCallback - Función para seleccionar una criptomoneda
 */
function renderSearchResults(results, selectCryptoCallback) {
    searchResultsEl.innerHTML = '';
    
    if (results.length === 0) {
        searchResultsEl.innerHTML = '<div class="search-result-item">No se encontraron resultados</div>';
        return;
    }
    
    results.forEach(crypto => {
        const resultItem = document.createElement('div');
        resultItem.classList.add('search-result-item');
        
        // Crear imagen predeterminada si no existe
        const imageUrl = crypto.image || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%236b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 8l-8 8M8 8l8 8"></path></svg>';
        
        resultItem.innerHTML = `
            <img src="${imageUrl}" alt="${crypto.name}" class="search-result-image">
            <div class="search-result-info">
                <div class="search-result-name">${crypto.name}</div>
                <div class="search-result-symbol">${crypto.symbol.toUpperCase()}</div>
            </div>
            <div class="search-result-price">$${formatNumber(crypto.current_price)}</div>
        `;
        
        // Evento para seleccionar criptomoneda desde resultados de búsqueda
        resultItem.addEventListener('click', () => {
            selectCryptoCallback(crypto);
            searchResultsEl.style.display = 'none';
        });
        
        searchResultsEl.appendChild(resultItem);
    });
}

/**
 * Verifica si la búsqueda está activa
 * 
 * @returns {boolean} - true si la búsqueda está activa
 */
export function isSearchModeActive() {
    return isSearchActive;
}

/**
 * Reinicia el estado de búsqueda
 */
export function resetSearch() {
    isSearchActive = false;
    searchInputEl.value = '';
    searchResultsEl.style.display = 'none';
}