export class Particle {
  x: number;
  y: number;
  radius: number;

  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  draw(canvasCtx: CanvasRenderingContext2D): void {
    // canvasCtx.fillStyle = `rgb(0, 188, 212)`;
    canvasCtx.beginPath();
    canvasCtx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    canvasCtx.fill();
  }
}
