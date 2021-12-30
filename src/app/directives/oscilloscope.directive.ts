import {
  Directive,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { GLOBAL_AUDIO_CONTEXT } from '../shared/inject-tokens';

@Directive({
  selector: 'canvas[oscilloscope]',
  exportAs: 'oscilloscope',
})
export class OscilloscopeDirective implements OnInit, OnDestroy {
  @Input() type: 'time' | 'frequency' = 'time';
  @Input() fftSize: number = 2048;

  private _source?: AudioNode;
  private _analyser?: AnalyserNode;
  private _rafId?: number | null;

  constructor(
    private _elementRef: ElementRef<HTMLCanvasElement>,
    private _renderer2: Renderer2,
    @Inject(GLOBAL_AUDIO_CONTEXT) private _audioContext: AudioContext
  ) {}

  ngOnInit(): void {
    this._renderer2.setStyle(
      this._elementRef.nativeElement,
      'border',
      '1px solid #cccccc'
    );
    this._renderer2.setStyle(
      this._elementRef.nativeElement,
      'display',
      'block'
    );
    this._renderer2.setStyle(
      this._elementRef.nativeElement,
      'margin',
      '1rem auto'
    );
    this._renderer2.setStyle(
      this._elementRef.nativeElement,
      'background-size',
      '10px 10px, 10px 10px, 50px 50px, 50px 50px'
    );
    this._renderer2.setStyle(
      this._elementRef.nativeElement,
      'background-image',
      'linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 0), linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 0), linear-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 0), linear-gradient(90deg, rgba(0, 0, 0, 0.08) 1px, transparent 0)'
    );
    this._renderer2.setStyle(this._elementRef.nativeElement, 'width', '512px');
    this._renderer2.setStyle(this._elementRef.nativeElement, 'height', '100px');
  }

  ngOnDestroy(): void {
    this.stop();
  }

  public start(source: AudioNode) {
    if (this._analyser) {
      this._analyser.disconnect();
    }
    this._source = source;
    this._analyser = this._audioContext.createAnalyser();
    this._analyser.fftSize = this.fftSize;
    this._source.connect(this._analyser);
    if (!this._rafId) {
      this.plot();
    }

    this._source.addEventListener('ended', () => {
      this.stop();
    });
  }

  public stop() {
    this._source?.disconnect();
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  private plot(): void {
    if (!this._analyser) return;
    const bufferLength = this._analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    switch (this.type) {
      case 'frequency': {
        this._analyser.getByteFrequencyData(dataArray);
        this.drawFrequencyDomain(dataArray);
        break;
      }
      case 'time': {
        this._analyser.getByteTimeDomainData(dataArray);
        this.drawTimeDomain(dataArray);
        break;
      }
      default:
        break;
    }
    this._rafId = requestAnimationFrame(this.plot.bind(this));
  }

  private drawTimeDomain(dataArray: Uint8Array): void {
    const canvas = this._elementRef.nativeElement;
    const bufferLength = dataArray.length;
    const canvasContext = canvas.getContext('2d');
    canvas.width = bufferLength;
    canvas.height = 300;
    if (!canvasContext) {
      return;
    }
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    canvasContext.lineWidth = 2;
    canvasContext.strokeStyle = '#00BCD4';

    canvasContext.beginPath();
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (const item of dataArray) {
      let y = item / 128;
      y = (y * canvas.height) / 2;
      canvasContext.lineTo(x, y);
      x += sliceWidth;
    }
    canvasContext.stroke();
  }

  private drawFrequencyDomain(dataArray: Uint8Array): void {
    const canvas = this._elementRef.nativeElement;
    const bufferLength = dataArray.length;
    const canvasContext = canvas.getContext('2d');
    canvas.width = bufferLength;
    canvas.height = 300;
    if (!canvasContext) {
      return;
    }

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    canvasContext.fillStyle = '#00BCD4';
    const gap = 1;
    const barWidth = (canvas.width * 2) / bufferLength;
    let barHeight = 0;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      barHeight = ((canvas.height - 40) * (dataArray[i] || 1)) / 255;
      canvasContext.fillRect(
        x,
        (canvas.height - barHeight) / 2,
        barWidth,
        barHeight
      );
      x += barWidth + gap;
    }
  }
}
