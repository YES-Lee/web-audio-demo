import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  ViewChild,
} from '@angular/core';
import { GLOBAL_AUDIO_CONTEXT } from '../../shared/inject-tokens';
import { Listener } from './listener';
import { Speaker } from './speaker';

@Component({
  templateUrl: 'panner.component.html',
  styleUrls: ['panner.component.scss'],
})
export class PannerComponent implements AfterViewInit {
  @ViewChild('audioRef') audioRef!: ElementRef<HTMLAudioElement>;

  private source!: MediaElementAudioSourceNode;
  private panner!: PannerNode;
  private listener!: AudioListener;
  private speakerNode!: Speaker;
  private listenerNode!: Listener;
  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;

  constructor(@Inject(GLOBAL_AUDIO_CONTEXT) private ac: AudioContext) {}

  ngAfterViewInit(): void {
    this.initPanner();
    this.initCanvas();
  }

  initPanner(): void {
    this.source = this.ac.createMediaElementSource(this.audioRef.nativeElement);
    this.panner = this.ac.createPanner();
    this.panner.panningModel = 'HRTF'; // 音频空间化算法模型
    this.panner.distanceModel = 'inverse'; // 远离时的音量衰减算法
    this.panner.maxDistance = 500;
    this.panner.refDistance = 50; // 开始衰减的参考距离
    this.panner.rolloffFactor = 1; // 衰减速度
    this.panner.coneInnerAngle = 360; // 声音球形扩散
    this.panner.coneOuterAngle = 0;
    this.panner.coneOuterGain = 0;
    this.panner.orientationX.value = 0; // 声源朝向x分量
    this.panner.orientationY.value = 0;
    this.panner.orientationZ.value = 1;

    this.listener = this.ac.listener;
    this.listener.forwardX.value = 0; // 收听者面部朝向向量
    this.listener.forwardY.value = 0;
    this.listener.forwardZ.value = -1; // 设置与panner朝向相反，即与panner面对面
    this.listener.upX.value = 0; // 收听着头部朝向向量
    this.listener.upY.value = 1;
    this.listener.upZ.value = 0;

    this.source.connect(this.panner);
    this.panner.connect(this.ac.destination);
  }

  initCanvas(): void {
    const $canvas = this.canvasRef.nativeElement;
    const rect = $canvas.getBoundingClientRect();
    $canvas.width = rect.width;
    $canvas.height = rect.height;
    const canvasCtx = $canvas.getContext('2d');

    this.listenerNode = new Listener($canvas.width / 2, $canvas.height / 2);
    this.listenerNode.onLoad = () => {
      this.listenerNode.draw(canvasCtx!);
      this.updateListenerPosition(this.listenerNode.x, 0, this.listenerNode.y);
    };

    this.speakerNode = new Speaker($canvas.width / 2, $canvas.height / 2 - 100);
    this.speakerNode.onLoad = () => {
      this.speakerNode.draw(canvasCtx!);
      this.updatePannerPosition(this.speakerNode.x, 0, this.speakerNode.y);
    };

    const lastPos = {
      x: 0,
      y: 0,
    };
    $canvas.addEventListener('mousemove', (event) => {
      const { offsetX, offsetY } = event;
      if (this.speakerNode.isMouseOver(offsetX, offsetY)) {
        $canvas.style.cursor = 'move';
      } else {
        $canvas.style.cursor = 'default';
      }

      if (this.speakerNode.dragging) {
        this.speakerNode.x += offsetX - lastPos.x;
        this.speakerNode.y += offsetY - lastPos.y;
        lastPos.x = offsetX;
        lastPos.y = offsetY;
        this.updatePannerPosition(this.speakerNode.x, 0, this.speakerNode.y);
        window.requestAnimationFrame(() => {
          canvasCtx!.clearRect(0, 0, $canvas.width, $canvas.height);
          this.listenerNode.draw(canvasCtx!);
          this.speakerNode.draw(canvasCtx!);
        });
      }
    });

    window.addEventListener('mousedown', (event) => {
      const { offsetX, offsetY } = event;
      lastPos.x = offsetX;
      lastPos.y = offsetY;
      this.speakerNode.dragging = this.speakerNode.isMouseOver(
        offsetX,
        offsetY
      );
    });

    window.addEventListener('mouseup', () => {
      this.speakerNode.dragging = false;
    });
  }

  updatePannerPosition(x: number, y: number, z: number): void {
    this.panner.positionX.value = x;
    this.panner.positionY.value = y;
    this.panner.positionZ.value = z;
  }

  updateListenerPosition(x: number, y: number, z: number): void {
    this.listener.positionX.value = x;
    this.listener.positionY.value = y;
    this.listener.positionZ.value = z;
  }

  handlePlay() {
    this.ac.resume();
  }
}
