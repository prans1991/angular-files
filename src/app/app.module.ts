import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { HttpClientModule } from "@angular/common/http";
import { LoggerModule, NgxLoggerLevel } from "ngx-logger";
import { FormsModule } from "@angular/forms";
import { SocketIoModule, SocketIoConfig } from "ngx-socket-io";
import { MomentModule } from "ngx-moment";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxFileDropModule } from "ngx-file-drop";
import { NgxExtendedPdfViewerModule } from "ngx-extended-pdf-viewer";

const url = `http://${new URL(window.location.href).hostname}:3737`;
const config: SocketIoConfig = { url, options: {} };

import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatProgressBarModule } from "@angular/material/progress-bar";

import { AppComponent } from "./app.component";
import { UploadComponent } from "./upload/upload.component";
import { ListingComponent } from "./listing/listing.component";
import { HttpService } from "./http.service";
import { AlertBoxComponent } from "./alert-box/alert-box.component";
import { UtilityService } from "./utility.service";
import { PreviewModalComponent } from "./preview-modal/preview-modal.component";

@NgModule({
  exports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatProgressBarModule,
  ],
})
export class MaterialModule {}

@NgModule({
  declarations: [AppComponent, UploadComponent, ListingComponent, AlertBoxComponent, PreviewModalComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MaterialModule,
    BrowserAnimationsModule,
    FormsModule,
    LoggerModule.forRoot({
      serverLoggingUrl: "/api/logs",
      level: NgxLoggerLevel.DEBUG,
      serverLogLevel: NgxLoggerLevel.ERROR,
    }),
    SocketIoModule.forRoot(config),
    MomentModule,
    NgbModule,
    NgxFileDropModule,
    NgxExtendedPdfViewerModule,
  ],
  providers: [HttpService, UtilityService],
  entryComponents: [AlertBoxComponent, PreviewModalComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
