import { Component, Inject } from '@angular/core';

@Component({
  templateUrl: 'examples.component.html',
  styleUrls: ['examples.component.scss']
})
export class ExamplesComponent {
  constructor(
    @Inject('EXAMPLES') public examples: Array<{
      title: string;
      subtitle: string;
      path: string;
    }>
  ) {}
}
