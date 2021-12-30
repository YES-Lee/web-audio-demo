import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AudioStreamComponent } from './pages/audio-stream/audio-stream.component';
import { BiquadFilterComponent } from './pages/biquad-filter/biquad-filter.component';
import { ConvolverComponent } from './pages/convolver/convolver.component';
import { ExamplesComponent } from './pages/examples/examples.component';
import { OscillatorComponent } from './pages/oscillator/oscillator.component';
import { PannerComponent } from './pages/panner/panner.component';
import { VisualizationComponent } from './pages/visualization/visualization.component';
import { WhiteNoiseComponent } from './pages/white-noise/white-noise.component';

const routes: Routes = [
  {
    path: '',
    component: ExamplesComponent,
  },
  {
    path: 'oscillator',
    component: OscillatorComponent,
  },
  {
    path: 'visualization',
    component: VisualizationComponent,
  },
  {
    path: 'audio-stream',
    component: AudioStreamComponent,
  },
  {
    path: 'biquad-filter',
    component: BiquadFilterComponent,
  },
  {
    path: 'panner',
    component: PannerComponent,
  },
  {
    path: 'white-noise',
    component: WhiteNoiseComponent,
  },
  {
    path: 'convolver',
    component: ConvolverComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
