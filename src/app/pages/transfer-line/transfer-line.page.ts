import { ActivatedRoute, Router } from '@angular/router';
import { TransferOrderModel } from './../../models/STPTransferOrder.model';
import { ParameterService } from './../../providers/parameterService/parameter.service';
import { STPLogSyncDetailsModel } from './../../models/STPLogSyncData.model';
import { AxService } from 'src/app/providers/axService/ax.service';
import { DataService } from 'src/app/providers/dataService/data.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Component, OnInit, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ToastController, IonInput, AlertController, LoadingController } from '@ionic/angular';
import { TransferOrderLine } from 'src/app/models/STPTransferOrderLine.Model';
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
  constructor(public barcodeScanner: BarcodeScanner, public dataServ: DataService, public alertController: AlertController,
    public toastController: ToastController, public axService: AxService, private keyboard: Keyboard,
    public paramService: ParameterService, private activateRoute: ActivatedRoute,
    public loadingController: LoadingController, public router: Router) {

    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
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
    this.user = this.dataServ.userId
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
    var visibleLine = [];

    if (this.barcode != null && this.barcode.length > 3) {
      const loading = await this.loadingController.create({
        message: 'Please Wait'
      });
      await loading.present();
      this.axService.getItemFromBarcode(this.barcode).subscribe(res => {
        var flag = false;
        var counter = 0;
        loading.dismiss();
        this.toLineList.forEach(el => {
          counter++;
          if (el.ItemNo == res.ItemId && el.UnitOfMeasure.toLowerCase() == res.Unit.toLowerCase()) {
            el.isVisible = true;

            el.inputQty = 0;
            this.count++

            flag = true;
            el.qtyDesc = res.Description;
            el.BarCode = res.BarCode;

            this.toLine = el;
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
  async savePO() {
    this.toLineList.forEach(el => {
      var dataTable = {} as STPLogSyncDetailsModel;
      if (el.isSaved && !el.dataSavedToList) {
        dataTable.BarCode = el.BarCode;
        dataTable.DeviceId = "52545f17-74ca-e75e-3518-990821491968";
        dataTable.DocumentDate = this.toHeader.ReceiveDate;
        dataTable.ItemId = el.ItemNo;
        dataTable.DocumentNum = this.toHeader.JournalId;
        if (this.pageType == "Transfer-out") {
          dataTable.DocumentType = 4;
        } else {
          dataTable.DocumentType = 3;
        }
        dataTable.ItemLocation = this.paramService.Location.LocationId;
        dataTable.UserLocation = this.paramService.Location.LocationId;
        dataTable.LineNum = el.LineNo;

        dataTable.Quantity = el.updatableQty;
        dataTable.TransactionType = 3;
        dataTable.UnitId = el.UnitOfMeasure;
        dataTable.User = this.user;

        el.dataSavedToList = true;
        this.updateDataTableList.push(dataTable)
      }
    })

    if (this.updateDataTableList.length > 0) {
      const loading = await this.loadingController.create({
        message: 'Please Wait'
      });
      await loading.present();
      this.axService.updateStagingTable(this.updateDataTableList).subscribe(res => {
        if (res) {
          this.presentToast("Line Updated successfully");
          this.updateDataTableList = [];
        } else {
          this.presentToast("Error Updating Line");
        }
        loading.dismiss();
      }, error => {
        loading.dismiss();
        console.log(error.message);
      })
    } else {
      this.presentToast("Line Already Saved");
    }
  }
  clearQtyToRec(toLine: TransferOrderLine) {
    toLine.inputQty = 0;
  }
  recQtyChanged(toLine: TransferOrderLine) {
    toLine.isSaved = false;
  }
  qtyRecCheck(toLine: TransferOrderLine) {
    if (this.pageType == "Transfer-out") {
      if ((toLine.QtyShipped + toLine.inputQty) > toLine.Quantity) {
        this.presentToast("Rec item cannot be greater than Qty");
        return false;
      } else {
        toLine.QtyToShip -= toLine.inputQty;
        toLine.QtyShipped += toLine.inputQty;
        toLine.updatableQty += toLine.inputQty;
        this.qtyList[this.count] = toLine.updatableQty;
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
        toLine.updatableQty += toLine.inputQty;
        this.qtyList[this.count] = toLine.updatableQty;
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
              toLine.QtyShipped -= toLine.updatableQty;
              toLine.QtyToShip += toLine.updatableQty;
            } else {
              toLine.QtyReceived -= toLine.updatableQty;
              toLine.QtyToReceive += toLine.updatableQty;
            }
            toLine.updatableQty = 0;
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
