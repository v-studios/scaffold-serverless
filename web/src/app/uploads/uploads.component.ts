import { Component, OnInit } from '@angular/core';

import { Upload } from '../upload';
import { UPLOADS } from '../mock-uploads';

@Component({
  selector: 'app-uploads',
  templateUrl: './uploads.component.html',
  styleUrls: ['./uploads.component.css']
})
export class UploadsComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

  uploads = UPLOADS;

  selectedUpload: Upload;

  onSelect(upload: Upload): void {
    this.selectedUpload = upload;
  }

}
