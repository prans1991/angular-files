import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploadComponent} from './upload/upload.component';
import { ListingComponent} from './listing/listing.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
   path: 'file/upload',
   component: UploadComponent
  },
  {
    path: 'files',
    component: ListingComponent
  },
  {
    path: '',
    component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
