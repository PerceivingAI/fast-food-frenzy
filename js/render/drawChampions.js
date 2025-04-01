// Load champion images
const burgerBruiserR = new Image();
burgerBruiserR.src = "assets/images/burger-bruiser-R.png";

const burgerBruiserL = new Image();
burgerBruiserL.src = "assets/images/burger-bruiser-L.png";

const tacoTitanR = new Image();
tacoTitanR.src = "assets/images/taco-titan-R.png";

const tacoTitanL = new Image();
tacoTitanL.src = "assets/images/taco-titan-L.png";

export function drawChampions(ctx, champions) {
    champions.forEach(ch => {
        if (!ch.alive) return;

        // --- DEFAULTS ---
        if (ch.facing === undefined) ch.facing = 'right';
        if (ch.imageWidth === undefined) ch.imageWidth = 100;
        if (ch.imageHeight === undefined) ch.imageHeight = 60;
        if (ch.offsetXR === undefined) ch.offsetXR = 17;
        if (ch.offsetYR === undefined) ch.offsetYR = 0;
        if (ch.offsetXL === undefined) ch.offsetXL = -17;
        if (ch.offsetYL === undefined) ch.offsetYL = 0;
        if (ch.imageAlpha === undefined) ch.imageAlpha = 1;

        // --- DRAW TARGETING / POSITION CIRCLE ---
        ctx.globalAlpha = 0;
        ctx.fillStyle = ch.isAI ? 'red' : 'blue';
        ctx.beginPath();
        ctx.arc(ch.x, ch.y, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // --- SELECT SPRITE + OFFSETS ---
        let sprite, offsetX, offsetY;
        if (!ch.isAI) {
            if (ch.facing === 'right') {
                sprite = burgerBruiserR;
                offsetX = ch.offsetXR;
                offsetY = ch.offsetYR;
            } else {
                sprite = burgerBruiserL;
                offsetX = ch.offsetXL;
                offsetY = ch.offsetYL;
            }
        } else {
            if (ch.facing === 'right') {
                sprite = tacoTitanR;
                offsetX = ch.offsetXR;
                offsetY = ch.offsetYR;
            } else {
                sprite = tacoTitanL;
                offsetX = ch.offsetXL;
                offsetY = ch.offsetYL;
            }
        }

        // --- DRAW IMAGE ---
        ctx.globalAlpha = ch.imageAlpha;
        ctx.drawImage(
            sprite,
            ch.x - ch.imageWidth / 2 + offsetX,
            ch.y - ch.imageHeight / 2 + offsetY,
            ch.imageWidth,
            ch.imageHeight
        );
        ctx.globalAlpha = 1;

        // --- HP BAR ---
        const barWidth = 48;
        const barHeight = 6;
        const barX = ch.x - barWidth / 2;
        const barY = ch.y - ch.imageHeight / 2 - 10;

        ctx.fillStyle = 'black';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = 'green';
        ctx.fillRect(barX, barY, barWidth * (ch.hp / ch.maxHp), barHeight);
    });
}
