// Helper function to display notifications (for events only)
export function pushNotification(message) {
    const container = document.getElementById("topNotifications");
    if (!container) return;
  
    // Create a new notification element
    const notif = document.createElement("div");
    notif.className = "notification";
    notif.textContent = message;
    container.appendChild(notif);
  
    // If more than 2 notifications are visible, remove the oldest immediately
    while (container.children.length > 2) {
      container.removeChild(container.firstChild);
    }
  
    // Fade out after 2 seconds, then remove after fade (0.5s)
    setTimeout(() => {
      notif.style.opacity = "0";
      setTimeout(() => {
        if (notif.parentNode === container) {
          container.removeChild(notif);
        }
      }, 500);
    }, 2000);
  }
  
  // Existing HP bar update using CSS transform for efficiency
  export function updateHpBar(champion) {
    const hpFillEl = document.querySelector('.scoreboard .champion-status .hp-bar .hp-fill');
    if (!hpFillEl) return;
    const hpPercent = Math.max(0, Math.min(1, champion.hp / champion.maxHp));
    hpFillEl.style.transform = `scaleX(${hpPercent})`;
    hpFillEl.style.transformOrigin = 'left';
  }
  
  // Update the tower score display
  export function updateTowerScore(teams) {
    const towerScoreEl = document.querySelector('.scoreboard .tower-score');
    if (!towerScoreEl) return;
    const burgerScore = teams.burgerBarn.towerDestroyed || 0;
    const tacoScore = teams.tacoTruck.towerDestroyed || 0;
    towerScoreEl.textContent = `${burgerScore} - ${tacoScore}`;
  }
  