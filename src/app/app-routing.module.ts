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
    path: '',
    component: ListingComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
