import { Component, OnInit } from '@angular/core';

import { Upload } from '../upload';
import { UploadService } from '../upload.service';


@Component({
  selector: 'app-uploads',
  templateUrl: './uploads.component.html',
  styleUrls: ['./uploads.component.css']
})
export class UploadsComponent implements OnInit {

  constructor(private uploadService: UploadService) { }

  ngOnInit() {
    this.getUploads();
  }

  uploads: Upload[]

  selectedUpload: Upload;

  onSelect(upload: Upload): void {
    this.selectedUpload = upload;
  }

  getUploads(): void {
    this.uploadService.getUploads().subscribe(uploads => this.uploads = uploads);
  }

}
