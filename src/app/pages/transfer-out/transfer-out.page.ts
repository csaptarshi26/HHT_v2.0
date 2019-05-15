import { AxService } from './../../providers/axService/ax.service';
import { InventLocationLineModel } from './../../models/STPInventLocationLine.model';
import { Component, OnInit } from '@angular/core';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';

@Component({
  selector: 'app-transfer-out',
  templateUrl: './transfer-out.page.html',
  styleUrls: ['./transfer-out.page.scss'],
})
export class TransferOutPage implements OnInit {

  warehouseList: InventLocationLineModel[] = [];
  currentLoc: InventLocationLineModel = {} as InventLocationLineModel;

  toWarehouse: InventLocationLineModel = {} as InventLocationLineModel;
  constructor(public paramService: ParameterService, public axService: AxService) { }

  ngOnInit() {
    this.currentLoc = this.paramService.Location;
    this.getWarehouse();

  }
  fromListSelected() {
    console.log(this.toWarehouse)
    this.axService.readTOList(this.toWarehouse.LocationId).subscribe(res => {
      console.log(res);
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
