import { ImageNode } from './image-node';

export class Listener extends ImageNode {
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number) {
    super('/assets/image/person.png');
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(
      this.image,
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );
  }
}
