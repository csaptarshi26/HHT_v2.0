import { InventLocationLineModel } from './../../models/STPInventLocationLine.model';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { TransferOrderModel } from './../../models/STPTransferOrder.model';
import { ParameterService } from './../../providers/parameterService/parameter.service';
import { STPLogSyncDetailsModel } from './../../models/STPLogSyncData.model';
import { AxService } from 'src/app/providers/axService/ax.service';
import { DataService } from 'src/app/providers/dataService/data.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Component, OnInit, Input, SimpleChanges, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ToastController, IonInput, AlertController, LoadingController } from '@ionic/angular';
import { TransferOrderLine } from 'src/app/models/STPTransferOrderLine.Model';
import { ItemModel } from 'src/app/models/STPItem.model';
import { StorageService } from 'src/app/providers/storageService/storage.service';
declare var $: any;
@Component({
  selector: 'app-stock-count',
  templateUrl: './stock-count.page.html',
  styleUrls: ['./stock-count.page.scss'],
})
export class StockCountPage implements OnInit {

  barcode: string;

  currentLoc: InventLocationLineModel = {} as InventLocationLineModel;

  item: ItemModel = {} as ItemModel;
  itemList: ItemModel[] = [];
  scannedQty: any = 0;
  user: any;

  qtyList: any[] = [];

  editField: boolean = false;
  count: any = -1;

  @ViewChild("input") barcodeInput: IonInput;
  @ViewChild("qtyInput") qtyInput: IonInput;


  constructor(public barcodeScanner: BarcodeScanner, public dataServ: DataService, public alertController: AlertController,
    public toastController: ToastController, public axService: AxService, private keyboard: Keyboard,
    public paramService: ParameterService, private router: Router,
    public loadingController: LoadingController, public storageServ: StorageService,
    private changeDetectorref: ChangeDetectorRef) {
      
    let instance = this;
    (<any>window).plugins.intentShim.registerBroadcastReceiver({
      filterActions: ['com.steeples.hht.ACTION'
        // 'com.zebra.ionicdemo.ACTION',
        // 'com.symbol.datawedge.api.RESULT_ACTION'
      ],
      filterCategories: ['android.intent.category.DEFAULT']
    },
      function (intent) {
        //  Broadcast received
        instance.barcode = "";
        console.log('Received Intent: ' + JSON.stringify(intent.extras));
        instance.barcode = intent.extras['com.symbol.datawedge.data_string'];
        changeDetectorref.detectChanges();
      });

    // let profileConfig2 = {
    //   "PROFILE_NAME": "ZebraIonicDemo",
    //   "PROFILE_ENABLED": "true",
    //   "CONFIG_MODE": "UPDATE",
    //   "PLUGIN_CONFIG": {
    //     "PLUGIN_NAME": "INTENT",
    //     "RESET_CONFIG": "true",
    //     "PARAM_LIST": {
    //       "intent_output_enabled": "true",
    //       "intent_action": "com.zebra.ionicdemo.ACTION",
    //       "intent_delivery": "2" // Broadcast
    //     }
    //   }
    // };
    // (<any>window).plugins.intentShim.sendBroadcast({
    //   action: 'com.symbol.datawedge.api.ACTION',
    //   extras: {
    //     "com.symbol.datawedge.api.SET_CONFIG": profileConfig2,
    //     "SEND_RESULT": this.requestResultCodes
    //   }
    // },
    //   function () { },  //  Success in sending the intent, not success of DW to process the intent.
    //   function () { }  //  Failure in sending the intent, not failure of DW to process the intent.
    // );











  }

  ngOnInit() {
    this.getStorageData();
    this.user = this.dataServ.userId
    this.currentLoc = this.paramService.Location;
  }

  setBarcodeFocus() {
    this.barcode = "";
    setTimeout(() => {
      this.barcodeInput.setFocus();
    }, 150);
    setTimeout(() => {
      this.keyboard.hide();
    }, 150);
  }

  ionViewWillEnter() {
    this.setBarcodeFocus();
    console.log(this.paramService.itemUpdated)
    if (this.paramService.itemUpdated) {
      this.item = {} as ItemModel;
      this.itemList = [];
      this.scannedQty = 0;
    }
    else {
      this.scannedQty = this.calculateItemListQty();
    }
  }
  keyboardHide() {
    this.keyboard.hide();
  }
  clearBarcode() {
    this.barcode = "";
    this.setBarcodeFocus();
  }


  notify() {
    if (this.editField) {
      this.item.isEditable = true;
    } else {
      this.item.isEditable = false;
    }
  }


  getStorageData() {
    this.storageServ.getAllValuesFromStorage.subscribe((res) => {

    }, (error) => {

    }, () => {
      if (this.paramService.ItemList == null || this.paramService.ItemList.length == 0) {
        this.itemList = [];
      } else {
        this.itemList = this.paramService.ItemList;
        console.log(this.itemList)
        this.scannedQty = this.calculateItemListQty();
        //this.item.visible = true;
      }
    });
  }
  calculateItemListQty() {
    var sum = 0;
    this.qtyList = [];
    this.itemList.forEach(el => {
      this.qtyList.push(el.quantity);
      sum = sum + el.quantity;
    })
    if (sum == 0) {
      this.item = {} as ItemModel;
    }
    return sum;
  }
  calculateSum() {
    var sum = 0;
    this.qtyList.forEach(el => {
      sum = sum + el;
    })

    return sum;
  }
  async barcodeScan() {
    this.storageServ.setItemList(this.itemList);
    if (this.barcode != null && this.barcode.length > 3) {
      var flag = false;
      const loading = await this.loadingController.create({
        message: 'Please Wait',

      });
      await loading.present();
      this.axService.getItemFromBarcode(this.barcode).subscribe(res => {
        this.item = res;
        if (this.item.ItemId == null || this.item.ItemId == "") {
          flag = true;
          this.presentToast("This item barcode not in order list");
          this.setBarcodeFocus();
        } else {
          this.count++;
          if (this.editField) {
            this.item.quantity = 0;
            this.item.isEditable = true;
            setTimeout(() => {
              this.qtyInput.setFocus();
              this.barcode = "";
            }, 150);
            this.qtyInput.setFocus();
          } else {
            this.item.quantity = 1;
            this.scannedQty = this.scannedQty + 1;
            this.item.isEditable = false;
            this.item.isSaved = true;
            this.barcode = "";
            this.setBarcodeFocus();
          }
          this.item.visible = true;
          loading.dismiss();

          this.itemList.push(this.item);
          this.itemList.reverse();


          // this.itemList.push(this.item);
          console.log(this.itemList)
        }
        loading.dismiss();
      }, error => {
        loading.dismiss();
        flag = true;
        this.presentToast("Connection Error");
      });
      if (flag) {
        this.presentToast("This item barcode not in order list");
        this.setBarcodeFocus();
      }
    }
  }
  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }
  valueChanged() {
    this.item.isSaved = false;
  }
  confirm(item: ItemModel) {
    if (item.quantity == 0 || item.quantity == null) {
      item.isSaved = false;
    } else {
      item.isSaved = true;
    }
    this.qtyList[this.count] = this.item.quantity;
    console.log(this.count + "   " + this.qtyList)
    this.scannedQty = this.calculateSum();
    this.storageServ.setItemList(this.itemList);
  }

  showList() {
    this.dataServ.setItemList(this.itemList);
    this.router.navigateByUrl('/stock-count-list');
  }


}
