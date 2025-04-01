export const TEAMS = {
    BURGER_BARN: { id: 'burgerBarn', color: 'blue' },
    TACO_TRUCK: { id: 'tacoTruck', color: 'red' }
};

export function createTeams() {
    return {
        [TEAMS.BURGER_BARN.id]: {
            ...TEAMS.BURGER_BARN,
            base: { type: 'base', hp: 200, maxHp: 200, x: 50, y: 830, width: 200, height: 200, isDestroyed: false, healingRate: 0.5  },
            innerTower: { type: 'tower', hp: 100, maxHp: 100, x: 300, y: 620, width: 100, height: 100, isDestroyed: false },
            outerTower: { type: 'tower', hp: 100, maxHp: 100, x: 760, y: 760, width: 100, height: 100, isDestroyed: false },
            minions: [],
            projectiles: []
        },
        [TEAMS.TACO_TRUCK.id]: {
            ...TEAMS.TACO_TRUCK,
            base: { type: 'base', hp: 200, maxHp: 200, x: 1670, y: 50, width: 200, height: 200, isDestroyed: false, healingRate: 0.5  },
            innerTower: { type: 'tower', hp: 100, maxHp: 100, x: 1520, y: 380, width: 100, height: 100, isDestroyed: false },
            outerTower: { type: 'tower', hp: 100, maxHp: 100, x: 1070, y: 200, width: 100, height: 100, isDestroyed: false },
            minions: [],
            projectiles: []
        }
    };
}
