import { Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { OscilloscopeDirective } from '../../directives/oscilloscope.directive';
import { GLOBAL_AUDIO_CONTEXT } from '../../shared/inject-tokens';

@Component({
  templateUrl: 'oscillator.component.html',
  styleUrls: ['oscillator.component.scss'],
})
export class OscillatorComponent implements OnDestroy {
  @ViewChild('timeDomainOscilloscope')
  timeDomainOscilloscope!: OscilloscopeDirective;
  @ViewChild('frequencyDomainOscilloscope')
  frequencyDomainOscilloscope!: OscilloscopeDirective;

  private sourceNode?: OscillatorNode | null;
  private gainNode: GainNode;

  waveType: OscillatorNode['type'] = 'sine';
  frequency = 560;
  gain = 0.8;

  constructor(
    @Inject(GLOBAL_AUDIO_CONTEXT)
    private audioContext: AudioContext
  ) {
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = this.gain;
  }

  handlePlay(): void {
    if (this.sourceNode) {
      return;
    }
    this.sourceNode = this.audioContext.createOscillator();
    this.sourceNode.type = this.waveType;
    this.sourceNode.frequency.value = this.frequency;
    this.sourceNode.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);
    this.sourceNode.start();

    this.timeDomainOscilloscope.start(this.sourceNode);
    this.frequencyDomainOscilloscope.start(this.sourceNode);
  }

  handleStop(): void {
    if (!this.sourceNode) {
      return;
    }
    this.sourceNode.stop();
    this.sourceNode = null;
  }

  handleFrequencyChange(value: string): void {
    this.frequency = +value;
    if (this.sourceNode) {
      this.sourceNode.frequency.value = this.frequency;
    }
  }

  handleGainChange(value: string): void {
    this.gain = +value;
    this.gainNode.gain.value = this.gain;
  }

  handleChangeWaveType(type: OscillatorNode['type']): void {
    if (this.sourceNode) {
      if (type === 'custom') {
        const real = [0, 0, 1, 0, 1]; // cosine terms
        const imag = [0, 0, 0, 0, 0]; // sine terms
        const periodicWave = this.audioContext.createPeriodicWave(real, imag);
        this.sourceNode.setPeriodicWave(periodicWave);
      } else {
        this.waveType = type;
        this.sourceNode.type = type;
      }
    }
  }

  ngOnDestroy(): void {
    this.timeDomainOscilloscope.stop();
    this.frequencyDomainOscilloscope.stop();
    this.sourceNode?.disconnect();
    this.audioContext?.close();
  }
}
