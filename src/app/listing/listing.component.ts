import { Component, OnInit } from '@angular/core';
import { HttpService } from '../http.service';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import FilesList from '../FilesList';
import { AlertBoxComponent } from '../alert-box/alert-box.component';
import { NGXLogger } from 'ngx-logger';
import { UtilityService } from '../utility.service';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss']
})
export class ListingComponent implements OnInit {

  filesHostPort = '3013';

  files: FilesList = { list: [], ip: '' };

  selectedFiles: Array<String> = [];

  hasFilesSelected: Boolean = false;

  constructor(private http: HttpService, private router: Router, private dialog: MatDialog, private logger: NGXLogger, private utility: UtilityService) {
    this.utility.setTitle('View files');
  }

  ngOnInit() {
    this.getFiles();
  }

  getFiles() {
    this.http.getFiles().subscribe((data: FilesList) => {
      this.files = data;
      if (!data.list.length) {
        this.navigateToHome();
      }
    });
  }

  selectFile(selectedFile: String) {
    let selectedFiles = this.selectedFiles;
    let filteredFiles = [];
    if (selectedFiles.length == 0) {
      selectedFiles.push(selectedFile);
    } else {
      // Remove already selected file if it has been chosen
      filteredFiles = selectedFiles.reduce(function (result, file) {
        if (file != selectedFile) {
          result.push(file);
        }
        return result;
      }, []);
      // If the file selected is new add to selected files 
      if (filteredFiles.length == selectedFiles.length) {
        selectedFiles.push(selectedFile);
      } else {
        selectedFiles = filteredFiles;
      }
    }
    this.selectedFiles = selectedFiles;
    this.hasFilesSelected = (this.selectedFiles.length > 0);
  }

  navigateToHome() {
    let that = this;
    const config = new MatDialogConfig();
    config.data = {
      message: 'No files to display'
    };
    let dialogRef = this.dialog.open(AlertBoxComponent, config);
    dialogRef.afterClosed().subscribe(result => {
      that.router.navigate(['']);
    });
  }

  deleteFile(fileName) {
    this.http.deleteSingle(fileName).subscribe(res => {
      this.logger.log('File deleted successfully');
      this.getFiles();
    });
  }

  deleteAllFiles() {
    this.http.deleteAll().subscribe(res => {
      this.logger.log('All files deleted successfully');
      this.files = { list: [], ip: '' };
      this.navigateToHome();
    });
  }

  deleteSelectedFiles() {
    this.http.deleteSelected(this.selectedFiles).subscribe(res => {
      this.logger.log('Selected files deleted successfully');
      this.selectedFiles = [];
      this.getFiles();
    });
  }

  getFileLink(fileName) {
    let host = this.files.ip,
      url = `http://${host}:${this.filesHostPort}/${fileName}`;
    window.open(url, '_blank');
  }
}
