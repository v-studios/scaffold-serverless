import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';

import { Upload } from './upload';
import { MessageService } from './message.service';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable()
export class UploadService {

  // private uploadsUrl = 'api/uploads'; // URL to the InMemory web api
  private uploadsUrl = 'https://3zgerpnde3.execute-api.us-east-1.amazonaws.com/local/assets';

  constructor(
    private http: HttpClient,
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

  searchUploads(term: string): Observable<Upload[]> {
    if (!term.trim()) {
      return of([]);
    }
    // use `id` as the search target, not tutorial's `name`
    const url = `${this.uploadsUrl}?term=${term}`;
    return this.http.get<Upload[]>(url).pipe(
      tap(_ => this.log(`found uploads matching "${term}"`)),
      catchError(this.handleError<Upload[]>('searchUploads', []))
    );
  }

  getUpload(id: string): Observable<Upload> {
    // 404 if not found
    const url = `${this.uploadsUrl}/${id}`;
    return this.http.get<Upload>(url).pipe(
      tap(_ => this.log(`fetched upload id=${id}`)),
      // TODO: this doesn't display the 404: getUpload id=... failed: undefined
      // Perhaps the full code handles that? 
      catchError(this.handleError<Upload>(`getUpload id=${id}`))
    );
  }

  updateUpload(upload: Upload): Observable<any> {
    return this.http.put(this.uploadsUrl, upload, httpOptions).pipe(
      tap(_ => this.log(`updated upload id=${upload.id}`)),
      catchError(this.handleError<any>('updateUpload')),
    );
  }

  addUpload(upload: Upload): Observable<Upload> {
    return this.http.post<Upload>(this.uploadsUrl, upload, httpOptions).pipe(
      tap((hero: Upload) => this.log(`added upload id=${upload.id}`)),
      catchError(this.handleError<Upload>('addUpload'))
    );
  }

  deleteUpload(upload: Upload | string): Observable<Upload> {
    // Our id is a string, the S3 key, not a number
    const id = typeof upload === 'string' ? upload : upload.id;
    const url = `${this.uploadsUrl}/${id}`

    return this.http.delete<Upload>(url, httpOptions).pipe(
      tap(_ => this.log(`deleted upload id=${id}`)),
      catchError(this.handleError<Upload>('deleteUpload'))
    );
  }


}

