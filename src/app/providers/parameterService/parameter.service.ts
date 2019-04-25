import { InventLocationModel } from './../../models/STPInventLocation.model';
import { CommonModel } from './../../models/STPCommon.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ParameterService {

  public authenticated:boolean;
  public LocationId:any;
  public dataAreaId:any;

  public inventLocationList:InventLocationModel[]=[];

  public totalStorageVariables: Number = 3;
  constructor() { }
}
