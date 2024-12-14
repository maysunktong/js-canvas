const canvas = document.querySelector("canvas");
const scoreEl = document.querySelector("#score-el");
const modal = document.querySelector(".game-over-box");
const modalScore = document.querySelector("#modal-score");
const buttonEl = document.querySelector(".restart-btn");

canvas.width = innerWidth;
canvas.height = innerHeight;

const ctx = canvas.getContext("2d");

// Object constructor for Player
class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

// Create a projectile
class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

const friction = 0.99;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }
  draw() {
    // ctx.save() helps accessing global
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= 0.02;
  }
}

// Player positions
//  in the middle of screen
const x = canvas.width / 2;
const y = canvas.height / 2;

// create a new player
let player = new Player(x, y, 10, "white");
let projectiles = [];
let enemies = [];
let particles = [];
let animationId;
let intervalId;
let score = 0;

// initialization
function init() {
  player = new Player(x, y, 10, "white");
  projectiles = [];
  enemies = [];
  particles = [];
  animationId;
  score = 0;
}

function spawnEnemies() {
  intervalId = setInterval(() => {
    // Make sure enemies sizes are not too small
    const radius = Math.random() * (30 - 10) + 10;

    let x;
    let y;

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.height;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    // random the first value of hsl()
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

    // Object move towards center
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

    // Object away from center
    // const angle = Math.atan2(y-canvas.height / 2, x-canvas.width / 2);

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}

// loop over animate()
function animate() {
  animationId = requestAnimationFrame(animate);

  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  player.draw();

  for (let index = particles.length - 1; index >= 0; index--) {
    const particle = particles[index];

    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    }
    particle.update();
  }

  for (let index = projectiles.length - 1; index >= 0; index--) {
    const projectile = projectiles[index];

    projectile.update();
    // remove from edges of screen
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      projectiles.splice(index, 1);
    }
  }

  for (let index = enemies.length - 1; index >= 0; index--) {
    const enemy = enemies[index];

    enemy.update();

    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    // end game
    if (distance - enemy.radius - player.radius < 1) {
      // stop game when enemy touches player
      cancelAnimationFrame(animationId);
      clearInterval(intervalId);
      modal.style.display = "block";
      modalScore.innerHTML = score;
    }

    for (
      let projectilesIndex = projectiles.length - 1;
      projectilesIndex >= 0;
      projectilesIndex--
    ) {
      const projectile = projectiles[projectilesIndex];

      const distance = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );
      // when projectiles touch enemy
      if (distance - enemy.radius - projectile.radius < 1) {
        // one hit breaks into explosion
        for (let i = 0; i < enemy.radius; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6),
              }
            )
          );
        }
        // shrink enemy
        if (enemy.radius - 10 > 5) {
          score += 10;
          scoreEl.innerHTML = score;

          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          projectiles.splice(projectilesIndex, 1);
        } else {
          // remove enemy if they are too small
          score += 20;
          scoreEl.innerHTML = score;

          enemies.splice(index, 1);
          projectiles.splice(projectilesIndex, 1);
        }
      }
    }
  }
}

addEventListener("click", (event) => {
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );

  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };

  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", velocity)
  );
});

buttonEl.addEventListener("click", () => {
  init();
  animate();
  spawnEnemies();
  modal.style.display = "none";
});

animate();
spawnEnemies();
