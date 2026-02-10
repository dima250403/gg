const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const ui = {
  health: document.getElementById('health'),
  ammo: document.getElementById('ammo'),
  score: document.getElementById('score'),
  wave: document.getElementById('wave'),
};

const keys = new Set();
const mouse = { x: canvas.width / 2, y: canvas.height / 2, down: false };

const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 16,
  speed: 220,
  hp: 100,
  maxHp: 100,
  clip: 30,
  clipSize: 30,
  reserve: 90,
  fireDelay: 0.1,
  cooldown: 0,
  reload: 0,
};

const world = {
  bullets: [],
  enemies: [],
  particles: [],
  score: 0,
  wave: 1,
  spawnTimer: 0,
  gameOver: false,
};

const obstacle = {
  x: canvas.width / 2 - 75,
  y: canvas.height / 2 - 50,
  w: 150,
  h: 100,
};

function spawnEnemy() {
  const side = Math.floor(Math.random() * 4);
  let x = 0;
  let y = 0;

  if (side === 0) {
    x = Math.random() * canvas.width;
    y = -20;
  } else if (side === 1) {
    x = canvas.width + 20;
    y = Math.random() * canvas.height;
  } else if (side === 2) {
    x = Math.random() * canvas.width;
    y = canvas.height + 20;
  } else {
    x = -20;
    y = Math.random() * canvas.height;
  }

  world.enemies.push({
    x,
    y,
    radius: 14,
    speed: 90 + Math.random() * 45 + world.wave * 6,
    hp: 30 + world.wave * 4,
    touchDamage: 16,
    hitCooldown: 0,
  });
}

function shoot() {
  if (player.cooldown > 0 || player.reload > 0 || player.clip <= 0 || world.gameOver) return;

  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  world.bullets.push({
    x: player.x,
    y: player.y,
    vx: Math.cos(angle) * 500,
    vy: Math.sin(angle) * 500,
    ttl: 1.1,
    damage: 20,
  });

  player.cooldown = player.fireDelay;
  player.clip -= 1;
}

function beginReload() {
  if (player.reload > 0 || player.clip === player.clipSize || player.reserve <= 0 || world.gameOver) return;
  player.reload = 1.6;
}

function clampToArena(entity) {
  entity.x = Math.max(entity.radius, Math.min(canvas.width - entity.radius, entity.x));
  entity.y = Math.max(entity.radius, Math.min(canvas.height - entity.radius, entity.y));
}

function resolveObstacleCollision(entity) {
  const nearestX = Math.max(obstacle.x, Math.min(entity.x, obstacle.x + obstacle.w));
  const nearestY = Math.max(obstacle.y, Math.min(entity.y, obstacle.y + obstacle.h));
  const dx = entity.x - nearestX;
  const dy = entity.y - nearestY;
  const distSq = dx * dx + dy * dy;

  if (distSq < entity.radius * entity.radius) {
    if (Math.abs(dx) > Math.abs(dy)) {
      entity.x = nearestX + Math.sign(dx || 1) * entity.radius;
    } else {
      entity.y = nearestY + Math.sign(dy || 1) * entity.radius;
    }
  }
}

function updatePlayer(dt) {
  let dx = 0;
  let dy = 0;

  if (keys.has('w')) dy -= 1;
  if (keys.has('s')) dy += 1;
  if (keys.has('a')) dx -= 1;
  if (keys.has('d')) dx += 1;

  if (dx || dy) {
    const length = Math.hypot(dx, dy);
    player.x += (dx / length) * player.speed * dt;
    player.y += (dy / length) * player.speed * dt;
  }

  clampToArena(player);
  resolveObstacleCollision(player);

  player.cooldown = Math.max(0, player.cooldown - dt);
  if (player.reload > 0) {
    player.reload -= dt;
    if (player.reload <= 0) {
      const need = player.clipSize - player.clip;
      const take = Math.min(need, player.reserve);
      player.clip += take;
      player.reserve -= take;
      player.reload = 0;
    }
  }

  if (mouse.down) shoot();
}

function updateBullets(dt) {
  world.bullets = world.bullets.filter((b) => {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.ttl -= dt;

    const hitObstacle =
      b.x > obstacle.x && b.x < obstacle.x + obstacle.w && b.y > obstacle.y && b.y < obstacle.y + obstacle.h;
    if (hitObstacle) return false;

    for (const enemy of world.enemies) {
      const d = Math.hypot(enemy.x - b.x, enemy.y - b.y);
      if (d < enemy.radius + 3) {
        enemy.hp -= b.damage;
        world.particles.push({ x: b.x, y: b.y, ttl: 0.25 });
        return false;
      }
    }

    return b.ttl > 0 && b.x >= 0 && b.x <= canvas.width && b.y >= 0 && b.y <= canvas.height;
  });
}

function updateEnemies(dt) {
  for (const e of world.enemies) {
    const angle = Math.atan2(player.y - e.y, player.x - e.x);
    e.x += Math.cos(angle) * e.speed * dt;
    e.y += Math.sin(angle) * e.speed * dt;
    resolveObstacleCollision(e);

    if (e.hitCooldown > 0) e.hitCooldown -= dt;

    const distanceToPlayer = Math.hypot(player.x - e.x, player.y - e.y);
    if (distanceToPlayer < player.radius + e.radius && e.hitCooldown <= 0) {
      player.hp = Math.max(0, player.hp - e.touchDamage);
      e.hitCooldown = 0.6;
      if (player.hp <= 0) world.gameOver = true;
    }
  }

  const before = world.enemies.length;
  world.enemies = world.enemies.filter((e) => e.hp > 0);
  world.score += before - world.enemies.length;
}

function updateWave(dt) {
  world.spawnTimer -= dt;
  if (world.spawnTimer <= 0 && !world.gameOver) {
    spawnEnemy();
    const pace = Math.max(0.35, 1.35 - world.wave * 0.1);
    world.spawnTimer = pace;
  }

  if (world.score > 0 && world.score % 8 === 0 && world.wave < 99) {
    world.wave = 1 + Math.floor(world.score / 8);
  }
}

function updateParticles(dt) {
  world.particles = world.particles.filter((p) => {
    p.ttl -= dt;
    return p.ttl > 0;
  });
}

function drawArena() {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#1f2a44';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.fillStyle = '#243040';
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
}

function drawPlayer() {
  const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(angle);

  ctx.fillStyle = '#71f79f';
  ctx.beginPath();
  ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#b8ffd0';
  ctx.fillRect(0, -4, 24, 8);
  ctx.restore();
}

function drawEnemies() {
  for (const e of world.enemies) {
    ctx.fillStyle = '#ff5f6a';
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBulletsAndFx() {
  ctx.fillStyle = '#ffd166';
  for (const b of world.bullets) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const p of world.particles) {
    ctx.fillStyle = `rgba(255, 209, 102, ${p.ttl * 4})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6 * (1 - p.ttl), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGameOver() {
  if (!world.gameOver) return;
  ctx.fillStyle = 'rgba(0,0,0,0.58)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 48px Segoe UI';
  ctx.textAlign = 'center';
  ctx.fillText('Раунд проигран', canvas.width / 2, canvas.height / 2 - 10);

  ctx.font = '24px Segoe UI';
  ctx.fillText(`Счёт: ${world.score}. Обнови страницу для рестарта`, canvas.width / 2, canvas.height / 2 + 34);
}

function updateUi() {
  ui.health.textContent = `HP: ${Math.round(player.hp)}`;
  ui.ammo.textContent = player.reload > 0
    ? `Ammo: перезарядка... ${player.clip} / ${player.reserve}`
    : `Ammo: ${player.clip} / ${player.reserve}`;
  ui.score.textContent = `Фраги: ${world.score}`;
  ui.wave.textContent = `Волна: ${world.wave}`;
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  updatePlayer(dt);
  updateBullets(dt);
  updateEnemies(dt);
  updateWave(dt);
  updateParticles(dt);

  drawArena();
  drawBulletsAndFx();
  drawEnemies();
  drawPlayer();
  drawGameOver();
  updateUi();

  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (['w', 'a', 's', 'd'].includes(key)) keys.add(key);
  if (key === 'r') beginReload();
});

window.addEventListener('keyup', (e) => {
  keys.delete(e.key.toLowerCase());
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * canvas.width;
  mouse.y = ((e.clientY - rect.top) / rect.height) * canvas.height;
});

canvas.addEventListener('mousedown', () => {
  mouse.down = true;
  shoot();
});

window.addEventListener('mouseup', () => {
  mouse.down = false;
});

canvas.addEventListener('contextmenu', (e) => e.preventDefault());

requestAnimationFrame(loop);
