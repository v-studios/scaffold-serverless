import { Component, OnInit, Input } from '@angular/core';

import { Upload } from '../upload';


@Component({
  selector: 'app-upload-detail',
  templateUrl: './upload-detail.component.html',
  styleUrls: ['./upload-detail.component.css']
})
export class UploadDetailComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

  @Input() upload: Upload;

}
