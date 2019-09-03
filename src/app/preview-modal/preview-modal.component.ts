import { Component, OnInit, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA
} from "@angular/material";
import { NGXLogger } from 'ngx-logger';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-preview-modal',
  templateUrl: './preview-modal.component.html',
  styleUrls: ['./preview-modal.component.scss']
})
export class PreviewModalComponent implements OnInit {

  hasDialogAction: Boolean = true;

  pdfSrc: Object;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private logger: NGXLogger, private dialogRef: MatDialogRef<PreviewModalComponent>) { 
    dialogRef.disableClose = true;
    this.hasDialogAction = (data.hasDialogAction != undefined) ? data.hasDialogAction : this.hasDialogAction;
  }

  ngOnInit() {
  }

  closeModal(){
    this.dialogRef.close();
  }
}

