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

  //public baseAddress: string = "http://192.168.0.182:1060/AX/api/ax/";

  //MASSKAR URL
  //public baseAddress: string = "http://192.168.1.105:1060/ax/api/ax/";

  //NAIVAS URL
  public baseAddress: string = "http://192.168.0.190:1060/AX/api/ax/";
  constructor(public paramService: ParameterService, public hTTP: HTTP, public http: HttpClient) {

  }

  getToken() {
    let url = "https://schnellservicesit.azurewebsites.net/api/Account/D365Login";
    let body = {
      "Email": "schnelld365@yopmail.com",
      "Password": "Schnell@123"
    }
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(url, JSON.stringify(body), httpOptions);
  }

  testApi(token) {
    let url = "https://schnellservicesit.azurewebsites.net/api/D365Integration/SaveD365Products";
    let bodyArr =[];
    let body =
      {
        "ProductTypeName": "Product",
        "BCProductId": "BCProd6",
        "ProductName": "Schnell Finance Product6",
        "ProductPrice": "720.00",
        "ProductCurrency": "AED",
        "ProductPriceROW": "800.00",
        "ProductCurrencyROW": "USD",
        "MinimumLicences": "10",
        "LicenseType": "User",
        "IsActive": "true",
        "ProductDetail": [{
          "ProductDetailsTypeName": "Module",
          "ProductDetails": "Standard Test"
        },
        {
          "ProductDetailsTypeName": "Feature",
          "ProductDetails": "VAT Test"
        }
          ,
        {
          "ProductDetailsTypeName": "Feature",
          "ProductDetails": "VAT Test Feature S"
        }]
      };
    bodyArr.push(body);
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzY2huZWxsZDM2NUB5b3BtYWlsLmNvbSIsImp0aSI6IjdkNTY4MzUwLThkNzctNDZmNy04OWVjLWFmZGJmMDU2MzRkMyIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWVpZGVudGlmaWVyIjoiZTdkZjNiMWYtYWExOS00N2RjLWE3NWEtZDlmNDFkMWUyNzdjIiwiZXhwIjoxNTY2NjQ1MDE0LCJpc3MiOiJodHRwczovL3d3dy5vcHRpc29sYnVzaW5lc3MuY29tLyIsImF1ZCI6Imh0dHBzOi8vd3d3Lm9wdGlzb2xidXNpbmVzcy5jb20vIn0.cCYQqLnrx4_7MgZ_OwStKeUHSRtsK7WNrnQqeYbBWNU'
      })
    };
    return this.http.post(url,JSON.stringify(bodyArr), httpOptions);
  }

  getCurrentDate() {
    let url = this.baseAddress + "getCurrentDate";
    let body = {};
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

  getPurchOrdersLine(purchId: any): Observable<any> {
    let url = this.baseAddress + "readPurchOrdersLine";
    let body = {
      "LocationId": this.paramService.Location.LocationId,
      "DataAreaId": this.paramService.dataAreaId,
      "PurchId": purchId
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

  readTransOrdersLine(transferId: any): Observable<any> {
    let url = this.baseAddress + "readTransOrdersLine";
    let body = {
      "DataAreaId": this.paramService.dataAreaId,
      "TransferId": transferId
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

  readPOReturnLineList(purchId: any): Observable<any> {
    let url = this.baseAddress + "readPOReturnLineList";
    let body = {
      "LocationId": this.paramService.Location.LocationId,
      "DataAreaId": this.paramService.dataAreaId,
      "PurchId": purchId
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
    return this.http.post(url, body, httpOptions);
  }

  getItemFromBarcodeWithOUM(barcode): Observable<any> {
    let url = this.baseAddress + "getItemFromBarcodeWithUOM";
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

  getSalesLine(salesId): Observable<any> {
    let url = this.baseAddress + "readSalesLine";
    let body = {
      "LocationId": this.paramService.Location.LocationId,
      "DataAreaId": this.paramService.dataAreaId,
      "SalesId": salesId,
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

  getVendorByPO(purchid): Observable<any> {
    let url = this.baseAddress + "readVendorNameByPO";
    let body = {
      "LocationId": this.paramService.Location.LocationId,
      "DataAreaId": this.paramService.dataAreaId,
      "PurchId": purchid,
    };
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(url, body, httpOptions);
  }
}
