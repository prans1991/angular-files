import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { UtilityService } from "./utility.service";
import { Socket } from "ngx-socket-io";

@Injectable()
export class HttpService {
  uri: string;

  constructor(
    private http: HttpClient,
    private utility: UtilityService,
    public socket: Socket
  ) {
    const host = this.utility.host;
    this.uri = `http://${host}:3737`;
    this.socket.connect();
  }

  deleteSingle(fileName: string) {
    const data = {
      fileName,
      delete: "single",
    };
    return this.http.post(`${this.uri}/delete`, data, { responseType: "text" });
  }

  deleteAll() {
    const data = {
      delete: "all",
    };
    return this.http.post(`${this.uri}/delete`, data, { responseType: "text" });
  }

  deleteSelected(files: Array<{ name: string }>) {
    const data = {
      files,
      delete: "selected",
    };
    return this.http.post(`${this.uri}/delete`, data, { responseType: "text" });
  }

  getFiles() {
    return this.http.get(`${this.uri}/list`);
  }

  uploadFiles(files: File[]) {
    const formData: any = new FormData();
    for (const file of files) {
      formData.append("uploads[]", file, file["name"]);
    }
    return this.http.post(`${this.uri}/upload`, formData, {
      reportProgress: true,
      observe: "events",
      responseType: "json",
    });
  }
}
