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

  qtyList: any[] = [];
  count: any = -1;
  role:RoleModel = {} as RoleModel;
  soItemSotrageList: any = [];
  @ViewChild("input") barcodeInput: IonSearchbar;
  @ViewChild("Recinput") qtyInput: IonInput;

  constructor(public barcodeScanner: BarcodeScanner, public dataServ: DataService, public axService: AxService, public router: Router,
    public paramService: ParameterService, private activateRoute: ActivatedRoute, private keyboard: Keyboard,
    public toastController: ToastController, public alertController: AlertController,
    public loadingController: LoadingController, public changeDetectorref: ChangeDetectorRef,
    public storageServ:StorageService) {
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
    this.getSoLineData();
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

  clearBarcode() {
    this.barcode = "";
    this.setBarcodeFocus();
  }

  async searchBarcode() {
    var visibleLine = [];

    if (this.barcode != null && this.barcode.length > 3) {
      const loading = await this.loadingController.create({
        message: 'Please Wait'
      });
      await loading.present();
      this.axService.getItemFromBarcodeWithOUM(this.barcode).subscribe(res => {
        var flag = false;
        var counter = 0;
        loading.dismiss();
        this.soLineList.forEach(el => {
          counter++;
          if (el.ItemNumber == res.ItemId && el.UnitOfMeasure.toLowerCase() == res.Unit.toLowerCase()) {
            this.count++
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

            visibleLine.push(counter);
            this.salesDetails = this.chechCountNumber(el);

          }
        });
        if (!flag) {
          this.clearBarcode();
          this.presentToast("This item barcode not in order list");
        } else {
          setTimeout(() => {
            this.qtyInput.setFocus();
          }, 150);
        }
      }, error => {
        loading.dismiss();
        this.barcode = "";
        this.setBarcodeFocus();
        this.presentToast("Connection error");
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
    return soLine;
  }
  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
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
    console.log(this.qtyList)
    var sum = 0;
    this.qtyList.forEach(data => {
      sum += data;
    })
    this.scannedQty = sum;
  }
  clearQtyToRec(soLine: SalesLineModel) {
    soLine.inputQty = 0;
  }
  qtyRecCheck(soLine: SalesLineModel) {
    if (this.pageType == "Sales-Order") {
      if ((soLine.QtyShipped + soLine.inputQty) > soLine.Quantity) {
        this.presentToast("Rec item cannot be greater than Qty");
        return false;
      } else {
        soLine.QtyToShip -= soLine.inputQty;
        soLine.QtyShipped += soLine.inputQty;
        if (this.soHeader.CountNumber == "1") {
          soLine.updatableCount1Qty += soLine.inputQty;
          this.qtyList[this.count] = soLine.updatableCount1Qty;
        } else if (this.soHeader.CountNumber == "2") {
          soLine.updatableCount2Qty += soLine.inputQty;
          this.qtyList[this.count] = soLine.updatableCount2Qty;
        }
        soLine.inputQty = 0;
        return true;
      }
    } else {
      if ((soLine.QtyReceived + soLine.inputQty) > soLine.Quantity) {
        this.presentToast("Rec item cannot be greater than Qty");
        return false;
      } else {
        soLine.QtyToReceive -= soLine.inputQty;
        soLine.QtyReceived += soLine.inputQty;
        if (this.soHeader.CountNumber == "1") {
          soLine.updatableCount1Qty += soLine.inputQty;
          this.qtyList[this.count] = soLine.updatableCount1Qty;
        } else if (this.soHeader.CountNumber == "2") {
          soLine.updatableCount2Qty += soLine.inputQty;
          this.qtyList[this.count] = soLine.updatableCount2Qty;
        }
        soLine.inputQty = 0;
        return true;
      }
    }
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
            if (this.paramService.POItemList != null) {
              this.soItemSotrageList = this.paramService.POItemList;
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
              if (el.poNo == this.soHeader.DocumentNo) {
                el.type = this.pageType;
                el.poNo = this.soHeader.DocumentNo;
                el.poHeader = this.soHeader;
                flag = 1;
              }
            });
            if (flag == 0) {
              this.soItemSotrageList.push(
                {
                  type: this.pageType,
                  poNo: this.soHeader.DocumentNo,
                  poHeader: this.soHeader
                }
              )
            }
            this.storageServ.setPOItemList(this.soItemSotrageList);
            this.paramService.POItemList = this.soItemSotrageList;
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
