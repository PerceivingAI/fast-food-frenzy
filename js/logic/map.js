export const lane = {
    start: { x: -225, y: 1080 },
    end: { x: 1920, y: 100 },
    width: 500
};

export function isOnLane(x, y) {
    const { start, end, width } = lane;
    const dist = Math.abs((end.y - start.y)*x - (end.x - start.x)*y + end.x*start.y - end.y*start.x) /
        Math.hypot(end.y - start.y, end.x - start.x);
    return dist <= width / 2;
}
