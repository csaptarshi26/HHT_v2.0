import { Router } from '@angular/router';
import { DataService } from './../../providers/dataService/data.service';
import { AxService } from './../../providers/axService/ax.service';
import { IonicSelectableComponent } from 'ionic-selectable';
import { Component, OnInit } from '@angular/core';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { PurchLineModel } from 'src/app/models/STPPurchTableLine.model';
import { PurchTableModel } from 'src/app/models/STPPurchTable.model';
import { VendorsModel } from 'src/app/models/STPVendors.model';

@Component({
  selector: 'app-return',
  templateUrl: './return.page.html',
  styleUrls: ['./return.page.scss'],
})
export class ReturnPage implements OnInit {

  vendorList: VendorsModel[] = [];
  selectedVendor: VendorsModel;

  purchaseList: PurchTableModel[] = [];
  selectedPurchOrder: PurchTableModel = {} as PurchTableModel;

  poLineList: PurchLineModel[] = [];

  constructor(public axService: AxService, public dataServ: DataService,
    public paramService: ParameterService, public router: Router) {

  }
  vendorSelected(event: {
    component: IonicSelectableComponent,
    value: any
  }) {
    this.selectedVendor = event.value;
    this.getPurchaseOrderReturn();
  }

  ngOnInit() {
    this.getVendorList();
  }
  getVendorList() {
    this.axService.getVendorList().subscribe(res => {
      this.vendorList = res;
      console.log(res);
    }, error => {

    })
  }
  getPurchaseOrderReturn() {
    this.axService.readPOReturnList(this.selectedVendor.VendAccount).subscribe(res => {
      console.log(res);
    }, error => {
      console.log(error);
    })
  }
}
