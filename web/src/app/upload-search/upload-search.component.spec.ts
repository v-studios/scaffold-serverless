import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadSearchComponent } from './upload-search.component';

describe('UploadSearchComponent', () => {
  let component: UploadSearchComponent;
  let fixture: ComponentFixture<UploadSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
