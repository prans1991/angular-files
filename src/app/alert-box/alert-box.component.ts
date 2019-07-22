import { Component, OnInit, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA
} from "@angular/material";
import { NGXLogger } from 'ngx-logger';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-alert-box',
  templateUrl: './alert-box.component.html',
  styleUrls: ['./alert-box.component.scss']
})
export class AlertBoxComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data:any, private logger: NGXLogger,private dialogRef: MatDialogRef<AlertBoxComponent>) { }

  ngOnInit() {
  }

  cancel() {
    this.dialogRef.close({isCancel: true});
  }

}
