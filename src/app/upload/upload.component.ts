import { Component, OnInit, ElementRef } from '@angular/core';
import { HttpService } from '../http.service';
import { NGXLogger } from 'ngx-logger';
import { ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { AlertBoxComponent } from '../alert-box/alert-box.component';
import FilesList from '../FilesList';
import { UtilityService } from '../utility.service';

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

  uploadedFiles: Array<String>;

  host: String = this.utility.host;

  maxLength: Number = 5;

  constructor(private http: HttpService, private logger: NGXLogger, private dialog: MatDialog, private utility: UtilityService) { }

  ngOnInit() {
    this.utility.setTitle('Upload files');
    this.http.getFiles().subscribe((data: FilesList) => {
      this.uploadedFiles = data.list;
    });
  }

  getFileList(files: FileList) {
    this.showUploadedFiles = false;
    this.files = Array.from(files);
  }

  goToFileListing() {
    this.showUploadedFiles = false;
    window.open(`http://${this.host}:4200/files`, '_blank');
  }

  validateFiles(files: Array<File>) {
    const config = new MatDialogConfig();
    config.data = {};
    let dialogRef;
    if (files.length == 0) {
      config.data.message = 'Please select files to upload';
    } else if (files.length > this.maxLength) {
      config.data.message = 'Please select a maximum of 5 files';
    } else {
      let fileNames = files.map(file => file.name);
      let duplicateFiles = fileNames.filter(name => this.uploadedFiles.indexOf(name) > -1);
      if (duplicateFiles.length) {
        this.fileInput.nativeElement.value = '';
        config.data.message = 'Duplicate files selected for upload. Please check and retry upload';
      } else {
        return true;
      }
    }
    dialogRef = this.dialog.open(AlertBoxComponent, config);
  }

  uploadFiles() {
    const files: Array<File> = this.files;
    const config = new MatDialogConfig();
    config.data = {};
    let that = this,
      dialogRef,
      canUpload = this.validateFiles(files);
    if (canUpload) {
      this.http.uploadFiles(files).subscribe((data: any) => {
        this.host = data.ip;
        config.data.message = 'File(s) uploaded successfully';
        dialogRef = this.dialog.open(AlertBoxComponent, config);
        dialogRef.afterClosed().subscribe(result => {
          that.fileInput.nativeElement.value = '';
          that.showUploadedFiles = true;
        });
      });
    }
  }
}
