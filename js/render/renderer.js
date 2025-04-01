import { drawMap } from './drawMap.js';
import { drawUnits } from './drawUnits.js';
import { drawProjectiles } from './drawProjectiles.js';
import { drawChampions } from './drawChampions.js';

export function initRenderer(ctx, game) {
    function render(gameOver = false, winner = '') {
        ctx.clearRect(0, 0, 1920, 1080);
        drawMap(ctx, game.teams, gameOver, winner);
        drawUnits(ctx, game.teams);
        drawProjectiles(ctx, game.teams);
        drawChampions(ctx, game.champions);  // champions is always an array now
    }
    return { render };
}
