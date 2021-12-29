export class Speaker {
  x: number;
  y: number;
  radius: number;
  dragging: boolean;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.dragging = false;
  }

  setPosition(x: number, y: number): Speaker {
    this.x = x;
    this.y = y;
    return this;
  }

  draw(ctx: CanvasRenderingContext2D): Speaker {
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
    return this;
  }

  isMouseOver(x: number, y: number): boolean {
    return Math.sqrt(Math.pow((x - this.x), 2) + Math.pow(y - this.y, 2)) <= this.radius;
  }
}
