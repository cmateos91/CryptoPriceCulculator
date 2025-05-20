// Variables globales
let selectedCrypto = null;
let cryptoListData = [];
let currentPage = 1;
const perPage = 20;
let isSearchActive = false;
let searchTimeout = null;

// Elementos del DOM
const apiStatusEl = document.getElementById('api-status');
const cryptoListEl = document.getElementById('crypto-list');
const errorMessageEl = document.getElementById('error-message');
const targetPriceSectionEl = document.getElementById('target-price-section');
const selectedCryptoInfoEl = document.getElementById('selected-crypto-info');
const targetPriceEl = document.getElementById('target-price');
const calculateBtn = document.getElementById('calculate-btn');
const resultsSectionEl = document.getElementById('results-section');
const resultsGridEl = document.getElementById('results-grid');
const interpretationEl = document.getElementById('interpretation');
const loadMoreContainerEl = document.getElementById('load-more-container');
const loadMoreBtn = document.getElementById('load-more-btn');

// Elementos para búsqueda
const searchInputEl = document.getElementById('crypto-search');
const searchButtonEl = document.getElementById('search-button');
const searchResultsEl = document.getElementById('search-results');

// Elementos para criptomoneda personalizada
const customNameEl = document.getElementById('custom-name');
const customSymbolEl = document.getElementById('custom-symbol');
const customPriceEl = document.getElementById('custom-price');
const customSupplyEl = document.getElementById('custom-supply');
const useCustomBtn = document.getElementById('use-custom-btn');
const customConfirmationEl = document.getElementById('custom-confirmation');

// Actualizar el estado de la API
function updateApiStatus(status, message) {
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

// Cargar datos e inicializar la aplicación
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar con el modo de carga
    updateApiStatus('loading', 'Conectando con la API de criptomonedas...');
    
    // Configurar un timeout para limitar el tiempo de espera de la API
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tiempo de espera agotado')), 3000)
    );
    
    // Inicializar la aplicación con datos de respaldo para mostrar algo rápidamente
    renderCryptoList(cryptoData);
    setupEventListeners();
    
    // Intentar obtener datos en tiempo real en segundo plano
    try {
        const dataPromise = fetchLiveData(currentPage, perPage);
        // Usar Promise.race para limitar el tiempo de espera
        const data = await Promise.race([dataPromise, timeoutPromise]);
        
        cryptoListData = data;
        
        // Renderizar la lista de criptomonedas con datos en tiempo real
        renderCryptoList(data);
        
        // Mostrar el botón "Cargar más" si hay suficientes criptomonedas
        if (data.length >= perPage) {
            loadMoreContainerEl.style.display = 'flex';
        }
        
        // Actualizar el estado de la API
        updateApiStatus('success', '¡Conectado! Datos obtenidos en tiempo real.');
    } catch (error) {
        console.error('Error al cargar datos en tiempo real:', error);
        updateApiStatus('error', 'No se pudo conectar a la API. Usando datos de respaldo.');
        
        // Ya hemos renderizado los datos de respaldo, así que no necesitamos hacer nada más
        cryptoListData = cryptoData;
    }
});

// Renderizar la lista de criptomonedas
function renderCryptoList(data, append = false) {
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
            selectCrypto(crypto);
        });
        
        cryptoListEl.appendChild(cryptoCard);
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Evento para usar criptomoneda personalizada
    useCustomBtn.addEventListener('click', handleCustomCrypto);
    
    // Evento para calcular proyección
    calculateBtn.addEventListener('click', calculateProjection);
    
    // Evento para cargar más criptomonedas
    loadMoreBtn.addEventListener('click', loadMoreCryptos);
    
    // Eventos para búsqueda
    searchInputEl.addEventListener('input', handleSearchInput);
    searchButtonEl.addEventListener('click', performSearch);
    searchInputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Cerrar resultados de búsqueda al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!searchInputEl.contains(e.target) && !searchButtonEl.contains(e.target) && !searchResultsEl.contains(e.target)) {
            searchResultsEl.style.display = 'none';
        }
    });
}

// Manejar la entrada de búsqueda con debounce
function handleSearchInput() {
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
            renderCryptoList(cryptoListData);
            loadMoreContainerEl.style.display = cryptoListData.length >= perPage ? 'flex' : 'none';
        }
        return;
    }
    
    // Establecer un retraso para no hacer demasiadas solicitudes
    searchTimeout = setTimeout(() => {
        performSearch();
    }, 300);
}

// Realizar búsqueda
async function performSearch() {
    const query = searchInputEl.value.trim();
    
    if (!query) {
        searchResultsEl.style.display = 'none';
        return;
    }
    
    try {
        // Actualizar estado
        updateApiStatus('loading', 'Buscando criptomonedas...');
        
        // Intentar realizar la búsqueda en la API, incluso si la búsqueda es corta (1-2 caracteres)
        let results = [];
        
        // Siempre intentar buscar en la API primero, sin importar la longitud del query
        try {
            results = await searchCryptos(query);
            
            // Si la búsqueda es exitosa, actualizar estado
            updateApiStatus('success', 'Búsqueda completada.');
        } catch (error) {
            console.error('Error al buscar en la API:', error);
            updateApiStatus('error', 'Error al buscar en la API. Usando datos locales.');
            
            // Solo si falla la API, buscar en datos locales como respaldo
            results = cryptoData.filter(crypto => 
                crypto.name.toLowerCase().includes(query.toLowerCase()) || 
                crypto.symbol.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        // Mostrar resultados en el dropdown
        renderSearchResults(results);
        
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
        renderCryptoList(results);
    } catch (error) {
        console.error('Error al buscar:', error);
        updateApiStatus('error', 'Error al realizar la búsqueda.');
        
        searchResultsEl.innerHTML = '<div class="search-result-item">Error al realizar la búsqueda</div>';
        searchResultsEl.style.display = 'block';
    }
}

// Renderizar resultados de búsqueda
function renderSearchResults(results) {
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
            selectCrypto(crypto);
            searchResultsEl.style.display = 'none';
        });
        
        searchResultsEl.appendChild(resultItem);
    });
}

// Cargar más criptomonedas
async function loadMoreCryptos() {
    // Solo cargar más si no estamos en modo búsqueda
    if (isSearchActive) {
        return;
    }
    
    // Actualizar estado
    updateApiStatus('loading', 'Cargando más criptomonedas...');
    
    // Incrementar página
    currentPage++;
    
    try {
        // Obtener más datos
        const moreData = await fetchLiveData(currentPage, perPage);
        
        // Añadir a los datos existentes
        cryptoListData = [...cryptoListData, ...moreData];
        
        // Renderizar las nuevas criptomonedas
        renderCryptoList(moreData, true);
        
        // Actualizar estado
        updateApiStatus('success', 'Datos adicionales cargados correctamente.');
        
        // Si no hay más datos, ocultar el botón de cargar más
        if (moreData.length < perPage) {
            loadMoreContainerEl.style.display = 'none';
        }
    } catch (error) {
        console.error('Error al cargar más criptomonedas:', error);
        updateApiStatus('error', 'Error al cargar más criptomonedas.');
    }
}

// Seleccionar una criptomoneda predefinida
function selectCrypto(crypto) {
    // Actualizar la variable global
    selectedCrypto = crypto;
    
    // Actualizar la UI para mostrar la selección
    updateCryptoSelection();
    
    // Limpiar los campos personalizados
    clearCustomFields();
    
    // Limpiar resultados anteriores
    clearResults();
    
    // Mostrar la sección de precio objetivo
    showTargetPriceSection();
}

// Actualizar la UI para reflejar la selección de criptomoneda
function updateCryptoSelection() {
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
    customConfirmationEl.style.display = 'none';
}

// Mostrar la sección de precio objetivo
function showTargetPriceSection() {
    // Actualizar la información de la criptomoneda seleccionada
    selectedCryptoInfoEl.innerHTML = `
        <p class="selected-name">Criptomoneda seleccionada: <strong>${selectedCrypto.name} (${selectedCrypto.symbol.toUpperCase()})</strong></p>
        <p class="selected-price">Precio actual: <strong>$${formatNumber(selectedCrypto.current_price)}</strong></p>
        <p class="selected-market-cap">Capitalización actual: <strong>${formatMarketCap(selectedCrypto.market_cap)}</strong></p>
        <p class="selected-supply">Suministro circulante: <strong>${formatNumber(selectedCrypto.circulating_supply, 0)} ${selectedCrypto.symbol.toUpperCase()}</strong></p>
    `;
    
    // Mostrar la sección
    targetPriceSectionEl.style.display = 'block';
    
    // Limpiar el campo de precio objetivo
    targetPriceEl.value = '';
    
    // Hacer scroll a la sección de precio objetivo
    targetPriceSectionEl.scrollIntoView({ behavior: 'smooth' });
    
    // Limpiar resultados anteriores
    clearResults();
}

// Manejar la criptomoneda personalizada
function handleCustomCrypto() {
    // Obtener valores
    const name = customNameEl.value.trim();
    const symbol = customSymbolEl.value.trim();
    const price = parseFloat(customPriceEl.value);
    const supply = parseFloat(customSupplyEl.value);
    
    // Validar datos
    if (!name || !symbol) {
        showError('Por favor, introduce un nombre y un símbolo para la criptomoneda personalizada.');
        return;
    }
    
    if (isNaN(price) || price <= 0 || isNaN(supply) || supply <= 0) {
        showError('Por favor, introduce valores numéricos válidos para precio y suministro.');
        return;
    }
    
    // Crear objeto de criptomoneda personalizada
    const customCrypto = {
        id: 'custom',
        name: name,
        symbol: symbol.toLowerCase(),
        current_price: price,
        circulating_supply: supply,
        market_cap: price * supply
    };
    
    // Seleccionar la criptomoneda personalizada
    selectedCrypto = customCrypto;
    
    // Actualizar la UI
    updateCryptoSelection();
    
    // Mostrar confirmación
    customConfirmationEl.innerHTML = `<p>Usando datos personalizados para: <strong>${name}</strong></p>`;
    customConfirmationEl.style.display = 'block';
    
    // Mostrar la sección de precio objetivo
    showTargetPriceSection();
    
    // Limpiar mensaje de error si existe
    hideError();
}

// Calcular proyección de precio
function calculateProjection() {
    // Validar que haya una criptomoneda seleccionada
    if (!selectedCrypto) {
        showError('Por favor, selecciona primero una criptomoneda.');
        return;
    }
    
    // Obtener precio objetivo
    const targetPriceValue = parseFloat(targetPriceEl.value);
    
    // Validar precio objetivo
    if (isNaN(targetPriceValue) || targetPriceValue <= 0) {
        showError('Por favor, introduce un precio objetivo válido.');
        return;
    }
    
    // Realizar cálculos
    const currentPrice = selectedCrypto.current_price;
    const currentMarketCap = selectedCrypto.market_cap;
    const supply = selectedCrypto.circulating_supply;
    
    // Calcular nueva capitalización de mercado necesaria
    const targetMarketCap = supply * targetPriceValue;
    
    // Multiplicador desde la capitalización actual
    const multiplier = targetMarketCap / currentMarketCap;
    
    // Mostrar resultados
    displayResults({
        crypto: selectedCrypto,
        targetPrice: targetPriceValue,
        currentPrice,
        currentMarketCap,
        targetMarketCap,
        multiplier,
        supply
    });
    
    // Limpiar mensaje de error si existe
    hideError();
}

// Mostrar resultados
function displayResults(result) {
    // Construir grid de resultados
    resultsGridEl.innerHTML = `
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
    
    interpretationEl.innerHTML = interpretation;
    
    // Mostrar sección de resultados
    resultsSectionEl.style.display = 'block';
    
    // Desplazarse a la sección de resultados
    resultsSectionEl.scrollIntoView({ behavior: 'smooth' });
}

// Limpiar campos personalizados
function clearCustomFields() {
    customNameEl.value = '';
    customSymbolEl.value = '';
    customPriceEl.value = '';
    customSupplyEl.value = '';
    customConfirmationEl.style.display = 'none';
}

// Limpiar resultados
function clearResults() {
    resultsSectionEl.style.display = 'none';
    resultsGridEl.innerHTML = '';
    interpretationEl.innerHTML = '';
}

// Mostrar mensaje de error
function showError(message) {
    errorMessageEl.textContent = message;
    errorMessageEl.style.display = 'block';
    
    // Desplazarse al mensaje de error
    errorMessageEl.scrollIntoView({ behavior: 'smooth' });
}

// Ocultar mensaje de error
function hideError() {
    errorMessageEl.style.display = 'none';
}

// Formatear números con separadores y decimales apropiados
function formatNumber(num, decimals = 2) {
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
        
        // Ajusta los decimales a mostrar: al menos 2 dígitos significativos después de los ceros
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

// Formatear capitalización de mercado
function formatMarketCap(marketCap) {
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