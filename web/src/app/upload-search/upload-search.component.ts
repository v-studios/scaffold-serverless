import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { of } from 'rxjs/observable/of';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { Upload } from '../upload';
import { UploadService } from '../upload.service';


@Component({
  selector: 'app-upload-search',
  templateUrl: './upload-search.component.html',
  styleUrls: ['./upload-search.component.css']
})
export class UploadSearchComponent implements OnInit {
  uploads$: Observable<Upload[]>;
  private searchTerms = new Subject<string>(); // what's `new` do when called?

  constructor(private uploadService: UploadService) { }

  ngOnInit(): void {
    this.uploads$ = this.searchTerms.pipe(
      debounceTime(300),        // wait 300ms after each keystroke
      distinctUntilChanged(),   // ignore new term if same as previous
      // switch to new search observable each time term changes, ignoring old results
      switchMap((term: string) => this.uploadService.searchUploads(term)),
    );
  }

  search(term: string): void {
    // push search term into observable stream (`next` is a stupid name for push/append!)
    this.searchTerms.next(term);
  }


}
