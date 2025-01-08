const urlBase = 'https://pokeapi.co/api/v2/pokemon/';

        document.getElementById('searchButton').addEventListener('click', () => {
            const pokemonName = document.getElementById('pokemonInput').value.toLowerCase();
            fetch(urlBase + pokemonName)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Pokémon no encontrado');
                    }
                    return response.json();
                })
                .then(data => {
                    const pokemonList = document.getElementById('pokemonList');
                    pokemonList.innerHTML = ''; // Limpiar resultados anteriores
                    const div = document.createElement('div');
                    div.className = 'pokemon';
                    div.innerHTML = `
                        <h2>${data.name}</h2>
                        <p>ID: ${data.id}</p>
                        <img src="${data.sprites.front_default}" alt="${data.name}">
                    `;
                    pokemonList.appendChild(div);
                })
                .catch(error => {
                    const pokemonList = document.getElementById('pokemonList');
                    pokemonList.innerHTML = ''; // Limpiar resultados anteriores
                    const div = document.createElement('div');
                    div.className = 'pokemon';
                    div.textContent = error.message;
                    pokemonList.appendChild(div);
                });
        });