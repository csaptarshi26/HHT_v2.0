import { DataService } from 'src/app/providers/dataService/data.service';
import { Router } from '@angular/router';
import { InventLocationLineModel } from './../../models/STPInventLocationLine.model';
import { InventLocationModel } from './../../models/STPInventLocation.model';
import { ParameterService } from './../../providers/parameterService/parameter.service';
import { Component, OnInit } from '@angular/core';
import { AxService } from 'src/app/providers/axService/ax.service';
import { isError } from 'util';
import { TransferOrderModel } from 'src/app/models/STPTransferOrder.model';

@Component({
  selector: 'app-transfer-in',
  templateUrl: './transfer-in.page.html',
  styleUrls: ['./transfer-in.page.scss'],
})
export class TransferInPage implements OnInit {

  warehouseList: InventLocationLineModel[] = [];
  currentLoc: InventLocationLineModel = {} as InventLocationLineModel;

  fromWarehouse: InventLocationLineModel = {} as InventLocationLineModel;

  transOrderList: TransferOrderModel[] = [];
  selectedTrans: TransferOrderModel = {} as TransferOrderModel;

  constructor(public paramService: ParameterService, public axService: AxService,
    public dataServ:DataService,public router:Router) { }

  ngOnInit() {
    this.currentLoc = this.paramService.Location;
    this.getWarehouse();

  }
  fromListSelected() {
    console.log(this.fromWarehouse.LocationId);
    this.axService.readTransferOrders(this.paramService.Location.LocationId,this.fromWarehouse.LocationId).subscribe(res => {
      console.log(res);
      this.transOrderList = res;
    }, error => {
      console.log(error)
    })
  }
  getWarehouse() {
    this.warehouseList = this.paramService.wareHouseList.slice();
    this.warehouseList.forEach(el => {
      if (el.LocationId == this.currentLoc.LocationId) {
        var index = this.warehouseList.indexOf(el);
        if (index > -1) {
          this.warehouseList.splice(index, 1);
        }
      }
    })
  }

  navigateToNext() {
    this.dataServ.setToIn(this.selectedTrans);
    this.router.navigateByUrl('/transfer-line/' + 'transferIn');

  }


}
