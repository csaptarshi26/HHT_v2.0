import { StorageService } from './../../providers/storageService/storage.service';
import { DataService } from './../../providers/dataService/data.service';
import { TransferOrderModel } from './../../models/STPTransferOrder.model';
import { AxService } from './../../providers/axService/ax.service';
import { InventLocationLineModel } from './../../models/STPInventLocationLine.model';
import { Component, OnInit } from '@angular/core';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-transfer-out',
  templateUrl: './transfer-out.page.html',
  styleUrls: ['./transfer-out.page.scss'],
})
export class TransferOutPage implements OnInit {

  warehouseList: InventLocationLineModel[] = [];
  currentLoc: InventLocationLineModel = {} as InventLocationLineModel;
  toWarehouse: InventLocationLineModel = {} as InventLocationLineModel;

  transOrderList: TransferOrderModel[] = [];
  selectedTrans: TransferOrderModel = {} as TransferOrderModel;

  constructor(public paramService: ParameterService, public axService: AxService,
    public dataServ:DataService,public router:Router) { 
    }

  ngOnInit() {
    this.currentLoc = this.paramService.Location;
    this.getWarehouse();

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
  ToListSelected() {
    this.axService.readTransferOrders(this.toWarehouse.LocationId,this.paramService.Location.LocationId).subscribe(res => {
      console.log(res);
      this.transOrderList = res;
    }, error => {
      console.log(error)
    })
  }

  navigateToNext() {
    this.dataServ.setTO(this.selectedTrans);
    this.router.navigateByUrl('/transfer-line/'+'transferOut');

  }

}
