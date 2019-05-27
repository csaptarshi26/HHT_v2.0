import { TransferInModel } from './../../models/STPTransferIN.model';
import { InventLocationLineModel } from './../../models/STPInventLocationLine.model';
import { InventLocationModel } from './../../models/STPInventLocation.model';
import { ParameterService } from './../../providers/parameterService/parameter.service';
import { Component, OnInit } from '@angular/core';
import { AxService } from 'src/app/providers/axService/ax.service';
import { isError } from 'util';

@Component({
  selector: 'app-transfer-in',
  templateUrl: './transfer-in.page.html',
  styleUrls: ['./transfer-in.page.scss'],
})
export class TransferInPage implements OnInit {

  warehouseList: InventLocationLineModel[] = [];
  currentLoc: InventLocationLineModel = {} as InventLocationLineModel;

  fromWarehouse: InventLocationLineModel = {} as InventLocationLineModel;
  transferInList: TransferInModel[] = [];
  selectedTO: TransferInModel = {} as TransferInModel;
  constructor(public paramService: ParameterService, public axService: AxService) { }

  ngOnInit() {
    this.currentLoc = this.paramService.Location;
    this.getWarehouse();

  }
  fromListSelected() {
    console.log(this.fromWarehouse.LocationId);
    this.axService.readTransferOrders(this.fromWarehouse.LocationId).subscribe(res => {
      console.log(res);
      this.transferInList = res;
    }, error => {
      console.log(error)
    })
  }
  getWarehouse() {
    this.warehouseList = this.paramService.wareHouseList;
    this.warehouseList.forEach(el => {
      if (el.LocationId == this.currentLoc.LocationId) {
        var index = this.warehouseList.indexOf(el);
        if (index > -1) {
          this.warehouseList.splice(index, 1);
        }
      }
    })
  }


}
