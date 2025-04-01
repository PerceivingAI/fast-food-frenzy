export const CHAMPION_CONFIG = {
    maxHp: 200,              // Durable enough for duels
    damage: 20,              // Strong, but not 2-shotting minions
    attackRange: 80,         // Slightly less to make positioning matter
    cooldown: 1200,          // Slower attacks (1.2s), more readable fights
    speed: 2.5,              // Not too fast, allows reaction time
    respawnDelay: 10000,     // Shorter respawn for faster rounds
    collisionRadius: 24,     // Keep as is

    xpNeeded: {
        1: 150,
        2: 350,
        3: 600
    },

    levelUp: {
        hp: 40,              // Makes levels impactful
        damage: 5,
        range: 5,
        speed: 0.15
    }
};
