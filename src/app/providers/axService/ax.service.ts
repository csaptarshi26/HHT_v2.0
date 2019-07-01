import { CommonModel } from './../../models/STPCommon.model';
import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { ParameterService } from '../parameterService/parameter.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { STPLogSyncDetailsModel } from 'src/app/models/STPLogSyncData.model';
@Injectable({
  providedIn: 'root'
})
export class AxService {

  public baseAddress: string = "http://192.168.0.182:1060/AX/api/ax/";

  //MASSKAR URL
  //public baseAddress: string = "http://192.168.1.105:1060/ax/api/ax/";
  constructor(public paramService: ParameterService, public hTTP: HTTP, public http: HttpClient) {

  }

  getCurrentDate() {
    let url = this.baseAddress + "getCurrentDate";
    let body = { };
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(url, body, httpOptions);
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
      "LocationId": this.paramService.Location.LocationId,
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
      "LocationId": this.paramService.Location.LocationId,
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

  readTransferOrders(toLocaion: any, fromLocation: any): Observable<any> {
    let url = this.baseAddress + "readTransOrders";
    let body = {
      "DataAreaId": this.paramService.dataAreaId,
      "ToLocationId": toLocaion,
      "FromLocationId": fromLocation
    };
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(url, body, httpOptions);
  }


  readPOReturnList(vendAcc: any): Observable<any> {
    let url = this.baseAddress + "readPOReturnList";
    let body = {
      "LocationId": this.paramService.Location.LocationId,
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

  updateStagingTable(dataTable: STPLogSyncDetailsModel[]) {
    let url = this.baseAddress + "updateStagingTableList";
    let body = {
      "LocationId": this.paramService.Location.LocationId,
      "DataAreaId": this.paramService.dataAreaId,
      "ContractList": dataTable
    };
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(url, body, httpOptions);
  }

  getItemFromBarcode(barcode): Observable<any> {
    let url = this.baseAddress + "getItemFromBarcode";
    let body = {
      "DataAreaId": this.paramService.dataAreaId,
      "ItemBarcode": barcode
    };
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    console.log(body);
    return this.http.post(url, body, httpOptions);
  }


  getCustomerList(): Observable<any> {
    let url = this.baseAddress + "readCustomers";
    let body = {
      "DataAreaId": this.paramService.dataAreaId,
      "LocationId": this.paramService.Location.LocationId,
    };
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(url, body, httpOptions);
  }

  getSalesOrder(custAcc): Observable<any> {
    let url = this.baseAddress + "readSalesOrders";
    let body = {
      "LocationId": this.paramService.Location.LocationId,
      "DataAreaId": this.paramService.dataAreaId,
      "CustAccount": custAcc,
    };
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(url, body, httpOptions);
  }

  getSalesReturnOrder(custAcc): Observable<any> {
    let url = this.baseAddress + "readSalesReturnOrders";
    let body = {
      "LocationId": this.paramService.Location.LocationId,
      "DataAreaId": this.paramService.dataAreaId,
      "CustAccount": custAcc,
    };
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(url, body, httpOptions);
  }
}
