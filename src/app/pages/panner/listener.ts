export class Listener {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#00BCD4';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - 10, this.y + 18);
    ctx.lineTo(this.x, this.y + 12);
    ctx.lineTo(this.x + 10, this.y + 18);
    ctx.closePath();
    ctx.fill();
  }
}
