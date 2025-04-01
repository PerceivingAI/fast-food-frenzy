import { createTeams } from './teams.js';
import { spawnMinions, updateMinions } from './minions.js';
import { updateBuildings } from './buildings.js';
import { updateTowers, updateProjectiles } from './towers.js';
import { Champion } from './champions.js';
import { getAIChampionControls } from './ai.js';
import { getChampionControls } from './input.js';

export function initGame(mode = 'vsPC') {
    const teams = createTeams();
    const initialSpawnDelay = 5000;
    const spawnInterval = 30000;
    let lastSpawn = Date.now() - spawnInterval + initialSpawnDelay;
    const suddenDeathTime = 300000;
    let suddenDeath = false;
    const startTime = Date.now();

    const champions = [
        new Champion(teams.burgerBarn, teams.burgerBarn.base.x + 100, teams.burgerBarn.base.y + 100, false),
        new Champion(teams.tacoTruck, teams.tacoTruck.base.x + 100, teams.tacoTruck.base.y + 100, mode === 'vsPC')
    ];

    let clickedTarget = null;

    function findEntityAt(x, y) {
        const targets = [
            ...teams.burgerBarn.minions,
            ...teams.tacoTruck.minions,
            ...champions.filter(c => c.alive),
            teams.burgerBarn.outerTower,
            teams.burgerBarn.innerTower,
            teams.burgerBarn.base,
            teams.tacoTruck.outerTower,
            teams.tacoTruck.innerTower,
            teams.tacoTruck.base
        ];
    
        return targets.find(entity => {
            if (entity.collisionRadius) {
                const centerX = entity.x;
                const centerY = entity.y;
                const dx = centerX - x;
                const dy = centerY - y;
                return dx * dx + dy * dy <= entity.collisionRadius * entity.collisionRadius;
            } else if (entity.width && entity.height) {
                return (
                    x >= entity.x &&
                    x <= entity.x + entity.width &&
                    y >= entity.y &&
                    y <= entity.y + entity.height
                );
            }
            return false;
        }) || null;
    }
    
    function updateClickedTarget() {
        if (window.clearTarget) {
            clickedTarget = null;
            window.clearTarget = false;
            return;
        }
        if (window.clickedTarget) {
            const { x, y } = window.clickedTarget;
            clickedTarget = findEntityAt(x, y);
            window.clickedTarget = null;
        }
    }

    function update() {
        const now = Date.now();

        updateClickedTarget();

        if (now - lastSpawn >= spawnInterval) {
            spawnMinions(teams);
            lastSpawn = now;
        }

        if (!suddenDeath && (now - startTime) >= suddenDeathTime) {
            suddenDeath = true;
            console.log("Sudden death activated: Double damage!");
        }

        updateMinions(teams, suddenDeath, champions);
        updateTowers(teams, suddenDeath, champions);
        updateProjectiles(teams);
        updateBuildings(teams, suddenDeath);

        champions.forEach(ch => {
            const controls = ch.isAI
                ? getAIChampionControls(ch, teams, champions)
                : getChampionControls(ch.team.id);

            ch.update({ teams, getEnemyUnits, checkCollision, clickedTarget, champions }, controls); // FIXED
        });
    }

    function getEnemyUnits(teamId) {
        const enemy = teamId === teams.burgerBarn.id ? teams.tacoTruck : teams.burgerBarn;
        return [
            ...enemy.minions,
            enemy.outerTower,
            enemy.innerTower,
            enemy.base,
            ...champions.filter(c => c.team.id !== teamId && c.alive)
        ];
    }

    function checkCollision(x, y, radius, teamId) {
        const allUnits = [...teams.burgerBarn.minions, ...teams.tacoTruck.minions];
        const buildings = [
            teams.burgerBarn.innerTower, teams.burgerBarn.outerTower, teams.burgerBarn.base,
            teams.tacoTruck.innerTower, teams.tacoTruck.outerTower, teams.tacoTruck.base
        ];

        return allUnits.concat(buildings).some(u => {
            if (u.hp <= 0) return false;
            if (u.type === 'base' && u === teams[teamId].base) return false;

            if (u.width && u.height) {
                const closestX = Math.max(u.x, Math.min(x, u.x + u.width));
                const closestY = Math.max(u.y, Math.min(y, u.y + u.height));
                const dx = closestX - x;
                const dy = closestY - y;
                return (dx * dx + dy * dy) < (radius * radius);
            }

            const centerX = u.x + (u.width || 12) / 2;
            const centerY = u.y + (u.height || 12) / 2;
            const entityRadius = (u.width || 12) / 2;
            const distSq = (centerX - x) ** 2 + (centerY - y) ** 2;
            return distSq < (radius + entityRadius) ** 2;
        });
    }

    return { teams, champions, update };
}
