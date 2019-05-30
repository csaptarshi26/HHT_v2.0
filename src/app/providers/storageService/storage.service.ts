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

    this.storage.get('Location').then((data) => {
      this.parameterservice.Location = data;
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

    this.storage.get('warehouseList').then((data) => {
      this.parameterservice.wareHouseList = data;
      observer.next(data);
      variables++;
      if (variables == this.parameterservice.totalStorageVariables) {
        observer.complete();
      }
    });

    this.storage.get('deviceId').then((data) => {
      this.parameterservice.deviceID = data;
      observer.next(data);
      variables++;
      if (variables == this.parameterservice.totalStorageVariables) {
        observer.complete();
      }
    });

    this.storage.get('ItemList').then((data) => {
      this.parameterservice.ItemList = data;
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
  setLocation(LocationId: any) {
    this.storage.set('Location', LocationId);
    this.parameterservice.Location = LocationId;
  }

  setDataAreaId(dataAreaId: any) {
    this.storage.set('dataAreaId', dataAreaId);
    this.parameterservice.dataAreaId = dataAreaId;
  }
  setInventLocationList(inventLocationList) {
    this.storage.set('inventLocationList', inventLocationList);
    this.parameterservice.inventLocationList = inventLocationList;
  }

  setWarehouseForLegalEntity(wareHouseList) {
    this.storage.set('warehouseList', wareHouseList);
    this.parameterservice.wareHouseList = wareHouseList;
  }
  setDeviceID(deviceId) {
    this.storage.set('deviceId', deviceId);
    this.parameterservice.deviceID = deviceId;
  }
  setItemList(itemList) {
    this.storage.set('ItemList', itemList);
    this.parameterservice.ItemList = itemList;
  }
  clearStorageValues() {
    this.storage.clear();
  }
  clearItemList(){
    this.storage.remove('ItemList');
  }
}
