import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-alert-box",
  templateUrl: "./alert-box.component.html",
  styleUrls: ["./alert-box.component.scss"],
})
export class AlertBoxComponent implements OnInit {
  hasDialogAction = true;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<AlertBoxComponent>) {
    dialogRef.disableClose = true;
    this.hasDialogAction = data.hasDialogAction !== undefined ? data.hasDialogAction : this.hasDialogAction;
  }

  ngOnInit() {}

  cancel() {
    this.dialogRef.close({ isCancel: true });
  }
  cancelUpload() {
    this.dialogRef.close({ cancelUpload: true });
  }
}
