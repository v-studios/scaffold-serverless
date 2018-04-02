import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { UploadsComponent } from './uploads/uploads.component';
import { UploadDetailComponent } from './upload-detail/upload-detail.component';


const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'uploads', component: UploadsComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'detail/:id', component: UploadDetailComponent },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
