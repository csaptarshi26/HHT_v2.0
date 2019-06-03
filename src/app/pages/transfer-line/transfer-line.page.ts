import { ActivatedRoute } from '@angular/router';
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

  pageType: any;
  scannedQty: any;

  itemBarcode: any = "";
  updateDataTableList: STPLogSyncDetailsModel[] = [];

  @ViewChild('input') inputElement: IonInput;
  qtyList: any[] = [];

  count: any = -1;

  dataTable: STPLogSyncDetailsModel = {} as STPLogSyncDetailsModel;
  constructor(public barcodeScanner: BarcodeScanner, public dataServ: DataService, public alertController: AlertController,
    public toastController: ToastController, public axService: AxService, private keyboard: Keyboard,
    public paramService: ParameterService, private activateRoute: ActivatedRoute,
    public loadingController: LoadingController) {

    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
  }

  ngOnInit() {

    this.user = this.dataServ.userId
    this.getToLineData();

    setTimeout(() => {
      this.inputElement.setFocus();
    }, 150);
    this.keyboard.hide();
  }

  keyboardHide() {
    this.keyboard.hide();
  }
  getToLineData() {
    if (this.pageType == 'transferOut') {
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
  barcodeScan() {
    if (this.barcode == null) {
      this.barcodeScanner.scan().then(barcodeData => {
        console.log('Barcode data', barcodeData);
        this.barcode = barcodeData.text;
        this.searchBarcode();
      }).catch(err => {
        console.log('Error', err);
      });
    } else {
      this.searchBarcode();
    }
  }
  clearBarcode() {
    this.barcode = "";
    document.getElementById("barcodeInput").focus();
    this.keyboard.hide();
  }
  toggleDetails(toLine: TransferOrderLine, i) {
    toLine.toggle = !toLine.toggle;
    let id = "#Recinput" + i;
    $(document).ready(function () {
      $(id).focus();
    });
  }
  ngOnDestroy() {
    this.toHeader.scannedQty = this.scannedQty;
  }
  searchBarcode() {
    var visibleLine = [];

    if (this.barcode != null && this.barcode.length > 3) {
      this.axService.getItemFromBarcode(this.barcode).subscribe(res => {
        var flag = false;
        var counter = 0;
        var multiLine = 0;
        this.toLineList.forEach(el => {
          counter++;
          if (el.ItemNo == res.ItemId && el.UnitOfMeasure.toLowerCase() == res.Unit.toLowerCase()) {
            el.isVisible = true;
            el.toggle = false;
            this.count++
            if (this.pageType == "transferOut") {
              el.QtyToShip = 0;
              el.qtyReceivedFromServer = el.QtyShipped;

              el.balance = el.Quantity - el.QtyShipped;
            } else {
              el.qtyReceivedFromServer = el.QtyReceived;
              el.QtyToReceive = 0;
              el.balance = el.Quantity - el.QtyReceived;
            }

            flag = true;
            el.updatableQty = [];
            el.qtyDesc = res.Description;
            el.BarCode = res.BarCode;

            visibleLine.push(counter);
            multiLine++;
          }
        });

        let id = "#Recinput" + visibleLine[0];
        $(document).ready(function () {
          $(id).focus();
        });

        if (multiLine > 1) {
          this.presentAlert("This Item has " + multiLine + " Lines");
        }
        if (!flag) {
          this.presentToast("Barcode not found");
          this.barcode = "";
          document.getElementById("barcodeInput").focus();
        }
      }, error => {
        this.presentToast("Barcode not found");
        document.getElementById("barcodeInput").focus();
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
    if (this.qtyRecCheck(toLine)) {
      this.saveLine(toLine);
    }
  }
  saveLine(toLine: TransferOrderLine) {
    toLine.isSaved = true;
    toLine.toggle = true;

    if (this.pageType == "transferOut") {
      let sum = 0;
      toLine.updatableQty[this.count] = toLine.QtyToShip;
      toLine.QtyShipped = toLine.QtyShipped + toLine.QtyToShip;
      toLine.QtyToShip = 0;

      this.qtyList[this.count] = toLine.QtyShipped;
      this.scannedQty = this.calculateSum();

    } else {
      let sum = 0;
      toLine.updatableQty[this.count] = toLine.QtyToReceive;
      toLine.QtyReceived = toLine.QtyReceived + toLine.QtyToReceive;
      toLine.QtyToReceive = 0;


      this.qtyList[this.count] = toLine.QtyReceived;
      this.scannedQty = this.calculateSum();
    }
  }
  calculateSum() {
    var sum = 0;
    this.qtyList.forEach(el => {
      sum = sum + el;
    })

    return sum;
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
        if (this.pageType == "transferOut") {
          dataTable.DocumentType = 4;
        } else {
          dataTable.DocumentType = 3;
        }
        dataTable.ItemLocation = this.paramService.Location.LocationId;
        dataTable.UserLocation = this.paramService.Location.LocationId;
        dataTable.LineNum = el.LineNo;

        var sum = 0;
        el.updatableQty.forEach(data => {
          sum = sum + data;
        })

        dataTable.Quantity = sum;
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
    if (this.pageType == "transferOut") {
      toLine.QtyToShip = 0;
    } else {
      toLine.QtyToReceive = 0;
    }
  }
  qtyRecCheck(toLine: TransferOrderLine) {
    if (this.pageType == "transferOut") {
      if ((toLine.QtyShipped + toLine.QtyToShip) > toLine.Quantity) {
        this.presentToast("Rec item cannot be greater than Qty");
        toLine.btnDisable = true;
        return false;
      } else {
        toLine.balance = toLine.Quantity - (toLine.QtyToShip + toLine.QtyShipped);
        toLine.btnDisable = false;
        return true;
      }
    } else {
      if ((toLine.QtyReceived + toLine.QtyToReceive) > toLine.Quantity) {
        this.presentToast("Rec item cannot be greater than Qty");
        toLine.btnDisable = true;
        return false;
      } else {
        toLine.balance = toLine.Quantity - (toLine.QtyToReceive + toLine.QtyReceived);
        toLine.btnDisable = false;
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
  cancelBtn(toLine: TransferOrderLine) {
    if (this.pageType == "transferOut") {
      toLine.QtyShipped = toLine.qtyReceivedFromServer;
      toLine.QtyToShip = 0;
      toLine.balance = toLine.Quantity - toLine.qtyReceivedFromServer;
    } else {
      toLine.QtyReceived = toLine.qtyReceivedFromServer;
      toLine.QtyToReceive = 0;
      toLine.balance = toLine.Quantity - toLine.qtyReceivedFromServer;
    }

  }


}
