import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';

import { Upload } from '../upload';
import { UploadService } from '../upload.service';

@Component({
  selector: 'app-upload-detail',
  templateUrl: './upload-detail.component.html',
  styleUrls: ['./upload-detail.component.css']
})
export class UploadDetailComponent implements OnInit {

  upload: Upload;

  constructor(
    private route: ActivatedRoute,
    private uploadService: UploadService,
    private location: Location,
  ) { }

  ngOnInit(): void {
    this.getUpload();
  }

  getUpload(): void {
    // For Scaffolding app, upload.id is NOT a number, it's a S3 key, a string
    const id = this.route.snapshot.paramMap.get('id');
    this.uploadService.getUpload(id)
      .subscribe(upload => this.upload = upload);
  }

  goBack(): void {
    this.location.back();
  }

  save(): void {
    this.uploadService.updateUpload(this.upload.id, this.upload)
      .subscribe(() => this.goBack());
  }

}
