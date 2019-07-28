import { StorageService } from './../../providers/storageService/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { AxService } from './../../providers/axService/ax.service';
import { DataService } from './../../providers/dataService/data.service';
import { PurchTableModel } from './../../models/STPPurchTable.model';
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { PurchLineModel } from 'src/app/models/STPPurchTableLine.model';
import { STPLogSyncDetailsModel } from 'src/app/models/STPLogSyncData.model';
import { ToastController, LoadingController, AlertController, IonInput, IonSearchbar } from '@ionic/angular';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';

declare var $: any;
@Component({
  selector: 'app-purchase-line',
  templateUrl: './purchase-line.page.html',
  styleUrls: ['./purchase-line.page.scss'],
})
export class PurchaseLinePage implements OnInit {
  barcode: string;
  poHeader: PurchTableModel;
  poLineList: PurchLineModel[] = [];
  user: any;
  scannedQty: any = 0;
  pageType: any;

  itemBarcode: any = "";

  poItemSotrageList: any = [];
  qtyList: any[] = [];

  poLine: PurchLineModel = {} as PurchLineModel;
  count: any = -1;


  @ViewChild("input") barcodeInput: IonSearchbar;
  @ViewChild("Recinput") qtyInput: IonInput;

  constructor(public dataServ: DataService, public alertController: AlertController, private activateRoute: ActivatedRoute,
    public toastController: ToastController, public axService: AxService, private keyboard: Keyboard,
    public paramService: ParameterService, public loadingController: LoadingController,
    public router: Router, public storageServ: StorageService,
    public changeDetectorref: ChangeDetectorRef) {
    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');


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
  ionViewWillEnter() {
    this.setBarcodeFocus();
  }
  ngOnInit() {
    this.getPoLineData();
    //this.getStorageData();
    this.user = this.paramService.userId
  }

  getPoLineData() {
    if (this.pageType == "Receive") {
      this.dataServ.getPO$.subscribe(res => {
        this.poHeader = res;
        this.poLineList = this.poHeader.PurchLines;
        console.log(this.poHeader)
      })
    } else {
      this.dataServ.getReturnPO$.subscribe(res => {
        this.poHeader = res;
        this.poLineList = this.poHeader.PurchLines;
        console.log(this.poHeader)
      })
    }

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

  setBarcodeFocus() {
    setTimeout(() => {
      this.barcodeInput.setFocus();
    }, 150);
    setTimeout(() => {
      this.keyboard.hide();
    }, 150);
  }
  onPressEnter() {
    this.searchBarcode(true);
  }
  searchBarcode(keyboardPressed = false) {
    if (this.barcode != null && this.barcode.length > 1) {

      this.axService.getItemFromBarcode(this.barcode).subscribe(res => {
        var flag = false;
        var counter = 0;
        if (res.Unit) {
          this.poLineList.forEach(el => {
            counter++;
            if (el.ItemId == res.ItemId && el.UnitId.toLowerCase() == res.Unit.toLowerCase()) {
              
              this.count++
              el.inputQty = "";
              el.toggle = false;
              if(el.QtyReceived){
                el.QtyReceivedServer = el.QtyReceived;
              }
              flag = true;
              el.qtyDesc = res.Description;
              el.BarCode = res.BarCode;
              this.poLine = this.chechCountNumber(el);
              this.barcode = "";
              setTimeout(() => {
                this.qtyInput.setFocus();
              }, 100);
              return;
            }
          });

          if (flag) {
            setTimeout(() => {
              this.barcode = "";
              this.qtyInput.setFocus();
            }, 150);
          } else {
            if (keyboardPressed) {
              this.barcode = "";
              this.setBarcodeFocus();
              this.presentToast("This item barcode not in order list");
            }
          }
        } else {
          var multiple = 0;
          var multiPoLineList: PurchLineModel[] = [];
          this.poLineList.forEach(el => {
            counter++;
            if (el.ItemId == res.ItemId) {
              this.count++;
              flag = true;

              el.inputQty = "";
              // el.isVisible = true;
              if(el.QtyReceived){
                el.QtyReceivedServer = el.QtyReceived;
              }

              el.qtyDesc = res.Description;
              el.BarCode = res.BarCode;
              multiPoLineList.push(this.chechCountNumber(el));
              // this.poLine = el;
            }
          });

          if (!flag) {
            if (keyboardPressed) {
              this.barcode = "";
              this.setBarcodeFocus();
              this.presentToast("This item barcode not in order list");
            }
          } else {
            if (multiPoLineList.length == 1) {
              this.poLine = multiPoLineList.pop();
              this.poLine.isVisible = true;
            } else {
              this.presentAlertRadio(multiPoLineList);
            }

          }
        }

      }, error => {
        this.barcode = "";
        this.setBarcodeFocus();
        this.presentToast("Connection Error");
      })
    }
  }

  chechCountNumber(poLine: PurchLineModel) {
    if (this.poHeader.CountNumber == "1") {
      if (poLine.CountNumber == 1){
        poLine.isVisible = true;
        poLine.QtyToReceive = poLine.Qty - poLine.QtyReceivedServer;
        poLine.QtyReceived = poLine.QtyReceivedServer;
      }
    } else if (this.poHeader.CountNumber == "2") {
      if (poLine.CountNumber == 1){
        poLine.isVisible = true;
        poLine.QtyToReceive = poLine.Qty;
        poLine.QtyReceived = 0;
      }
    }
    return poLine;
  }
  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }
  onEnter(poLine: PurchLineModel) {
    this.saveLine(poLine);
  }

  saveLine(poLine: PurchLineModel) {
    if (this.qtyRecCheck(poLine)) {
      poLine.isSaved = true;
      poLine.toggle = true;
    } else {
      poLine.isSaved = false;
      poLine.toggle = false;
    }
    var sum = 0;
    this.qtyList.forEach(data => {
      sum += data;
    })
    this.scannedQty = sum;
    this.setBarcodeFocus();
  }
  calculateSum() {
    var sum = 0;
    this.qtyList.forEach(el => {
      sum = sum + el;
    })

    return sum;
  }

  clearQtyToRec(poLine: PurchLineModel) {
    poLine.inputQty = "";
  }
  qtyRecCheck(poLine: PurchLineModel) {
    poLine.isSaved = false;
    if (poLine.inputQty < 0) {
      this.presentToast("Qty Cann't be Negative");
      return false;
    }
    if (poLine.inputQty == "") {
      this.presentToast("Qty Cann't be Blank");
      return false;
    }
    if (this.pageType == "Receive") {
      if ((poLine.QtyReceived + poLine.inputQty) > poLine.Qty) {
        this.presentToast("Rec item cannot be greater than Qty");
        //poLine.btnDisable = true;
        return false;
      } else {
        poLine.QtyToReceive -= poLine.inputQty;
        poLine.QtyReceived += poLine.inputQty;
        poLine.updatableQty += poLine.inputQty;
        this.qtyList[this.count] = poLine.updatableQty;
        poLine.inputQty = "";
        return true;
      }
    } else {
      if ((poLine.QtyReceived + poLine.inputQty) > (-poLine.Qty)) {
        this.presentToast("Rec item cannot be greater than Qty");
        //poLine.btnDisable = true;
        return false;
      } else {
        poLine.QtyToReceive -= -poLine.inputQty;
        poLine.QtyReceived += -poLine.inputQty;
        poLine.updatableQty += poLine.inputQty;
        this.qtyList[this.count] = poLine.updatableQty;
        poLine.inputQty = "";
        return true;
      }
    }
  }
  async presentAlert(poLine: PurchLineModel) {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Are you sure you want to clear the entered data? `,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            if (this.pageType == "Receive") {
              poLine.QtyReceived -= poLine.updatableQty;
              poLine.QtyToReceive += poLine.updatableQty;
            } else {
              poLine.QtyReceived -= -poLine.updatableQty;
              poLine.QtyToReceive -= poLine.updatableQty;
            }
            poLine.updatableQty = 0;
          }
        },
        {
          text: 'No',
          handler: () => {

          }
        }
      ]
    });

    await alert.present();
  }
  cancelBtn(poLine: PurchLineModel) {
    this.presentAlert(poLine);
  }
  showList() {
    if (this.pageType == "Receive") {
      this.dataServ.setPOReceiveList(this.poLineList);
    } else {
      this.dataServ.setPOReturnList(this.poLineList);
    }
    this.router.navigateByUrl('/purchase-list/' + this.pageType);
  }

  async presentAlertRadio(multiPoLineList: PurchLineModel[]) {
    var inputArr = [];
    multiPoLineList.forEach(el => {
      inputArr.push({
        name: el.UnitId,
        type: 'radio',
        label: el.UnitId,
        value: el
      })
    })
    const alert = await this.alertController.create({
      header: 'Select UOM',
      inputs: inputArr,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data: PurchLineModel) => {
            data.isVisible = true;
            this.poLine = data;
            // setTimeout(() => {
            //   this.qtyInput.setFocus();
            // }, 150);
          }
        }
      ]
    });

    await alert.present();
  }

  backBtn() {
    if (this.count >= 0) {
      this.presentAlertForstoragebckUp();
    }
  }

  async presentAlertForstoragebckUp() {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Do you want to Keep the unprocessed data?`,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            if (this.paramService.POItemList != null) {
              this.poItemSotrageList = this.paramService.POItemList;
            } else {
              this.poItemSotrageList = [];
            }
            var flag = 0;
            this.poItemSotrageList.forEach(el => {
              if (el.poNo == this.poHeader.PurchId) {
                el.type = this.pageType;
                el.poNo = this.poHeader.PurchId;
                el.poHeader = this.poHeader;
                flag = 1;
              }
            });
            if (flag == 0) {
              this.poItemSotrageList.push(
                {
                  type: this.pageType,
                  poNo: this.poHeader.PurchId,
                  poHeader: this.poHeader
                }
              )
            }
            this.storageServ.setPOItemList(this.poItemSotrageList);
            this.paramService.POItemList = this.poItemSotrageList;
          }
        },
        {
          text: 'No',
          handler: () => {
          }
        }
      ]
    });

    await alert.present();
  }
}
