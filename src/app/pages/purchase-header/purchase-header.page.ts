import { AxService } from 'src/app/providers/axService/ax.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from './../../providers/dataService/data.service';
import { Component, OnInit } from '@angular/core';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { VendorsModel } from 'src/app/models/STPVendors.model';
import { PurchLineModel } from 'src/app/models/STPPurchTableLine.model';
import { PurchTableModel } from 'src/app/models/STPPurchTable.model';
import { StorageService } from 'src/app/providers/storageService/storage.service';

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
  poSotrageItemList: any[] = [];
  itemExistsInStorage: boolean;

  constructor(public dataServ: DataService, public axService: AxService, public router: Router,
    public paramService: ParameterService, private activateRoute: ActivatedRoute,
    public storageService: StorageService, public loadingController: LoadingController,
    public toastController: ToastController, public alertController: AlertController) {

    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
  }

  ngOnInit() {
    this.itemExistsInStorage = false;
    this.getItemsFromStorage();
    this.getVendorList();
  }
  vendorSelected() {
    if (this.pageType == "Receive") {
      this.getPurchaseOrder();
    } else {
      this.getPurchaseOrderReturn();
    }
  }


  getItemsFromStorage() {
    this.storageService.getAllValuesFromStorage.subscribe((res) => {

    }, (error) => {

    }, () => {
      if (this.paramService.POItemList != null) {
        this.poSotrageItemList = this.paramService.POItemList;
      }
    });
  }



  getVendorList() {
    this.axService.getVendorList().subscribe(res => {
      this.vendorList = res;
      this.vendorList.forEach(el => {
        el.displayText = el.VendAccount + " - " + el.Name;
      })
      this.storageService.setVendorList(this.vendorList);
    }, error => {
      console.log(error);
    })
  }
  async getPurchaseOrder() {
    const loading = await this.loadingController.create({
      message: 'Please Wait'
    });
    await loading.present();
    this.axService.getPurchOrders(this.selectedVendor.VendAccount).subscribe(res => {
      loading.dismiss();
      this.purchaseList = res;
    }, error => {
      loading.dismiss();
      this.presentToast("Connection Error")
      console.log(error);
    })
  }
  async getPurchaseOrderReturn() {
    const loading = await this.loadingController.create({
      message: 'Please Wait'
    });
    await loading.present();
    this.axService.readPOReturnList(this.selectedVendor.VendAccount).subscribe(res => {
      loading.dismiss();
      this.purchaseList = res;
    }, error => {
      loading.dismiss();
      this.presentToast("Connection Error")
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

  async presentAlert(poItem: PurchTableModel) {
    const alert = await this.alertController.create({
      header: 'Data Exits!',
      message: `There is Unsaved data for this Order Number, 
      Click Continue to proceed with Unsaved data `,
      buttons: [
        {
          text: 'Continue',
          handler: () => {
            this.selectedPurchOrder = poItem;
          }
        },
        {
          text: 'Discard',
          handler: () => {

          }
        }
      ]
    });

    await alert.present();
  }

  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  poSelected(){
    var poItem: PurchTableModel;
    if (this.poSotrageItemList != null || this.poSotrageItemList.length !=0) {
      this.poSotrageItemList.forEach(el => {
        if (el.poNo == this.selectedPurchOrder.PurchId && el.type == this.pageType) {
          this.itemExistsInStorage = true;
          poItem = el.poHeader;
        }
      })
      if (this.itemExistsInStorage) {
        this.presentAlert(poItem);
      }
    }
  }
}
