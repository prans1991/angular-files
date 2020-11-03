import { Component, OnDestroy, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { HttpService } from "../http.service";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { Router, ActivatedRoute } from "@angular/router";
import FilesList from "../FilesList";
import { AlertBoxComponent } from "../alert-box/alert-box.component";
import { NGXLogger } from "ngx-logger";
import { UtilityService } from "../utility.service";
import _ from "underscore";
import IFileInfo from "../File";
import moment from "moment";
import { PreviewModalComponent } from "../preview-modal/preview-modal.component";
import { interval, Subscription } from "rxjs";
import { MatCheckboxChange } from "@angular/material/checkbox";

@Component({
  selector: "app-listing",
  templateUrl: "./listing.component.html",
  styleUrls: ["./listing.component.scss"],
})
export class ListingComponent implements OnInit, OnDestroy {
  subscription: Subscription;

  filesPort = "3013";

  searchInput: string;

  allFiles: FilesList = { list: [], ip: "" };

  files: FilesList = { list: [], ip: "" };

  fileTypes: string[] = [];

  selectedFiles: IFileInfo[] = [];

  hasFilesSelected = false;

  currentFileType: string;

  sortOrder: string;

  connections: number;

  qParams: object;

  isAdmin = false;

  previewFileTypes: string[] = ["png", "gif", "jpg", "jpeg", "pdf"];

  hasFetchedList = false;

  loadingImgPath = "assets/loading.gif";

  isFetchingList = false;

  showScrollTop = false;

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
      this.isAdmin = !!params.admin;
      this.location.replaceState("");
    });
    this.getFiles();
    const that = this;
    this.http.socket.on("change", (data: FilesList) => {
      that.updateFilesList(data);
    });

    this.http.socket.on("connections", (data: any) => {
      that.connections = data;
    });

    const source = interval(3000);
    this.subscription = source.subscribe((val) => this.checkScrollY());
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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
    _.map(this.selectedFiles, (file) => {
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

  sortFilesByTime(files: FilesList, sortOrder: string) {
    let list = _.sortBy(files.list, (file) => file.modifiedTime);
    if (sortOrder === "desc") {
      list = list.reverse();
    }
    this.sortOrder = sortOrder;
    this.files.list = list;
  }

  getFileTypes() {
    const list = this.files.list;
    const fileTypes = _.uniq(
      list.map((file) => {
        const splitName = file.name.split(".");
        const fileType = splitName.splice(-1)[0].toLowerCase();
        return fileType;
      })
    );
    this.fileTypes = fileTypes;
  }

  selectFile(selectedFile: IFileInfo, $event: MatCheckboxChange) {
    let selectedFiles = this.selectedFiles;
    let filteredFiles = [];
    selectedFile.checked = $event.checked;
    if (selectedFiles.length === 0) {
      selectedFiles.push(selectedFile);
    } else {
      // Remove already selected file if it has been chosen
      filteredFiles = selectedFiles.reduce((result, file) => {
        if (file.name !== selectedFile.name) {
          result.push(file);
        }
        return result;
      }, []);
      // If the file selected is new add to selected files
      if (filteredFiles.length === selectedFiles.length) {
        selectedFiles.push(selectedFile);
      } else {
        selectedFiles = filteredFiles;
      }
    }
    this.selectedFiles = selectedFiles;
    this.hasFilesSelected = this.selectedFiles.length > 0;
  }

  navigateToHome() {
    const that = this;
    const config = new MatDialogConfig();
    config.data = {
      message: this.utility.getMessageByType("noFiles"),
    };
    const dialogRef = this.dialog.open(AlertBoxComponent, config);
    dialogRef.afterClosed().subscribe((result) => {
      that.router.navigate([""]);
    });
  }

  deleteFile(fileName: string, $event: Event) {
    $event.stopPropagation();
    this.http.deleteSingle(fileName).subscribe((res) => {
      this.logger.log("File deleted successfully");
    });
  }

  deleteAllFiles() {
    const config = new MatDialogConfig();
    config.data = {
      message: this.utility.getMessageByType("delAllFiles"),
      hasCancelBtn: true,
    };
    const dialogRef = this.dialog.open(AlertBoxComponent, config);
    dialogRef.afterClosed().subscribe((res) => {
      if ((res && !res.isCancel) || !res) {
        this.http.deleteAll().subscribe(() => {
          this.logger.log("All files deleted successfully");
        });
      }
    });
  }

  deleteSelectedFiles() {
    const config = new MatDialogConfig();
    config.data = {
      message: this.utility.getMessageByType("delSelectedFiles"),
      hasCancelBtn: true,
    };
    const dialogRef = this.dialog.open(AlertBoxComponent, config);
    dialogRef.afterClosed().subscribe((res) => {
      if ((res && !res.isCancel) || !res) {
        this.http.deleteSelected(this.selectedFiles).subscribe(() => {
          this.logger.log("Selected files deleted successfully");
          this.selectedFiles = [];
        });
      }
    });
  }

  openFile(fileName: string) {
    const fileType = fileName.split(".").slice(-1).pop().toLowerCase();
    if (_.contains(this.previewFileTypes, fileType)) {
      const isPdf = fileType === "pdf";
      this.openPreviewModal(fileName, isPdf);
    } else {
      const url = `http://${this.utility.host}:${this.filesPort}/${fileName}`;
      window.open(url, "_blank");
    }
  }

  filterFilesByType(type: string) {
    let filteredFiles;
    const files = this.searchInput ? this.files.list : this.allFiles.list;

    if (type) {
      filteredFiles = files.filter((file) => {
        const fileType = file.name.split(".").splice(-1)[0];
        if (fileType === type) {
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
      const filteredList = this.allFiles.list.filter((file) => {
        const name = file.name.toLowerCase();
        const searchInput = this.searchInput.toLowerCase();
        return name.search(searchInput) > -1;
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
    const selectedFiles = { ...this.selectedFiles };
    this.resetSelected();
    selectedFiles.forEach((file: IFileInfo) => {
      this.openFile(file.name);
    });
  }

  isUploadedRecent(uploadedDate: Date) {
    const currentTime = moment(moment.now());
    uploadedDate = new Date(uploadedDate);
    const diff = currentTime.diff(uploadedDate, "days");
    return diff <= 7;
  }

  openPreviewModal(fileName: string, isPdf: boolean) {
    const url = `http://${this.files.ip}:${this.filesPort}/${fileName}`;
    const config = new MatDialogConfig();
    config.data = {
      url,
      isPdf,
    };
    this.dialog.open(PreviewModalComponent, config);
  }

  scrollToTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }

  resetFileType() {
    this.updateFilesList(this.allFiles);
  }
}
