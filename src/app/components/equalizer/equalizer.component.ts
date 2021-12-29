import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { GLOBAL_AUDIO_CONTEXT } from '../../shared/inject-tokens';

@Component({
  selector: 'app-equalizer',
  templateUrl: 'equalizer.component.html',
  styleUrls: ['equalizer.component.scss'],
})
export class EqualizerComponent {
  static FREQUENCY: Array<{
    type: BiquadFilterNode['type'];
    frequency: number;
    q?: number;
  }> = [
    {
      type: 'lowshelf',
      frequency: 320,
    },
    {
      type: 'peaking',
      frequency: 1000,
      q: 10,
    },
    {
      type: 'highshelf',
      frequency: 3200,
    },
  ];
  filterList: BiquadFilterNode[] = [];

  constructor(@Inject(GLOBAL_AUDIO_CONTEXT) private ac: AudioContext) {
    this.initFilter(ac);
  }

  private initFilter(ac: AudioContext): void {
    EqualizerComponent.FREQUENCY.reduce(
      (prevFilter: BiquadFilterNode, current) => {
        const filter = ac.createBiquadFilter();
        filter.type = current.type;
        if (current.q) {
          filter.Q.value = current.q;
        }
        filter.frequency.value = current.frequency;
        filter.gain.value = 0;
        if (prevFilter) {
          filter.connect(prevFilter);
        }
        this.filterList.push(filter);
        return filter;
      },
      null as any
    );
    this.filterList[0].connect(ac.destination);
  }

  connect(sourceNode: AudioNode): AudioNode {
    sourceNode.connect(this.filterList[this.filterList.length - 1]);
    return this.filterList[this.filterList.length - 1];
  }

  formatLabel(value: number): string {
    return `${value}db`;
  }
}
