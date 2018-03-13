import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // for NgModel on <input>
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { UploadsComponent } from './uploads/uploads.component';


@NgModule({
  declarations: [
    AppComponent,
    UploadsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
