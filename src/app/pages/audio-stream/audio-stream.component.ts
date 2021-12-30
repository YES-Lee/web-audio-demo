import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { OscilloscopeDirective } from '../../directives/oscilloscope.directive';
import { GLOBAL_AUDIO_CONTEXT } from '../../shared/inject-tokens';

@Component({
  templateUrl: 'audio-stream.component.html',
  styleUrls: ['audio-stream.component.scss'],
})
export class AudioStreamComponent implements OnDestroy {
  private stream!: MediaStream;
  private source!: MediaStreamAudioSourceNode;

  @ViewChild('timeDomainOscilloscope')
  timeDomainOscilloscope!: OscilloscopeDirective;
  @ViewChild('frequencyDomainOscilloscope')
  frequencyDomainOscilloscope!: OscilloscopeDirective;

  constructor(@Inject(GLOBAL_AUDIO_CONTEXT) private ac: AudioContext) {}

  handleClickStart(): void {
    if (this.stream) {
      return;
    }
    this.ac.resume();
    window.navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((stream) => {
        this.stream = stream;
        this.initOscilloscope();
      });
  }

  private initOscilloscope(): void {
    this.source = this.ac.createMediaStreamSource(this.stream);
    this.timeDomainOscilloscope.start(this.source);
    this.frequencyDomainOscilloscope.start(this.source);
  }

  ngOnDestroy(): void {
    this.source?.disconnect();
    this.stream?.getTracks().map((track) => track.stop());
  }
}
