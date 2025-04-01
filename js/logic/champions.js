import { distance } from './utils.js';
import { CHAMPION_CONFIG } from '../config/champion_config.js';
import { getChampionControls } from './input.js';
import { isOnLane } from './map.js';
import { TEAMS } from './teams.js';
import { pushNotification } from '../ui.js';

export class Champion {
    constructor(team, x, y, isAI = false) {
        this.team = team;
        this.x = x;
        this.y = y;
        this.isAI = isAI;
        this.teamId = team.id;
        this.level = 1;
        this.xp = 0;
        this.alive = true;
        this.respawnTime = 0;
        this.lastAttack = 0;
        this.facing = 'right';
        this.applyStats();
    }

    applyStats() {
        this.maxHp = CHAMPION_CONFIG.maxHp + (this.level - 1) * CHAMPION_CONFIG.levelUp.hp;
        this.hp = this.maxHp;
        this.dmg = CHAMPION_CONFIG.damage + (this.level - 1) * CHAMPION_CONFIG.levelUp.damage;
        this.range = CHAMPION_CONFIG.attackRange + (this.level - 1) * CHAMPION_CONFIG.levelUp.range;
        this.speed = CHAMPION_CONFIG.speed + (this.level - 1) * CHAMPION_CONFIG.levelUp.speed;
        this.cooldown = CHAMPION_CONFIG.cooldown;
        this.collisionRadius = CHAMPION_CONFIG.collisionRadius;
    }

    update(game, controls) {
        if (!this.alive) {
            if (Date.now() >= this.respawnTime) this.respawn(game);
            return;
        }

        // === FACING ===
        if (controls.dx > 0) this.facing = 'right';
        else if (controls.dx < 0) this.facing = 'left';

        moveChampionSmartly(this, controls, game, game.champions);
        this.updateCombat(game, controls);

        const base = game.teams[this.team.id].base;
        if (this.x >= base.x && this.x <= base.x + base.width &&
            this.y >= base.y && this.y <= base.y + base.height) {
            this.hp = Math.min(this.hp + base.healingRate, this.maxHp);
        }
    }

    updateCombat(game, controls) {
        const { clickedTarget } = game;
        const enemies = game.getEnemyUnits(this.teamId).filter(e => e.hp > 0);
        const enemyTeam = this.teamId === TEAMS.BURGER_BARN.id ? game.teams[TEAMS.TACO_TRUCK.id] : game.teams[TEAMS.BURGER_BARN.id];
        const towersRemaining = [enemyTeam.outerTower, enemyTeam.innerTower].some(tower => !tower.isDestroyed);
        const validTargets = enemies.filter(target => {
            if (target.type === 'base' && towersRemaining) return false;
            return true;
        });

        let target = null;
        if (clickedTarget && clickedTarget.hp > 0 && validTargets.some(e => e === clickedTarget)) {
            target = clickedTarget;
        } else {
            target = validTargets.reduce((closest, e) => {
                const d = getEntityDistance(this, e);
                return d < closest.dist ? { entity: e, dist: d } : closest;
            }, { entity: null, dist: Infinity }).entity;
        }

        if (!target) return;

        const dist = getEntityDistance(this, target);
        const now = Date.now();

        if (dist <= this.range && now - this.lastAttack >= this.cooldown) {
            target.hp -= this.dmg;
            this.lastAttack = now;
            this.gainXp(this.dmg, game);
        } else if (clickedTarget === target && dist > this.range && (!controls.dx && !controls.dy)) {
            moveChampionTowardsTarget(this, target, game, game.champions);
        }
    }

    gainXp(amount, game) {
        this.xp += amount;
        const needed = CHAMPION_CONFIG.xpNeeded[this.level];
        if (needed && this.xp >= needed) {
            this.level++;
            this.applyStats();
            pushNotification(`${this.teamId === 'burgerBarn' ? "Burger" : "Taco"} Champion achieved Level ${this.level}!`, "topNotifications");
            window.showNotification(`Level ${this.level}! Stats increased`);
        }
    }

    die() {
        this.alive = false;
        pushNotification(`${this.teamId === 'burgerBarn' ? "Burger" : "Taco"} Champion was killed!`, "topNotifications");
        this.respawnTime = Date.now() + CHAMPION_CONFIG.respawnDelay;
    }

    respawn(game) {
        this.alive = true;
        this.xp = 0;
        this.level = 1;
        this.applyStats();
        const base = game.teams[this.teamId].base;
        this.x = base.x + base.width / 2;
        this.y = base.y + base.height / 2;
    }
}

// === UTILS ===

function getEntityDistance(champ, target) {
    if (target.collisionRadius) {
        return distance(champ, target) - target.collisionRadius;
    } else if (target.width && target.height) {
        const closestX = Math.max(target.x, Math.min(champ.x, target.x + target.width));
        const closestY = Math.max(target.y, Math.min(champ.y, target.y + target.height));
        return distance(champ, { x: closestX, y: closestY });
    } else {
        return distance(champ, target);
    }
}

function collidesWithOtherChampion(champ, champions, tx, ty) {
    return champions.some(other =>
        other !== champ &&
        other.alive &&
        distance({ x: tx, y: ty }, other) < (champ.collisionRadius + other.collisionRadius)
    );
}

function moveChampionSmartly(champ, controls, game, champions) {
    const { dx, dy } = controls;
    if (!dx && !dy) return;

    const step = champ.speed;
    const radius = champ.collisionRadius;
    const epsilon = 0.5;

    const isFree = (x, y) => {
        return !game.checkCollision(x, y, radius - epsilon, champ.teamId) &&
            !collidesWithOtherChampion(champ, champions, x, y) &&
            isOnLane(x, y);
    };

    const tryMove = (offsetX, offsetY) => {
        const tx = champ.x + offsetX * step;
        const ty = champ.y + offsetY * step;
        if (isFree(tx, ty)) {
            champ.x = tx;
            champ.y = ty;
            return true;
        }
        return false;
    };

    if (tryMove(dx, dy)) return;
    if (dx && tryMove(dx, 0)) return;
    if (dy && tryMove(0, dy)) return;
}

function moveChampionTowardsTarget(champ, target, game, champions) {
    const angle = Math.atan2(target.y - champ.y, target.x - champ.x);
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const controls = { dx, dy };
    moveChampionSmartly(champ, controls, game, champions);
}
