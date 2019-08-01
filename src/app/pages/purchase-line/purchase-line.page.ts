import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
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
    public router: Router, public storageServ: StorageService, public barcodeScanner: BarcodeScanner,
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

  scanByCamera() {
    this.barcodeScanner.scan().then(barcodeData => {
      console.log('Barcode data', barcodeData);
      this.barcode = barcodeData.text;

    }).catch(err => {
      console.log('Error', err);
    });
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
              if (el.QtyReceived) {
                el.QtyReceivedServer = el.QtyReceived;
              }
              flag = true;
              el.qtyDesc = res.Description;
              el.BarCode = res.BarCode;
              el.isVisible = true;
              this.barcode = "";
              this.poLine = this.chechCountNumber(el);

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
              if (el.QtyReceived) {
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
              setTimeout(() => {
                this.barcode = "";
                this.qtyInput.setFocus();
              }, 150);
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
      if (this.pageType == "Receive") {
        if (poLine.Count1Qty == 0 && poLine.Count2Qty == 0) {

        } else if (poLine.Count1Qty == 0 && poLine.Count2Qty > 0) {
          poLine.QtyToReceive = poLine.Qty;
          poLine.QtyReceived = 0;
        } else if (poLine.Count1Qty == poLine.Qty) {
          poLine.QtyToReceive = 0;
          poLine.QtyReceived = poLine.Qty;
        } else if (poLine.Count1Qty > 0) {
          poLine.QtyToReceive = poLine.Qty - poLine.Count1Qty;
          poLine.QtyReceived = poLine.Count1Qty;
        } else if (poLine.Count1Qty == poLine.Qty && poLine.Count2Qty == poLine.Qty) {
          poLine.QtyToReceive = 0;
          poLine.QtyReceived = poLine.Qty;
        }
      } else {
        if (poLine.Count1Qty == 0 && poLine.Count2Qty == 0) {

        } else if (poLine.Count1Qty == 0 && poLine.Count2Qty > 0) {
          poLine.QtyToReceive = poLine.Qty;
          poLine.QtyReceived = 0;
        } else if (poLine.Count1Qty == -poLine.Qty) {
          poLine.QtyToReceive = 0;
          poLine.QtyReceived = -poLine.Qty;
        } else if (poLine.Count1Qty > 0) {
          poLine.QtyToReceive = -poLine.Qty - poLine.Count1Qty;
          poLine.QtyReceived = poLine.Count1Qty;
        } else if (poLine.Count1Qty == -poLine.Qty && poLine.Count2Qty == -poLine.Qty) {
          poLine.QtyToReceive = 0;
          poLine.QtyReceived = -poLine.Qty;
        }
      }
    } else if (this.poHeader.CountNumber == "2") {
      if (this.pageType == "Receive") {
        if (poLine.Count1Qty == 0 && poLine.Count2Qty == 0) {

        } else if (poLine.Count1Qty == 0 && poLine.Count2Qty > 0) {
          poLine.QtyToReceive = poLine.Qty - poLine.Count2Qty;
          poLine.QtyReceived = poLine.Count2Qty;
        } else if (poLine.Count1Qty == poLine.Qty && poLine.Count2Qty == poLine.Qty) {
          poLine.QtyToReceive = 0;
          poLine.QtyReceived = poLine.Qty;
        } else if (poLine.Count1Qty == poLine.Qty && poLine.Count2Qty > 0) {
          poLine.QtyToReceive = poLine.Qty - poLine.Count2Qty;
          poLine.QtyReceived = poLine.Count2Qty;
        } else if (poLine.Count2Qty == poLine.Qty) {
          poLine.QtyToReceive = 0;
          poLine.QtyReceived = poLine.Qty;
        } else if (poLine.Count1Qty > 0 && poLine.Count2Qty == 0) {
          poLine.QtyToReceive = poLine.Qty;
          poLine.QtyReceived = 0;
        } else if (poLine.Count1Qty > 0 && poLine.Count2Qty > 0) {
          poLine.QtyToReceive = poLine.Qty - poLine.Count2Qty;
          poLine.QtyReceived = poLine.Count2Qty;
        }
      } else {
        if (poLine.Count1Qty == 0 && poLine.Count2Qty == 0) {

        } else if (poLine.Count1Qty == 0 && poLine.Count2Qty > 0) {
          poLine.QtyToReceive = -poLine.Qty - poLine.Count2Qty;
          poLine.QtyReceived = poLine.Count2Qty;
        } else if (poLine.Count1Qty == -poLine.Qty && poLine.Count2Qty == -poLine.Qty) {
          poLine.QtyToReceive = 0;
          poLine.QtyReceived = -poLine.Qty;
        } else if (poLine.Count1Qty == -poLine.Qty && poLine.Count2Qty > 0) {
          poLine.QtyToReceive = -poLine.Qty - poLine.Count2Qty;
          poLine.QtyReceived = poLine.Count2Qty;
        } else if (poLine.Count2Qty == -poLine.Qty) {
          poLine.QtyToReceive = 0;
          poLine.QtyReceived = -poLine.Qty;
        } else if (poLine.Count1Qty > 0 && poLine.Count2Qty == 0) {
          poLine.QtyToReceive = poLine.Qty;
          poLine.QtyReceived = 0;
        } else if (poLine.Count1Qty > 0 && poLine.Count2Qty > 0) {
          poLine.QtyToReceive = -poLine.Qty - poLine.Count2Qty;
          poLine.QtyReceived = poLine.Count2Qty;
        }
      }

    }
    poLine.headerCountNumber = this.poHeader.CountNumber;
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
        if (this.poHeader.CountNumber == "1") {
          poLine.updatableCount1Qty += poLine.inputQty;
          this.qtyList[this.count] = poLine.updatableCount1Qty;
        } else if (this.poHeader.CountNumber == "2") {
          poLine.updatableCount2Qty += poLine.inputQty;
          this.qtyList[this.count] = poLine.updatableCount2Qty;
        }
        poLine.inputQty = "";
        return true;
      }
    } else {
      if ((this.mod(poLine.QtyReceived) + this.mod(poLine.inputQty)) > this.mod((poLine.Qty))) {
        this.presentToast("Rec item cannot be greater than Qty");
        //poLine.btnDisable = true;
        return false;
      } else {
        poLine.QtyToReceive -= -poLine.inputQty;
        poLine.QtyReceived += -poLine.inputQty;
        if (this.poHeader.CountNumber == "1") {
          poLine.updatableCount1Qty += poLine.inputQty;
          this.qtyList[this.count] = poLine.updatableCount1Qty;
        } else if (this.poHeader.CountNumber == "2") {
          poLine.updatableCount2Qty += poLine.inputQty;
          this.qtyList[this.count] = poLine.updatableCount2Qty;
        }
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
              if (this.poHeader.CountNumber == "1") {
                poLine.QtyReceived -= poLine.updatableCount1Qty;
                poLine.QtyToReceive += poLine.updatableCount1Qty;
              } else if (this.poHeader.CountNumber == "2") {
                poLine.QtyReceived -= poLine.updatableCount2Qty;
                poLine.QtyToReceive += poLine.updatableCount2Qty;
              }
            } else {
              if (this.poHeader.CountNumber == "1") {
                poLine.QtyReceived -= -poLine.updatableCount1Qty;
                poLine.QtyToReceive -= poLine.updatableCount1Qty;
              } else if (this.poHeader.CountNumber == "2") {
                poLine.QtyReceived -= -poLine.updatableCount1Qty;
                poLine.QtyToReceive -= poLine.updatableCount1Qty;
              }
            }
            if (this.poHeader.CountNumber == "1") {
              poLine.updatableCount1Qty = 0;
            } else if (this.poHeader.CountNumber == "2") {
              poLine.updatableCount2Qty = 0;
            }
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
            console.log(data);
            data.isVisible = true;
            this.poLine = data;
            setTimeout(() => {
              this.barcode = "";
              this.qtyInput.setFocus();
            }, 150);
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
            this.poLineList.forEach(el => {
              if (this.poHeader.CountNumber == "1") {
                if (el.updatableCount1Qty == 0) {
                  el.Count1Qty = el.Count1Qty;
                } else {
                  el.Count1Qty = el.updatableCount1Qty;
                }

              } else if (this.poHeader.CountNumber == "2") {
                if (el.updatableCount2Qty == 0) {
                  el.Count2Qty = el.Count2Qty;
                } else {
                  el.Count2Qty = el.updatableCount2Qty;
                }
              }
            })
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
            this.poLineList.forEach(el=> el.isVisible = false);

          }
        }
      ]
    });
    await alert.present();
  }

  mod(n:any){
    if(n==0) return 0;
    else if(n > 0) return n;
    else return -n;
  }
}
