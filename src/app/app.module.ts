import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { SharedModule } from './shared/shared.module';
import { ExamplesComponent } from './pages/examples/examples.component';
import { OscillatorComponent } from './pages/oscillator/oscillator.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { VisualizationComponent } from './pages/visualization/visualization.component';
import { AudioStreamComponent } from './pages/audio-stream/audio-stream.component';
import { BiquadFilterComponent } from './pages/biquad-filter/biquad-filter.component';
import { HttpClientModule } from '@angular/common/http';
import { EqualizerComponent } from './components/equalizer/equalizer.component';
import { PannerComponent } from './pages/panner/panner.component';
import { WhiteNoiseComponent } from './pages/white-noise/white-noise.component';
import { ConvolverComponent } from './pages/convolver/convolver.component';
import { OscilloscopeDirective } from './directives/oscilloscope.directive';
import { GLOBAL_AUDIO_CONTEXT } from './shared/inject-tokens';

@NgModule({
  declarations: [
    OscilloscopeDirective,
    AppComponent,
    ExamplesComponent,
    OscillatorComponent,
    VisualizationComponent,
    AudioStreamComponent,
    BiquadFilterComponent,
    EqualizerComponent,
    PannerComponent,
    WhiteNoiseComponent,
    ConvolverComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatSliderModule,
    MatSelectModule,
    HttpClientModule,
    AppRoutingModule,
  ],
  providers: [
    {
      provide: GLOBAL_AUDIO_CONTEXT,
      useValue: new AudioContext(),
    },
    {
      provide: 'EXAMPLES',
      useValue: [
        {
          title: '白噪声',
          subtitle: '用buffer生成一段白噪声音频',
          path: '/white-noise',
        },
        {
          title: '振荡器',
          subtitle: '使用振荡器合成不同波形的周期信号',
          path: '/oscillator',
        },
        {
          title: '可视化',
          subtitle: '一个简单的音乐播放动效',
          path: '/visualization',
        },
        {
          title: '音频流',
          subtitle: '对实时音频流进行分析、处理',
          path: '/audio-stream',
        },
        {
          title: '均衡器',
          subtitle: '使用BiquadFilter实现均衡器',
          path: '/biquad-filter',
        },
        {
          title: '空间音频',
          subtitle: '3D立体空间音频效果',
          path: '/panner',
        },
        {
          title: '环境混响',
          subtitle: '使用卷积处理节点实现音频混响效果',
          path: '/convolver',
        },
      ],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
