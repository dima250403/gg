(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const statsEl = document.getElementById('stats');
  const msgEl = document.getElementById('msg');
  const overlayEl = document.getElementById('overlay');
  const startBtn = document.getElementById('startBtn');

  const map = [
    '1111111111111111',
    '1000000000000001',
    '1011111111111101',
    '1000100000000101',
    '1000101111100101',
    '1000001000100001',
    '1011101010111101',
    '1000000010000001',
    '1011111011111101',
    '1000000000000001',
    '1111111111111111',
  ];

  const game = {
    w: 960,
    h: 640,
    fov: Math.PI / 3,
    maxDepth: 24,
    keys: Object.create(null),
    mouseLocked: false,
    lastTime: performance.now(),
    player: { x: 2.5, y: 2.5, a: 0.15, hp: 100, alive: true },
    enemy: { x: 10.5, y: 7.2, hp: 8 },
    kills: 0,
    shootCooldown: 0,
    enemyAttackCooldown: 0,
    msg: 'Игра началась',
  };

  const spawnPoints = [
    [10.5, 7.2],
    [12.3, 2.8],
    [8.2, 8.4],
    [4.4, 6.7],
  ];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    game.w = canvas.width;
    game.h = canvas.height;
  }

  function isWall(x, y) {
    const mx = Math.floor(x);
    const my = Math.floor(y);
    if (my < 0 || my >= map.length || mx < 0 || mx >= map[0].length) return true;
    return map[my][mx] === '1';
  }

  function angleDiff(a, b) {
    let d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  function respawnEnemy() {
    const p = spawnPoints[(Math.random() * spawnPoints.length) | 0];
    game.enemy.x = p[0];
    game.enemy.y = p[1];
    game.enemy.hp = 8;
  }

  function shoot() {
    if (!game.player.alive || game.shootCooldown > 0) return;
    game.shootCooldown = 0.25;

    if (game.enemy.hp <= 0) return;
    const dx = game.enemy.x - game.player.x;
    const dy = game.enemy.y - game.player.y;
    const dist = Math.hypot(dx, dy);
    const enemyAngle = Math.atan2(dy, dx);
    const d = Math.abs(angleDiff(enemyAngle, game.player.a));

    if (d < 0.1 && dist < 10) {
      game.enemy.hp -= 2;
      game.msg = 'Попадание!';
      if (game.enemy.hp <= 0) {
        game.kills += 1;
        game.msg = 'Враг уничтожен!';
        respawnEnemy();
      }
    } else {
      game.msg = 'Мимо';
    }
  }

  function update(dt) {
    const moveSpeed = 2.7;
    const rotSpeed = 2.4;

    if (game.keys['KeyA']) game.player.a -= rotSpeed * dt;
    if (game.keys['KeyD']) game.player.a += rotSpeed * dt;

    let nx = game.player.x;
    let ny = game.player.y;

    const forwardX = Math.cos(game.player.a);
    const forwardY = Math.sin(game.player.a);

    if (game.keys['KeyW']) {
      nx += forwardX * moveSpeed * dt;
      ny += forwardY * moveSpeed * dt;
    }
    if (game.keys['KeyS']) {
      nx -= forwardX * moveSpeed * dt;
      ny -= forwardY * moveSpeed * dt;
    }

    if (!isWall(nx, game.player.y)) game.player.x = nx;
    if (!isWall(game.player.x, ny)) game.player.y = ny;

    if (game.enemy.hp > 0 && game.player.alive) {
      const dx = game.player.x - game.enemy.x;
      const dy = game.player.y - game.enemy.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.45) {
        const step = 1.2 * dt;
        const ex = game.enemy.x + (dx / dist) * step;
        const ey = game.enemy.y + (dy / dist) * step;
        if (!isWall(ex, ey)) {
          game.enemy.x = ex;
          game.enemy.y = ey;
        }
      }

      if (dist < 0.85 && game.enemyAttackCooldown <= 0) {
        game.enemyAttackCooldown = 0.5;
        game.player.hp = Math.max(0, game.player.hp - 10);
        if (game.player.hp <= 0) {
          game.player.alive = false;
          game.msg = 'YOU DIED — Reload page to restart';
        }
      }
    }

    game.shootCooldown = Math.max(0, game.shootCooldown - dt);
    game.enemyAttackCooldown = Math.max(0, game.enemyAttackCooldown - dt);

    statsEl.textContent = `HP: ${game.player.hp} | Kills: ${game.kills} | Enemy HP: ${game.enemy.hp}`;
    msgEl.textContent = game.msg;
  }

  function castRay(rayAngle) {
    let dist = 0.01;
    while (dist < game.maxDepth) {
      const tx = game.player.x + Math.cos(rayAngle) * dist;
      const ty = game.player.y + Math.sin(rayAngle) * dist;
      if (isWall(tx, ty)) return dist;
      dist += 0.02;
    }
    return game.maxDepth;
  }

  function drawSkyAndFloor() {
    const half = game.h / 2;
    const gradSky = ctx.createLinearGradient(0, 0, 0, half);
    gradSky.addColorStop(0, '#2b3050');
    gradSky.addColorStop(1, '#4d6b8d');
    ctx.fillStyle = gradSky;
    ctx.fillRect(0, 0, game.w, half);

    const gradFloor = ctx.createLinearGradient(0, half, 0, game.h);
    gradFloor.addColorStop(0, '#2d3b23');
    gradFloor.addColorStop(1, '#141910');
    ctx.fillStyle = gradFloor;
    ctx.fillRect(0, half, game.w, half);
  }

  function renderWalls() {
    const half = game.h / 2;
    for (let x = 0; x < game.w; x++) {
      const rayAngle = game.player.a - game.fov / 2 + (x / game.w) * game.fov;
      const rawDist = castRay(rayAngle);
      const correctedDist = rawDist * Math.cos(rayAngle - game.player.a);
      const wallH = Math.min(game.h - 10, (game.h * 0.75) / Math.max(0.1, correctedDist));
      const top = half - wallH / 2;
      const shade = Math.max(25, 255 - correctedDist * 22);
      ctx.strokeStyle = `rgb(${shade}, ${shade}, ${shade})`;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, top + wallH);
      ctx.stroke();
    }
  }

  function renderEnemy() {
    if (game.enemy.hp <= 0) return;

    const dx = game.enemy.x - game.player.x;
    const dy = game.enemy.y - game.player.y;
    const dist = Math.hypot(dx, dy);
    const enemyAngle = Math.atan2(dy, dx);
    const d = angleDiff(enemyAngle, game.player.a);

    if (Math.abs(d) > game.fov / 2) return;

    const screenX = ((d + game.fov / 2) / game.fov) * game.w;
    const size = Math.max(16, Math.min(240, game.h / Math.max(0.2, dist)));
    const y = game.h / 2;

    ctx.fillStyle = '#d43030';
    ctx.beginPath();
    ctx.arc(screenX, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2a0a0a';
    ctx.stroke();
  }

  function render() {
    drawSkyAndFloor();
    renderWalls();
    renderEnemy();
  }

  function frame(t) {
    const dt = Math.min(0.033, (t - game.lastTime) / 1000);
    game.lastTime = t;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('keydown', (e) => {
    game.keys[e.code] = true;
    if (e.code === 'Space') {
      e.preventDefault();
      shoot();
    }
    if (e.code === 'Escape') document.exitPointerLock();
  });
  window.addEventListener('keyup', (e) => {
    game.keys[e.code] = false;
  });

  document.addEventListener('mousemove', (e) => {
    if (!game.mouseLocked) return;
    game.player.a += e.movementX * 0.0026;
  });

  document.addEventListener('pointerlockchange', () => {
    game.mouseLocked = document.pointerLockElement === canvas;
    overlayEl.classList.toggle('hidden', game.mouseLocked);
  });

  startBtn.addEventListener('click', () => canvas.requestPointerLock());
  canvas.addEventListener('click', () => {
    if (!game.mouseLocked) canvas.requestPointerLock();
  });

  resize();
  requestAnimationFrame(frame);
})();
