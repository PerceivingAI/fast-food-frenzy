export function distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

export function moveTowards(unit, target, lane) {
    const angle = Math.atan2(target.y - unit.y, target.x - unit.x);
    unit.x += Math.cos(angle) * unit.speed;
    unit.y += Math.sin(angle) * unit.speed;
}
