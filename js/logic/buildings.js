export function updateBuildings(teams, suddenDeath) {
    Object.values(teams).forEach(team => {
        ['innerTower', 'outerTower', 'base'].forEach(buildingKey => {
            const building = team[buildingKey];
            if (building.hp <= 0 && !building.isDestroyed) {
                building.isDestroyed = true;
                building.hp = 0;
            }
        });

        // Cleanup projectiles
        if (team.projectiles) {
            team.projectiles = team.projectiles.filter(proj => proj.target.hp > 0);
        }
    });
}
