// ✅ Load Images
const tendyImg = new Image();
tendyImg.src = "assets/images/tendy.png";

const nachoImg = new Image();
nachoImg.src = "assets/images/nacho.png";

// ✅ Image Config
const BURGER_MINION_IMAGE = { width: 40, height: 40, offsetX: -10, offsetY: -10 };
const TACO_MINION_IMAGE = { width: 40, height: 40, offsetX: -10, offsetY: -10 };

export function drawUnits(ctx, teams) {
    teams.burgerBarn.minions.forEach(m => {
        // Draw targeting radius if enabled
        if (m.showRadius) {
            ctx.beginPath();
            ctx.arc(m.x + 10, m.y + 10, m.collisionRadius || 100, 0, Math.PI * 2);
            ctx.fillStyle = m.radiusColor || 'rgba(255, 0, 0, 0.3)';
            ctx.fill();
        }

        // Draw Image
        ctx.drawImage(
            tendyImg,
            m.x + BURGER_MINION_IMAGE.offsetX,
            m.y + BURGER_MINION_IMAGE.offsetY,
            BURGER_MINION_IMAGE.width,
            BURGER_MINION_IMAGE.height
        );

        // Draw Shape (50% opacity)
        ctx.fillStyle = "rgba(255, 255, 0, 0)";
        ctx.fillRect(m.x, m.y, 20, 20);

        // HP Bar
        ctx.fillStyle = "black";
        ctx.fillRect(m.x - 2, m.y - 10, 24, 5);
        ctx.fillStyle = "green";
        ctx.fillRect(m.x - 2, m.y - 10, 24 * (m.hp / 100), 5);
    });

    teams.tacoTruck.minions.forEach(m => {
        // Draw targeting radius if enabled
        if (m.showRadius) {
            ctx.beginPath();
            ctx.arc(m.x + 10, m.y + 10, m.collisionRadius || 100, 0, Math.PI * 2);
            ctx.fillStyle = m.radiusColor || 'rgba(255, 0, 0, 0.3)';
            ctx.fill();
        }

        // Draw Image
        ctx.drawImage(
            nachoImg,
            m.x + TACO_MINION_IMAGE.offsetX,
            m.y + TACO_MINION_IMAGE.offsetY,
            TACO_MINION_IMAGE.width,
            TACO_MINION_IMAGE.height
        );

        // Draw Shape (50% opacity)
        ctx.fillStyle = "rgba(255, 165, 0, 0)";
        ctx.fillRect(m.x, m.y, 20, 20);

        // HP Bar
        ctx.fillStyle = "black";
        ctx.fillRect(m.x - 2, m.y - 10, 24, 5);
        ctx.fillStyle = "green";
        ctx.fillRect(m.x - 2, m.y - 10, 24 * (m.hp / 100), 5);
    });
}
