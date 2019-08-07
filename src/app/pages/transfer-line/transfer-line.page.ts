import { ActivatedRoute, Router } from '@angular/router';
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
import { RoleModel } from 'src/app/models/STPRole.model';
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

  @ViewChild("input") barcodeInput: IonInput;
  @ViewChild("Recinput") qtyInput: IonInput;


  qtyList: any[] = [];

  count: any = -1;

  dataTable: STPLogSyncDetailsModel = {} as STPLogSyncDetailsModel;
  role:RoleModel = {} as RoleModel;
  
  constructor(public barcodeScanner: BarcodeScanner, public dataServ: DataService, public alertController: AlertController,
    public toastController: ToastController, public axService: AxService, private keyboard: Keyboard,
    public paramService: ParameterService, private activateRoute: ActivatedRoute,
    public loadingController: LoadingController, public router: Router,
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
    if (this.toHeader.scannedQty) {
      this.scannedQty = this.toHeader.scannedQty;
    } else {
      this.scannedQty = 0;
    }

  }

  clearBarcode() {
    this.barcode = "";
    this.setBarcodeFocus()
  }

  ngOnDestroy() {
    this.toHeader.scannedQty = this.scannedQty;
  }
  async barcodeScan() {
    console.log(this.toLineList);
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
        this.toLineList.forEach(el => {
          counter++;
          if (el.ItemNo == res.ItemId && el.UnitOfMeasure.toLowerCase() == res.Unit.toLowerCase()) {
            el.isVisible = true;

            el.inputQty = 0;
            this.count++
            if (el.QtyShipped) {
              el.qtyShippedFromServer = el.QtyShipped;
            }
            if(el.QtyReceived){
              el.qtyReceivedFromServer = el.QtyReceived;
            }
            flag = true;
            el.qtyDesc = res.Description;
            el.BarCode = res.BarCode;

            this.toLine = this.chechCountNumber(el);
            visibleLine.push(counter);
          }
        });

        if (!flag) {
          this.barcode = "";
          this.setBarcodeFocus()
          this.presentToast("This item barcode not in order list");

        } else {
          setTimeout(() => {
            this.qtyInput.setFocus();
          }, 150);
        }
      }, error => {
        loading.dismiss()
        this.barcode = "";
        this.setBarcodeFocus()
        this.presentToast("Connection Error");
      })
    }

  }
  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
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
    var sum = 0;
    this.qtyList.forEach(data => {
      sum += data;
    })
    this.scannedQty = sum;
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
    toLine.isVisible = true;
    return toLine;
  }
  qtyRecCheck(toLine: TransferOrderLine) {
    if (this.pageType == "Transfer-out") {
      if ((toLine.QtyShipped + toLine.inputQty) > toLine.Quantity) {
        this.presentToast("Rec item cannot be greater than Qty");
        return false;
      } else {
        toLine.QtyToShip -= toLine.inputQty;
        toLine.QtyShipped += toLine.inputQty;
        if (this.toHeader.CountNumber == "1") {
          toLine.updatableCount1Qty += toLine.inputQty;
          this.qtyList[this.count] = toLine.updatableCount1Qty;
        } else if (this.toHeader.CountNumber == "2") {
          toLine.updatableCount2Qty += toLine.inputQty;
          this.qtyList[this.count] = toLine.updatableCount2Qty;
        }
        toLine.inputQty = 0;
        return true;
      }
    } else {
      if ((toLine.QtyReceived + toLine.inputQty) > toLine.Quantity || (toLine.inputQty > toLine.QtyToReceive)) {
        this.presentToast("Rec item cannot be greater than Qty");
        return false;
      } else {
        toLine.QtyToReceive -= toLine.inputQty;
        toLine.QtyReceived += toLine.inputQty;
        if (this.toHeader.CountNumber == "1") {
          toLine.updatableCount1Qty += toLine.inputQty;
          this.qtyList[this.count] = toLine.updatableCount1Qty;
        } else if (this.toHeader.CountNumber == "2") {
          toLine.updatableCount2Qty += toLine.inputQty;
          this.qtyList[this.count] = toLine.updatableCount2Qty;
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
} 
