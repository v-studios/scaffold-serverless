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

  getUploadURL(filename: string): Observable<UploadURL> {
    // We may want to get name, size, type, etc from HTML5 File:
    // https://stackoverflow.com/questions/27227788/get-source-and-name-of-selected-file-with-angularjs
    // We probably have to return an HTML File type
    // since browser may not let us access the filesystem path
    // TODO: we can't pass filename=C:\fakepath\my_file.mp3 -- can't reach API
    // probalby have to URL encode, but then we realize we really need the
    // bar filename
    //const url = `${this.baseUrl}/upload_url?filename=${filename}`;
    const url = `${this.baseUrl}/upload_url?filename=FAKE_FILE.txt`;
    this.log(`getUploadURL filename=${filename} url=${url}`);
    // API returns like: {'url': url}
    return this.http.get<UploadURL>(url).pipe(
      tap(uploadURL => this.log(`got upload=${uploadURL.url}`)),
      catchError(this.handleError<UploadURL>('getUploadURL'))
    );
  }

  // TODO: Looks like I have to add PUT as allowed method in S3 CORS.
  // TODO: How can I do that in serverless.yml?

  // If I do it manually with same generated URL, it works:
  //
  // curl -v --upload-file ~/Pictures/alex.jpg ${uploadurl}
  // > PUT /FAKE_FILE.txt?AWSAccessKeyId=ASIAJMJZVNMFYQJIJ6NA&Signature=4255R%2Bbpt%2BRJjjNgnsiq%2B8CKIvU%3D&x-amz-security-token=FQoDYXdzEPX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDMAiQJvaf9V12TTLiyLvAbTls9meqnVhwFxT6SWcvXt5i26HA%2BJ9tkk4hN4J3vOK%2BPUiOo8NGhWV%2FvGZCX0Qm%2B%2BWEv4QFUsuI7LiyPe1UOZyTJFbRpJocC58LWhT4tC34FXCHpTi3ni6unLeNa1enWfu%2FJjK6erWKLZOGVgTplvQZEv1Jfp2J%2FwIU%2BmlTJX6uZfi%2Fs7Dz0HE99kdpKml8NruCECxGfZofGBjp%2FSRB0szKy5kTAXzCI8azgd6dcyEY%2B5jnUbTE2fgTqZF6TNl0Hbiele%2BWPWCfLAAxFsOFo7KVoBqP8byzWnTraNdzTGz73MjDutBC8d10mtVD%2F%2BUKMT3ytUF&Expires=1521671895 HTTP/1.1
  // > Host: uploads-info-local.s3.amazonaws.com
  // > User-Agent: curl/7.54.0
  // > Accept: */*
  // > Content-Length: 2505094
  // > Expect: 100-continue
  // > 
  // < HTTP/1.1 100 Continue
  // * We are completely uploaded and fine

  // But uploading by code fails, doing PUT after successful OPTIONS (now that we manually added CORS):
  //
  // <Error><Code>SignatureDoesNotMatch</Code>...
  //
  // Http failure response for https://uploads-info-local.s3.amazonaws.com/
  // FAKE_FILE.txt?AWSAccessKeyId=ASIAJMJZVNMFYQJIJ6NA&Signature=4255R%2Bbpt%2BRJjjNgnsiq%2B8CKIvU%3D&x-amz-security-token=FQoDYXdzEPX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDMAiQJvaf9V12TTLiyLvAbTls9meqnVhwFxT6SWcvXt5i26HA%2BJ9tkk4hN4J3vOK%2BPUiOo8NGhWV%2FvGZCX0Qm%2B%2BWEv4QFUsuI7LiyPe1UOZyTJFbRpJocC58LWhT4tC34FXCHpTi3ni6unLeNa1enWfu%2FJjK6erWKLZOGVgTplvQZEv1Jfp2J%2FwIU%2BmlTJX6uZfi%2Fs7Dz0HE99kdpKml8NruCECxGfZofGBjp%2FSRB0szKy5kTAXzCI8azgd6dcyEY%2B5jnUbTE2fgTqZF6TNl0Hbiele%2BWPWCfLAAxFsOFo7KVoBqP8byzWnTraNdzTGz73MjDutBC8d10mtVD%2F%2BUKMT3ytUF&Expires=1521671895: 403 Forbidden"
  //
  // Could it be PUT is URL-encoding the URL and breaking sig? 
  // No, The MD5 of the FAKE_FILE.txt?... are the same in both
  // Is it because our code sends "text/plain"? 
  // The number 1521671895 is epoch-seconds of current time, and is sane

  // "<?xml version="1.0" encoding="UTF-8"?>
  // <Error><Code>SignatureDoesNotMatch</Code><Message>The request signature we calculated does not match the signature you provided. Check your key and signing method.</Message><AWSAccessKeyId>ASIAJMJZVNMFYQJIJ6NA</AWSAccessKeyId><StringToSign>PUT
  //
  // text/plain
  // 1521671895
  // x-amz-security-token:FQoDYXdzEPX//////////wEaDMAiQJvaf9V12TTLiyLvAbTls9meqnVhwFxT6SWcvXt5i26HA+J9tkk4hN4J3vOK+PUiOo8NGhWV/vGZCX0Qm++WEv4QFUsuI7LiyPe1UOZyTJFbRpJocC58LWhT4tC34FXCHpTi3ni6unLeNa1enWfu/JjK6erWKLZOGVgTplvQZEv1Jfp2J/wIU+mlTJX6uZfi/s7Dz0HE99kdpKml8NruCECxGfZofGBjp/SRB0szKy5kTAXzCI8azgd6dcyEY+5jnUbTE2fgTqZF6TNl0Hbiele+WPWCfLAAxFsOFo7KVoBqP8byzWnTraNdzTGz73MjDutBC8d10mtVD/+UKMT3ytUF
  // /uploads-info-local/FAKE_FILE.txt</StringToSign><SignatureProvided>4255R+bpt+RJjjNgnsiq+8CKIvU=</SignatureProvided><StringToSignBytes>50 55 54 0a 0a 74 65 78 74 2f 70 6c 61 69 6e 0a 31 35 32 31 36 37 31 38 39 35 0a 78 2d 61 6d 7a 2d 73 65 63 75 72 69 74 79 2d 74 6f 6b 65 6e 3a 46 51 6f 44 59 58 64 7a 45 50 58 2f 2f 2f 2f 2f 2f 2f 2f 2f 2f 77 45 61 44 4d 41 69 51 4a 76 61 66 39 56 31 32 54 54 4c 69 79 4c 76 41 62 54 6c 73 39 6d 65 71 6e 56 68 77 46 78 54 36 53 57 63 76 58 74 35 69 32 36 48 41 2b 4a 39 74 6b 6b 34 68 4e 34 4a 33 76 4f 4b 2b 50 55 69 4f 6f 38 4e 47 68 57 56 2f 76 47 5a 43 58 30 51 6d 2b 2b 57 45 76 34 51 46 55 73 75 49 37 4c 69 79 50 65 31 55 4f 5a 79 54 4a 46 62 52 70 4a 6f 63 43 35 38 4c 57 68 54 34 74 43 33 34 46 58 43 48 70 54 69 33 6e 69 36 75 6e 4c 65 4e 61 31 65 6e 57 66 75 2f 4a 6a 4b 36 65 72 57 4b 4c 5a 4f 47 56 67 54 70 6c 76 51 5a 45 76 31 4a 66 70 32 4a 2f 77 49 55 2b 6d 6c 54 4a 58 36 75 5a 66 69 2f 73 37 44 7a 30 48 45 39 39 6b 64 70 4b 6d 6c 38 4e 72 75 43 45 43 78 47 66 5a 6f 66 47 42 6a 70 2f 53 52 42 30 73 7a 4b 79 35 6b 54 41 58 7a 43 49 38 61 7a 67 64 36 64 63 79 45 59 2b 35 6a 6e 55 62 54 45 32 66 67 54 71 5a 46 36 54 4e 6c 30 48 62 69 65 6c 65 2b 57 50 57 43 66 4c 41 41 78 46 73 4f 46 6f 37 4b 56 6f 42 71 50 38 62 79 7a 57 6e 54 72 61 4e 64 7a 54 47 7a 37 33 4d 6a 44 75 74 42 43 38 64 31 30 6d 74 56 44 2f 2b 55 4b 4d 54 33 79 74 55 46 0a 2f 75 70 6c 6f 61 64 73 2d 69 6e 66 6f 2d 6c 6f 63 61 6c 2f 46 41 4b 45 5f 46 49 4c 45 2e 74 78 74</StringToSignBytes><RequestId>AF72DA9CD65FE05A</RequestId><HostId>1o0ySRJ+XzX8Dn/8ZfRNuIJL7H4akojgC5tajKgaZ3HDD91FpsYJDiF21GlTdkPT6x23X5n9MK4=</HostId></Error>"

  putUploadFile(uploadURL: UploadURL, body: string): Observable<any> {
    // We get back nothing from the PUT, can only check HTTP response
    // (Looks like we get XML on 403 error, even if we ask for JSON)
    this.log(`putUploadFile url.url=${uploadURL.url}`);
    // put(..., options for HTTP)
    return this.http.put(uploadURL.url, body).pipe(
      tap(res => this.log(`putUploadFile got res=${res}`)),
      catchError(this.handleError<UploadURL>('putUploadFile'))
    );
  }

}

