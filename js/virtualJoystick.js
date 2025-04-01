// js/virtualJoystick.js
class VirtualJoystick {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;
    this.stick = document.createElement('div');
    this.stick.className = 'joystick-stick';
    this.container.appendChild(this.stick);
    this.maxDistance = this.container.clientWidth / 2;
    this.active = false;
    this.direction = { dx: 0, dy: 0 };
    this._init();
  }

  _init() {
    this.container.style.touchAction = 'none';
    this.container.addEventListener('pointerdown', this._start.bind(this));
    this.container.addEventListener('pointermove', this._move.bind(this));
    this.container.addEventListener('pointerup', this._end.bind(this));
    this.container.addEventListener('pointercancel', this._end.bind(this));
  }

  _start(e) {
    e.preventDefault();
    this.active = true;
    const rect = this.container.getBoundingClientRect();
    this.center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    this._move(e);
  }

  _move(e) {
    if (!this.active) return;
    e.preventDefault();
    const touchX = e.clientX;
    const touchY = e.clientY;
    const dx = touchX - this.center.x;
    const dy = touchY - this.center.y;
    const dist = Math.hypot(dx, dy);
    let clampedDx = dx, clampedDy = dy;
    if (dist > this.maxDistance) {
      const ratio = this.maxDistance / dist;
      clampedDx *= ratio;
      clampedDy *= ratio;
    }
    this.stick.style.transform = `translate(${clampedDx}px, ${clampedDy}px)`;
    this.direction = {
      dx: clampedDx / this.maxDistance,
      dy: clampedDy / this.maxDistance
    };
    window.joystick = this.direction;
  }

  _end(e) {
    e.preventDefault();
    this.active = false;
    this.stick.style.transform = 'translate(0px, 0px)';
    this.direction = { dx: 0, dy: 0 };
    window.joystick = this.direction;
  }
}

export default VirtualJoystick;
