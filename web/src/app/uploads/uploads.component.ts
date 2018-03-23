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
    private messageService: MessageService) {
  }

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

  doUpload(file0): void {       // needs to be an HTML File type
    // Read file, get presigned URL from API then PUT file to that S3 URL
    var reader: FileReader = new FileReader();

    reader.onloadend = (e) => {   // arrow_function doesn't change `this`
      var fileBody = reader.result;

      this.uploadService.getUploadURL(file0)
        .subscribe(urlObj => {
          this.uploadService.putUploadFile(urlObj, file0, fileBody)
            .subscribe(res => this.log(`doUpload done res=${res}`)); // null
        });
    }
    reader.readAsArrayBuffer(file0); // asBinaryString mutilates binaries!
  }

  onChange(file0) {
    // When file is selected, show some basic info
    this.log(`onChange file0 name=${file0.name} size=${file0.size} type=${file0.type}`);
  }

  delete(upload: Upload): void {
    this.uploads = this.uploads.filter(u => u != upload);
    this.uploadService.deleteUpload(upload).subscribe();
  }

}
