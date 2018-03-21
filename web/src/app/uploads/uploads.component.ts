import { Component, OnInit } from '@angular/core';

import { MessageService } from '../message.service';
import { Upload } from '../upload';
import { UploadURL } from '../upload-url';
import { UploadService } from '../upload.service';

@Component({
  selector: 'app-uploads',
  templateUrl: './uploads.component.html',
  styleUrls: ['./uploads.component.css']
})
export class UploadsComponent implements OnInit {

  constructor(
    private uploadService: UploadService,
    private messageService: MessageService) { }

  ngOnInit() {
    this.getUploads();
  }

  uploads: Upload[]

  // TODO are selectedUpload and on Select needed now? we hvae routerLink
  selectedUpload: Upload;

  onSelect(upload: Upload): void {
    this.selectedUpload = upload;
  }

  private log(message: string) {
    this.messageService.add('UploadsComponent: ' + message);
  }

  getUploads(): void {
    this.uploadService.getUploads().subscribe(uploads => this.uploads = uploads);
  }

  // // TODO: on uploads page, get presigned URL from API then PUT file to that S3 URL
  // // widget should be file chooser with action to invoke this `add`
  // // which should GET a presigned URL then PUT to it.
  // add(id: string): void {
  //   id = id.trim();
  //   if (!id) { return; }
  //   // I don't have to instantiate all Upload attrs, they become '' or none, don't know yet
  //   this.uploadService.addUpload({ id } as Upload)
  //     .subscribe(upload => {
  //       this.uploads.push(upload);
  //     });
  //   this.log(`add added id=${id}`);
  // }

  // On uploads page, get presigned URL from API then PUT file to that S3 URL
  add2(filename: string): void {
    filename = filename.trim();
    if (!filename) { return; }
    // TODO: get the filename without preceeding path or HTML5 File object
    this.uploadService.getUploadURL(filename)
      .subscribe(urlObj => {
        this.log(`add2 got urlObj.url=${urlObj.url}`);
        // local copy of urlObj seems undefined outside this scope, do here while we have it
        // or maybe it's executing async, so runs before we set it?
        this.uploadService.putUploadFile(urlObj, 'BODY FROM COMPONENT')
          .subscribe(res => {       // probably no response
            this.log('add2 upload res=${res}');
          });
      });
  }

  delete(upload: Upload): void {
    this.uploads = this.uploads.filter(u => u != upload);
    this.uploadService.deleteUpload(upload).subscribe();
  }

}
