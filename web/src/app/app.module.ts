import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // for NgModel on <input>
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './in-memory-data.service';

import { AppComponent } from './app.component';
import { UploadsComponent } from './uploads/uploads.component';
import { UploadDetailComponent } from './upload-detail/upload-detail.component';
import { UploadService } from './upload.service';
import { MessagesComponent } from './messages/messages.component';
import { MessageService } from './message.service';
import { AppRoutingModule } from './/app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UploadSearchComponent } from './upload-search/upload-search.component';


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    MessagesComponent,
    UploadDetailComponent,
    UploadsComponent,
    UploadSearchComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,           // TODO: use API, not angular-in-memory-web-api
    HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, { dataEncapsulation: false }),
  ],
  providers: [
    MessageService,
    UploadService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
