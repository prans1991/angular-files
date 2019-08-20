import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable()
export class UtilityService {

  host: String;

  messages = {
    'delAllFiles': 'Are you sure you want to delete all files?',
    'delSelectedFiles': 'Are you sure you want to delete the selected files?',
    'noFiles': 'No files to display',
    'noFilesUploadSome': 'No files to display. Please upload some.',
    'selectFiles': 'Please select files to upload',
    'maxSelect': 'Please select a maximum of 5 files',
    'duplicateSelect': 'Duplicate files selected for upload. Please check and retry upload',
    'uploadSuccess': 'File(s) uploaded successfully',
    'uploadingFiles': 'File(s) are being uploaded. Please wait ...'
  };

  constructor(private title: Title) {
    this.host = new URL(window.location.href).hostname;
  }

  setTitle(name: string) {
    this.title.setTitle(name);
  }

  getTitle() {
    return this.title.getTitle();
  }

  getMessageByType(type: string): Object{
    return this.messages[type];
  }
}
