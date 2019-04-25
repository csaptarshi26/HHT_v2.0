import { InventLocationModel } from './../../models/STPInventLocation.model';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import { ParameterService } from '../parameterService/parameter.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private storage: Storage, private parameterservice: ParameterService) {

  }
  getAllValuesFromStorage = Observable.create((observer) => {
    let variables = 0;

    this.storage.get('authenticated').then((data) => {
      this.parameterservice.authenticated = data;
      observer.next(data);
      variables++;
      if (variables == this.parameterservice.totalStorageVariables) {
        observer.complete();
      }
    });

    this.storage.get('LocationId').then((data) => {
      this.parameterservice.LocationId = data;
      observer.next(data);
      variables++;
      if (variables == this.parameterservice.totalStorageVariables) {
        observer.complete();
      }
    });

    this.storage.get('dataAreaId').then((data) => {
      this.parameterservice.dataAreaId = data;
      observer.next(data);
      variables++;
      if (variables == this.parameterservice.totalStorageVariables) {
        observer.complete();
      }
    });
  })

  setAuthenticated(authenticated: any) {
    this.storage.set('authenticated', authenticated);
    this.parameterservice.authenticated = authenticated;
  }
  setLocationId(LocationId:any){
    this.storage.set('LocationId', LocationId);
    this.parameterservice.LocationId = LocationId;
  }

  setDataAreaId(dataAreaId:any){
    this.storage.set('dataAreaId', dataAreaId);
    this.parameterservice.dataAreaId = dataAreaId;
  }
  setInventLocationList(inventLocationList){
    this.storage.set('inventLocationList', inventLocationList);
    this.parameterservice.inventLocationList = inventLocationList;
  }

  clearStorageValues() {
    this.storage.clear();
  }
}
