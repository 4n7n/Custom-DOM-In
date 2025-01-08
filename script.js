const urlBase = 'https://pokeapi.co/api/v2/pokemon/';
const urlSpeciesBase = 'https://pokeapi.co/api/v2/pokemon-species/';
const urlTypeBase = 'https://pokeapi.co/api/v2/type/';

function getPvpTier(pokemonId) {
    const tiers = {
        1: 'S',
        2: 'A',
        3: 'B',
    };
    return tiers[pokemonId] || 'Desconocido';
}

function getEvYield(pokemonId) {
    const evYields = {
        1: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 1 },
        2: { hp: 0, attack: 0, defense: 1, specialAttack: 0, specialDefense: 0, speed: 0 },
        3: { hp: 0, attack: 2, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
    };
    return evYields[pokemonId] || { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };
}

function getWeaknesses(types) {
    const weaknessesPromises = types.map(type => {
        return fetch(urlTypeBase + type.type.name)
            .then(response => response.json())
            .then(typeData => {
                return typeData.damage_relations.double_damage_from.map(damageType => damageType.name).join(', ');
            });
    });

    return Promise.all(weaknessesPromises).then(weaknessArrays => {
        return [...new Set(weaknessArrays.flat())].join(', ');
    });
}

function searchPokemon() {
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
            const div = document.createElement('div');
            div.className = 'pokemon';

            const types = data.types.map(type => type.type.name);
            const abilities = data.abilities.map(ability => ability.ability.name).join(', ');
            const moves = data.moves.slice(0, 5).map(move => move.move.name).join(', ');

            return fetch(urlSpeciesBase + data.id)
                .then(response => response.json())
                .then(speciesData => {
                    const color = speciesData.color.name;
                    const habitat = speciesData.habitat ? speciesData.habitat.name : 'Desconocido';
                    const description = speciesData.flavor_text_entries
                        .find(entry => entry.language.name === 'es').flavor_text.replace(/\n/g, ' ');

                    const pvpTier = getPvpTier(data.id);
                    const evYield = getEvYield(data.id);
                    const eggGroup = speciesData.egg_groups.map(group => group.name).join(', ');
                    const height = (data.height / 10).toFixed(1);
                    const weight = (data.weight / 10).toFixed(1);

                    const baseStats = data.stats.map(stat => stat.base_stat);
                    const totalStats = baseStats.reduce((acc, stat) => acc + stat, 0);

                    return getWeaknesses(data.types).then(uniqueWeaknesses => {
                        div.innerHTML = `
                            <h2>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</h2>
                            <img src="${data.sprites.front_default}" alt="${data.name}">
                            <div class="header">Resumen</div>
                            <div class="section">
                                <p><strong>ID:</strong> ${data.id}</p>
                                <p><strong>Tipo:</strong> ${types.join(', ')}</p>
                                <p><strong>Descripción:</strong> ${description}</p>
                                <p><strong>Habilidades:</strong> ${abilities}</p>
                                <p><strong>PvP Tier:</strong> ${pvpTier}</p>
                                <p><strong>EV Yield:</strong> HP: ${evYield.hp}, Ataque: ${evYield.attack}, Defensa: ${evYield.defense}, Ataque Especial: ${evYield.specialAttack}, Defensa Especial: ${evYield.specialDefense}, Velocidad: ${evYield.speed}</p>
                                <p><strong>Grupo Huevo:</strong> ${eggGroup}</p>
                                <p><strong>Altura:</strong> ${height} m</p>
                                <p><strong>Peso:</strong> ${weight} kg</p>
                            </div>
                            <div class="header">Movimientos</div>
                            <div class="section">
                                <p><strong>Movimientos:</strong> ${moves}</p>
                            </div>
                            <div class="header">Estado Base</div>
                            <div class="section">
                                <p><strong>HP:</strong> ${baseStats[0]}</p>
                                <p><strong>Ataque:</strong> ${baseStats[1]}</p>
                                <p><strong>Defensa:</strong> ${baseStats[2]}</p>
                                <p><strong>Ataque Especial:</strong> ${baseStats[3]}</p>
                                <p><strong>Defensa Especial:</strong> ${baseStats[4]}</p>
                                <p><strong>Velocidad:</strong> ${baseStats[5]}</p>
                                <p><strong>Total:</strong> ${totalStats}</p>
                            </div>
                            <div class="header">Zonas Salvajes</div>
                            <div class="section">
                                <p><strong>Hábitat:</strong> ${habitat}</p>
                            </div>
                            <div class="header">Línea de Evolución</div>
                            <div class="section">
                                <p><strong>Debilidades:</strong> ${uniqueWeaknesses}</p>
                            </div>
                        `;
                        pokemonList.appendChild(div);
                    });
                });
        })
        .catch(error => {
            const pokemonList = document.getElementById('pokemonList');
            pokemonList.innerHTML = '';
            const div = document.createElement('div');
            div.innerHTML = `<p style="color: red;">${error.message}</p>`;
            pokemonList.appendChild(div);
        });
}

document.getElementById('searchButton').addEventListener('click', searchPokemon);

// Agregar evento para la tecla Enter
document.getElementById('pokemonInput').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchPokemon();
    }
});