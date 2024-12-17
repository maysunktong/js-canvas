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

const treesImage = createImage(trees);
const rocksImage = createImage(rocks);
const backgroundImage = createImage(background);
const levelLeftImage = createImage(levelLeft);
const levelRightImage = createImage(levelRight);
const spriteIdleLeftImage = createImage(spriteIdleLeft);
const spriteIdleRightImage = createImage(spriteIdleRight);
const spriteRunLeftImage = createImage(spriteRunLeft);
const spriteRunRightImage = createImage(spriteRunRight);
const spriteJumpLeftImage = createImage(spriteJumpLeft);
const spriteJumpRightImage = createImage(spriteJumpRight);

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
    this.speed = 10;

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

// initializing the game: restart
async function init() {
  platformImage = await createImageAsync(platform);
  console.log(platformImage.width);

  player = new Player();

  for (let i = 0; i < 10; i++) {
    platforms.push(
      new Platform({
        x: i * platformImage.width,
        y: 500,
        image: platformImage,
      })
    );
  }

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
const animate = () => {
  requestAnimationFrame(animate);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  genericObjects.forEach((genericObject) => genericObject.update());
  platforms.forEach((platform) => platform.update());
  player.update();

  // Player movement logic
  if (keys.right.pressed && player.position.x < 400) {
    player.velocity.x = player.speed;
  } else if (keys.left.pressed && player.position.x > 100) {
    player.velocity.x = -player.speed;
  } else {
    player.velocity.x = 0;
    if (keys.right.pressed) {
      scrollOffset += player.speed;
      platforms.forEach((platform) => (platform.position.x -= player.speed));
      genericObjects.forEach(
        (genericObject) => (genericObject.position.x -= player.speed * 0.7)
      );
    } else if (keys.left.pressed && scrollOffset > 0) {
      scrollOffset = 0;
      platforms.forEach((platform) => (platform.position.x += player.speed));
      genericObjects.forEach(
        (genericObject) => (genericObject.position.x += player.speed * 0.7)
      );
    }
  }

  // Platform collision detection
  platforms.forEach((platform) => {
    if (
      player.position.y + player.height <= platform.position.y &&
      player.position.y + player.height + player.velocity.y >=
        platform.position.y &&
      player.position.x + player.width >= platform.position.x &&
      player.position.x <= platform.position.x + platform.width
    ) {
      player.velocity.y = 0;
      player.jumpCount = 0;
    }
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
  if (scrollOffset > createImage(platform).width * 3 + 200) {
    console.log("You win");
  }

  // LOSE condition: death pits
  if (player.position.y > canvas.height) {
    init();
  }
};

init();
animate();

addEventListener("keydown", ({ keyCode }) => {
  switch (keyCode) {
    case 87:
      if (player.jumpCount < 2) {
        // Check if jump count is less than 2
        player.velocity.y = -13; // Perform jump
        player.jumpCount++; // Increment the jump count
        console.log(`Jump count: ${player.jumpCount}`); // Debug log
      }
      break;
    case 83:
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
