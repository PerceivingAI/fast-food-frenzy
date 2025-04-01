// js/render/drawMap.js
import { lane } from '../logic/map.js';

// ✅ Load Images
const burgerBaseImg = new Image();
burgerBaseImg.src = "assets/images/barn.png";

const tacoBaseImg = new Image();
tacoBaseImg.src = "assets/images/truck.png";

const towerImg = new Image();
towerImg.src = "assets/images/tower.png";

const mapImg = new Image();
mapImg.src = "assets/images/map.png";

// === IMAGE SETTINGS ===

// --- Bases ---
const BURGER_BASE_IMAGE = { width: 250, height: 250, offsetX: -20, offsetY: -40 };
const TACO_BASE_IMAGE = { width: 270, height: 230, offsetX: -40, offsetY: -20 };

// --- Towers ---
const TOWER_IMAGE = { width: 170, height: 170, offsetX: -30, offsetY: -50 };

// --- Map ---
const MAP_IMAGE = { x: -100, y: -270, width: 2320, height: 1780, alpha: 0.5, rotation: 0.27 };

// --- Lane ---
const LANE_ALPHA = 0;

export function drawMap(ctx, teams, gameOver = false, winner = '') {
    // === Draw Background Map ===
    ctx.save();
    ctx.globalAlpha = MAP_IMAGE.alpha;
    ctx.translate(MAP_IMAGE.x + MAP_IMAGE.width / 2, MAP_IMAGE.y + MAP_IMAGE.height / 2);
    ctx.rotate(MAP_IMAGE.rotation);
    ctx.drawImage(
        mapImg,
        -MAP_IMAGE.width / 2,
        -MAP_IMAGE.height / 2,
        MAP_IMAGE.width,
        MAP_IMAGE.height
    );
    ctx.restore();
    ctx.globalAlpha = 1;

    // === Draw Lane ===
    ctx.save();
    ctx.globalAlpha = LANE_ALPHA;
    ctx.strokeStyle = "grey";
    ctx.lineWidth = lane.width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(lane.start.x, lane.start.y);
    ctx.lineTo(lane.end.x, lane.end.y);
    ctx.stroke();
    ctx.restore();

    // === Draw Bases ===
    ctx.drawImage(
        burgerBaseImg,
        teams.burgerBarn.base.x + BURGER_BASE_IMAGE.offsetX,
        teams.burgerBarn.base.y + BURGER_BASE_IMAGE.offsetY,
        BURGER_BASE_IMAGE.width,
        BURGER_BASE_IMAGE.height
    );

    ctx.drawImage(
        tacoBaseImg,
        teams.tacoTruck.base.x + TACO_BASE_IMAGE.offsetX,
        teams.tacoTruck.base.y + TACO_BASE_IMAGE.offsetY,
        TACO_BASE_IMAGE.width,
        TACO_BASE_IMAGE.height
    );

    ctx.fillStyle = "rgba(101, 67, 33, 0)";
    ctx.fillRect(teams.burgerBarn.base.x, teams.burgerBarn.base.y, 200, 200);
    ctx.fillRect(teams.tacoTruck.base.x, teams.tacoTruck.base.y, 200, 200);

    drawHPBar(ctx, teams.burgerBarn.base, 200, 35);
    drawHPBar(ctx, teams.tacoTruck.base, 200, 35);

    // === Draw Towers ===
    ['innerTower', 'outerTower'].forEach(towerKey => {
        Object.values(teams).forEach(team => {
            const tower = team[towerKey];
            if (!tower.isDestroyed) {
                ctx.drawImage(
                    towerImg,
                    tower.x + TOWER_IMAGE.offsetX,
                    tower.y + TOWER_IMAGE.offsetY,
                    TOWER_IMAGE.width,
                    TOWER_IMAGE.height
                );

                ctx.fillStyle = "rgba(101, 67, 33, 0)";
                ctx.fillRect(tower.x, tower.y, tower.width, tower.height);
                drawHPBar(ctx, tower, tower.width, 45);
            }
        });
    });

    // === Game Over Overlay ===
    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, 1920, 1080);
        ctx.fillStyle = "white";
        ctx.font = "bold 48px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${winner} Wins!`, 960, 480);
        ctx.fillStyle = "#444";
        ctx.fillRect(860, 520, 200, 60);
        ctx.fillStyle = "white";
        ctx.font = "bold 30px Arial";
        ctx.fillText("OK", 960, 560);
    }
}

// === HP Bar Helper ===
function drawHPBar(ctx, entity, width, barOffset) {
    const barWidth = width;
    const barHeight = 15;
    ctx.fillStyle = "black";
    ctx.fillRect(entity.x, entity.y - barOffset, barWidth, barHeight);

    ctx.fillStyle = "green";
    ctx.fillRect(entity.x, entity.y - barOffset, barWidth * (entity.hp / entity.maxHp), barHeight);
}
