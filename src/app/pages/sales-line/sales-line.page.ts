import { IqtyList } from './../../models/IQtyModel';
import { RoleModel } from 'src/app/models/STPRole.model';
import { StorageService } from 'src/app/providers/storageService/storage.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { SalesLineModel } from './../../models/STPSalesLine.model';
import { SalesTable } from './../../models/STPSalesTable.model';
import { AxService } from 'src/app/providers/axService/ax.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/providers/dataService/data.service';
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { STPLogSyncDetailsModel } from 'src/app/models/STPLogSyncData.model';
import { ToastController, AlertController, IonInput, LoadingController, IonSearchbar } from '@ionic/angular';
declare var $: any;
@Component({
  selector: 'app-sales-line',
  templateUrl: './sales-line.page.html',
  styleUrls: ['./sales-line.page.scss'],
})
export class SalesLinePage implements OnInit {

  pageType: any;
  barcode: string;
  soHeader: SalesTable;
  soLineList: SalesLineModel[] = [];
  user: any;

  salesDetails: SalesLineModel = {} as SalesLineModel;

  salesLineList: SalesLineModel[] = [];

  scannedQty: any;

  itemBarcode: any = "";

  qtyList: IqtyList[] = [{} as IqtyList];
  count: any = -1;
  role: RoleModel = {} as RoleModel;
  soItemSotrageList: any = [];
  scannedQty1: any = 0;
  scannedQty2: any = 0;
  @ViewChild("input") barcodeInput: IonSearchbar;
  @ViewChild("Recinput") qtyInput: IonInput;

  constructor(public barcodeScanner: BarcodeScanner, public dataServ: DataService, public axService: AxService, public router: Router,
    public paramService: ParameterService, private activateRoute: ActivatedRoute, private keyboard: Keyboard,
    public toastController: ToastController, public alertController: AlertController,
    public loadingController: LoadingController, public changeDetectorref: ChangeDetectorRef,
    public storageServ: StorageService) {
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
    this.soLineList.forEach(el => {
      if (el.isVisible) {
        if (this.soHeader.CountNumber == "1") {
          this.qtyList.push(this.getQtyObj(this.soHeader.CountNumber, el.updatableCount1Qty))
        } else if (this.soHeader.CountNumber == "2") {
          this.qtyList.push(this.getQtyObj(this.soHeader.CountNumber, el.updatableCount2Qty))
        }
      }
    })
    if (this.soHeader.CountNumber == "1") {
      this.scannedQty1 = this.calculateSum(this.soHeader.CountNumber);
    } else if (this.soHeader.CountNumber == "2") {
      this.scannedQty2 = this.calculateSum(this.soHeader.CountNumber);
    }
  }
  getQtyObj(header, qty) {
    var obj = {} as IqtyList;
    obj.countNumber = header;
    obj.qty = qty;

    return obj;
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
      //this.keyboard.hide();
    }, 150);
  }
  ngOnInit() {
    this.role = this.paramService.userRole;
    this.user = this.paramService.userId
    this.getSoLineData();
    this.getScannedQty();
  }

  getSoLineData() {
    if (this.pageType == 'Sales-Order') {
      this.dataServ.getSO$.subscribe(res => {
        this.soHeader = res;
        this.soLineList = this.soHeader.SalesLine;
        console.log(this.soHeader)
      })
    } else {
      this.dataServ.getSOReturn$.subscribe(res => {
        this.soHeader = res;
        this.soLineList = this.soHeader.SalesLine;
        console.log(this.soHeader)
      })
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
  clearBarcode() {
    this.barcode = "";
    setTimeout(() => {
      this.barcodeInput.setFocus();
    }, 100);
    setTimeout(() => {
      this.keyboard.show();
    }, 100);
  }
  onPressEnter() {
    this.searchBarcode();
  }
  searchBarcodeOninput(event: any) {
    let dataValue = event.detail.data || 0;
    let targerValue = event.target.value
    console.clear();
    console.log("data value " + dataValue);
    console.log("targer value " + targerValue);
    console.log(event);
    if (targerValue && !dataValue && event.detail.inputType != "deleteContentBackward") {
      this.barcode = targerValue;
      if (this.barcode != null) {
        this.searchBarcode();
      }
    } else if (targerValue != null && dataValue.toString().length == 1) {
      console.log("keyboard input");
    }
  }
  async searchBarcode() {
    if (this.barcode != null && this.barcode.length > 1) {

      this.axService.getItemFromBarcodeWithOUM(this.barcode).subscribe(res => {
        var flag = false;
        this.count++;
        this.soLineList.forEach(el => {
          if (el.ItemNumber == res.ItemId && el.UnitOfMeasure.toLowerCase() == res.Unit.toLowerCase()) {
            el.inputQty = 0;
            el.DocumentNo = this.soHeader.DocumentNo;
            flag = true;
            if (this.pageType == "Sales-Order") {
              if (el.QtyShipped) {
                el.QtyReceivedServer = el.QtyShipped;
              }
            } else {
              if (el.QtyReceived) {
                el.QtyReceivedServer = el.QtyReceived;
              }
            }
            el.qtyDesc = res.Description;
            el.BarCode = res.BarCode;
            this.salesDetails = this.chechCountNumber(el);
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
          this.salesDetails.isVisible = false;
          this.setBarcodeFocus();
          this.presentError("This item barcode not in order list");
        }
      }, error => {
        this.salesDetails.isVisible = false;
        this.barcode = "";
        this.setBarcodeFocus();
        this.presentError("Connection error");
      })
    }
  }

  chechCountNumber(soLine: SalesLineModel) {
    if (this.soHeader.CountNumber == "1") {
      if (this.pageType == "Sales-Order") {
        if (soLine.Count1Qty == 0 && soLine.Count2Qty == 0) {

        } else if (soLine.Count1Qty == 0 && soLine.Count2Qty > 0) {
          soLine.QtyToShip = soLine.Quantity;
          soLine.QtyShipped = 0;

          // soLine.QtyToShip = soLine.Quantity - soLine.QtyReceivedServer;
          // soLine.QtyShipped = soLine.QtyReceivedServer;
        } else if (soLine.Count1Qty == soLine.Quantity) {
          soLine.QtyToShip = 0;
          soLine.QtyShipped = soLine.Quantity;
        } else if (soLine.Count1Qty > 0) {
          soLine.QtyToShip = soLine.Quantity - soLine.Count1Qty;
          soLine.QtyShipped = soLine.Count1Qty;
        } else if (soLine.Count1Qty == soLine.Quantity && soLine.Count2Qty == soLine.Quantity) {
          soLine.QtyToShip = 0;
          soLine.QtyShipped = soLine.Quantity;
        }
      } else {
        if (soLine.Count1Qty == 0 && soLine.Count2Qty == 0) {

        } else if (soLine.Count1Qty == 0 && soLine.Count2Qty > 0) {
          soLine.QtyToReceive = soLine.Quantity;
          soLine.QtyReceived = 0;
        } else if (soLine.Count1Qty == soLine.Quantity) {
          soLine.QtyToReceive = 0;
          soLine.QtyReceived = soLine.Quantity;
        } else if (soLine.Count1Qty > 0) {
          soLine.QtyToReceive = soLine.Quantity - soLine.Count1Qty;
          soLine.QtyReceived = soLine.Count1Qty;
        } else if (soLine.Count1Qty == soLine.Quantity && soLine.Count2Qty == soLine.Quantity) {
          soLine.QtyToReceive = 0;
          soLine.QtyReceived = soLine.Quantity;
        }
      }
    } else if (this.soHeader.CountNumber == "2") {
      if (this.pageType == "Sales-Order") {
        if (soLine.Count1Qty == 0 && soLine.Count2Qty == 0) {

        } else if (soLine.Count1Qty == 0 && soLine.Count2Qty > 0) {
          soLine.QtyToShip = soLine.Quantity - soLine.Count2Qty;
          soLine.QtyShipped = soLine.Count2Qty;
        } else if (soLine.Count1Qty == soLine.Quantity && soLine.Count2Qty == soLine.Quantity) {
          soLine.QtyToShip = 0;
          soLine.QtyShipped = soLine.Quantity;
        } else if (soLine.Count1Qty == soLine.Quantity && soLine.Count2Qty > 0) {
          soLine.QtyToShip = soLine.Quantity - soLine.Count2Qty;
          soLine.QtyShipped = soLine.Count2Qty;
        } else if (soLine.Count2Qty == soLine.Quantity) {
          soLine.QtyToShip = 0;
          soLine.QtyShipped = soLine.Quantity;
        } else if (soLine.Count1Qty > 0 && soLine.Count2Qty == 0) {
          soLine.QtyToShip = soLine.Quantity;
          soLine.QtyShipped = 0;
        } else if (soLine.Count1Qty > 0 && soLine.Count2Qty > 0) {
          soLine.QtyToShip = soLine.Quantity - soLine.Count2Qty;
          soLine.QtyShipped = soLine.Count2Qty;
        }
      } else {
        if (soLine.Count1Qty == 0 && soLine.Count2Qty == 0) {

        } else if (soLine.Count1Qty == 0 && soLine.Count2Qty > 0) {
          soLine.QtyToReceive = soLine.Quantity - soLine.Count2Qty;
          soLine.QtyReceived = soLine.Count2Qty;
        } else if (soLine.Count1Qty == soLine.Quantity && soLine.Count2Qty == soLine.Quantity) {
          soLine.QtyToReceive = 0;
          soLine.QtyReceived = soLine.Quantity;
        } else if (soLine.Count1Qty == soLine.Quantity && soLine.Count2Qty > 0) {
          soLine.QtyToReceive = soLine.Quantity - soLine.Count2Qty;
          soLine.QtyReceived = soLine.Count2Qty;
        } else if (soLine.Count2Qty == soLine.Quantity) {
          soLine.QtyToReceive = 0;
          soLine.QtyReceived = soLine.Quantity;
        } else if (soLine.Count1Qty > 0 && soLine.Count2Qty == 0) {
          soLine.QtyToReceive = soLine.Quantity;
          soLine.QtyReceived = 0;
        } else if (soLine.Count1Qty > 0 && soLine.Count2Qty > 0) {
          soLine.QtyToReceive = soLine.Quantity - soLine.Count2Qty;
          soLine.QtyReceived = soLine.Count2Qty;
        }
      }
    }
    soLine.isVisible = true;
    soLine.headerCountNumber = this.soHeader.CountNumber;
    return soLine;
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
  async presentAlert(msg) {
    const alert = await this.alertController.create({
      header: 'Multiple Item',
      subHeader: '',
      message: msg,
      buttons: ['OK']
    });

    await alert.present();
  }

  onEnter(soLine: SalesLineModel) {
    this.saveLine(soLine);
  }
  saveLine(soLine: SalesLineModel) {
    if (this.soHeader.CountNumber == "1") {
      if (soLine.updatableCount1Qty == 0) soLine.isSaved = false;
    } else if (this.soHeader.CountNumber == "2") {
      if (soLine.updatableCount2Qty == 0) soLine.isSaved = false;
    }
    if (this.qtyRecCheck(soLine)) {
      soLine.isSaved = true;
    } else {
      soLine.isSaved = false;
    }

    console.log(this.soLineList);
    if (this.soHeader.CountNumber == "1") {
      this.scannedQty1 = this.calculateSum(this.soHeader.CountNumber);
    } else if (this.soHeader.CountNumber == "2") {
      this.scannedQty2 = this.calculateSum(this.soHeader.CountNumber);
    }
    this.setBarcodeFocus();
  }
  clearQtyToRec(soLine: SalesLineModel) {
    soLine.inputQty = 0;
  }
  qtyRecCheck(soLine: SalesLineModel) {
    var len = this.getVisibleItemScannedQty(this.soHeader.SalesLine);
    if (soLine.inputQty < 0) {
      this.presentError("Qty Cann't be Negative");
      return false;
    }
    if (this.pageType == "Sales-Order") {
      if ((soLine.QtyShipped + soLine.inputQty) > soLine.Quantity) {
        this.presentError("Rec item cannot be greater than Qty");
        return false;
      } else {
        soLine.QtyToShip -= soLine.inputQty;
        soLine.QtyShipped += soLine.inputQty;
        if (this.soHeader.CountNumber == "1") {
          soLine.updatableCount1Qty += soLine.inputQty;
          this.qtyList[len] = this.getQtyObj(this.soHeader.CountNumber, soLine.updatableCount1Qty);
        } else if (this.soHeader.CountNumber == "2") {
          soLine.updatableCount2Qty += soLine.inputQty;
          this.qtyList[len] = this.getQtyObj(this.soHeader.CountNumber, soLine.updatableCount2Qty);
        }
        soLine.inputQty = 0;
        return true;
      }
    } else {
      if ((soLine.QtyReceived + soLine.inputQty) > soLine.Quantity) {
        this.presentError("Rec item cannot be greater than Qty");
        return false;
      } else {
        soLine.QtyToReceive -= soLine.inputQty;
        soLine.QtyReceived += soLine.inputQty;
        if (this.soHeader.CountNumber == "1") {
          soLine.updatableCount1Qty += soLine.inputQty;
          this.qtyList[len] = this.getQtyObj(this.soHeader.CountNumber, soLine.updatableCount1Qty);
        } else if (this.soHeader.CountNumber == "2") {
          soLine.updatableCount2Qty += soLine.inputQty;
          this.qtyList[len] = this.getQtyObj(this.soHeader.CountNumber, soLine.updatableCount2Qty);
        }
        soLine.inputQty = 0;
        return true;
      }
    }
  }
  getVisibleItemScannedQty(soLine: SalesLineModel[]) {
    let len = 0;
    soLine.forEach(el => {
      if (el.isVisible) {
        len++;
      }
    })

    return len;
  }
  async presentAlertForCancel(soLine: SalesLineModel) {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Are you sure you want to clear the entered data? `,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            if (this.pageType == "Sales-Order") {
              if (this.soHeader.CountNumber == "1") {
                soLine.QtyShipped -= soLine.updatableCount1Qty;
                soLine.QtyToShip += soLine.updatableCount1Qty;
              } else if (this.soHeader.CountNumber == "2") {
                soLine.QtyShipped -= soLine.updatableCount2Qty;
                soLine.QtyToShip += soLine.updatableCount2Qty;
              }
            } else {
              if (this.soHeader.CountNumber == "1") {
                soLine.QtyReceived -= soLine.updatableCount1Qty;
                soLine.QtyToReceive += soLine.updatableCount1Qty;
              } else if (this.soHeader.CountNumber == "2") {
                soLine.QtyReceived -= soLine.updatableCount2Qty;
                soLine.QtyToReceive += soLine.updatableCount2Qty;
              }
            }
            if (this.soHeader.CountNumber == "1") {
              soLine.updatableCount1Qty = 0;
            } else if (this.soHeader.CountNumber == "2") {
              soLine.updatableCount2Qty = 0;
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
  cancelBtn(soLine: SalesLineModel) {
    this.presentAlertForCancel(soLine);
  }
  showList() {
    if (this.pageType == "Sales-Order") {
      this.dataServ.setSOList(this.soLineList);
    } else {
      this.dataServ.setSOReturnList(this.soLineList);
    }
    this.router.navigateByUrl('/sales-list/' + this.pageType);
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
            if (this.paramService.SOItemList != null) {
              this.soItemSotrageList = this.paramService.SOItemList;
            } else {
              this.soItemSotrageList = [];
            }
            this.soLineList.forEach(el => {
              if (this.soHeader.CountNumber == "1") {
                if (el.updatableCount1Qty == 0) {
                  el.Count1Qty = el.Count1Qty;
                } else {
                  el.Count1Qty = el.updatableCount1Qty;
                }

              } else if (this.soHeader.CountNumber == "2") {
                if (el.updatableCount2Qty == 0) {
                  el.Count2Qty = el.Count2Qty;
                } else {
                  el.Count2Qty = el.updatableCount2Qty;
                }
              }
            })
            var flag = 0;
            this.soItemSotrageList.forEach(el => {
              if (el.soNo == this.soHeader.DocumentNo) {
                el.type = this.pageType;
                el.soNo = this.soHeader.DocumentNo;
                el.soHeader = this.soHeader;
                flag = 1;
              }
            });
            if (flag == 0) {
              this.soItemSotrageList.push(
                {
                  type: this.pageType,
                  soNo: this.soHeader.DocumentNo,
                  soHeader: this.soHeader
                }
              )
            }
            this.storageServ.setSOItemList(this.soItemSotrageList);
            this.paramService.SOItemList = this.soItemSotrageList;
          }
        },
        {
          text: 'No',
          handler: () => {
            this.soLineList.forEach(el => el.isVisible = false);

          }
        }
      ]
    });
    await alert.present();
  }
}
