import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';

import { Upload } from './upload';
import { UploadURL } from './upload-url';

import { MessageService } from './message.service';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable()
export class UploadService {

  // private uploadsUrl = 'api/uploads'; // URL to the InMemory web api
  private uploadsUrl = 'https://3zgerpnde3.execute-api.us-east-1.amazonaws.com/local/assets';
  private uploadsGetUrl = 'https://3zgerpnde3.execute-api.us-east-1.amazonaws.com/local/upload_url';
  private baseUrl = 'https://3zgerpnde3.execute-api.us-east-1.amazonaws.com/local';

  private readbody;

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
    // TODO: get an UPLOAD URL from API then PUT a file to that URL
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

  // Use 2 services for the upload:
  // 1. getUploadUrl: returns a presigned URL from API
  // 2. putUploadFile: HTTP PUT file to S3

  getUploadURL(file0): Observable<UploadURL> {
    const filename = file0.name;
    const contentType = file0.type;
    const url = `${this.baseUrl}/upload_url?filename=${filename}`;
    const headers = { 'Content-Type': contentType };
    const options = { 'headers': headers };
    this.log(`getUploadURL contentType=${contentType} filename=${filename} url=${url}`);
    // API returns like: {'url': url}
    return this.http.get<UploadURL>(url, options).pipe(
      tap(uploadURL => this.log(`got upload=${uploadURL.url}`)),
      catchError(this.handleError<UploadURL>('getUploadURL'))
    );
  }

  putUploadFile(uploadURL: UploadURL, file0): Observable<any> { // TODO type of file0
    // TODO: import {RequestOptions, Headers} from @angular/http
    const contentType = file0.type;
    const headers = { 'Content-Type': contentType };
    const options = { 'headers': headers };

    var reader = new FileReader();
    var readbody = 'READBODY';               // type?
    var that = this;

    reader.onloadend = function() {
      that.log(`onloaded orig should be empty readbody=${readbody}`);
      readbody = reader.result; // save to outer scope?
      that.log(`putUploadFile ONLOADEND READBODY=${readbody}`); // we have content here
    }
    reader.readAsBinaryString(file0);  // other methods less deprecated??
    // I think the below may be happening async, before my onloaded() has returned?
    this.log(`putUploadFile OUTSIDE READBODY=${readbody}`); // undefined

    return this.http.put(uploadURL.url, 'WIRED STRING', options).pipe(
      tap(res => that.log(`putUploadFile got res=${res}`)),
      catchError(that.handleError<UploadURL>('putUploadFile'))
    );
  }

}

