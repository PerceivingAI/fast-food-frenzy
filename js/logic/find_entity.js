// find_entity.js
export function findEntityAt(x, y, teams, champions) {
    const enemies = [
        ...teams.tacoTruck.minions,
        ...champions.filter(c => c.team.id === teams.tacoTruck.id && c.alive),
        teams.tacoTruck.outerTower,
        teams.tacoTruck.innerTower,
        teams.tacoTruck.base
    ];

    return enemies.find(entity => (
        x >= entity.x && x <= entity.x + (entity.width || 20) &&
        y >= entity.y && y <= entity.y + (entity.height || 20) &&
        entity.hp > 0
    )) || null;
}
