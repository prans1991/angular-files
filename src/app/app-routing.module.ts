import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploadComponent} from './upload/upload.component';
import { ListingComponent } from './listing/listing.component';

const routes: Routes = [
  {
   path: 'upload',
   component: UploadComponent
  },
  {
    path: 'files',
    component: ListingComponent
  },
  {
    path: '',
    redirectTo: '/files',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
