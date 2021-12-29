import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { OscilloscopeDirective } from '../../directives/oscilloscope.directive';
import { GLOBAL_AUDIO_CONTEXT } from '../../shared/inject-tokens';

@Component({
  templateUrl: 'white-noise.component.html',
  styleUrls: ['white-noise.component.scss'],
})
export class WhiteNoiseComponent implements OnDestroy {
  private _source?: AudioBufferSourceNode;

  @ViewChild('timeDomainOscilloscope')
  timeDomainOscilloscope!: OscilloscopeDirective;
  @ViewChild('frequencyDomainOscilloscope')
  frequencyDomainOscilloscope!: OscilloscopeDirective;

  constructor(@Inject(GLOBAL_AUDIO_CONTEXT) private ac: AudioContext) {}

  handlePlay(): void {
    this._source = this.ac.createBufferSource();
    const buffer = this.ac.createBuffer(
      2,
      1 * this.ac.sampleRate,
      this.ac.sampleRate
    );
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        channelData[i] = Math.random() * 2 - 1;
      }
    }
    this._source.buffer = buffer;
    this._source.connect(this.ac.destination);
    this._source.start(0);

    this.timeDomainOscilloscope.start(this._source);
    this.frequencyDomainOscilloscope.start(this._source);
  }

  ngOnDestroy(): void {
    this._source?.stop();
    this._source?.disconnect();
    this.timeDomainOscilloscope.stop();
    this.frequencyDomainOscilloscope.stop();
  }
}
