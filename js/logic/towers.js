// js/logic/towers.js
import { distance } from './utils.js';
import { TOWER_CONFIG } from '../config/tower_config.js';
import { Champion } from './champions.js'; // for instanceof
import { pushNotification } from '../ui.js';  // Added for notifications

export function updateTowers(teams, suddenDeath, champions) {
  const currentTime = Date.now();
  const dmgMultiplier = suddenDeath ? 2 : 1;

  Object.values(teams).forEach(team => {
    // Check each tower for destruction and update score
    ['innerTower', 'outerTower'].forEach(towerKey => {
      const tower = team[towerKey];
      if (!tower) return;
      if (tower.hp <= 0 && !tower.isDestroyed) {
        tower.isDestroyed = true;
        // If the tower belongs to burgerBarn, then the message is "Burger Tower was destroyed!"
        // Otherwise, "Taco Tower was destroyed!"
        if (team.id === 'burgerBarn') {
          pushNotification("Burger Tower was destroyed!", "topNotifications");
        } else {
          pushNotification("Taco Tower was destroyed!", "topNotifications");
        }
        const opponentId = team.id === 'burgerBarn' ? 'tacoTruck' : 'burgerBarn';
        teams[opponentId].towerDestroyed = (teams[opponentId].towerDestroyed || 0) + 1;
      }
    });

    const enemyTeam = team.id === teams.burgerBarn.id ? teams.tacoTruck : teams.burgerBarn;

    ['innerTower', 'outerTower'].forEach(towerKey => {
      const tower = team[towerKey];
      if (tower.isDestroyed) return;

      tower.lastAttack = tower.lastAttack || 0;
      if (currentTime - tower.lastAttack >= TOWER_CONFIG.cooldown) {
        const target = findClosestTarget(
          tower,
          enemyTeam.minions,
          champions.filter(c => c.team.id === enemyTeam.id && c.alive)
        );
        if (target) {
          fireProjectile(tower, target, enemyTeam, dmgMultiplier);
          tower.lastAttack = currentTime;
        }
      }
    });
  });
}

function findClosestTarget(tower, enemyMinions, enemyChampions) {
  const targetsInRange = [
    ...enemyMinions.filter(m => m.hp > 0),
    ...enemyChampions.filter(ch => ch.alive)
  ].filter(entity => distance(tower, entity) <= TOWER_CONFIG.range);

  if (!targetsInRange.length) return null;
  return targetsInRange.reduce((closest, entity) => {
    const d = distance(tower, entity);
    return d < closest.distance ? { target: entity, distance: d } : closest;
  }, { distance: Infinity }).target;
}

function fireProjectile(tower, target, enemyTeam, dmgMultiplier) {
  const projectile = {
    startX: tower.x + tower.width / 2,
    startY: tower.y + tower.height / 2,
    target,
    startTime: Date.now(),
    dmg: TOWER_CONFIG.damage * dmgMultiplier,
    travelTime: TOWER_CONFIG.projectileTravelTime,
    enemyTeam
  };

  enemyTeam.projectiles = enemyTeam.projectiles || [];
  enemyTeam.projectiles.push(projectile);
}

export function updateProjectiles(teams) {
  const currentTime = Date.now();
  Object.values(teams).forEach(team => {
    if (!team.projectiles) return;
    team.projectiles.forEach((proj, idx) => {
      if (currentTime - proj.startTime >= proj.travelTime) {
        if (proj.target.hp > 0) {
          proj.target.hp -= proj.dmg;
          if (proj.target.hp <= 0) {
            proj.target.hp = 0;
            if (proj.target instanceof Champion) {
              proj.target.die();
            }
          }
        }
        team.projectiles.splice(idx, 1);
      }
    });
  });
}
