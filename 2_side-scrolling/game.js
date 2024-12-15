const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

const gravity = 0.5;

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
    else this.velocity.y = 0;
  }
}

// importing road img
const image = new Image();
image.src = "./assets/platform.png";
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

const player = new Player();
const platforms = [
  new Platform({ x: 0, y: 500, image }),
  new Platform({ x: image.width, y: 500, image }),
  new Platform({ x: image.width*2, y: 500, image }),
  new Platform({ x: image.width*3, y: 500, image })
];

const keys = {
  right: {
    pressed: false,
  },
  left: {
    pressed: false,
  },
};

// how far have platform scrolled
let scrollOffset = 0;

// loop over animate()
const animate = () => {
  requestAnimationFrame(animate);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // render multiple platforms
  platforms.forEach((platform) => {
    platform.draw();
  });
  // player has to be generated after platforms
  player.update();

  // key bindings management, limit player's distance
  if (keys.right.pressed && player.position.x < 400) {
    player.velocity.x = 5;
  } else if (keys.left.pressed && player.position.x > 100) {
    player.velocity.x = -5;
  } else {
    player.velocity.x = 0;

    // platform scrolling
    if (keys.right.pressed) {
      scrollOffset += 5;
      platforms.forEach((platform) => {
        platform.position.x -= 5;
      });
    } else if (keys.left.pressed) {
      scrollOffset += 5;
      platforms.forEach((platform) => {
        platform.position.x += 5;
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
  if (scrollOffset > 1000) {
    console.log("You win");
  }
};

animate();

addEventListener("keydown", ({ keyCode }) => {
  switch (keyCode) {
    case 87:
      console.log("up");
      player.velocity.y -= 20;
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
