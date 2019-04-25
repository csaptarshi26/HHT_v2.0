import { CommonModel } from './../../models/STPCommon.model';
import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { ParameterService } from '../parameterService/parameter.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AxService {

  public baseAddress: string = "http://192.168.0.124:1060/hhtservice/api/ax/";
  constructor(public paramService: ParameterService, public hTTP: HTTP, public http: HttpClient) {

  }

  checkUser(userId: string, password: string): Observable<any> {
    let url = this.baseAddress + "checkuser";
    let body = {
      UserId: userId,
      Password: password
    };
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(url, body, httpOptions);
  }

  getInventoryLocation(): Observable<any> {
    let url = this.baseAddress + "readInventLocations";
    let body = {};
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(url, body, httpOptions);
  }

  getVendorList(): Observable<any> {
    let url = this.baseAddress + "readVendors";
    let body = {
      "LocationId": this.paramService.LocationId,
      "DataAreaId": this.paramService.dataAreaId
    };
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(url, body, httpOptions);
  }

  getPurchOrders(vendAcc: any): Observable<any> {
    let url = this.baseAddress + "readPurchOrders";
    let body = {
      "LocationId": this.paramService.LocationId,
      "DataAreaId": this.paramService.dataAreaId,
      "VendAccount": vendAcc
    };
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(url, body, httpOptions);
  }
}
