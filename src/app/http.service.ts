import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { UtilityService } from './utility.service';
import { Socket } from 'ngx-socket-io';
import FileInfo from './File';


@Injectable()
export class HttpService {

  uri: String;

  constructor(private http: HttpClient, private logger: NGXLogger, private utility: UtilityService, public socket: Socket) {
    let host = this.utility.host;
    this.uri = `http://${host}:3737`;
    this.socket.connect();
  }

  deleteSingle(fileName: string) {
    var data = {
      fileName: fileName,
      delete: 'single'
    };
    return this.http.post(`${this.uri}/delete`, data, { responseType: 'text' });
  }

  deleteAll() {
    var data = {
      delete: 'all'
    };
    return this.http.post(`${this.uri}/delete`, data, { responseType: 'text' });
  }

  deleteSelected(files:{ name: string; }[]) {
    var data = {
      files: files,
      delete: 'selected'
    };
    return this.http.post(`${this.uri}/delete`, data, { responseType: 'text' });
  }

  getFiles() {
    return this.http.get(`${this.uri}/list`);
  }

  uploadFiles(files:File[]) {
    const formData: any = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("uploads[]", files[i], files[i]['name']);
    }
    return this.http.post(`${this.uri}/upload`, formData, { reportProgress: true,  observe:'events',responseType: 'json' });
  }
}
