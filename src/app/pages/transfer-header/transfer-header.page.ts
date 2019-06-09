import { InventLocationLineModel } from './../../models/STPInventLocationLine.model';
import { DataService } from 'src/app/providers/dataService/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AxService } from './../../providers/axService/ax.service';
import { Component, OnInit } from '@angular/core';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { TransferOrderModel } from 'src/app/models/STPTransferOrder.model';

@Component({
  selector: 'app-transfer-header',
  templateUrl: './transfer-header.page.html',
  styleUrls: ['./transfer-header.page.scss'],
})
export class TransferHeaderPage implements OnInit {

  pageType: any;
  warehouseList: InventLocationLineModel[] = [];
  currentLoc: InventLocationLineModel = {} as InventLocationLineModel;

  toWarehouse: InventLocationLineModel = {} as InventLocationLineModel;
  fromWarehouse: InventLocationLineModel = {} as InventLocationLineModel;

  transOrderList: TransferOrderModel[] = [];
  selectedTrans: TransferOrderModel = {} as TransferOrderModel;

  constructor(public dataServ: DataService, public axService: AxService,
    public paramService: ParameterService, private activateRoute: ActivatedRoute,
    public router: Router) {

    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
  }


  ngOnInit() {
    this.currentLoc = this.paramService.Location;
    this.getWarehouse();

  }
  fromListSelected() {
    console.log(this.fromWarehouse.LocationId);
    this.axService.readTransferOrders(this.paramService.Location.LocationId, this.fromWarehouse.LocationId).subscribe(res => {
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

  ToListSelected() {
    this.axService.readTransferOrders(this.toWarehouse.LocationId, this.paramService.Location.LocationId).subscribe(res => {
      console.log(res);
      this.transOrderList = res;
    }, error => {
      console.log(error)
    })
  }

  navigateToNext() {
    if (this.pageType == "Transfer-in") {
      this.dataServ.setToIn(this.selectedTrans);
      this.router.navigateByUrl('/transfer-line/' + 'Transfer-in');
    } else {
      this.dataServ.setTO(this.selectedTrans);
      this.router.navigateByUrl('/transfer-line/' + 'Transfer-out');
    }

  }
}