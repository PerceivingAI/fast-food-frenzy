// ✅ Load Image
const blobImg = new Image();
blobImg.src = "assets/images/blob.png";

// ✅ Image Config
const PROJECTILE_IMAGE = { width: 20, height: 20, offsetX: -10, offsetY: -10 };

export function drawProjectiles(ctx, teams) {
    Object.values(teams).forEach(team => {
        if (!team.projectiles) return;

        team.projectiles.forEach(proj => {
            const progress = Math.min((Date.now() - proj.startTime) / proj.travelTime, 1);
            const x = proj.startX + (proj.target.x - proj.startX) * progress;
            const y = proj.startY + (proj.target.y - proj.startY) * progress;

            // Draw Image
            ctx.drawImage(
                blobImg,
                x + PROJECTILE_IMAGE.offsetX,
                y + PROJECTILE_IMAGE.offsetY,
                PROJECTILE_IMAGE.width,
                PROJECTILE_IMAGE.height
            );

            // Optional: keep shape for debugging (50% transparent)
            ctx.fillStyle = 'rgba(0, 0, 0, 0)';
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
    });
}
