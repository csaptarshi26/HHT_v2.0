import { IqtyList } from './../../models/IQtyModel';
import { DataService } from './../../providers/dataService/data.service';
import { ItemModel } from './../../models/STPItem.model';
import { InventLocationLineModel } from './../../models/STPInventLocationLine.model';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { AlertController, LoadingController, ToastController, IonInput, IonSearchbar } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AxService } from './../../providers/axService/ax.service';
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { StorageService } from 'src/app/providers/storageService/storage.service';
import { STPLogSyncDetailsModel } from 'src/app/models/STPLogSyncData.model';
declare var $: any;
@Component({
  selector: 'app-inventory-header',
  templateUrl: './inventory-header.page.html',
  styleUrls: ['./inventory-header.page.scss'],
})
export class InventoryHeaderPage implements OnInit {

  pageType: any;
  barcode: string;
  warehouseList: InventLocationLineModel[] = [];
  currentLoc: InventLocationLineModel = {} as InventLocationLineModel;
  selectedWarehouse: InventLocationLineModel = {} as InventLocationLineModel;

  updateDataTableList: STPLogSyncDetailsModel[] = [];
  item: ItemModel = {} as ItemModel;
  itemList: ItemModel[] = [];
  scannedQty: any = 0;
  user: any;

  qtyList: any[] = [];

  editField: boolean = false;
  count: any = -1;
  scannedQty1: any = 0;
  scannedQty2: any = 0;
  CountNumber: any = "1";
  @ViewChild("input") barcodeInput: IonSearchbar;
  @ViewChild("qtyInput") qtyInput: IonInput;

  constructor(public axService: AxService, public paramService: ParameterService,
    public alertController: AlertController, private activateRoute: ActivatedRoute,
    public toastController: ToastController, private keyboard: Keyboard,
    private router: Router, public storageServ: StorageService,
    public loadingController: LoadingController, public dataServ: DataService,
    public changeDetectorref: ChangeDetectorRef) {

    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
    console.log(this.pageType)

    // let instance = this;
    // (<any>window).plugins.intentShim.registerBroadcastReceiver({
    //   filterActions: ['com.steeples.hht.ACTION'
    //     // 'com.zebra.ionicdemo.ACTION',
    //     // 'com.symbol.datawedge.api.RESULT_ACTION'
    //   ],
    //   filterCategories: ['android.intent.category.DEFAULT']
    // },
    //   function (intent) {
    //     //  Broadcast received
    //     instance.barcode = "";
    //     console.log('Received Intent: ' + JSON.stringify(intent.extras));
    //     instance.barcode = intent.extras['com.symbol.datawedge.data_string'];
    //     changeDetectorref.detectChanges();
    //   });
  }

  ngOnInit() {
    this.count = -1;
    //this.getStorageData();
    this.user = this.paramService.userId
    this.currentLoc = this.paramService.Location;

  }
  setBarcodeFocus() {
    this.barcode = "";
    setTimeout(() => {
      this.barcodeInput.setFocus();
    }, 100);
    setTimeout(() => {
      this.keyboard.hide();
    }, 100);
  }
  ionViewWillEnter() {
    this.setBarcodeFocus();
    if (this.paramService.itemUpdated) {
      this.item = {} as ItemModel;
      this.itemList = [];
      this.scannedQty1 = 0;
      this.scannedQty2 = 0;
    }
    else {
      this.dataServ.getitemListFromInventoryList$.subscribe(res => {
        if (res) {
          this.itemList = res;
        }
      }, error => {

      })
      if (this.CountNumber == "1") {
        this.scannedQty1 = this.calculateItemListQty(this.CountNumber);
      } else if (this.CountNumber == "2") {
        this.scannedQty2 = this.calculateItemListQty(this.CountNumber);
      }
    }
  }
  calculateItemListQty(selectedCountNumber) {
    var sum = 0;
    this.qtyList = [];
    this.itemList.forEach(el => {
      var obj = {} as IqtyList;
      obj.countNumber = el.CountNumber;
      obj.qty = el.quantity;
      this.qtyList.push(obj);
      if (selectedCountNumber == el.CountNumber) {
        sum = sum + +el.quantity;
      }
    })
    if (sum == 0) {
      this.item = {} as ItemModel;
    }
    return sum;
  }
  clearBarcode() {
    this.barcode = "";
    setTimeout(() => {
      this.barcodeInput.setFocus();
    }, 100);
    setTimeout(() => {
      this.keyboard.show();
    }, 100);
  }
  getStorageData() {
    this.storageServ.getAllValuesFromStorage.subscribe((res) => {

    }, (error) => {

    }, () => {
      if (this.pageType == "Positive-adj") {
        console.log(this.paramService.inventoryPOSItemList)
        if (this.paramService.inventoryPOSItemList == null || this.paramService.inventoryPOSItemList.length == 0) {
          this.itemList = [];
        } else {
          this.itemList = this.paramService.inventoryPOSItemList;
          console.log(this.itemList)
          this.scannedQty1 = this.calculateItemListQty("1");
          this.scannedQty2 = this.calculateItemListQty("2");
        }
      } else {
        if (this.paramService.inventoryNEGItemList == null || this.paramService.inventoryNEGItemList.length == 0) {
          this.itemList = [];
        } else {
          this.itemList = this.paramService.inventoryNEGItemList;
          console.log(this.itemList)
          this.scannedQty1 = this.calculateItemListQty("1");
          this.scannedQty2 = this.calculateItemListQty("2");
        }
      }

    });
  }
  calculateSum(selectedCount) {
    var sum = 0;
    this.qtyList.forEach(el => {
      if (selectedCount == el.countNumber) {
        sum = sum + +el.qty;
      }
    })
    return sum;
  }
  keyboardHide() {
    this.keyboard.hide();
  }
  onPressEnter() {
    this.searchBarcode(true);
  }
  async barcodeScan(event: any) {
    this.barcode = event.target.value;
    if (this.barcode != null) {
      if (!this.CountNumber) {
        this.presentAlertForError("Please Select Count Number ");
      } else {
        this.searchBarcode();
      }
    }
  }
  async searchBarcode(flag = false) {
    this.axService.getItemFromBarcodeWithOUM(this.barcode).subscribe(res => {
      this.item = res;
      if (this.item.ItemId == null || this.item.ItemId == "") {
        // flag = true;
        // this.presentToast("This item barcode not in order list");
        // this.setBarcodeFocus();
        this.count++;
        if (flag) {
          // this.presentToast("Item not found");
          this.setBarcodeFocus();
        }
      } else {
        this.barcode = "";
        this.count++;
        this.item.visible = true;

        this.item.quantity = "";
        setTimeout(() => {
          this.qtyInput.setFocus();
          this.barcode = "";
        }, 100);
        this.item.CountNumber = this.CountNumber;
        this.itemList.push(this.item);
        this.itemList.reverse();
        // this.itemList.push(this.item);
      }
    }, error => {
      this.presentToast("Connection Error");
      this.setBarcodeFocus();
    });
  }
  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }
  onEnterConfirm(item: ItemModel) {
    this.confirm(item);
    this.setBarcodeFocus();
  }
  confirm(item: ItemModel) {
    if (item.BarCode == "" || item.quantity == 0 || item.quantity == null) {
      item.isSaved = false;
      return false;
    } else {
      if (item.quantity > 9999) {
        this.presentAlertForError("Qty cann't be greater than 9999");
        item.quantity = "";
        return false;
      } else {
        item.isSaved = true;
      }
    }
    var len = this.itemList.length - 1
    if (this.item.quantity == "") {
      let obj = {} as IqtyList;
      obj.countNumber = this.CountNumber;
      obj.qty = 0;
      this.qtyList[len] = obj;
    } else {
      let obj = {} as IqtyList;
      obj.countNumber = this.CountNumber;
      obj.qty = this.item.quantity;
      this.qtyList[len] = obj;
    }
    if (this.CountNumber == "1") {
      this.scannedQty1 = this.calculateSum(this.CountNumber);
    } else if (this.CountNumber == "2") {
      this.scannedQty2 = this.calculateSum(this.CountNumber);
    }
    //this.storageServ.setItemList(this.itemList);
  }
  showList() {
    if (!this.CountNumber) {
      this.presentAlertForError("Please Select Count Number");
    } else {
      this.dataServ.setItemList(this.itemList);
      this.dataServ.setStockCountNumber(this.CountNumber);
      this.router.navigateByUrl('/inventory-line/' + this.pageType);
    }

  }
  async presentAlertForError(msg) {
    const alert = await this.alertController.create({
      header: 'Information',
      message: msg,
      buttons: [
        {
          text: 'Okay',
          handler: () => {
            this.setBarcodeFocus();
          }
        }]
    });

    await alert.present();
  }
  // backBtn() {
  //   if ((this.count >= 0 && !this.paramService.itemUpdated) || this.paramService.itemChanged) {
  //     this.presentAlertForExit();
  //   }
  // }

  // async presentAlertForExit() {
  //   const alert = await this.alertController.create({
  //     header: 'Confirmation',
  //     message: `Do you want to Keep the unprocessed data?`,
  //     buttons: [
  //       {
  //         text: 'Yes',
  //         handler: () => {
  //           console.log(this.itemList);
  //           this.storageServ.setItemList(this.itemList);
  //         }
  //       },
  //       {
  //         text: 'no',
  //         handler: () => {
  //           this.itemList.forEach(el => el.isSaved = false)
  //         }
  //       }

  //     ]
  //   });

  //   await alert.present();
  // }
  countNumberChanged() {
    this.item = {} as ItemModel;
    if (this.CountNumber == "1") {

    } else if (this.CountNumber == "2") {

    }
  }
}
