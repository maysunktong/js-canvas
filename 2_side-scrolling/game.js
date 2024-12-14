const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;
class Player {
  constructor() {
    this.position = {
      x: 100,
      y: 100,
    };
    this.width = 30;
    this.height = 30;
    this.velocity = {
      // player will draw downward only
      x: 0,
      y: 1,
    };
  }

  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.position.y += this.velocity.y;
    this.draw();
  }
}

const player = new Player();
player.update();

// animate()
const animate = () => {
  requestAnimationFrame(animate);
  player.update();
};

animate();
