import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { VisualizerParticle } from '../../components/visualizer-particle/visualizer-particle';
import { last, map } from 'rxjs/operators';
import { GLOBAL_AUDIO_CONTEXT } from '../../shared/inject-tokens';
import {
  AudioService,
  LoadAudioEventType,
} from '../../shared/services/audio.service';
import { Subject } from 'rxjs';

@Component({
  templateUrl: 'visualization.component.html',
  styleUrls: ['visualization.component.scss'],
})
export class VisualizationComponent implements OnDestroy, AfterViewInit {
  @ViewChild('playButton', { read: ElementRef })
  playButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;
  private source?: AudioBufferSourceNode;
  private visualizer?: VisualizerParticle;
  private _analyser: AnalyserNode;
  private _destroy$: Subject<void>;
  loaded = false;
  loadProgress = 0;

  constructor(
    private http: HttpClient,
    @Inject(GLOBAL_AUDIO_CONTEXT) private _ac: AudioContext,
    private _audioService: AudioService
  ) {
    this._destroy$ = new Subject();
    this._analyser = this._ac.createAnalyser();
  }

  ngAfterViewInit(): void {
    this.loadMusic();
  }

  loadMusic(): void {
    this._audioService
      .loadAudio('/assets/audio/Return of the Heroes.mp3')
      .subscribe(async (event) => {
        if (event.type === LoadAudioEventType.DownloadProgress) {
          this.loadProgress = event.data as number;
        }
        if (event.type === LoadAudioEventType.Response) {
          this.source = this._ac.createBufferSource();
          this.source.buffer = await this._ac.decodeAudioData(
            event.data as ArrayBuffer
          );
          this.source.connect(this._ac.destination);
          this.loaded = true;
          this.initCanvas();
        }
      });
  }

  initCanvas(): void {
    const $canvas = this.canvasRef.nativeElement;
    const vParticle = new VisualizerParticle({
      fftSize: 1024,
      sourceNode: this.source!,
      audioContext: this._ac,
    });
    vParticle.addCanvas($canvas);
    this.visualizer = vParticle;

    this._initButton();
  }

  handleStart(): void {
    if (!this.visualizer!.playing) {
      this.source?.start();
      this.visualizer!.playing = true;
    }
  }

  ngOnDestroy(): void {
    this.visualizer?.destroy();
    this.source?.disconnect();
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _initButton() {
    this._analyser.maxDecibels = 0;
    this._analyser.fftSize = 1024;
    this.source?.connect(this._analyser);

    const getDb = (data: Uint8Array, frequency: number) => {
      const index = Math.round(
        this._analyser.fftSize * 0.5 * ((frequency * 2) / this._ac.sampleRate)
      );
      return data[index];
    };

    const dataArray = new Uint8Array(this._analyser.frequencyBinCount);

    let rafId: number;

    const update = () => {
      this._analyser.getByteFrequencyData(dataArray);
      const dbs: number[] = [];
      for (let i = 30; i < 150; i++) {
        dbs.push(getDb(dataArray, i));
      }
      const db = dbs.reduce((total, current) => total + current) / dbs.length;
      this.playButton.nativeElement.style.transform = `scale(${1 + db / 255})`;

      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);

    this._destroy$.subscribe(() => {
      cancelAnimationFrame(rafId);
    });
  }
}
