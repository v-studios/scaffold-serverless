import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDetailComponent } from './upload-detail.component';

describe('UploadDetailComponent', () => {
  let component: UploadDetailComponent;
  let fixture: ComponentFixture<UploadDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
