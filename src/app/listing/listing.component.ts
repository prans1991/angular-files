import { Component, OnInit } from '@angular/core';
import { Location} from '@angular/common';
import { HttpService } from '../http.service';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import FilesList from '../FilesList';
import { AlertBoxComponent } from '../alert-box/alert-box.component';
import { NGXLogger } from 'ngx-logger';
import { UtilityService } from '../utility.service';
import * as _ from 'underscore';
import FileInfo from '../File';
import * as moment from 'moment';
import { PreviewModalComponent } from '../preview-modal/preview-modal.component';
import { interval, Subscription } from "rxjs";


@Component({
  selector: "app-listing",
  templateUrl: "./listing.component.html",
  styleUrls: ["./listing.component.scss"]
})
export class ListingComponent implements OnInit {

  subscription: Subscription;

  filesPort = "3013";

  searchInput: string;

  allFiles: FilesList = { list: [], ip: "" };

  files: FilesList = { list: [], ip: "" };

  fileTypes: Array<String> = [];

  selectedFiles: Array<FileInfo> = [];

  hasFilesSelected: Boolean = false;

  currentFileType: String;

  sortOrder: String;

  connections: number;

  qParams: Object;

  isAdmin: Boolean = false;

  previewFileTypes: Array<String> = ["png", "gif", "jpg", "jpeg"];

  hasFetchedList: Boolean = false;

  loadingImgPath: String = "assets/loading.gif";

  isFetchingList: Boolean = false;

  showScrollTop: Boolean = false;

  constructor(
    private http: HttpService,
    private router: Router,
    private dialog: MatDialog,
    private logger: NGXLogger,
    private utility: UtilityService,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.utility.setTitle("Share Files");
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      this.qParams = params;
      this.isAdmin = params.hasOwnProperty("admin");
      this.location.replaceState("");
    });
    this.getFiles();
    var that = this;
    this.http.socket.on("change", function(data: FilesList) {
      that.updateFilesList(data);
    });

    this.http.socket.on("connections", function(data: any) {
      that.connections = data;
    });

    const source = interval(3000);
    this.subscription = source.subscribe(val =>
      this.checkScrollY()
    );
  }

  ngOnDestroy() {
    this.subscription && this.subscription.unsubscribe();
  }

  checkScrollY = (): void => {
    this.showScrollTop = window.scrollY > 100;
  };

  updateFilesList(data: FilesList) {
    this.hasFetchedList = true;
    // Redirect to upload file page when no files to list
    if (!data.list) {
      this.logger.log("Directory is empty");
      this.navigateToHome();
    }
    this.resetSelected();
    this.resetFileInfo();

    this.allFiles = { ...data };
    this.files.ip = this.allFiles.ip;
    // Sort files descending
    this.sortFilesByTime(data, "desc");
    // Get file types
    this.getFileTypes();
  }

  resetSelected() {
    _.map(this.selectedFiles, file => {
      file.checked = false;
    });
    this.selectedFiles = [];
    this.hasFilesSelected = false;
  }

  resetFileInfo() {
    this.currentFileType = "";
    this.searchInput = "";
  }

  getFiles() {
    this.isFetchingList = true;
    this.http.getFiles().subscribe((data: FilesList) => {
      this.isFetchingList = false;
      this.updateFilesList(data);
    });
  }

  sortFilesByTime(files: FilesList, sortOrder: String) {
    let list = _.sortBy(files.list, function(file) {
      return file.modifiedTime;
    });
    if (sortOrder == "desc") {
      list = list.reverse();
    }
    this.sortOrder = sortOrder;
    this.files.list = list;
  }

  getFileTypes() {
    let fileTypes = [];
    let list = this.files.list;
    fileTypes = list.map(file => {
      let splitName = file.name.split("."),
        fileType: String;
      fileType = splitName.splice(-1)[0].toLowerCase();
      return fileType;
    });
    fileTypes = _.uniq(fileTypes);
    this.fileTypes = fileTypes;
  }

  selectFile(selectedFile: FileInfo, $event) {
    let selectedFiles = this.selectedFiles;
    let filteredFiles = [];
    selectedFile.checked = $event.checked;
    if (selectedFiles.length == 0) {
      selectedFiles.push(selectedFile);
    } else {
      // Remove already selected file if it has been chosen
      filteredFiles = selectedFiles.reduce(function(result, file) {
        if (file.name != selectedFile.name) {
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
    this.hasFilesSelected = this.selectedFiles.length > 0;
  }

  navigateToHome() {
    let that = this;
    const config = new MatDialogConfig();
    config.data = {
      message: this.utility.getMessageByType("noFiles")
    };
    let dialogRef = this.dialog.open(AlertBoxComponent, config);
    dialogRef.afterClosed().subscribe(result => {
      that.router.navigate([""]);
    });
  }

  deleteFile(fileName, $event) {
    $event.stopPropagation();
    this.http.deleteSingle(fileName).subscribe(res => {
      this.logger.log("File deleted successfully");
    });
  }

  deleteAllFiles() {
    const config = new MatDialogConfig();
    config.data = {
      message: this.utility.getMessageByType("delAllFiles"),
      hasCancelBtn: true
    };
    let dialogRef = this.dialog.open(AlertBoxComponent, config);
    dialogRef.afterClosed().subscribe(res => {
      if ((res && !res.isCancel) || !res) {
        this.http.deleteAll().subscribe(res => {
          this.logger.log("All files deleted successfully");
        });
      }
    });
  }

  deleteSelectedFiles() {
    const config = new MatDialogConfig();
    config.data = {
      message: this.utility.getMessageByType("delSelectedFiles"),
      hasCancelBtn: true
    };
    let dialogRef = this.dialog.open(AlertBoxComponent, config);
    dialogRef.afterClosed().subscribe(res => {
      if ((res && !res.isCancel) || !res) {
        this.http.deleteSelected(this.selectedFiles).subscribe(res => {
          this.logger.log("Selected files deleted successfully");
          this.selectedFiles = [];
        });
      }
    });
  }

  openFile(fileName) {
    let fileType = fileName
      .split(".")
      .slice(-1)
      .pop()
      .toLowerCase();
    if (_.contains(this.previewFileTypes, fileType)) {
      let isPdf = fileType == "pdf";
      this.openPreviewModal(fileName, isPdf);
    } else {
      let url = `http://${this.utility.host}:${this.filesPort}/${fileName}`;
      window.open(url, "_blank");
    }
  }

  filterFilesByType(type: String) {
    let filteredFiles, files;
    if (this.searchInput) {
      files = this.files.list;
    } else {
      files = this.allFiles.list;
    }

    if (type) {
      filteredFiles = files.filter(file => {
        let fileType = file.name.split(".").splice(-1)[0];
        if (fileType == type) {
          return file;
        }
      });
    } else {
      filteredFiles = files;
    }

    this.currentFileType = type;

    this.files.list = filteredFiles;
    this.sortFilesByTime({ ...this.files }, "desc");
    this.resetSelected();
  }

  searchFiles() {
    if (this.searchInput) {
      let that = this,
        filteredList = [];
      _.each(this.allFiles.list, file => {
        let name = file.name.toLowerCase(),
          searchInput = that.searchInput.toLowerCase();

        if (name.search(searchInput) > -1) {
          filteredList.push(file);
        }
      });
      this.files.list = filteredList;
      this.sortFilesByTime({ ...this.files }, "desc");
      this.getFileTypes();
    } else {
      this.clearSearch();
    }
  }

  clearSearch() {
    this.searchInput = "";
    this.currentFileType = "";
    this.sortFilesByTime({ ...this.allFiles }, "desc");
    this.getFileTypes();
  }

  refreshList() {
    this.getFiles();
  }

  downloadSelectedFiles() {
    let selectedFiles = { ...this.selectedFiles };
    this.resetSelected();
    _.map(selectedFiles, (file: FileInfo) => {
      this.openFile(file.name);
    });
  }

  isUploadedRecent(uploadedDate: any) {
    let currentTime = moment(moment.now());
    uploadedDate = new Date(uploadedDate);
    let diff = currentTime.diff(uploadedDate, "days");
    return diff <= 7;
  }

  openPreviewModal(fileName, isPdf) {
    let url = `http://${this.files.ip}:${this.filesPort}/${fileName}`;
    let config = new MatDialogConfig();
    config.data = {
      url: url,
      isPdf: isPdf
    };
    this.dialog.open(PreviewModalComponent, config);
  }

  scrollToTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  }

  resetFileType() {
    this.updateFilesList(this.allFiles);
  }
}