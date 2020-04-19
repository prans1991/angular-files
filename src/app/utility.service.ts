import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import alertMessages from '../assets/alert-messages.json';
import { MatDialog } from '@angular/material';

@Injectable()
export class UtilityService {

  host: String;

  constructor(private title: Title, private dialog: MatDialog) {
    this.host = new URL(window.location.href).hostname;
  }

  setTitle(name: string) {
    this.title.setTitle(name);
  }

  getTitle() {
    return this.title.getTitle();
  }

  getMessageByType(type: string): Object{
    return alertMessages[type];
  }

  closeModalDialogs(){
    this.dialog.closeAll();
  }
}
