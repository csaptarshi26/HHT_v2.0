import { AxService } from 'src/app/providers/axService/ax.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from './../../providers/dataService/data.service';
import { Component, OnInit } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { VendorsModel } from 'src/app/models/STPVendors.model';
import { PurchLineModel } from 'src/app/models/STPPurchTableLine.model';
import { PurchTableModel } from 'src/app/models/STPPurchTable.model';

@Component({
  selector: 'app-purchase-header',
  templateUrl: './purchase-header.page.html',
  styleUrls: ['./purchase-header.page.scss'],
})
export class PurchaseHeaderPage implements OnInit {

  pageType: any;
  vendorList: VendorsModel[] = [];
  selectedVendor: VendorsModel;

  purchaseList: PurchTableModel[] = [];
  selectedPurchOrder: PurchTableModel = {} as PurchTableModel;

  poLineList: PurchLineModel[] = [];

  constructor(public dataServ: DataService, public axService: AxService, public router: Router,
    public paramService: ParameterService, private activateRoute: ActivatedRoute,
    public toastController: ToastController, public alertController: AlertController) {

    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
  }

  ngOnInit() {
    this.getVendorList();
  }
  vendorSelected() {
    if (this.pageType == "Receive") {
      this.getPurchaseOrder();
    } else {
      this.getPurchaseOrderReturn();
    }
  }

  getVendorList() {
    this.axService.getVendorList().subscribe(res => {
      this.vendorList = res;
      this.vendorList.forEach(el => {
        el.displayText = el.VendAccount + " - " + el.Name;
      })
    }, error => {
      console.log(error);
    })
  }
  getPurchaseOrder() {
    this.axService.getPurchOrders(this.selectedVendor.VendAccount).subscribe(res => {
      this.purchaseList = res;
    }, error => {
      console.log(error);
    })
  }
  getPurchaseOrderReturn() {
    this.axService.readPOReturnList(this.selectedVendor.VendAccount).subscribe(res => {
      this.purchaseList = res;
    }, error => {
      console.log(error);
    })
  }
  navigateToNext() {
    this.poLineList = this.selectedPurchOrder.PurchLines;
    if (this.pageType == "Receive") {
      this.dataServ.setPO(this.selectedPurchOrder);
    } else {
      this.dataServ.setPOReturn(this.selectedPurchOrder);
    }
    this.router.navigateByUrl('/purchase-line/' + this.pageType);

  }

}