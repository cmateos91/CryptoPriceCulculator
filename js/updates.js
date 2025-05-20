// Actualización de la función showTargetPriceSection para manejar precios pequeños
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