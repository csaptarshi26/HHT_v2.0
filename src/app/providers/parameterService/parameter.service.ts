import { InventLocationLineModel } from './../../models/STPInventLocationLine.model';
import { InventLocationModel } from './../../models/STPInventLocation.model';
import { CommonModel } from './../../models/STPCommon.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ParameterService {
  public authenticated: boolean;
  public Location: InventLocationLineModel;
  public dataAreaId: any;

  public inventLocationList: InventLocationModel[] = [];
  public wareHouseList: InventLocationLineModel[] = [];

  public deviceID:any;

  public totalStorageVariables: Number = 5;
  constructor() { }
}
