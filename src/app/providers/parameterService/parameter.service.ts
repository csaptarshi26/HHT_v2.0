import { InventLocationLineModel } from './../../models/STPInventLocationLine.model';
import { InventLocationModel } from './../../models/STPInventLocation.model';
import { CommonModel } from './../../models/STPCommon.model';
import { Injectable } from '@angular/core';
import { ItemModel } from 'src/app/models/STPItem.model';

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

  public deviceID: any;

  public totalStorageVariables: Number = 6;
  constructor() { }
}
