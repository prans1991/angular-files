import { Component, OnInit, ElementRef } from '@angular/core';
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

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  @ViewChild('fileInput')
  fileInput: ElementRef;

  showUploadedFiles: Boolean;

  files: Array<File> = [];

  uploadedFiles: Array<FileInfo>;

  host: String = this.utility.host;

  maxLength: Number = 5;

  constructor(private http: HttpService, private logger: NGXLogger, private dialog: MatDialog, private utility: UtilityService, private location: Location, private route: ActivatedRoute, private socket: Socket) { }

  ngOnInit() {
    const param = + this.route.snapshot.paramMap.get('id');
    this.logger.log('param ', param);
    this.http.getFiles().subscribe((data: FilesList) => {
      this.uploadedFiles = data.list || [];
    });
  }

  uploadSelected(files: FileList) {
    this.showUploadedFiles = false;
    this.files = Array.from(files);
    this.socket.disconnect();
    this.uploadFiles();

  }

  goToFileListing() {
    this.showUploadedFiles = false;
    this.getFiles();
  }

  getFiles() {
    this.http.getFiles().subscribe((data: FilesList) => {
      if (!data.list) {
        this.displayError('noFilesUploadSome');
      } else {
        window.open('files', '_self');
      }
    });
  }

  displayError(type) {
    const config = new MatDialogConfig();
    config.data = {
      message: this.utility.getMessageByType(type)
    };
    this.dialog.open(AlertBoxComponent, config);
  }

  getDuplicateFiles(files: Array<File>) {
    const config = new MatDialogConfig();
    config.data = {};
    return this.http.getFiles().toPromise().then((data: FilesList) => {
      this.uploadedFiles = data.list || [];
      let fileNames = files.map(file => file.name);
      let uploadedFileNames = _.pluck(this.uploadedFiles, 'name');
      let duplicateFiles = fileNames.filter(name => {
        return (uploadedFileNames.indexOf(name) > -1);
      });
      if (duplicateFiles.length) {
        this.fileInput.nativeElement.value = '';
        config.data.message = this.utility.getMessageByType('duplicateSelect');
        this.dialog.open(AlertBoxComponent, config);
        return false;
      } else {
        return true;
      }
    });
  }

  validateFiles(files: Array<File>) {
    const config = new MatDialogConfig();
    config.data = {};
    if (files.length == 0) {
      config.data.message = this.utility.getMessageByType('selectFiles');
      this.dialog.open(AlertBoxComponent, config);
      return false;
    } else if (files.length > this.maxLength) {
      config.data.message = this.utility.getMessageByType('maxSelect');
      this.dialog.open(AlertBoxComponent, config);
      this.fileInput.nativeElement.value = '';
      this.files = [];
      return false;
    }
    return true;
  }

  uploadFiles() {
    const files: Array<File> = this.files;
    const config = new MatDialogConfig();
    config.data = {};
    let that = this,
      dialogRef;
    if (this.validateFiles(files)) {
      this.getDuplicateFiles(files).then((canUpload: boolean) => {
        if (canUpload) {
          this.http.uploadFiles(files).subscribe((data: any) => {
            this.host = data.ip;
            config.data.message = this.utility.getMessageByType('uploadSuccess');
            dialogRef = this.dialog.open(AlertBoxComponent, config);
            dialogRef.afterClosed().subscribe(result => {
              that.fileInput.nativeElement.value = '';
              that.showUploadedFiles = true;
              that.socket.connect();
            });
          });
        } else {
          this.files = [];
        }
      });
    }
  }
}
