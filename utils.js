// Funciones de Utilidad
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
