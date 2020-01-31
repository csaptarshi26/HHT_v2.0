import { IqtyList } from './../../models/IQtyModel';
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
import { ToastController, IonInput, AlertController, LoadingController, Events, IonSearchbar } from '@ionic/angular';
import { TransferOrderLine } from 'src/app/models/STPTransferOrderLine.Model';
import { ItemModel } from 'src/app/models/STPItem.model';
import { Network } from '@ionic-native/network/ngx';
import { StorageService } from 'src/app/providers/storageService/storage.service';
import { ZoneModel } from 'src/app/models/STPZone.model';
import * as math from 'mathjs';
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
  scannedQty1: any = 0;
  scannedQty2: any = 0;
  user: any;
  CountNumber: any = "1";
  zone: ZoneModel = {} as ZoneModel;
  qtyList: IqtyList[] = [{} as IqtyList];

  editField: boolean = false;
  count: any;
  exitingPage: boolean;
  zoneList: ZoneModel[] = [];
  keyPress: boolean = false;
  pageType: any = "";

  showSecondCount:boolean = true;
  @ViewChild("input") barcodeInput: IonSearchbar;
  @ViewChild("qtyInput") qtyInput: IonInput;


  constructor(public barcodeScanner: BarcodeScanner, public dataServ: DataService,
    public alertController: AlertController, public events: Events,
    public toastController: ToastController, public axService: AxService, private keyboard: Keyboard,
    public paramService: ParameterService, private router: Router, private activateRoute: ActivatedRoute,
    public loadingController: LoadingController, public storageServ: StorageService,
    public changeDetectorref: ChangeDetectorRef, private network: Network) {

    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
    let disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      console.log('network was disconnected :-(');
      this.storageServ.setItemList(this.itemList);
    });
   
    // stop disconnect watch
    disconnectSubscription.unsubscribe();

    let connectSubscription = this.network.onConnect().subscribe(() => {
      console.log('network connected!');
      setTimeout(() => {
        if (this.network.type === 'wifi') {
          console.log('we got a wifi connection, woohoo!');
        }
      }, 3000);
    });

    // stop connect watch
    connectSubscription.unsubscribe();
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

  scanByCamera() {
    this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', barcodeData);
      this.barcode = barcodeData.text;

    }).catch(err => {
      console.log('Error', err);
    });
  }
  ngOnInit() {
    this.getZoneList();
    this.count = -1;
    this.getStorageData();
    this.user = this.paramService.userId
    this.currentLoc = this.paramService.Location;

  }

  setBarcodeFocus() {
    this.barcode = "";
    setTimeout(() => {
      this.barcodeInput.setFocus();
    }, 100);
    setTimeout(() => {
      this.keyboard.show();
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
      this.dataServ.getitemListFromSCList$.subscribe(res => {
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
  keyboardHide() {
    this.keyboard.hide();
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
        this.scannedQty1 = this.calculateItemListQty("1");
        this.scannedQty2 = this.calculateItemListQty("2");
        //this.item.visible = true;
      }
    });
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
  calculateSum(selectedCount) {
    var sum = 0;
    this.qtyList.forEach(el => {
      if (selectedCount == el.countNumber) {
        sum = sum + +el.qty;
      }
    })
    return sum;
  }
  onPressEnter() {
    if (this.barcode != null) {
      if (!this.CountNumber) {
        this.presentAlertForError("Please Select Count Number ");
      } else if (!this.zone.ZoneName) {
        this.presentAlertForError("Please Select Zone ");
      } else {
        this.searchBarcode();
      }
    }
  }
  valueChange(event: any) {
    let dataValue = event.detail.data || 0;
    let targerValue = event.target.value
    console.clear();
    console.log("data value " + dataValue);
    console.log("targer value " + targerValue);
    console.log(event);
    if (targerValue && !dataValue && event.detail.inputType != "deleteContentBackward") {
      this.barcode = targerValue;
      if (this.barcode != null) {
        if (!this.CountNumber) {
          this.presentAlertForError("Please Select Count Number ");
        } else if (!this.zone.ZoneName) {
          this.presentAlertForError("Please Select Zone ");
        } else {
          this.searchBarcode();
        }
      }
    } else if (targerValue != null && dataValue.toString().length == 1) {
      console.log("keyboard input");
    }
  }

  async searchBarcode() {
    console.log("barcode scan");
    this.axService.getItemFromBarcodeWithOUM(this.barcode).subscribe(res => {
      this.item = res;
      if (this.item.ItemId == null || this.item.ItemId == "") {
        this.count++;
        this.presentAlertForError("Item not found");
        this.setBarcodeFocus();
      } else {
        this.barcode = "";
        this.count++;
        this.item.visible = true;
        if (this.editField) {
          this.item.quantity = "";
          this.item.isEditable = true;
          setTimeout(() => {
            this.qtyInput.setFocus();
            this.barcode = "";
          }, 100);
        } else {
          this.item.quantity = 1;
          if (this.CountNumber == "1") {
            this.scannedQty1 = this.scannedQty1 + 1;
          } else if (this.CountNumber == "2") {
            this.scannedQty2 = this.scannedQty2 + 1;
          }
          let len = this.itemList.length - 1
          let obj = {} as IqtyList;
          obj.countNumber = this.CountNumber;
          obj.qty = 1;
          this.qtyList[len] = obj;
          this.item.isEditable = false;
          this.item.isSaved = true;
          this.barcode = "";
          this.setBarcodeFocus();
        }
        this.item.CountNumber = this.CountNumber;
        this.item.zone = this.zone;
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
      duration: 2000,
      position: 'top'
    });
    toast.present();
  }
  valueChanged(qty) {
    this.item.isSaved = false;
  }
  onEnterConfirm(item: ItemModel) {
    this.confirm(item);
  }
  confirm(item: ItemModel) {
    if (item.BarCode == "") {
      return false;
    }
    if (item.quantity == 0 || item.quantity == null) {
      item.isSaved = false;
    } else {
      if (item.quantity > 999999) {
        this.presentAlertForError("Qty cann't be greater than 999999");
        item.quantity = 0;
        return false;
      } else if (item.quantity < 0) {
        this.presentAlertForError("Qty cann't be lesser than 0");
        item.quantity = 0;
        return false;

      } else {
        var allSpecialChar = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
        var format = /[\+\-\*\/]/;
        if (allSpecialChar.test(item.quantity)) {
          if (format.test(item.quantity)) {
            let rs = math.evaluate(item.quantity);
            if (rs.toString().includes("Infinity")) {
              this.presentAlertForError("Can't divide by 0");
              item.quantity = 0;
              return;
            } else if (Number(rs) > 999999) {
              this.presentAlertForError("Qty cann't be greater than 999999");
              item.quantity = 0;
              return false;
            } else if (Number(rs) < 0) {
              this.presentAlertForError("Qty cann't be greater than 999999");
              item.quantity = 0;
              return false;
            } else {
              item.quantity = Math.floor(rs);
              console.log(item.quantity);
            }
          } else {
            this.presentAlertForError("Invalid Expression");
            return;
          }
        }
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
    console.log(this.count + "   " + this.qtyList)

    if (this.CountNumber == "1") {
      this.scannedQty1 = this.calculateSum(this.CountNumber);
    } else if (this.CountNumber == "2") {
      this.scannedQty2 = this.calculateSum(this.CountNumber);
    }
    this.clearBarcode();
    //this.storageServ.setItemList(this.itemList);
  }

  showList() {
    if (!this.CountNumber) {
      this.presentAlertForError("Please Select Count Number");
    } else if (!this.zone) {
      this.presentAlertForError("Please Select Zone");
    } else {
      this.dataServ.setItemList(this.itemList);
      this.dataServ.setStockCountNumber(this.CountNumber);
      this.router.navigateByUrl('/stock-count-list/' + this.pageType);
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
  backBtn() {
    if ((this.count >= 0 && !this.paramService.itemUpdated) || this.paramService.itemChanged) {
      this.presentAlertForExit();
    }
  }

  async presentAlertForExit() {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Do you want to Keep the unprocessed data?`,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            console.log(this.itemList);
            this.storageServ.setItemList(this.itemList);
          }
        },
        {
          text: 'no',
          handler: () => {
            this.itemList.forEach(el => el.isSaved = false)
          }
        }

      ]
    });

    await alert.present();
  }
  countNumberChanged() {
    this.item = {} as ItemModel;
    if (this.CountNumber == "1") {

    } else if (this.CountNumber == "2") {

    }
  }

  getZoneList() {
    this.axService.getZoneList().subscribe(res => {
      this.zoneList = res;
      console.log(res);
    }, error => {
      console.log(error);
    })
  }
}