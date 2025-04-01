export const CHAMPION_CONFIG = {
    maxHp: 100,
    damage: 15,
    attackRange: 100,      // 50 pixels
    cooldown: 1000,       // milliseconds between auto‑attacks
    speed: 2.5,           // movement speed (pixels per frame) 1.5
    respawnDelay: 20000,  // ms before respawn
    collisionRadius: 24,   // matches the drawn circle radius

    // XP needed per level (levels 1→2, 2→3)
    xpNeeded: {
        1: 100,
        2: 250,
        3: 500
    },

    // Stat increases on level up
    levelUp: {
        hp: 30,
        damage: 5,
        range: 2,
        speed: 0.1
    }
};
