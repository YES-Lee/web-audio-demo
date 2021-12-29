import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  ViewChild,
} from '@angular/core';
import { EqualizerComponent } from '../../components/equalizer/equalizer.component';
import { OscilloscopeDirective } from '../../directives/oscilloscope.directive';
import { GLOBAL_AUDIO_CONTEXT } from '../../shared/inject-tokens';

@Component({
  templateUrl: 'biquad-filter.component.html',
  styleUrls: ['biquad-filter.component.scss'],
})
export class BiquadFilterComponent implements AfterViewInit {
  @ViewChild('audioRef') audioRef!: ElementRef<HTMLAudioElement>;
  @ViewChild('eqRef') eqRef!: EqualizerComponent;
  @ViewChild('frequencyDomainOscilloscope')
  frequencyDomainOscilloscope!: OscilloscopeDirective;
  @ViewChild('timeDomainOscilloscope')
  timeDomainOscilloscope!: OscilloscopeDirective;

  private source?: MediaElementAudioSourceNode;

  constructor(@Inject(GLOBAL_AUDIO_CONTEXT) private ac: AudioContext) {}

  ngAfterViewInit(): void {
    const $audio = this.audioRef.nativeElement;
    this.source = this.ac.createMediaElementSource($audio);
    const res = this.eqRef.connect(this.source);

    this.timeDomainOscilloscope.start(res);
    this.frequencyDomainOscilloscope.start(res);
  }

  handlePlay() {
    this.ac.resume();
  }
}
