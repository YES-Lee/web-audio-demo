export class ImageNode {
  public onLoad?: () => void;
  protected image: HTMLImageElement;

  constructor(public url: string) {
    this.image = new Image();
    this.image.crossOrigin = 'anonymous';
    this.image.src = url;
    this.image.onload = () => {
      this.onLoad?.();
    };
  }
}
