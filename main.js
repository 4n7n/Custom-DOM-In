// Inicialización de Eventos
document.getElementById('searchButton').addEventListener('click', searchPokemon);
document.getElementById('pokemonInput').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchPokemon();
    }
});
