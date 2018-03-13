import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // for NgModel on <input>
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { UploadsComponent } from './uploads/uploads.component';
import { UploadDetailComponent } from './upload-detail/upload-detail.component';
import { UploadService } from './upload.service';
import { MessagesComponent } from './messages/messages.component';
import { MessageService } from './message.service';


@NgModule({
  declarations: [
    AppComponent,
    UploadsComponent,
    UploadDetailComponent,
    MessagesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
  ],
  providers: [
    UploadService,
    MessageService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
