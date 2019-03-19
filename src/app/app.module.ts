import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

import {
  MatButtonModule,
  MatDialogModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatToolbarModule,
  MatCheckboxModule
} from '@angular/material';


import { AppComponent } from './app.component';
import { UploadComponent } from './upload/upload.component';
import { ListingComponent } from './listing/listing.component';
import { HomeComponent } from './home/home.component';
import { HttpService } from './http.service';
import { AlertBoxComponent } from './alert-box/alert-box.component';
import { UtilityService } from './utility.service';

@NgModule({
  exports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatToolbarModule,
    MatCheckboxModule
  ]
})
export class MaterialModule { }

@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    ListingComponent,
    HomeComponent,
    AlertBoxComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MaterialModule,
    BrowserAnimationsModule,
    LoggerModule.forRoot({serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.DEBUG, serverLogLevel: NgxLoggerLevel.ERROR})
  ],
  providers: [
    HttpService,
    UtilityService
  ],
  entryComponents:[
    AlertBoxComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
