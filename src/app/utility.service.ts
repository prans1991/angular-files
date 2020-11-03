import { Injectable } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { MatDialog } from "@angular/material/dialog";
import { ALERT_MESSAGES } from "./constants";

@Injectable()
export class UtilityService {
  host: string;

  constructor(private title: Title, private dialog: MatDialog) {
    this.host = new URL(window.location.href).hostname;
  }

  setTitle(name: string) {
    this.title.setTitle(name);
  }

  getTitle() {
    return this.title.getTitle();
  }

  getMessageByType = (type: string): string => {
    return ALERT_MESSAGES[type];
  };

  closeModalDialogs() {
    this.dialog.closeAll();
  }
}
