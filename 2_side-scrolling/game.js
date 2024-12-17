const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

const gravity = 1;

const platform = "./assets/platform.png";
const trees = "./assets/trees.png";
const background = "./assets/bg.png";
const rocks = "./assets/rocks.png";
const levelLeft = "./assets/platformers/Ground_04.png";
const levelRight = "./assets/platformers/Ground_08.png";

const spriteIdleLeft = "./assets/swordman/Idle_left.png";
const spriteIdleRight = "./assets/swordman/Idle_right.png";
const spriteRunLeft = "./assets/swordman/Run_left.png";
const spriteRunRight = "./assets/swordman/Run_right.png";
const spriteJumpLeft = "./assets/swordman/Jump_left.png";
const spriteJumpRight = "./assets/swordman/Jump_right.png";

function createImage(imageSrc) {
  const image = new Image();
  image.src = imageSrc;
  return image;
}

function createImageAsync(imageSrc) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.src = imageSrc;
  });
}

let platformImage;
let treesImage = createImage(trees);
let rocksImage = createImage(rocks);
let backgroundImage;
let levelLeftImage = createImage(levelLeft);
let levelRightImage = createImage(levelRight);
let spriteIdleLeftImage = createImage(spriteIdleLeft);
let spriteIdleRightImage = createImage(spriteIdleRight);
let spriteRunLeftImage = createImage(spriteRunLeft);
let spriteRunRightImage = createImage(spriteRunRight);
let spriteJumpLeftImage = createImage(spriteJumpLeft);
let spriteJumpRightImage = createImage(spriteJumpRight);

class Player {
  constructor() {
    this.position = {
      x: 100,
      y: 100,
    };
    this.width = 128;
    this.height = 128;
    this.velocity = {
      // player will draw downward only, y-axis
      x: 0,
      y: 0,
    };
    this.speed = 5;

    this.image = spriteIdleRightImage;
    this.frames = 0;
    this.sprites = {
      idle: {
        right: spriteIdleRightImage,
        left: spriteIdleLeftImage,
      },
      run: {
        right: spriteRunRightImage,
        left: spriteRunLeftImage,
      },
      jump: {
        right: spriteJumpRightImage,
        left: spriteJumpLeftImage,
      },
    };
    this.currentSprite = this.sprites.idle.right;
    this.jumpCount = 0;
  }

  draw() {
    ctx.drawImage(
      this.currentSprite,
      128 * this.frames, // croping image from (0,0)
      0,
      128,
      128,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }

  update() {
    this.frames++;
    if (this.frames > 7) {
      this.frames = 0;
    }
    this.draw();
    this.position.y += this.velocity.y;
    this.position.x += this.velocity.x;

    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      this.velocity.y += gravity;
    } else {
      this.jumpCount = 0;
    }
  }
}

class Enemy {
  constructor({ position, velocity }) {
    this.position = {
      x: position.x,
      y: position.y,
    };

    this.velocity = {
      x: velocity.x,
      y: velocity.y,
    };

    this.width = 50;
    this.height = 50;
  }

  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      this.velocity.y += gravity;
    }
  }
}

class Platform {
  constructor({ x, y, image }) {
    this.position = {
      x,
      y,
    };
    this.image = image;
    this.width = image.width;
    this.height = image.height;
  }

  draw() {
    ctx.drawImage(this.image, this.position.x, this.position.y);
  }

  update() {
    this.draw();
    if (this.position.x + this.width <= 0) {
      this.position.x += this.width * 2;
    }
  }
}

class GenericObject {
  constructor({ x, y, image }) {
    this.position = {
      x,
      y,
    };
    this.image = image;
    this.width = image.width;
    this.height = image.height;
  }

  draw() {
    ctx.drawImage(this.image, this.position.x, this.position.y);
  }

  update() {
    this.draw();
    if (this.position.x + this.width <= 0) {
      this.position.x += this.width * 2;
    }
  }
}

/* declare variables for init() */
let player = new Player();
let platforms = [];
let genericObjects = [];
let enemies = [];

let lastKey;
let keys = {
  right: {
    pressed: false,
  },
  left: {
    pressed: false,
  },
};
let scrollOffset = 0;

function isOnTop({ object, platform }) {
  return (
    object.position.y + object.height <= platform.position.y &&
    object.position.y + object.height + object.velocity.y >=
      platform.position.y &&
    object.position.x + object.width >= platform.position.x &&
    object.position.x <= platform.position.x + platform.width
  );
}

// check if object has something on top of it
function collisionTop({ object1, object2 }) {
  return (
    object1.position.y + object1.height <= object2.position.y &&
    object1.position.y + object1.height + object1.velocity.y >=
      object2.position.y &&
    object1.position.x + object1.width >= object2.position.x &&
    object1.position.x <= object2.position.x + object2.width
  );
}

// initializing the game: restart
async function init() {
  platformImage = await createImageAsync(platform);

  player = new Player();

  enemies = [
    new Enemy({ position: { x: 400, y: 100 }, velocity: { x: -0.3, y: 0 } }),
  ];

  for (let i = 0; i < 10; i++) {
    platforms.push(
      new Platform({
        x: i * platformImage.width,
        y: 500,
        image: platformImage,
      })
    );
  }

  backgroundImage = await createImageAsync(background);
  // Create two background images to achieve the looping effect
  for (let i = 0; i < 2; i++) {
    genericObjects.push(
      new GenericObject({
        x: i * backgroundImage.width,
        y: 0,
        image: backgroundImage,
      })
    );
  }

  // Reset scroll offset
  scrollOffset = 0;
}

// loop over animate()
function animate() {
  requestAnimationFrame(animate);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  genericObjects.forEach((genericObject) => genericObject.update());
  platforms.forEach((platform) => platform.update());

  // player is on top of enemy
  enemies.forEach((enemy, index) => {
    enemy.update();
    if (collisionTop({ object1: player, object2: enemy })) {
      player.velocity.y -= 40; // player bounces up when jumping on enemy
      setTimeout(() => {
        enemies.splice(index, 1), 0; // make sure dont get any flash of other contents
      });
    } else if (
      player.position.x + player.width >= enemy.position.x &&
      player.position.y + player.height >= enemy.position.y &&
      player.position.x <= enemy.position.x + enemy.width
    ) {
      init();
    }
  });
  player.update();

  // Player movement logic
  if (keys.right.pressed && player.position.x < 400) {
    player.velocity.x = player.speed;
  } else if (keys.left.pressed && player.position.x > 100) {
    player.velocity.x = -player.speed;
  } else {
    player.velocity.x = 0;
    // scrolling code
    if (keys.right.pressed) {
      scrollOffset += player.speed;
      platforms.forEach((platform) => (platform.position.x -= player.speed));

      genericObjects.forEach(
        (genericObject) => (genericObject.position.x -= player.speed * 0.7)
      );

      // enemy moves pass player
      enemies.forEach((enemy) => (enemy.position.x -= player.speed));
    } else if (keys.left.pressed && scrollOffset > 0) {
      scrollOffset = 0;

      platforms.forEach((platform) => (platform.position.x += player.speed));

      genericObjects.forEach(
        (genericObject) => (genericObject.position.x += player.speed * 0.7)
      );

      enemies.forEach((enemy) => (enemy.position.x += player.speed));
    }
  }

  // Platform collision detection
  platforms.forEach((platform) => {
    if (isOnTop({ object: player, platform })) {
      player.velocity.y = 0;
      player.jumpCount = 0;
    }

    enemies.forEach((enemy) => {
      if (
        isOnTop({
          object: enemy,
          platform,
        })
      )
        enemy.velocity.y = 0;
    });
  });

  // Sprite switching logic
  if (
    keys.right.pressed &&
    lastKey === "right" &&
    player.currentSprite !== player.sprites.run.right
  ) {
    player.frames = 1;
    player.currentSprite = player.sprites.run.right;
  } else if (
    keys.left.pressed &&
    lastKey === "left" &&
    player.currentSprite !== player.sprites.run.left
  ) {
    player.currentSprite = player.sprites.run.left;
  } else if (
    !keys.left.pressed &&
    lastKey === "left" &&
    player.currentSprite !== player.sprites.idle.left
  ) {
    player.currentSprite = player.sprites.idle.left;
  } else if (
    !keys.right.pressed &&
    lastKey === "right" &&
    player.currentSprite !== player.sprites.idle.right
  ) {
    player.currentSprite = player.sprites.idle.right;
  }

  // WIN condition
  if (platformImage && scrollOffset > platformImage.width * 3 + 200) {
    console.log("You win");
  }

  // LOSE condition: death pits
  if (player.position.y > canvas.height) {
    init();
  }
}

init();
animate();

addEventListener("keydown", ({ keyCode }) => {
  switch (keyCode) {
    case 87:
      if (player.jumpCount < 2) {
        // Check if jump count is less than 2
        player.velocity.y = -20 // Perform jump
        player.jumpCount++; // Increment the jump count
        console.log(`Jump count: ${player.jumpCount}`); // Debug log
      }
      break;
    case 83:d
      console.log("down");
      break;
    case 65:
      console.log("left");
      keys.left.pressed = true;
      lastKey = "left";
      break;
    case 68:
      console.log("right");
      keys.right.pressed = true;
      lastKey = "right";
      break;
  }
});

addEventListener("keyup", ({ keyCode }) => {
  switch (keyCode) {
    case 87:
      console.log("up");
      break;
    case 83:
      console.log("down");
      break;
    case 65:
      console.log("left");
      keys.left.pressed = false;
      break;
    case 68:
      console.log("right");
      keys.right.pressed = false;
      break;
  }
});
