// js/logic/minions.js
import { lane } from './map.js';
import { distance } from './utils.js';
import { MINION_CONFIG } from '../config/minion_config.js';
import { pushNotification } from '../ui.js';  // Import the notification function

export function spawnMinions(teams) {
    const MINION_RADIUS = 25; // Example value

    const burgerBaseCenter = { x: teams.burgerBarn.base.x + 100, y: teams.burgerBarn.base.y + 120 };
    teams.burgerBarn.minions.push(
        { type: 'minion', hp: MINION_CONFIG.maxHp, maxHp: MINION_CONFIG.maxHp, dmg: MINION_CONFIG.damage, x: burgerBaseCenter.x, y: burgerBaseCenter.y, speed: MINION_CONFIG.speed, collisionRadius: MINION_RADIUS, targetReached: false, lastAttack: 0, team: teams.burgerBarn },
        { type: 'minion', hp: MINION_CONFIG.maxHp, maxHp: MINION_CONFIG.maxHp, dmg: MINION_CONFIG.damage, x: burgerBaseCenter.x + 40, y: burgerBaseCenter.y - 70, speed: MINION_CONFIG.speed, collisionRadius: MINION_RADIUS, targetReached: false, lastAttack: 0, team: teams.burgerBarn },
        { type: 'minion', hp: MINION_CONFIG.maxHp, maxHp: MINION_CONFIG.maxHp, dmg: MINION_CONFIG.damage, x: burgerBaseCenter.x - 40, y: burgerBaseCenter.y - 70, speed: MINION_CONFIG.speed, collisionRadius: MINION_RADIUS, targetReached: false, lastAttack: 0, team: teams.burgerBarn }
    );
    // Notify for burgerBarn arrival
    pushNotification("The Tendies Crew has arrived!", "topNotifications");

    const tacoBaseCenter = { x: teams.tacoTruck.base.x + 100, y: teams.tacoTruck.base.y + 60 };
    teams.tacoTruck.minions.push(
        { type: 'minion', hp: MINION_CONFIG.maxHp, maxHp: MINION_CONFIG.maxHp, dmg: MINION_CONFIG.damage, x: tacoBaseCenter.x, y: tacoBaseCenter.y, speed: MINION_CONFIG.speed, collisionRadius: MINION_RADIUS, targetReached: false, lastAttack: 0, team: teams.tacoTruck },
        { type: 'minion', hp: MINION_CONFIG.maxHp, maxHp: MINION_CONFIG.maxHp, dmg: MINION_CONFIG.damage, x: tacoBaseCenter.x - 40, y: tacoBaseCenter.y + 70, speed: MINION_CONFIG.speed, collisionRadius: MINION_RADIUS, targetReached: false, lastAttack: 0, team: teams.tacoTruck },
        { type: 'minion', hp: MINION_CONFIG.maxHp, maxHp: MINION_CONFIG.maxHp, dmg: MINION_CONFIG.damage, x: tacoBaseCenter.x + 40, y: tacoBaseCenter.y + 70, speed: MINION_CONFIG.speed, collisionRadius: MINION_RADIUS, targetReached: false, lastAttack: 0, team: teams.tacoTruck }
    );
    // Notify for tacoTruck arrival
    pushNotification("The Nacho Crew has arrived!", "topNotifications");
}

export function updateMinions(teams, suddenDeath, champions) {
    const dmgMultiplier = suddenDeath ? 2 : 1;

    function getClosestTarget(minion, enemyMinions, enemyBuildings, enemyChampions) {
        const targets = [
            ...enemyMinions.filter(m => m.hp > 0),
            ...enemyBuildings.filter(b => !b.isDestroyed),
            ...enemyChampions.filter(c => c.alive)
        ];
        if (!targets.length) return null;
        return targets.reduce((closest, t) => {
            const tx = t.x + ((t.width || 0) / 2);
            const ty = t.y + ((t.height || 0) / 2);
            const d = distance(minion, { x: tx, y: ty });
            return d < (closest.dist || Infinity) ? { target: t, dist: d } : closest;
        }, {}).target;
    }

    function getDirection(src, dest) {
        const dx = dest.x - src.x;
        const dy = dest.y - src.y;
        const mag = Math.hypot(dx, dy);
        return { x: dx / mag, y: dy / mag };
    }

    // Computes a normalized steering vector that blends target seeking with repulsion from obstacles.
    function computeSteeringVector(minion, targetPos, obstacles) {
        // Desired vector: direction toward the target.
        let desired = { x: targetPos.x - minion.x, y: targetPos.y - minion.y };
        let desiredMag = Math.hypot(desired.x, desired.y);
        if (desiredMag > 0) {
            desired.x /= desiredMag;
            desired.y /= desiredMag;
        }
        // Repulsion vector: sum contributions from each obstacle.
        let repulsion = { x: 0, y: 0 };
        obstacles.forEach(obs => {
            let avoidanceRadius = 50; // default
            if (obs.type === 'tower') {
                avoidanceRadius = 100;
            } else if (obs.type === 'champion') {
                avoidanceRadius = 70;
            }
            const dx = minion.x - obs.x;
            const dy = minion.y - obs.y;
            const dist = Math.hypot(dx, dy);
            if (dist < avoidanceRadius && dist > 0) {
                const strength = (avoidanceRadius - dist) / avoidanceRadius;
                repulsion.x += (dx / dist) * strength;
                repulsion.y += (dy / dist) * strength;
            }
        });
        // Combine desired and repulsion.
        const repulsionWeight = 1.0;
        let steering = {
            x: desired.x + repulsion.x * repulsionWeight,
            y: desired.y + repulsion.y * repulsionWeight
        };
        let steerMag = Math.hypot(steering.x, steering.y);
        if (steerMag > 0) {
            steering.x /= steerMag;
            steering.y /= steerMag;
        }
        return steering;
    }

    // Use continuous steering instead of discrete candidate offsets.
    function handleMovement(friendly, enemy, enemyBuildings, enemyChampions) {
        friendly.forEach(minion => {
            if (minion.hp <= 0) return;

            const target = getClosestTarget(minion, enemy, enemyBuildings, enemyChampions);
            if (!target) return;

            const targetPos = {
                x: target.x + ((target.width || 0) / 2),
                y: target.y + ((target.height || 0) / 2)
            };
            const dist = distance(minion, targetPos);
            const targetRadius = target.width
                ? Math.max(target.width, target.height) / 2
                : (target.collisionRadius || 0);

            // If within attack range, attack.
            if (dist <= MINION_CONFIG.attackRange + targetRadius) {
                if (Date.now() - minion.lastAttack >= MINION_CONFIG.cooldown) {
                    target.hp -= minion.dmg * dmgMultiplier;
                    minion.lastAttack = Date.now();
                    if (target.hp <= 0 && target.die) {
                        target.die();
                    }
                }
                return;
            }

            // Define obstacles for avoidance.
            let obstacles = [];
            const team = minion.team;
            if (team.outerTower) {
                obstacles.push({
                    x: team.outerTower.x + team.outerTower.width / 2,
                    y: team.outerTower.y + team.outerTower.height / 2,
                    type: 'tower'
                });
            }
            if (team.innerTower) {
                obstacles.push({
                    x: team.innerTower.x + team.innerTower.width / 2,
                    y: team.innerTower.y + team.innerTower.height / 2,
                    type: 'tower'
                });
            }
            champions.forEach(ch => {
                if (ch.alive && ch.team.id === minion.team.id) {
                    obstacles.push({ x: ch.x, y: ch.y, type: 'champion' });
                }
            });

            const steering = computeSteeringVector(minion, targetPos, obstacles);
            minion.x += steering.x * MINION_CONFIG.speed;
            minion.y += steering.y * MINION_CONFIG.speed;
        });

        for (let i = enemy.length - 1; i >= 0; i--) {
            if (enemy[i].hp <= 0) enemy.splice(i, 1);
        }
    }

    handleMovement(
        teams.burgerBarn.minions,
        teams.tacoTruck.minions,
        [teams.tacoTruck.outerTower, teams.tacoTruck.innerTower, teams.tacoTruck.base],
        champions.filter(ch => ch.team.id === 'tacoTruck')
    );

    handleMovement(
        teams.tacoTruck.minions,
        teams.burgerBarn.minions,
        [teams.burgerBarn.outerTower, teams.burgerBarn.innerTower, teams.burgerBarn.base],
        champions.filter(ch => ch.team.id === 'burgerBarn')
    );
}
