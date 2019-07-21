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


    this.storage.get('UserId').then((data) => {
      this.parameterservice.userId = data;
      observer.next(data);
      variables++;
      if (variables == this.parameterservice.totalStorageVariables) {
        observer.complete();
      }
    });

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

    this.storage.get('POItemList').then((data) => {
      this.parameterservice.POItemList = data;
      observer.next(data);
      variables++;
      if (variables == this.parameterservice.totalStorageVariables) {
        observer.complete();
      }
    });

    this.storage.get('SOItemList').then((data) => {
      this.parameterservice.SOItemList = data;
      observer.next(data);
      variables++;
      if (variables == this.parameterservice.totalStorageVariables) {
        observer.complete();
      }
    });

    this.storage.get('vendorList').then((data) => {
      this.parameterservice.vendorList = data;
      observer.next(data);
      variables++;
      if (variables == this.parameterservice.totalStorageVariables) {
        observer.complete();
      }
    });

    this.storage.get('TOItemList').then((data) => {
      this.parameterservice.TOItemList = data;
      observer.next(data);
      variables++;
      if (variables == this.parameterservice.totalStorageVariables) {
        observer.complete();
      }
    });

    this.storage.get('InventoryPOSItemList').then((data) => {
      this.parameterservice.inventoryPOSItemList = data;
      observer.next(data);
      variables++;
      if (variables == this.parameterservice.totalStorageVariables) {
        observer.complete();
      }
    });

    this.storage.get('InventoryNEGItemList').then((data) => {
      this.parameterservice.inventoryNEGItemList = data;
      observer.next(data);
      variables++;
      if (variables == this.parameterservice.totalStorageVariables) {
        observer.complete();
      }
    });

    this.storage.get('CustomerList').then((data) => {
      this.parameterservice.customerList = data;
      observer.next(data);
      variables++;
      if (variables == this.parameterservice.totalStorageVariables) {
        observer.complete();
      }
    });


    this.storage.get('demoData').then((data) => {
      this.parameterservice.demoData = data;
      observer.next(data);
      variables++;
      if (variables == this.parameterservice.totalStorageVariables) {
        observer.complete();
      }
    });


    this.storage.get('Role').then((data) => {
      this.parameterservice.userRole = data;
      observer.next(data);
      variables++;
      if (variables == this.parameterservice.totalStorageVariables) {
        observer.complete();
      }
    });
  })

  setUserId(userId: any) {
    this.storage.set('UserId', userId);
    this.parameterservice.userId = userId;
  }

  setRole(role: any) {
    this.storage.set('Role', role);
    this.parameterservice.userRole = role;
  }
  setDemoData(demoData: any) {
    this.storage.set('demoData', demoData);
    this.parameterservice.demoData = demoData;
  }

  setCustomerList(customerList: any) {
    this.storage.set('CustomerList', customerList);
    this.parameterservice.customerList = customerList;
  }

  setSOItemList(SOItemList: any) {
    this.storage.set('SOItemList', SOItemList);
    this.parameterservice.SOItemList = SOItemList;
  }
  setPOItemList(POItemList: any) {
    this.storage.set('POItemList', POItemList);
    this.parameterservice.POItemList = POItemList;
  }

  setTOItemList(TOItemList: any) {
    this.storage.set('TOItemList', TOItemList);
    this.parameterservice.TOItemList = TOItemList;
  }


  setVendorList(vendorList: any) {
    this.storage.set('vendorList', vendorList);
    this.parameterservice.vendorList = vendorList;
  }



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

  setInventoryPOSItemList(itemList) {
    this.storage.set('InventoryPOSItemList', itemList);
    this.parameterservice.inventoryPOSItemList = itemList;
  }

  setInventoryNEGItemList(itemList) {
    this.storage.set('InventoryNEGItemList', itemList);
    this.parameterservice.inventoryNEGItemList = itemList;
  }
  clearStorageValues() {
    this.storage.clear();
  }

  clearInventoryPOSItemList() {
    this.storage.remove('InventoryPOSItemList');
  }

  clearInventoryNEGItemList() {
    this.storage.remove('InventoryNEGItemList');
  }

  clearItemList() {
    this.storage.remove('ItemList');
  }

  clearPoItemList() {
    this.storage.remove('POItemList');
  }

  clearSOItemList() {
    this.storage.remove('SOItemList');
  }
}
