import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'time' })
export class TimePipe implements PipeTransform {
  transform(value: string, ...args: any[]): string {
    if (typeof value !== 'number' || Number.isNaN(+value)) { return value; }

    return Math.floor(value / 60) + ':' + Math.floor(value % 60);
  }
}
