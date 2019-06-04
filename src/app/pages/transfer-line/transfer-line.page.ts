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
            el.updatableQty = 0;
            el.inputQty = 0;
            this.count++
            // if (this.pageType == "transferOut") {
            //   el.Quantity = el.QtyToShip;
            //   el.qtyReceivedFromServer = el.QtyShipped;


            //   el.balance = el.Quantity - el.QtyShipped;
            // } else {
            //   el.Quantity = el.QtyToReceive;
            //   el.qtyReceivedFromServer = el.QtyReceived;

            //   el.balance = el.Quantity - el.QtyReceived;
            // }

            flag = true;
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
    this.saveLine(toLine);
  }
  saveLine(toLine: TransferOrderLine) {
    if (this.qtyRecCheck(toLine)) {
      toLine.isSaved = true;
      toLine.toggle = true;
    } else {
      toLine.isSaved = false;
      toLine.toggle = false;
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
        if (this.pageType == "transferOut") {
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
    if (this.pageType == "transferOut") {
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
      if ((toLine.QtyReceived + toLine.QtyToReceive) > toLine.Quantity) {
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
  cancelBtn(toLine: TransferOrderLine) {
    if (this.pageType == "transferOut") {
      toLine.QtyShipped -= toLine.updatableQty;
      toLine.QtyToShip += toLine.updatableQty;
    } else {
      toLine.QtyReceived -= toLine.updatableQty;
      toLine.QtyToReceive += toLine.updatableQty;
    }
    toLine.updatableQty = 0;
  }
} 
