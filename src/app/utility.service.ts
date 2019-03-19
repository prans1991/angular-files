import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable()
export class UtilityService {

  host: String;

  constructor(private title: Title) {
    this.host = new URL(window.location.href).hostname;
  }

  setTitle(name: string) {
    this.title.setTitle(name);
  }

  getTitle() {
    return this.title.getTitle();
  }
}
