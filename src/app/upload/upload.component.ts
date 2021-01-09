import { Component, OnInit, ElementRef, HostListener, ChangeDetectionStrategy } from "@angular/core";
import { HttpService } from "../http.service";
import { NGXLogger } from "ngx-logger";
import { ViewChild } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { AlertBoxComponent } from "../alert-box/alert-box.component";
import FilesList from "../FilesList";
import { UtilityService } from "../utility.service";
import IFileInfo from "../File";
import _ from "underscore";
import { NgxFileDropEntry, FileSystemFileEntry } from "ngx-file-drop";
import { HttpEvent, HttpEventType } from "@angular/common/http";

interface IAlertDisplay {
  type: string;
  showIcon: boolean;
  iconClass: string;
  hasDialogAction?: boolean;
}

@Component({
  selector: "app-upload",
  templateUrl: "./upload.component.html",
  styleUrls: ["./upload.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadComponent implements OnInit {
  @ViewChild("fileInput")
  fileInput: ElementRef;

  showUploadedFiles: boolean;

  files: NgxFileDropEntry[] = [];

  uploadedFiles: IFileInfo[];

  host = this.utility.host;

  maxFiles = 5;

  isUploading = false;

  @HostListener("window:beforeunload", ["$event"])
  handleClose($event: Event) {
    if (this.isUploading) {
      $event.returnValue = false;
    }
  }

  constructor(
    private http: HttpService,
    private logger: NGXLogger,
    private dialog: MatDialog,
    private utility: UtilityService
  ) {}

  ngOnInit() {
    this.http.getFiles().subscribe((data: FilesList) => {
      this.uploadedFiles = data.list || [];
    });
  }

  displayAlert(data: IAlertDisplay) {
    const config = new MatDialogConfig();
    config.data = {
      message: this.utility.getMessageByType(data.type),
      showIcon: data.showIcon,
      iconClass: data.iconClass,
      hasDialogAction: data.hasDialogAction ?? false,
    };
    this.dialog.open(AlertBoxComponent, config);
  }

  async hasDuplicateFiles(files: NgxFileDropEntry[]) {
    return this.http
      .getFiles()
      .toPromise()
      .then((data: FilesList) => {
        this.uploadedFiles = data.list || [];
        const fileNames = files.map((file) => file.fileEntry.name);
        const uploadedFileNames = _.pluck(this.uploadedFiles, "name");
        const duplicateFiles = fileNames.filter((name) => uploadedFileNames.indexOf(name) > -1);
        if (duplicateFiles.length) {
          this.displayAlert({
            type: "duplicateSelect",
            showIcon: false,
            iconClass: "",
            hasDialogAction: true,
          });
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
      this.displayAlert({
        type: "maxSelect",
        showIcon: false,
        iconClass: "",
        hasDialogAction: true,
      });
      this.files = [];
      return;
    }

    this.hasDuplicateFiles(files).then((canUpload: boolean) => {
      if (canUpload) {
        const droppedFiles = async (filesArr: NgxFileDropEntry[]) => {
          const promises = filesArr.map(async (file) => {
            const selectedFile = await this.getSelectedFile(file);
            return selectedFile;
          });

          const selectedFiles = await Promise.all(promises);
          return selectedFiles;
        };
        const that = this;
        droppedFiles(files).then((selectedFiles: File[]) => {
          const config = new MatDialogConfig();
          let uploadProgress = 0;
          const uploadingFiles = selectedFiles.map((file) => ({
            name: file.name,
          }));
          config.data = {
            message: this.utility.getMessageByType("uploadingFiles"),
            hasDialogAction: false,
            isUpload: true,
            uploadProgress,
          };
          const dialogRef = that.dialog.open(AlertBoxComponent, config);
          const upload = this.http.uploadFiles(selectedFiles).subscribe((event: HttpEvent<any>) => {
            switch (event.type) {
              case HttpEventType.Sent:
                this.isUploading = true;
                break;
              case HttpEventType.Response:
                this.utility.closeModalDialogs();
                this.isUploading = false;
                this.host = event.body.ip;
                this.displayAlert({
                  type: "uploadSuccess",
                  showIcon: true,
                  iconClass: "upload-complete",
                });
                setTimeout(() => {
                  this.utility.closeModalDialogs();
                }, 4000);
                break;
              case 1:
                uploadProgress = Math.round(
                  // @ts-ignore
                  (event["loaded"] / event["total"]) * 100
                );
                config.data.uploadProgress = uploadProgress;
                break;
            }
          });

          dialogRef.afterClosed().subscribe((res) => {
            if (res && res.cancelUpload) {
              this.logger.log("cancelUpload");
              this.logger.log(uploadingFiles);
              upload.unsubscribe();
              this.http.deleteSelected(uploadingFiles).subscribe(() => {
                this.logger.log("Selected files deleted successfully");
              });
            }
          });
        });
      }
    });
  }

  getSelectedFile = (droppedFile: NgxFileDropEntry) =>
    new Promise((resolve) => {
      const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
      fileEntry.file((file: File) => {
        resolve(file);
      });
    });
}
