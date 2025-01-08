const urlBase = 'https://pokeapi.co/api/v2/pokemon/';
const urlSpeciesBase = 'https://pokeapi.co/api/v2/pokemon-species/';
const urlMoveBase = 'https://pokeapi.co/api/v2/move/';

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
    const typeWeaknesses = {
        fire: ['water', 'rock', 'ground'],
        water: ['electric', 'grass'],
        grass: ['fire', 'ice', 'bug', 'flying', 'poison'],
        // Agrega más tipos y sus debilidades según sea necesario
    };
    const weaknesses = new Set();
    types.forEach(type => {
        if (typeWeaknesses[type]) {
            typeWeaknesses[type].forEach(weakness => weaknesses.add(weakness));
        }
    });
    return Array.from(weaknesses);
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
            pokemonList.innerHTML = ''; // Limpiar el contenido anterior
            const div = document.createElement('div');
            div.className = 'pokemon';

            const types = data.types.map(type => type.type.name);
            const abilities = data.abilities.map(ability => ability.ability.name).join(', ');
            const height = (data.height / 10).toFixed(1);
            const weaknesses = getWeaknesses(types);

            // Calcular el total de estadísticas base
            const baseStats = {
                hp: data.stats[0].base_stat,
                attack: data.stats[1].base_stat,
                defense: data.stats[2].base_stat,
                specialAttack: data.stats[3].base_stat,
                specialDefense: data.stats[4].base_stat,
                speed: data.stats[5].base_stat,
            };
            const totalStats = Object.values(baseStats).reduce((a, b) => a + b, 0);

            return fetch(urlSpeciesBase + data.id)
                .then(response => response.json())
                .then(speciesData => {
                    const description = speciesData.flavor_text_entries
                        .find(entry => entry.language.name === 'es').flavor_text.replace(/\\n/g, ' ');
                    const pvpTier = getPvpTier(data.id);
                    const evYield = getEvYield(data.id);
                    const eggGroup = speciesData.egg_groups.map(group => group.name).join(', ');

                    // Obtener movimientos
                    const movesDataPromises = data.moves.map(move => {
                        return fetch(urlMoveBase + move.move.name)
                            .then(response => response.json());
                    });

                    Promise.all(movesDataPromises).then(movesData => {
                        const movesDetails = movesData.map(move => {
                            const moveId = move.id;
                            const moveLink = `<a href="https://pokemondb.net/move/${move.name}" target="_blank">${move.name.charAt(0).toUpperCase() + move.name.slice(1)} (#${moveId})</a>`;
                            return `
                                <div class="move">
                                    <span>${moveLink}</span>
                                    <span>${move.type.name}</span>
                                    <span>${move.accuracy || 'N/A'}</span>
                                    <span>${move.pp}</span>
                                    <span>${move.power || 'N/A'}</span>
                                </div>
                            `;
                        }).join('');

                        // Obtener línea de evolución
                        const evolutionChainUrl = speciesData.evolution_chain.url;
                        fetch(evolutionChainUrl)
                            .then(evolutionResponse => evolutionResponse.json())
                            .then(evolutionData => {
                                const evolutionDetails = [];
                                const getEvolutionDetails = (chain) => {
                                    const evolutionName = chain.species.name;
                                    const evolutionId = chain.species.url.split('/')[6]; // Obtener el ID de la especie
                                    const evolutionLevel = chain.evolution_details.length > 0 ? chain.evolution_details[0].min_level : 'N/A';
                                    const evolutionLink = `<a href="https://pokemondb.net/pokedex/${evolutionId}" target="_blank">${evolutionName.charAt(0).toUpperCase() + evolutionName.slice(1)} (#${evolutionId})</a>`;
                                    evolutionDetails.push(`${evolutionLink} (Nivel: ${evolutionLevel})`);
                                    if (chain.evolves_to.length > 0) {
                                        chain.evolves_to.forEach(getEvolutionDetails);
                                    }
                                };
                                getEvolutionDetails(evolutionData.chain);

                                const evolutionLine = evolutionDetails.join(' - ');

                                div.innerHTML = `
                                    <div class="summary">
                                        <img src="${data.sprites.front_default}" alt="${data.name}">
                                        <div class="details">
                                            <div class="header">Resumen</div>
                                            <div class="info-box"><strong>ID:</strong> <span>${data.id}</span></div>
                                            <div class="info-box"><strong>Nombre:</strong> <span>${data.name.charAt(0).toUpperCase() + data.name.slice(1)}</span></div>
                                            <div class="info-box"><strong>Tipo:</strong> <span>${types.join(', ')}</span></div>
                                            <div class="info-box"><strong>Debilidades:</strong> <span>${weaknesses.join(', ') || 'N/A'}</span></div>
                                            <div class="info-box"><strong>Descripción:</strong> <span>${description}</span></div>
                                            <div class="info-box"><strong>Habilidades:</strong> <span>${abilities}</span></div>
                                            <div class="info-box"><strong>PvP Tier:</strong> <span>${pvpTier}</span></div>
                                            <div class="info-box"><strong>EV Yield:</strong> <span>HP: ${evYield.hp}, Ataque: ${evYield.attack}, Defensa: ${evYield.defense}, Ataque Especial: ${evYield.specialAttack}, Defensa Especial: ${evYield.specialDefense}, Velocidad: ${evYield.speed}</span></div>
                                            <div class="info-box"><strong>Grupo Huevo:</strong> <span>${eggGroup}</span></div>
                                            <div class="info-box"><strong>Altura:</strong> <span>${height} m</span></div>
                                        </div>
                                    </div>
                                    <div class="header">Movimientos</div>
                                    ${movesDetails}
                                    <div class="header">Estado Base</div>
                                    <div class="base-status">
                                        <canvas id="baseStatsChart"></canvas>
                                        <div class="info-box"><strong>HP:</strong> ${baseStats.hp} <span class="description">La cantidad de puntos de salud del Pokémon.</span></div>
                                        <div class="info-box"><strong>Ataque:</strong> ${baseStats.attack} <span class="description">Determina el daño de los ataques físicos.</span></div>
                                        <div class="info-box"><strong>Defensa:</strong> ${baseStats.defense} <span class="description">Reduce el daño de los ataques físicos recibidos.</span></div>
                                        <div class="info-box"><strong>SP Ataque:</strong> ${baseStats.specialAttack} <span class="description">Determina el daño de los ataques especiales.</span></div>
                                        <div class="info-box"><strong>SP Defensa:</strong> ${baseStats.specialDefense} <span class="description">Reduce el daño de los ataques especiales recibidos.</span></div>
                                        <div class="info-box"><strong>Velocidad:</strong> ${baseStats.speed} <span class="description">Determina el orden de ataque en combate.</span></div>
                                        <div class="info-box"><strong>Total:</strong> ${totalStats} <span class="description">La suma de todas las estadísticas base.</span></div>
                                    </div>
                                    <div class="header">Línea de Evolución</div>
                                    <div class="evolution-line">
                                        ${evolutionLine}
                                    </div>
                                `;
                                pokemonList.appendChild(div);

                                // Crear gráfica de estadísticas base
                                const ctx = document.getElementById('baseStatsChart').getContext('2d');
                                const baseStatsChart = new Chart(ctx, {
                                    type: 'bar',
                                    data: {
                                        labels: ['HP', 'Ataque', 'Defensa', 'SP Ataque', 'SP Defensa', 'Velocidad', 'Total'],
                                        datasets: [{
                                            label: 'Estadísticas Base',
                                            data: [baseStats.hp, baseStats.attack, baseStats.defense, baseStats.specialAttack, baseStats.specialDefense, baseStats.speed, totalStats],
                                            backgroundColor: [
                                                'rgba(255, 99, 132, 0.2)',
                                                'rgba(54, 162, 235, 0.2)',
                                                'rgba(255, 206, 86, 0.2)',
                                                'rgba(75, 192, 192, 0.2)',
                                                'rgba(153, 102, 255, 0.2)',
                                                'rgba(255, 159, 64, 0.2)',
                                                'rgba(255, 206, 86, 0.2)',
                                            ],
                                            borderColor: [
                                                'rgba(255, 99, 132, 1)',
                                                'rgba(54, 162, 235, 1)',
                                                'rgba(255, 206, 86, 1)',
                                                'rgba(75, 192, 192, 1)',
                                                'rgba(153, 102, 255, 1)',
                                                'rgba(255, 159, 64, 1)',
                                                'rgba(255, 206, 86, 1)',
                                            ],
                                            borderWidth: 1,
                                            barPercentage: 0.6,
                                        }]
                                    },
                                    options: {
                                        scales: {
                                            y: {
                                                beginAtZero: true
                                            }
                                        },
                                        plugins: {
                                            tooltip: {
                                                callbacks: {
                                                    label: function(tooltipItem) {
                                                        return `${tooltipItem.label}: ${tooltipItem.raw}`;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                });
                            });
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
    document.getElementById('pokemonInput').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchPokemon();
        }
    });