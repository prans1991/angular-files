import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { HttpService } from '../http.service';
import { NGXLogger } from 'ngx-logger';
import { ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { AlertBoxComponent } from '../alert-box/alert-box.component';
import FilesList from '../FilesList';
import { UtilityService } from '../utility.service';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import FileInfo from '../File';
import * as _ from 'underscore';
import { Socket } from 'ngx-socket-io';
import { NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { HttpEvent, HttpEventType } from '@angular/common/http';


@Component({
  selector: "app-upload",
  templateUrl: "./upload.component.html",
  styleUrls: ["./upload.component.scss"],
})
export class UploadComponent implements OnInit {
  @HostListener("window:beforeunload", ["$event"])
  handleClose($event) {
    if (this.isUploading) {
      $event.returnValue = false;
    }
  }

  @ViewChild("fileInput")
  fileInput: ElementRef;

  showUploadedFiles: Boolean;

  files: NgxFileDropEntry[] = [];

  uploadedFiles: Array<FileInfo>;

  host: String = this.utility.host;

  maxFiles: Number = 5;

  isUploading: boolean = false;

  constructor(
    private http: HttpService,
    private logger: NGXLogger,
    private dialog: MatDialog,
    private utility: UtilityService,
    private location: Location,
    private route: ActivatedRoute,
    private socket: Socket
  ) {}

  ngOnInit() {
    this.http.getFiles().subscribe((data: FilesList) => {
      this.uploadedFiles = data.list || [];
    });
  }

  displayAlert(...data) {
    const config = new MatDialogConfig();
    config.data = {
      message: this.utility.getMessageByType(data[0]),
      showIcon: data[1]
    };
    this.dialog.open(AlertBoxComponent, config);
  }

  async hasDuplicateFiles(files: NgxFileDropEntry[]) {
    return this.http
      .getFiles()
      .toPromise()
      .then((data: FilesList) => {
        this.uploadedFiles = data.list || [];
        let fileNames = files.map((file) => file.fileEntry.name);
        let uploadedFileNames = _.pluck(this.uploadedFiles, "name");
        let duplicateFiles = fileNames.filter((name) => {
          return uploadedFileNames.indexOf(name) > -1;
        });
        if (duplicateFiles.length) {
          this.displayAlert("duplicateSelect");
          return false;
        } else {
          return true;
        }
      });
  }

  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    // Prevent upload of files when the files length is more than max files allowed
    if (files.length > this.maxFiles) {
      this.displayAlert("maxSelect");
      this.files = [];
      return;
    }

    this.hasDuplicateFiles(files).then((canUpload: Boolean) => {
      if (canUpload) {
        const droppedFiles = async (files: NgxFileDropEntry[]) => {
          const promises = files.map(async (file) => {
            const selectedFile = await this.getSelectedFile(file);
            return selectedFile;
          });

          const selectedFiles = await Promise.all(promises);
          return selectedFiles;
        };
        var that = this;
        droppedFiles(files).then((selectedFiles) => {
          let config = new MatDialogConfig();
          let uploadProgress: number = 0;
          config.data = {
            message: this.utility.getMessageByType("uploadingFiles"),
            hasDialogAction: false,
            isUpload: true,
            uploadProgress: uploadProgress
          };
          this.http
            .uploadFiles(selectedFiles)
            .subscribe((event: HttpEvent<any>) => {
              switch (event.type) {
                case HttpEventType.Sent:
                  this.isUploading = true;
                  that.dialog.open(
                    AlertBoxComponent,
                    config
                  );
                  break;
                case HttpEventType.Response:
                  this.utility.closeModalDialogs();
                  this.isUploading = false;
                  this.host = event.body.ip;
                  this.displayAlert("uploadSuccess",true);
                  break;
                case 1:
                  uploadProgress = Math.round(
                    (event["loaded"] / event["total"]) * 100
                  );
                  config.data.uploadProgress = uploadProgress;
                  break;
              }
            });
        });
      }
    });
  }

  getSelectedFile(droppedFile: NgxFileDropEntry) {
    let promise = new Promise((resolve, reject) => {
      let fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
      fileEntry.file((file: File) => {
        resolve(file);
      });
    });
    return promise;
  }

  public fileOver(event) {
    console.log(event);
  }

  public fileLeave(event) {
    console.log(event);
  }
}
