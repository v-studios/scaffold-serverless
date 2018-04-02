import { Component, OnInit } from '@angular/core';
import { Upload } from '../upload';
import { UploadService } from '../upload.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  uploads: Upload[] = [];

  constructor(private uploadService: UploadService) { }

  ngOnInit() {
    this.getUploads();
  }

  getUploads(): void {
    // TODO: make this random slice the most recent 
    this.uploadService.getUploads()
      .subscribe(uploads => this.uploads = uploads.slice(1, 5));
  }
}
