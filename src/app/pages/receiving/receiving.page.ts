import { Router } from '@angular/router';
import { VendorsModel } from './../../models/STPVendors.model';
import { ParameterService } from './../../providers/parameterService/parameter.service';
import { AxService } from './../../providers/axService/ax.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Component, OnInit } from '@angular/core';
import { PurchTableModel } from 'src/app/models/STPPurchTable.model';
import { PurchLineModel } from 'src/app/models/STPPurchTableLine.model';
import { IonicSelectableComponent } from 'ionic-selectable';
import { DataService } from 'src/app/providers/dataService/data.service';

@Component({
  selector: 'app-receiving',
  templateUrl: './receiving.page.html',
  styleUrls: ['./receiving.page.scss'],
})
export class ReceivingPage implements OnInit {

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
    this.getPurchaseOrder();
  }
  ngOnInit() {
    this.getVendorList();
  }
  getVendorList() {
    this.axService.getVendorList().subscribe(res => {
      this.vendorList = res;
    }, error => {

    })
  }
  getPurchaseOrder() {
    this.axService.getPurchOrders(this.selectedVendor.VendAccount).subscribe(res => {
      this.purchaseList = res;
    }, error => {
      console.log(error);
    })
  }

  navigateToNext() {
    this.poLineList = this.selectedPurchOrder.PurchLines;
    this.dataServ.PO = this.selectedPurchOrder;
    //this.dataServ.setPO(this.selectedPurchOrder);
    this.router.navigateByUrl('/receiving-line');

  }
}
