import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';

import { Upload } from './upload';
import { MessageService } from './message.service';


@Injectable()
export class UploadService {

  private uploadsUrl = 'api/uploads'; // URL to the web api, TODO APIG+Lambda

  constructor(private http: HttpClient,
    private messageService: MessageService) { }

  private log(message: string) {
    this.messageService.add('UploadService: ' + message);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);   // let app continue by returning empty type
    };
  }

  // use RxJS `map` if data we want is buried in the returned HTTP JSON

  getUploads(): Observable<Upload[]> {
    this.messageService.add('UploadService: fetching uploads');
    return this.http.get<Upload[]>(this.uploadsUrl)
      .pipe(
      tap(uploads => this.log(`fetched uploads`)),
      catchError(this.handleError('getUploads', []))
      );
  }

  getUpload(id: string): Observable<Upload> {
    // 404 if not found
    const url = `${this.uploadsUrl}/${id}`;
    return this.http.get<Upload>(url).pipe(
      tap(_ => this.log(`fetched upload id=${id}`)),
      catchError(this.handleError<Upload>(`getUpload id=${id}`))
    );
  }

}
