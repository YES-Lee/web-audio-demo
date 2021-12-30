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
    @Inject(GLOBAL_AUDIO_CONTEXT) private ac: AudioContext
  ) {
    this.loadMusic();
  }

  loadMusic(): void {
    const req = new HttpRequest(
      'GET',
      '/assets/audio/Return of the Heroes.mp3',
      null,
      {
        reportProgress: true,
        responseType: 'arraybuffer',
      }
    );
    this.http
      .request<ArrayBuffer>(req)
      .pipe(
        map((event) => {
          if (event.type === HttpEventType.DownloadProgress && event.total) {
            this.loadProgress =
              Math.round((10000 * event.loaded) / event.total) / 100;
          }
          return event as any;
        }),
        last<HttpResponse<ArrayBuffer>>()
      )
      .subscribe(async (res) => {
        this.source = this.ac.createBufferSource();
        this.source.buffer = await this.ac.decodeAudioData(res.body!);
        this.source.connect(this.ac.destination);
        this.loaded = true;
        this.initCanvas();
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
