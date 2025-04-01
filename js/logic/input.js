import { TEAMS } from './teams.js';

export function getChampionControls(teamId) {
    const keys = window.keys || {};
    const isBurger = teamId === TEAMS.BURGER_BARN.id;
    const joystick = window.joystick || { dx: 0, dy: 0 };

    // If joystick input is significant, use it
    if (Math.abs(joystick.dx) > 0.1 || Math.abs(joystick.dy) > 0.1) {
        return { dx: joystick.dx, dy: joystick.dy };
    }
    
    return {
        dx: (isBurger ? (keys['d'] ? 1 : 0) : (keys['arrowright'] ? 1 : 0))
           - (isBurger ? (keys['a'] ? 1 : 0) : (keys['arrowleft'] ? 1 : 0)),
        dy: (isBurger ? (keys['s'] ? 1 : 0) : (keys['arrowdown'] ? 1 : 0))
           - (isBurger ? (keys['w'] ? 1 : 0) : (keys['arrowup'] ? 1 : 0))
    };
}

window.keys = {};

window.addEventListener('keydown', e => {
    const key = e.key.toLowerCase();
    window.keys[key] = true;
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
        window.clickedTarget = null;
        window.clearTarget = true;
    }
});

window.addEventListener('keyup', e => {
    window.keys[e.key.toLowerCase()] = false;
});

window.clickedTarget = null;
window.addEventListener('click', (e) => {
    const rect = e.target.getBoundingClientRect();
    window.clickedTarget = { x: e.clientX - rect.left, y: e.clientY - rect.top };
});
