import {
  HttpClient,
  HttpEventType,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { last, map } from 'rxjs/operators';

export enum LoadAudioEventType {
  DownloadProgress,
  Response,
}

export interface LoadAudioEvent<T> {
  type: LoadAudioEventType.DownloadProgress | LoadAudioEventType.Response;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AudioService {
  constructor(private _http: HttpClient) {}

  loadAudio(url: string) {
    const req = new HttpRequest('GET', url, null, {
      reportProgress: true,
      responseType: 'arraybuffer',
    });
    return new Observable<LoadAudioEvent<number | ArrayBuffer>>((observer) => {
      this._http
        .request<ArrayBuffer>(req)
        .pipe(
          map((event) => {
            if (event.type === HttpEventType.DownloadProgress && event.total) {
              observer.next({
                type: LoadAudioEventType.DownloadProgress,
                data: Math.round((10000 * event.loaded) / event.total) / 100,
              });
            }
            return event as any;
          }),
          last<HttpResponse<ArrayBuffer>>()
        )
        .subscribe(
          (res) => {
            if (res.body) {
              observer.next({
                type: LoadAudioEventType.Response,
                data: res.body,
              });
            } else {
              observer.error(new Error('音频加载失败'));
            }

            observer.complete();
          },
          (error) => observer.error(error)
        );
    });
  }
}
