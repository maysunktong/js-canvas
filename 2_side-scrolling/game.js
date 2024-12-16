const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

const gravity = 0.5;

const platform = "./assets/platform.png";
const trees = "./assets/trees.png";
const background = "./assets/bg.png";
const rocks = "./assets/rocks.png";

function createImage(imageSrc) {
  const image = new Image();
  image.src = imageSrc;
  return image;
}

const platformImage = createImage(platform);
const treesImage = createImage(trees);
const rocksImage = createImage(rocks);
const backgroundImage = createImage(background);

class Player {
  constructor() {
    this.position = {
      x: 100,
      y: 100,
    };
    this.width = 30;
    this.height = 30;
    this.velocity = {
      // player will draw downward only, y-axis
      x: 0,
      y: 0,
    };
    this.speed = 10;
  }

  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.y += this.velocity.y;
    this.position.x += this.velocity.x;

    if (this.position.y + this.height + this.velocity.y <= canvas.height)
      this.velocity.y += gravity;
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
}

/* declare variables for init() */
let player = new Player();
let platforms = [];
let genericObjects = [];
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
const init = () => {
  player = new Player();
  platforms = [
    new Platform({ x: 0, y: 500, image: platformImage }),
    new Platform({ x: platformImage.width, y: 500, image: platformImage }),
    new Platform({
      x: platformImage.width * 2 + 100,
      y: 500,
      image: platformImage,
    }),
  ];
  genericObjects = [
    new GenericObject({ x: 0, y: 0, image: backgroundImage }),
    new GenericObject({
      x: backgroundImage.width,
      y: 0,
      image: backgroundImage,
    }),
    new GenericObject({ x: 0, y: 440, image: treesImage }),
    new GenericObject({ x: 200, y: 440, image: treesImage }),
    new GenericObject({ x: 600, y: 440, image: treesImage }),
  ];

  // how far have platform scrolled
  scrollOffset = 0;
};

// loop over animate()
const animate = () => {
  requestAnimationFrame(animate);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  genericObjects.forEach((genericObject) => {
    genericObject.draw();
  });
  // render multiple platforms
  platforms.forEach((platform) => {
    platform.draw();
  });
  // player has to be generated after platforms
  player.update();

  // key bindings management, limit player's distance
  if (keys.right.pressed && player.position.x < 400) {
    player.velocity.x = player.speed;
  } else if (keys.left.pressed && player.position.x > 100) {
    player.velocity.x = -player.speed;
  } else {
    player.velocity.x = 0;

    // platform scrolling
    if (keys.right.pressed) {
      scrollOffset += player.speed;
      platforms.forEach((platform) => {
        platform.position.x -= player.speed;
      });
      genericObjects.forEach((genericObject) => {
        genericObject.position.x -= player.speed * 0.7;
      });
    } else if (keys.left.pressed) {
      scrollOffset += player.speed;
      platforms.forEach((platform) => {
        platform.position.x += player.speed;
      });
      genericObjects.forEach((genericObject) => {
        genericObject.position.x += player.speed * 0.7;
      });
    }
  }

  // platform collision detection
  platforms.forEach((platform) => {
    if (
      player.position.y + player.height <= platform.position.y &&
      player.position.y + player.height + player.velocity.y >=
        platform.position.y &&
      player.position.x + player.width >= platform.position.x &&
      player.position.x <= platform.position.x + platform.width
    ) {
      player.velocity.y = 0;
    }
  });

  // WIN condition
  if (scrollOffset > 1000) {
    console.log("You win");
  }

  // LOSE condition: death pits
  if (player.position.y > canvas.width) {
    init();
  }
};

init();
animate();

addEventListener("keydown", ({ keyCode }) => {
  switch (keyCode) {
    case 87:
      console.log("up");
      player.velocity.y -= 10;
      break;
    case 83:
      console.log("down");
      break;
    case 65:
      console.log("left");
      keys.left.pressed = true;
      break;
    case 68:
      console.log("right");
      keys.right.pressed = true;
      break;
  }
});

addEventListener("keyup", ({ keyCode }) => {
  switch (keyCode) {
    case 87:
      console.log("up");
      player.velocity.y = 0;
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
