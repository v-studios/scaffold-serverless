import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { Upload } from './upload';
import { UPLOADS } from './mock-uploads';
import { MessageService } from './message.service';


@Injectable()
export class UploadService {

  constructor(private messageService: MessageService) { }

  getUploads(): Observable<Upload[]> {
    this.messageService.add('UploadService: fetching uploads');
    return of(UPLOADS);
  }

}
