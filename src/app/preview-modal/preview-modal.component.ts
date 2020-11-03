import { Component, OnInit, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: "app-preview-modal",
  templateUrl: "./preview-modal.component.html",
  styleUrls: ["./preview-modal.component.scss"],
})
export class PreviewModalComponent implements OnInit {
  hasDialogAction = true;

  pdfSrc: object;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PreviewModalComponent>
  ) {
    dialogRef.disableClose = true;
    this.hasDialogAction =
      data.hasDialogAction !== undefined
        ? data.hasDialogAction
        : this.hasDialogAction;
  }

  ngOnInit() {}

  closeModal() {
    this.dialogRef.close();
  }
}
