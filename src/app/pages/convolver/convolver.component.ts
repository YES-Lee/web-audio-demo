import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';

@Component({
  templateUrl: 'convolver.component.html',
  styleUrls: ['convolver.component.scss'],
})
export class ConvolverComponent implements OnDestroy, AfterViewInit {
  impulseList = [
    {
      name: '电话',
      src: '/assets/audio/impulse/filter-telephone.wav',
    },
    {
      name: '室内',
      src: '/assets/audio/impulse/spreader50-65ms.wav',
    },
    {
      name: '山洞',
      src: '/assets/audio/impulse/feedback-spring.wav',
    },
    {
      name: '教堂',
      src: '/assets/audio/impulse/bin_dfeq/s2_r4_bd.wav',
    },
    {
      name: '厨房',
      src: '/assets/audio/impulse/house-impulses/kitchen-true-stereo.wav',
    },
    {
      name: '洗手间',
      src: '/assets/audio/impulse/house-impulses/living-bedroom-leveled.wav',
    },
  ];

  private impulseName = '无';
  private ac: AudioContext;
  private source?: MediaElementAudioSourceNode;
  private convolver?: ConvolverNode;

  @ViewChild('audioRef') audioRef!: ElementRef<HTMLAudioElement>;

  get mode(): string {
    return this.impulseName;
  }
  set mode(value: string) {
    this.impulseName = value;
    if (value !== '无') {
      const node = this.impulseList.find((item) => item.name === value);
      this.setImpulse(node!.src);
    } else {
      this.source?.disconnect();
      this.source?.connect(this.ac.destination);
    }
  }

  constructor(private http: HttpClient) {
    this.ac = new AudioContext();
  }

  ngAfterViewInit(): void {
    this.source = this.ac.createMediaElementSource(this.audioRef.nativeElement);
    this.convolver = this.ac.createConvolver();
    this.source.connect(this.ac.destination);
    this.convolver.connect(this.ac.destination);
  }

  setImpulse(impulse: string): void {
    this.http
      .get(impulse, {
        responseType: 'arraybuffer',
      })
      .subscribe(async (buffer) => {
        this.convolver!.buffer = await this.ac.decodeAudioData(buffer);
        this.source?.disconnect();
        this.source?.connect(this.convolver!);
      });
  }

  ngOnDestroy(): void {}
}
