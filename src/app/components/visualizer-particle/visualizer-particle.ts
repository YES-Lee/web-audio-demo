import { Circle } from './circle';
import { Particle } from './particle';

export interface VisualizerParticleOption {
  audioContext: AudioContext;
  sourceNode: AudioNode;
  fftSize?: number;
}

export type RemoveCanvas = () => void;

export class VisualizerParticle {
  private destroyed = false;
  private sourceNode: AudioNode;
  private analyser: AnalyserNode;
  private canvases: Array<HTMLCanvasElement> = [];
  private particles: Particle[] = [];
  private cover: HTMLImageElement;
  private coverRotate = 0;
  playing = false;

  constructor({
    fftSize = 1024,
    audioContext,
    sourceNode
  }: VisualizerParticleOption) {
    this.cover = new Image();
    this.cover.src = '/assets/image/Electro_House_Top_Hits.png';
    this.sourceNode = sourceNode;
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = fftSize;
    console.log('fft size', fftSize);
    console.log('buffer length', this.analyser.frequencyBinCount);
    sourceNode.connect(this.analyser);
    requestAnimationFrame(this.plot.bind(this));
  }

  private plot(): void {
    if (this.destroyed) { return; }
    const bufferLength = this.analyser.frequencyBinCount;
    const frequencyDomainDataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(frequencyDomainDataArray);
    for (const canvas of this.canvases) {
      this.drawFrequencyDomainCanvas(frequencyDomainDataArray, canvas);
    }
    requestAnimationFrame(this.plot.bind(this));
  }

  private drawFrequencyDomainCanvas(dataArray: Uint8Array, canvas: HTMLCanvasElement): void {
    const canvasContext = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 1200;
    const rect = canvas.getBoundingClientRect();
    canvasContext!.scale(canvas.width / rect.width, canvas.height / rect.height);
    if (!canvasContext) { return; }

    /**
     * 坐标原点，取画布中心点
     * 需要取计算后样式的中心点，画布的尺寸进行了等比例缩放
     * 如果取得是画布尺寸的中心点，则当画布样式宽高比例和画布尺寸宽高比例不同时会不同于预期
     */
    const O = {
      x: rect.width / 2,
      y: rect.height / 2
    };
    /**
     * 圆圈的半径
     */
    const R = 100;
    /**
     * 粒子最大跳动距离
     */
    const D = 50;
    /**
     * 封面最大宽度
     */
    const coverMaxWidth = 2 * (R - 12);

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = canvasContext.createLinearGradient(O.x, O.y - R - 30, O.x, O.y + R + 30);
    gradient.addColorStop(0, '#C6FFDD');
    gradient.addColorStop(0.5, '#FBD786');
    gradient.addColorStop(1, '#f7797d');
    canvasContext.fillStyle = gradient;
    canvasContext.strokeStyle = gradient;
    canvasContext.save();

    canvasContext.translate(O.x, O.y);
    canvasContext.rotate(this.coverRotate * Math.PI / 180);
    canvasContext.translate(-O.x, -O.y);

    canvasContext.beginPath();
    canvasContext.arc(O.x, O.y, R - 12, 0, Math.PI * 2);
    canvasContext.stroke();
    canvasContext.clip();
    const coverWidth = coverMaxWidth;
    const coverHeight = coverMaxWidth;
    canvasContext.drawImage(
      this.cover,
      O.x - coverWidth / 2,
      O.y - coverHeight / 2,
      coverWidth,
      coverHeight
    );
    if (this.playing) {
      this.coverRotate += 0.8;
    }

    canvasContext.restore();

    const radius = 3;
    const arr = [];
    for (let i = 1; i <= 10; i++) {
      arr.push(dataArray[i * 15]);
    }
    arr.push(...arr.slice().reverse());
    arr.push(...arr.slice().reverse());
    arr.push(...arr.slice().reverse());
    let n = 0;
    this.particles.push(new Circle(O.x, O.y, R - 3 * radius));
    for (let i = -0.25 * Math.PI; i <= 1.75 * Math.PI; i += Math.PI * 0.025) {
      const data = arr[n];
      let r = data > R ? data : R;
      r = R + (r - R) / (255 - R) * D;
      this.particles.push(
        new Particle(O.x + r * Math.cos(i), O.y + r * Math.sin(i), radius)
      );
      n++;
    }

    for (const particle of this.particles) {
      particle.draw(canvasContext);
    }
    this.particles.length = 0;
  }

  addCanvas(canvas: HTMLCanvasElement): RemoveCanvas {
    const index = this.canvases.push(canvas);
    return () => this.canvases.splice(index, 1);
  }

  destroy(): void {
    this.destroyed = true;
    this.canvases.length = 0;
    this.sourceNode.disconnect(this.analyser);
    this.analyser.disconnect();
  }
}
