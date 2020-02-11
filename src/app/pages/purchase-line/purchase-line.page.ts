import { IqtyList } from './../../models/IQtyModel';
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
import { RoleModel } from 'src/app/models/STPRole.model';
import * as math from 'mathjs';
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
  scannedQty1: any = 0;
  scannedQty2: any = 0;
  pageType: any;

  itemBarcode: any = "";

  poItemSotrageList: any = [];
  qtyList: IqtyList[] = [{} as IqtyList];

  poLine: PurchLineModel = {} as PurchLineModel;
  count: any = -1;

  role: RoleModel = {} as RoleModel;

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

  getScannedQty() {
    this.poLineList.forEach(el => {
      if (el.isVisible) {
        if (this.poHeader.CountNumber == "1") {
          this.qtyList.push(this.getQtyObj(this.poHeader.CountNumber, el.updatableCount1Qty))
        } else if (this.poHeader.CountNumber == "2") {
          this.qtyList.push(this.getQtyObj(this.poHeader.CountNumber, el.updatableCount2Qty))
        }
      }
    })
    if (this.poHeader.CountNumber == "1") {
      this.scannedQty1 = this.calculateSum(this.poHeader.CountNumber);
    } else if (this.poHeader.CountNumber == "2") {
      this.scannedQty2 = this.calculateSum(this.poHeader.CountNumber);
    }
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
    this.role = this.paramService.userRole;
    this.getPoLineData();
    this.getScannedQty();
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
    if (this.barcode != null) {
      this.searchBarcode();
    }
  }
  valueChange(event: any) {
    let dataValue = event.detail.data || 0;
    let targerValue = event.target.value
    console.clear();
    console.log("data value " + dataValue);
    console.log("targer value " + targerValue);
    console.log(event);
    if(dataValue && targerValue.length!=1){
      if (targerValue && targerValue == dataValue && event.detail.inputType != "deleteContentBackward") {
        this.barcode = targerValue;
        if (this.barcode != null) {
          this.searchBarcode();
        }
      } else if (targerValue != null && dataValue.toString().length == 1) {
        console.log("keyboard input");
      }
    }
   
  }
  searchBarcode() {
    if (this.barcode != null && this.barcode.length > 1) {

      this.axService.getItemFromBarcode(this.barcode).subscribe(res => {
        var flag = false;
        var counter = 0;
        this.count++
        if (res.Unit) {
          this.poLineList.forEach(el => {
            counter++;
            if (el.ItemId == res.ItemId && el.UnitId.toLowerCase() == res.Unit.toLowerCase()) {
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
            this.poLine.isVisible = false;
            this.setBarcodeFocus();
            this.presentError("This item barcode not in order list");

          }
        } else {
          var multiple = 0;
          var multiPoLineList: PurchLineModel[] = [];
          this.poLineList.forEach(el => {
            counter++;
            if (el.ItemId == res.ItemId) {
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
            this.poLine.isVisible = false;
            this.setBarcodeFocus();
            this.presentError("This item barcode not in order list");
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
        this.presentError("Connection Error");
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
          poLine.QtyReceived = poLine.Qty;
        } else if (poLine.Count1Qty > 0) {
          poLine.QtyToReceive = -(this.mod(poLine.Qty) - poLine.Count1Qty);
          poLine.QtyReceived = -poLine.Count1Qty;
        } else if (poLine.Count1Qty == -poLine.Qty && poLine.Count2Qty == -poLine.Qty) {
          poLine.QtyToReceive = 0;
          poLine.QtyReceived = poLine.Qty;
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
          poLine.QtyToReceive = -(this.mod(poLine.Qty) - poLine.Count2Qty);
          poLine.QtyReceived = poLine.Count2Qty;
        } else if (poLine.Count1Qty == -poLine.Qty && poLine.Count2Qty == -poLine.Qty) {
          poLine.QtyToReceive = 0;
          poLine.QtyReceived = -poLine.Qty;
        } else if (poLine.Count1Qty == -poLine.Qty && poLine.Count2Qty > 0) {
          poLine.QtyToReceive = -poLine.Qty - poLine.Count2Qty;
          poLine.QtyReceived = poLine.Count2Qty;
        } else if (poLine.Count2Qty == -poLine.Qty) {
          poLine.QtyToReceive = 0;
          poLine.QtyReceived = poLine.Qty;
        } else if (poLine.Count1Qty > 0 && poLine.Count2Qty == 0) {
          poLine.QtyToReceive = poLine.Qty;
          poLine.QtyReceived = 0;
        } else if (poLine.Count1Qty > 0 && poLine.Count2Qty > 0) {
          poLine.QtyToReceive = poLine.Qty + poLine.Count2Qty;
          poLine.QtyReceived = -poLine.Count2Qty;
        }
      }

    }
    poLine.headerCountNumber = this.poHeader.CountNumber;
    return poLine;
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
    if (this.poHeader.CountNumber == "1") {
      this.scannedQty1 = this.calculateSum(this.poHeader.CountNumber);
    } else if (this.poHeader.CountNumber == "2") {
      this.scannedQty2 = this.calculateSum(this.poHeader.CountNumber);
    }
    this.setBarcodeFocus();
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

  clearQtyToRec(poLine: PurchLineModel) {
    poLine.inputQty = "";
  }
  qtyRecCheck(poLine: PurchLineModel) {
    poLine.isSaved = false;
    var len = this.getVisibleItemScannedQty(this.poHeader.PurchLines)
    var allSpecialChar = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    var format = /[\+\-\*\/]/;
    if (allSpecialChar.test(poLine.inputQty)) {
      if (format.test(poLine.inputQty)) {
        let rs = math.evaluate(poLine.inputQty);
        if (rs.toString().includes("Infinity")) {
          this.presentError("Can't divide by 0");
          poLine.inputQty = 0;
          return;
        } else if (Number(rs) > 999999) {
          this.presentError("Qty cann't be greater than 999999");
          poLine.inputQty = 0;
          return false;
        } else if (Number(rs) < 0) {
          this.presentError("Qty cann't be lesser than 0");
          poLine.inputQty = 0;
          return false;
        } else {
          poLine.inputQty = Math.floor(rs);
          console.log(poLine.inputQty);
        }
      } else {
        this.presentError("Invalid Expression");
        poLine.inputQty= 0;
        return;
      }
    }else{
      this.presentError("Invalid Expression");
      poLine.inputQty = 0;
      return;
    }

    if (this.pageType == "Receive") {
      if ((poLine.QtyReceived + poLine.inputQty) > poLine.Qty) {
        this.presentError("Rec item cannot be greater than Qty");
        //poLine.btnDisable = true;
        return false;
      } else {
        poLine.QtyToReceive -= poLine.inputQty;
        poLine.QtyReceived += poLine.inputQty;
        if (this.poHeader.CountNumber == "1") {
          poLine.updatableCount1Qty += poLine.inputQty;
          this.qtyList[len] = this.getQtyObj(this.poHeader.CountNumber, poLine.updatableCount1Qty);
        } else if (this.poHeader.CountNumber == "2") {
          poLine.updatableCount2Qty += poLine.inputQty;
          this.qtyList[len] = this.getQtyObj(this.poHeader.CountNumber, poLine.updatableCount2Qty);
        }
        poLine.inputQty = "";
        return true;
      }
    } else {
      if ((this.mod(poLine.QtyReceived) + this.mod(poLine.inputQty)) > this.mod((poLine.Qty))) {
        this.presentError("Rec item cannot be greater than Qty");
        //poLine.btnDisable = true;
        return false;
      } else {
        poLine.QtyToReceive -= -poLine.inputQty;
        poLine.QtyReceived = poLine.QtyReceived - poLine.inputQty;
        if (this.poHeader.CountNumber == "1") {
          poLine.updatableCount1Qty += poLine.inputQty;
          this.qtyList[len] = this.getQtyObj(this.poHeader.CountNumber, poLine.updatableCount1Qty);
        } else if (this.poHeader.CountNumber == "2") {
          poLine.updatableCount2Qty += poLine.inputQty;
          this.qtyList[len] = this.getQtyObj(this.poHeader.CountNumber, poLine.updatableCount2Qty);
        }
        poLine.inputQty = "";
        return true;
      }
    }
  }
  getQtyObj(header, qty) {
    var obj = {} as IqtyList;
    obj.countNumber = header;
    obj.qty = qty;

    return obj;
  }
  getVisibleItemScannedQty(poLine: PurchLineModel[]) {
    let len = 0;
    poLine.forEach(el => {
      if (el.isVisible) {
        len++;
      }
    })

    return len;
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
                poLine.QtyReceived -= -poLine.updatableCount2Qty;
                poLine.QtyToReceive -= poLine.updatableCount2Qty;
              }
            }
            if (this.poHeader.CountNumber == "1") {
              this.scannedQty1 = this.scannedQty1 - poLine.updatableCount1Qty;
              poLine.updatableCount1Qty = 0;
            } else if (this.poHeader.CountNumber == "2") {
              this.scannedQty2 = this.scannedQty2 - poLine.updatableCount2Qty;
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
            console.log(this.poLineList);
            this.poLineList.forEach(el => {
              el.isVisible = false;
              el.QtyReceived = el.QtyReceivedServer;
            });
          }
        }
      ]
    });
    await alert.present();
  }
  mod(n: any) {
    if (n == 0) return 0;
    else if (n > 0) return n;
    else return -n;
  }
}
