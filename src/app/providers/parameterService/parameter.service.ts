import { CustomerModel } from './../../models/STPCustomer.model';
import { VendorsModel } from 'src/app/models/STPVendors.model';
import { PurchTableModel } from 'src/app/models/STPPurchTable.model';
import { SalesLineModel } from './../../models/STPSalesLine.model';
import { PurchLineModel } from 'src/app/models/STPPurchTableLine.model';
import { InventLocationLineModel } from './../../models/STPInventLocationLine.model';
import { InventLocationModel } from './../../models/STPInventLocation.model';
import { CommonModel } from './../../models/STPCommon.model';
import { Injectable } from '@angular/core';
import { ItemModel } from 'src/app/models/STPItem.model';
import { SalesTable } from 'src/app/models/STPSalesTable.model';
import { RoleModel } from 'src/app/models/STPRole.model';

@Injectable({
  providedIn: 'root'
})
export class ParameterService {
  public authenticated: boolean;
  public Location: InventLocationLineModel;
  public dataAreaId: any;

  public inventLocationList: InventLocationModel[] = [];
  public wareHouseList: InventLocationLineModel[] = [];
  public ItemList: ItemModel[] = [];
  public vendorList: VendorsModel[];
  public customerList: CustomerModel[];

  public deviceID: any;
  public userId:any;

  public inventoryPOSItemList: any[] = [];
  public inventoryNEGItemList: any[] = [];
  public POItemList: any[] = [];
  public SOItemList: any[] = [];
  public TOItemList: any[] = [];

  public soLineUpdated: boolean;
  public itemUpdated: boolean = false;
  public itemChanged: boolean = false;
  public poItemUpdated: boolean = false;
  public userRole:RoleModel;

  public demoData: any[] = [];

  public totalStorageVariables: Number = 16;


  constructor() { }
}

