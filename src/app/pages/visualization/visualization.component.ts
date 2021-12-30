import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import {
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

@Component({
  templateUrl: 'visualization.component.html',
  styleUrls: ['visualization.component.scss'],
})
export class VisualizationComponent implements OnDestroy {
  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;
  private source?: AudioBufferSourceNode;
  private visualizer?: VisualizerParticle;
  loaded = false;
  loadProgress = 0;

  constructor(
    private http: HttpClient,
    @Inject(GLOBAL_AUDIO_CONTEXT) private ac: AudioContext,
    private _audioService: AudioService
  ) {
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
          this.source = this.ac.createBufferSource();
          this.source.buffer = await this.ac.decodeAudioData(
            event.data as ArrayBuffer
          );
          this.source.connect(this.ac.destination);
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
      audioContext: this.ac,
    });
    vParticle.addCanvas($canvas);
    this.visualizer = vParticle;
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
  }
}
