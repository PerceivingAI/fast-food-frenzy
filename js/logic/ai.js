import { distance } from './utils.js';
import { MINION_CONFIG } from '../config/minion_config.js';

// Adjustable waiting position for AI Champion
const AI_WAIT_POSITION = { x: 1300, y: 350 };
const AI_WAIT_RADIUS = 10;

// Main AI logic
export function getAIChampionControls(champ, teams, champions) {
    const enemyTeam = champ.team.id === 'burgerBarn' ? teams.tacoTruck : teams.burgerBarn;
    const allyMinions = champ.team.minions;
    const base = teams[champ.team.id].base;

    // If health is 20% or lower, return a vector pointing to the base center.
    if (champ.hp <= 0.2 * champ.maxHp) {
        const baseCenter = { x: base.x + base.width / 2, y: base.y + base.height / 2 };
        const dx = baseCenter.x - champ.x;
        const dy = baseCenter.y - champ.y;
        const dist = Math.hypot(dx, dy);
        return dist > 0 ? { dx: dx / dist, dy: dy / dist } : { dx: 0, dy: 0 };
    }
    
    // If champion is inside its base and not healed to 70%, stay put.
    if (
        champ.x >= base.x &&
        champ.x <= base.x + base.width &&
        champ.y >= base.y &&
        champ.y <= base.y + base.height &&
        champ.hp < 0.7 * champ.maxHp
    ) {
        return { dx: 0, dy: 0 };
    }

    // --- Step 1: Go to waiting position ---
    if (!champ.hasReachedWait) {
        const dx = AI_WAIT_POSITION.x - champ.x;
        const dy = AI_WAIT_POSITION.y - champ.y;
        const dist = Math.hypot(dx, dy);
        if (dist > AI_WAIT_RADIUS) {
            return { dx: dx / dist, dy: dy / dist };
        } else {
            champ.hasReachedWait = true;
        }
    }
    
    // --- Step 2: Find valid targets ---
    const allTargets = [
        ...enemyTeam.minions,
        enemyTeam.outerTower,
        enemyTeam.innerTower,
        enemyTeam.base,
        ...champions.filter(c => c.team.id !== champ.team.id && c.alive)
    ].filter(target => target.hp > 0 && (!target.isDestroyed));
    
    if (!allTargets.length) return { dx: 0, dy: 0 };
    
    const nearest = allTargets.reduce((closest, target) => {
        const tx = target.x + (target.width || 0) / 2;
        const ty = target.y + (target.height || 0) / 2;
        const d = distance(champ, { x: tx, y: ty });
        return d < closest.dist ? { target, dist: d } : closest;
    }, { target: null, dist: Infinity }).target;
    
    if (!nearest) return { dx: 0, dy: 0 };
    
    // --- Step 3: Engagement Rule ---
    const under20Target = nearest.hp <= 0.2 * (nearest.maxHp || 1);
    const allyEngaged = allyMinions.some(minion => Date.now() - minion.lastAttack <= MINION_CONFIG.cooldown);
    
    if (!under20Target && !allyEngaged) {
        // Return to waiting position if no valid reason to engage
        const dx = AI_WAIT_POSITION.x - champ.x;
        const dy = AI_WAIT_POSITION.y - champ.y;
        const dist = Math.hypot(dx, dy);
        if (dist > AI_WAIT_RADIUS) {
            return { dx: dx / dist, dy: dy / dist };
        } else {
            return { dx: 0, dy: 0 };
        }
    }
    
    // --- Step 4: Anti-sticking behavior ---
    const tooClose = allyMinions.find(m => distance(champ, m) < 40);
    if (tooClose) {
        return { dx: 0.5 * Math.sign(Math.random() - 0.5), dy: 0 };
    }
    
    // --- Step 5: Move towards target ---
    const tx = nearest.x + (nearest.width || 0) / 2;
    const ty = nearest.y + (nearest.height || 0) / 2;
    const distToTarget = distance(champ, { x: tx, y: ty });
    
    return distToTarget <= champ.range
        ? { dx: 0, dy: 0 }
        : { dx: (tx - champ.x) / distToTarget, dy: (ty - champ.y) / distToTarget };
}
