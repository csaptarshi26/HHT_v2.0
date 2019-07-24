import { AxService } from 'src/app/providers/axService/ax.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from './../../providers/dataService/data.service';
import { Component, OnInit, ViewChild, Input, ElementRef } from '@angular/core';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { VendorsModel } from 'src/app/models/STPVendors.model';
import { PurchLineModel } from 'src/app/models/STPPurchTableLine.model';
import { PurchTableModel } from 'src/app/models/STPPurchTable.model';
import { StorageService } from 'src/app/providers/storageService/storage.service';
declare var $: any;
@Component({
  selector: 'app-purchase-header',
  templateUrl: './purchase-header.page.html',
  styleUrls: ['./purchase-header.page.scss'],
})
export class PurchaseHeaderPage implements OnInit {

  pageType: any;
  vendorList: VendorsModel[] = [];
  selectedVendor: VendorsModel = {} as VendorsModel;

  purchaseList: PurchTableModel[] = [];
  selectedPurchOrder: PurchTableModel = {} as PurchTableModel;

  poLineList: PurchLineModel[] = [];
  poSotrageItemList: any[] = [];
  itemExistsInStorage: boolean;
  searchByPo: boolean = true;
  poNo: any = "";
  
  constructor(public dataServ: DataService, public axService: AxService, public router: Router,
    public paramService: ParameterService, private activateRoute: ActivatedRoute,
    public storageService: StorageService, public loadingController: LoadingController,
    public toastController: ToastController, public alertController: AlertController) {

    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
  }

  ngOnInit() {
    this.searchByPoChange();
    $('.ui.dropdown').dropdown({ fullTextSearch: true });
    this.itemExistsInStorage = false;
    this.getItemsFromStorage();
    this.getVendorList();
    this.selectedVendor.displayText = "";
    this.selectedPurchOrder.InvoiceDate = new Date().toUTCString();
  }
  vendorSelected(vend: VendorsModel) {
    this.selectedVendor = vend;
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
    if (this.paramService.vendorList) {
      this.vendorList = this.paramService.vendorList;
    }
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
  getPurchOrdersLine() {
    this.axService.getPurchOrdersLine(this.selectedPurchOrder.PurchId).subscribe(res => {
      this.selectedPurchOrder.PurchLines = res;
      console.log(res);
    }, error => {

    })
  }

  getPurchReturnOrdersLine() {
    this.axService.readPOReturnLineList(this.selectedPurchOrder.PurchId).subscribe(res => {
      this.selectedPurchOrder.PurchLines = res;      
    }, error => {

    })
  }
  navigateToNext() {
    if (!this.selectedPurchOrder.InvoiceId) {
      this.presentAlertError();
    } else {
      this.poLineList = this.selectedPurchOrder.PurchLines;
      if (this.pageType == "Receive") {
        this.dataServ.setPO(this.selectedPurchOrder);
      } else {
        this.dataServ.setPOReturn(this.selectedPurchOrder);
      }
      this.router.navigateByUrl('/purchase-line/' + this.pageType);
    }
  }
  async presentAlertError() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Please Enter Invoice No.',
      buttons: [
        {
          text: 'Okay',
          handler: () => {

          }
        }
      ]
    });

    await alert.present();
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

  getVendorByPO() {
    this.axService.getVendorByPO(this.poNo).subscribe(res => {
      if (!res.PurchId) {
        this.AlertForPoError();
      } else {
        this.selectedPurchOrder = res;
        this.selectedPurchOrder.InvoiceDate = new Date().toUTCString();
        this.selectedPurchOrder.CountNumber = "1";
        this.vendorList.forEach(el => {
          if (el.VendAccount == this.selectedPurchOrder.VendorAccount) {
            this.selectedVendor = el;
            $('.ui.fluid.dropdown').dropdown('set selected', [this.selectedVendor.displayText]);
            $('.ui.dropdown').addClass("disabled");
          }
        })

        var poItem: PurchTableModel;
        if (this.poSotrageItemList != null || this.poSotrageItemList.length != 0) {
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

    }, error => {

    })
  }
  poSelected(po: PurchTableModel) {
    this.selectedPurchOrder = po;
    this.selectedPurchOrder.InvoiceDate = new Date().toUTCString();
    this.selectedPurchOrder.CountNumber = "1";
    if (this.pageType == "Receive") {
      this.getPurchOrdersLine();
    } else {
      this.getPurchReturnOrdersLine();
    }
    var poItem: PurchTableModel;
    if (this.poSotrageItemList != null || this.poSotrageItemList.length != 0) {
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
  searchByPoChange() {
    this.selectedVendor = {} as VendorsModel;
    if (this.searchByPo) {
      $('.ui.dropdown').addClass("disabled");
    } else {
      $('.ui.dropdown').removeClass("disabled");
      
    }
    //this.selectedVendor.displayText = "";
  }

  async AlertForPoError() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: `Purchase Number Not Found`,
      buttons: [
        {
          text: 'Okay',
          handler: () => {

          }
        }
      ]
    });

    await alert.present();
  }
}
