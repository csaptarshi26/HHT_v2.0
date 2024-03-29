import * as math from 'mathjs';
import { IqtyList } from './../../models/IQtyModel';
import { ActivatedRoute, Router } from '@angular/router';
import { TransferOrderModel } from './../../models/STPTransferOrder.model';
import { ParameterService } from './../../providers/parameterService/parameter.service';
import { STPLogSyncDetailsModel } from './../../models/STPLogSyncData.model';
import { AxService } from 'src/app/providers/axService/ax.service';
import { DataService } from 'src/app/providers/dataService/data.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Component, OnInit, Input, SimpleChanges, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ToastController, IonInput, AlertController, LoadingController, IonSearchbar } from '@ionic/angular';
import { TransferOrderLine } from 'src/app/models/STPTransferOrderLine.Model';
import { RoleModel } from 'src/app/models/STPRole.model';
import { StorageService } from 'src/app/providers/storageService/storage.service';
declare var $: any;

@Component({
  selector: 'app-transfer-line',
  templateUrl: './transfer-line.page.html',
  styleUrls: ['./transfer-line.page.scss'],
})
export class TransferLinePage implements OnInit {

  barcode: string;
  toHeader: TransferOrderModel;
  toLineList: TransferOrderLine[] = [];
  user: any;
  toLine: TransferOrderLine = {} as TransferOrderLine;

  pageType: any;
  scannedQty: any;

  itemBarcode: any = "";
  updateDataTableList: STPLogSyncDetailsModel[] = [];
  scannedQty1: any = 0;
  scannedQty2: any = 0;
  @ViewChild("input") barcodeInput: IonSearchbar;
  @ViewChild("Recinput") qtyInput: IonInput;


  qtyList: IqtyList[] = [{} as IqtyList];

  count: any = -1;

  dataTable: STPLogSyncDetailsModel = {} as STPLogSyncDetailsModel;
  role: RoleModel = {} as RoleModel;
  toItemSotrageList: any = [];

  constructor(public barcodeScanner: BarcodeScanner, public dataServ: DataService, public alertController: AlertController,
    public toastController: ToastController, public axService: AxService, private keyboard: Keyboard,
    public paramService: ParameterService, private activateRoute: ActivatedRoute,
    public loadingController: LoadingController, public router: Router, public storageServe: StorageService,
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

  setBarcodeFocus() {
    setTimeout(() => {
      this.barcodeInput.setFocus();
    }, 150);
    setTimeout(() => {
      this.keyboard.hide();
    }, 150);
  }

  ngOnInit() {
    this.role = this.paramService.userRole;
    this.user = this.paramService.userId
    this.getToLineData();
    this.getScannedQty();
  }
  getScannedQty() {
    this.toLineList.forEach(el => {
      if (el.isVisible) {
        if (this.toHeader.CountNumber == "1") {
          this.qtyList.push(this.getQtyObj(this.toHeader.CountNumber, el.updatableCount1Qty))
        } else if (this.toHeader.CountNumber == "2") {
          this.qtyList.push(this.getQtyObj(this.toHeader.CountNumber, el.updatableCount2Qty))
        }
      }
    })
    if (this.toHeader.CountNumber == "1") {
      this.scannedQty1 = this.calculateSum(this.toHeader.CountNumber);
    } else if (this.toHeader.CountNumber == "2") {
      this.scannedQty2 = this.calculateSum(this.toHeader.CountNumber);
    }
  }
  keyboardHide() {
    this.keyboard.hide();
  }
  getToLineData() {
    if (this.pageType == 'Transfer-out') {
      this.dataServ.getTO$.subscribe(res => {
        this.toHeader = res;
        this.toLineList = this.toHeader.JournalLine;
        console.log(this.toHeader)
      })
    } else {
      this.dataServ.getTOIn$.subscribe(res => {
        this.toHeader = res;
        this.toLineList = this.toHeader.JournalLine;
        console.log(this.toHeader)
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

  ngOnDestroy() {
  }
  onPressEnter() {
    this.barcodeScan();
  }
  valueChange(event: any) {
    let dataValue = event.detail.data || 0;
    let targerValue = event.target.value
    console.clear();
    console.log("data value " + dataValue);
    console.log("targer value " + targerValue);
    console.log(event);
    if (dataValue && targerValue.length != 1) {
      if (targerValue && targerValue == dataValue && event.detail.inputType != "deleteContentBackward") {
        this.barcode = targerValue;
        if (this.barcode != null) {
          this.barcodeScan();
        }
      } else if (targerValue != null && dataValue.toString().length == 1) {
        console.log("keyboard input");
      }
    }
  }

  async barcodeScan() {
    if (this.barcode != null && this.barcode.length > 1) {
      this.axService.getItemFromBarcodeWithOUM(this.barcode).subscribe(res => {
        var flag = false;
        this.count++;
        this.toLineList.forEach(el => {

          if (el.ItemNo == res.ItemId && el.UnitOfMeasure.toLowerCase() == res.Unit.toLowerCase()) {
            el.isVisible = true;

            el.inputQty = 0;

            if (el.QtyShipped) {
              el.qtyShippedFromServer = el.QtyShipped;
            }
            if (el.QtyReceived) {
              el.qtyReceivedFromServer = el.QtyReceived;
            }
            flag = true;
            el.qtyDesc = res.Description;
            el.BarCode = res.BarCode;

            this.toLine = this.chechCountNumber(el);
          }
        });

        if (flag) {
          setTimeout(() => {
            this.barcode = "";
            this.qtyInput.setFocus();
          }, 150);
          //this.presentError("This item barcode not in order list");
        } else {
          this.toLine.isVisible = false;
          this.barcode = "";
          this.setBarcodeFocus();
          this.presentError("This item barcode not in order list");
        }
      }, error => {
        this.toLine.isVisible = false;
        this.barcode = "";
        this.setBarcodeFocus()
        this.presentError("Connection Error");
      })
    }

  }
  async presentError(msg) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: msg,
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
  onEnter(toLine: TransferOrderLine) {
    this.saveLine(toLine);
  }
  saveLine(toLine: TransferOrderLine) {
    if (this.qtyRecCheck(toLine)) {
      toLine.isSaved = true;
    } else {
      toLine.isSaved = false;
    }

    console.log(toLine);
    console.log(this.qtyList)
    if (this.toHeader.CountNumber == "1") {
      this.scannedQty1 = this.calculateSum(this.toHeader.CountNumber);
    } else if (this.toHeader.CountNumber == "2") {
      this.scannedQty2 = this.calculateSum(this.toHeader.CountNumber);
    }
  }
  calculateSum(count) {
    var sum = 0;
    this.qtyList.forEach(el => {
      if (count == el.countNumber) {
        sum = sum + +el.qty;
      }
    })
    return sum;
  }
  clearQtyToRec(toLine: TransferOrderLine) {
    toLine.inputQty = 0;
  }
  recQtyChanged(toLine: TransferOrderLine) {
    toLine.isSaved = false;
  }

  chechCountNumber(toLine: TransferOrderLine) {
    if (this.toHeader.CountNumber == "1") {
      if (this.pageType == "Transfer-out") {
        if (toLine.Count1Qty == 0 && toLine.Count2Qty == 0) {

        } else if (toLine.Count1Qty == 0 && toLine.Count2Qty > 0) {
          toLine.QtyToShip = toLine.Quantity;
          toLine.QtyShipped = 0;

          // toLine.QtyToShip = toLine.Quantity - toLine.QtyReceivedServer;
          // toLine.QtyShipped = toLine.QtyReceivedServer;
        } else if (toLine.Count1Qty == toLine.Quantity) {
          toLine.QtyToShip = 0;
          toLine.QtyShipped = toLine.Quantity;
        } else if (toLine.Count1Qty > 0) {
          toLine.QtyToShip = toLine.Quantity - toLine.Count1Qty;
          toLine.QtyShipped = toLine.Count1Qty;
        } else if (toLine.Count1Qty == toLine.Quantity && toLine.Count2Qty == toLine.Quantity) {
          toLine.QtyToShip = 0;
          toLine.QtyShipped = toLine.Quantity;
        }
      } else {
        if (toLine.Count1Qty == 0 && toLine.Count2Qty == 0) {

        } else if (toLine.Count1Qty == 0 && toLine.Count2Qty > 0) {
          toLine.QtyToReceive = toLine.Quantity;
          toLine.QtyReceived = 0;
        } else if (toLine.Count1Qty == toLine.Quantity) {
          toLine.QtyToReceive = 0;
          toLine.QtyReceived = toLine.Quantity;
        } else if (toLine.Count1Qty > 0) {
          toLine.QtyToReceive = toLine.Quantity - toLine.Count1Qty;
          toLine.QtyReceived = toLine.Count1Qty;
        } else if (toLine.Count1Qty == toLine.Quantity && toLine.Count2Qty == toLine.Quantity) {
          toLine.QtyToReceive = 0;
          toLine.QtyReceived = toLine.Quantity;
        }
      }
    } else if (this.toHeader.CountNumber == "2") {
      if (this.pageType == "Transfer-out") {
        if (toLine.Count1Qty == 0 && toLine.Count2Qty == 0) {

        } else if (toLine.Count1Qty == 0 && toLine.Count2Qty > 0) {
          toLine.QtyToShip = toLine.Quantity - toLine.Count2Qty;
          toLine.QtyShipped = toLine.Count2Qty;
        } else if (toLine.Count1Qty == toLine.Quantity && toLine.Count2Qty == toLine.Quantity) {
          toLine.QtyToShip = 0;
          toLine.QtyShipped = toLine.Quantity;
        } else if (toLine.Count1Qty == toLine.Quantity && toLine.Count2Qty > 0) {
          toLine.QtyToShip = toLine.Quantity - toLine.Count2Qty;
          toLine.QtyShipped = toLine.Count2Qty;
        } else if (toLine.Count2Qty == toLine.Quantity) {
          toLine.QtyToShip = 0;
          toLine.QtyShipped = toLine.Quantity;
        } else if (toLine.Count1Qty > 0 && toLine.Count2Qty == 0) {
          toLine.QtyToShip = toLine.Quantity;
          toLine.QtyShipped = 0;
        } else if (toLine.Count1Qty > 0 && toLine.Count2Qty > 0) {
          toLine.QtyToShip = toLine.Quantity - toLine.Count2Qty;
          toLine.QtyShipped = toLine.Count2Qty;
        }
      } else {
        if (toLine.Count1Qty == 0 && toLine.Count2Qty == 0) {

        } else if (toLine.Count1Qty == 0 && toLine.Count2Qty > 0) {
          toLine.QtyToReceive = toLine.Quantity - toLine.Count2Qty;
          toLine.QtyReceived = toLine.Count2Qty;
        } else if (toLine.Count1Qty == toLine.Quantity && toLine.Count2Qty == toLine.Quantity) {
          toLine.QtyToReceive = 0;
          toLine.QtyReceived = toLine.Quantity;
        } else if (toLine.Count1Qty == toLine.Quantity && toLine.Count2Qty > 0) {
          toLine.QtyToReceive = toLine.Quantity - toLine.Count2Qty;
          toLine.QtyReceived = toLine.Count2Qty;
        } else if (toLine.Count2Qty == toLine.Quantity) {
          toLine.QtyToReceive = 0;
          toLine.QtyReceived = toLine.Quantity;
        } else if (toLine.Count1Qty > 0 && toLine.Count2Qty == 0) {
          toLine.QtyToReceive = toLine.Quantity;
          toLine.QtyReceived = 0;
        } else if (toLine.Count1Qty > 0 && toLine.Count2Qty > 0) {
          toLine.QtyToReceive = toLine.Quantity - toLine.Count2Qty;
          toLine.QtyReceived = toLine.Count2Qty;
        }
      }
    }
    toLine.headerCountNumber = this.toHeader.CountNumber;
    toLine.isVisible = true;
    return toLine;
  }
  getVisibleItemScannedQty(toLine: TransferOrderLine[]) {
    let len = 0;
    toLine.forEach(el => {
      if (el.isVisible) {
        len++;
      }
    })

    return len;
  }
  qtyRecCheck(toLine: TransferOrderLine) {
    var len = this.getVisibleItemScannedQty(this.toHeader.JournalLine)
    var allSpecialChar = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    var format = /[\+\-\*\/]/;
    if (allSpecialChar.test(toLine.inputQty)) {
      if (format.test(toLine.inputQty)) {
        let rs = math.evaluate(toLine.inputQty);
        if (rs.toString().includes("Infinity")) {
          this.presentError("Can't divide by 0");
          toLine.inputQty = 0;
          return false;
        } else if (Number(rs) > 999999) {
          this.presentError("Qty cann't be greater than 999999");
          toLine.inputQty = 0;
          return false;
        } else if (Number(rs) < 0) {
          this.presentError("Qty cann't be lesser than 0");
          toLine.inputQty = 0;
          return false;
        } else {
          toLine.inputQty = Math.floor(rs);
          console.log(toLine.inputQty);
        }
      } else {
        this.presentError("Invalid Expression");
        return false;
      }
    }


    if (this.pageType == "Transfer-out") {
      if ((toLine.QtyShipped + toLine.inputQty) > toLine.Quantity) {
        this.presentError("Rec item cannot be greater than Qty");
        return false;
      } else {
        toLine.QtyToShip -= toLine.inputQty;
        toLine.QtyShipped += toLine.inputQty;
        if (this.toHeader.CountNumber == "1") {
          toLine.updatableCount1Qty += toLine.inputQty;
          this.qtyList[len] = this.getQtyObj(this.toHeader.CountNumber, toLine.updatableCount1Qty);
        } else if (this.toHeader.CountNumber == "2") {
          toLine.updatableCount2Qty += toLine.inputQty;
          this.qtyList[len] = this.getQtyObj(this.toHeader.CountNumber, toLine.updatableCount2Qty);
        }
        toLine.inputQty = 0;
        return true;
      }
    } else {
      if ((toLine.QtyReceived + toLine.inputQty) > toLine.Quantity || (toLine.inputQty > toLine.QtyToReceive)) {
        this.presentError("Rec item cannot be greater than Qty");
        return false;
      } else {
        toLine.QtyToReceive -= toLine.inputQty;
        toLine.QtyReceived += toLine.inputQty;
        if (this.toHeader.CountNumber == "1") {
          toLine.updatableCount1Qty += toLine.inputQty;
          this.qtyList[len] = this.getQtyObj(this.toHeader.CountNumber, toLine.updatableCount1Qty);
        } else if (this.toHeader.CountNumber == "2") {
          toLine.updatableCount2Qty += toLine.inputQty;
          this.qtyList[len] = this.getQtyObj(this.toHeader.CountNumber, toLine.updatableCount2Qty);
        }
        toLine.inputQty = 0;
        return true;
      }
    }
  }

  async presentAlert(msg) {
    const alert = await this.alertController.create({
      header: 'Multiple Item',
      subHeader: '',
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }
  getQtyObj(header, qty) {
    var obj = {} as IqtyList;
    obj.countNumber = header;
    obj.qty = qty;

    return obj;
  }
  async presentAlertForCancel(toLine: TransferOrderLine) {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Are you sure you want to clear the entered data? `,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            if (this.pageType == "Transfer-out") {
              if (this.toHeader.CountNumber == "1") {
                toLine.QtyShipped -= toLine.updatableCount1Qty;
                toLine.QtyToShip += toLine.updatableCount1Qty;
              } else if (this.toHeader.CountNumber == "2") {
                toLine.QtyShipped -= toLine.updatableCount2Qty;
                toLine.QtyToShip += toLine.updatableCount2Qty;
              }
            } else {
              if (this.toHeader.CountNumber == "1") {
                toLine.QtyReceived -= toLine.updatableCount1Qty;
                toLine.QtyToReceive += toLine.updatableCount1Qty;
              } else if (this.toHeader.CountNumber == "2") {
                toLine.QtyReceived -= toLine.updatableCount2Qty;
                toLine.QtyToReceive += toLine.updatableCount2Qty;
              }
            }
            if (this.toHeader.CountNumber == "1") {
              toLine.updatableCount1Qty = 0;
            } else if (this.toHeader.CountNumber == "2") {
              toLine.updatableCount2Qty = 0;
            }
            toLine.inputQty = 0;
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
  cancelBtn(toLine: TransferOrderLine) {
    this.presentAlertForCancel(toLine);
  }

  showList() {
    if (this.pageType == "Transfer-out") {
      this.dataServ.setTOList(this.toLineList);
    } else {
      this.dataServ.setToInList(this.toLineList);
    }
    this.router.navigateByUrl('/transfer-line-list/' + this.pageType);
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
            if (this.paramService.TOItemList != null) {
              this.toItemSotrageList = this.paramService.TOItemList;
            } else {
              this.toItemSotrageList = [];
            }
            this.toLineList.forEach(el => {
              if (this.toHeader.CountNumber == "1") {
                if (el.updatableCount1Qty == 0) {
                  el.Count1Qty = el.Count1Qty;
                } else {
                  el.Count1Qty = el.updatableCount1Qty;
                }

              } else if (this.toHeader.CountNumber == "2") {
                if (el.updatableCount2Qty == 0) {
                  el.Count2Qty = el.Count2Qty;
                } else {
                  el.Count2Qty = el.updatableCount2Qty;
                }
              }
            })
            var flag = 0;
            this.toItemSotrageList.forEach(el => {
              if (el.toNo == this.toHeader.JournalLine) {
                el.type = this.pageType;
                el.toNo = this.toHeader.JournalId;
                el.toHeader = this.toHeader;
                flag = 1;
              }
            });
            if (flag == 0) {
              this.toItemSotrageList.push(
                {
                  type: this.pageType,
                  toNo: this.toHeader.JournalId,
                  toHeader: this.toHeader
                }
              )
            }
            this.storageServe.setTOItemList(this.toItemSotrageList);
            this.paramService.TOItemList = this.toItemSotrageList;
          }
        },
        {
          text: 'No',
          handler: () => {
            this.toLineList.forEach(el => el.isVisible = false);
          }
        }
      ]
    });
    await alert.present();
  }
} 
