// js/main.js
import { initGame } from './logic/game.js';
import { initRenderer } from './render/renderer.js';
import { updateHpBar, updateTowerScore } from './ui.js';
import VirtualJoystick from './virtualJoystick.js';

// Temporary global notification placeholder
window.showNotification = function(message) {
    console.log("Notification:", message);
};

function start() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const startUI = document.getElementById('startUI');
    const startBtn = document.getElementById('startBtn');
    const gameOverUI = document.getElementById('gameOverUI');
    const winnerMessage = document.getElementById('winnerMessage');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const quitBtn = document.getElementById('quitBtn');
    const uiOverlay = document.querySelector('.ui-overlay');

    let game, renderer, gameOver = false, winner = '';
    let uiIntervalId;

    startBtn.onclick = () => {
        startBtn.disabled = true;
        let count = 5;
        startUI.innerHTML = `<h1>${count}</h1>`;
        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                startUI.innerHTML = `<h1>${count}</h1>`;
            } else {
                clearInterval(countdownInterval);
                startUI.style.display = 'none';
                canvas.style.display = 'block';
                if (uiOverlay) uiOverlay.style.display = 'block';
                initializeGame();
            }
        }, 1000);
    };

    playAgainBtn.onclick = () => location.reload();
    quitBtn.onclick = () => {
        gameOverUI.innerHTML = `<h1 style="color:white; font-size:48px;">Thanks for playing!</h1>`;
    };

    function initializeGame() {
        // Initialize the virtual joystick for touch input
        const joystick = new VirtualJoystick('#movementPad');
        game = initGame();
        renderer = initRenderer(ctx, game);
        gameOver = false;
        winner = '';
        uiIntervalId = setInterval(() => {
            if (game && game.champions && game.champions.length > 0) {
                updateHpBar(game.champions[0]);
            }
            if (game && game.teams) {
                updateTowerScore(game.teams);
            }
        }, 1000);
        requestAnimationFrame(loop);
    }

    function endGame(winningTeam) {
        winner = winningTeam;
        winnerMessage.textContent = `${winningTeam} Wins!`;
        gameOverUI.style.display = 'flex';
        clearInterval(uiIntervalId);
    }

    function loop() {
        if (!gameOver) {
            game.update();
            if (game.teams.burgerBarn.base.isDestroyed) {
                gameOver = true;
                endGame('Taco Truck');
            } else if (game.teams.tacoTruck.base.isDestroyed) {
                gameOver = true;
                endGame('Burger Barn');
            }
        }
        renderer.render(gameOver, winner);
        if (!gameOver) requestAnimationFrame(loop);
    }

    return;
}

window.onload = start;
