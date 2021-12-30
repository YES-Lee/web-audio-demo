import { ImageNode } from './image-node';

export class Speaker extends ImageNode {
  x: number;
  y: number;
  width: number;
  height: number;
  dragging: boolean;

  constructor(x: number, y: number) {
    super('/assets/image/radio.png');
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
    this.dragging = false;
  }

  setPosition(x: number, y: number): Speaker {
    this.x = x;
    this.y = y;
    return this;
  }

  draw(ctx: CanvasRenderingContext2D): Speaker {
    ctx.drawImage(
      this.image,
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );

    return this;
  }

  isMouseOver(x: number, y: number): boolean {
    return (
      x >= this.x - this.width / 2 &&
      x <= this.x + this.width / 2 &&
      y >= this.y - this.height / 2 &&
      y <= this.y + this.height / 2
    );
  }
}
