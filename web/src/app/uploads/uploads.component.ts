import { Component, OnInit } from '@angular/core';

import { MessageService } from '../message.service';
import { Upload } from '../upload';
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
    this.messageService.add('UploadComponent: ' + message);
  }

  getUploads(): void {
    this.uploadService.getUploads().subscribe(uploads => this.uploads = uploads);
  }

  add(id: string): void {
    id = id.trim();
    if (!id) { return; }
    // I don't have to instantiate all Upload attrs, they become '' or none, don't know yet
    this.uploadService.addUpload({ id } as Upload)
      .subscribe(upload => {
        this.uploads.push(upload);
      });
    this.log(`add added id=${id}`);

  }

  delete(upload: Upload): void {
    this.uploads = this.uploads.filter(u => u != upload);
    this.uploadService.deleteUpload(upload).subscribe();
  }

}
