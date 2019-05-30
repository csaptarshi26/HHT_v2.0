import { ParameterService } from './../../providers/parameterService/parameter.service';
import { STPLogSyncDetailsModel } from './../../models/STPLogSyncData.model';
import { AxService } from 'src/app/providers/axService/ax.service';
import { PurchTableModel } from 'src/app/models/STPPurchTable.model';
import { DataService } from 'src/app/providers/dataService/data.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Component, OnInit, Input, SimpleChanges, ViewChild } from '@angular/core';
import { PurchLineModel } from 'src/app/models/STPPurchTableLine.model';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ToastController, IonInput, AlertController, LoadingController } from '@ionic/angular';
declare var $: any;
@Component({
  selector: 'receiving-line',
  templateUrl: './receiving-line.page.html',
  styleUrls: ['./receiving-line.page.scss'],
})
export class ReceivingLinePage implements OnInit {
  barcode: string;
  poHeader: PurchTableModel;
  poLineList: PurchLineModel[] = [];
  user: any;
  scannedQty: any = 0;


  itemBarcode: any = "";
  updateDataTableList: STPLogSyncDetailsModel[] = [];

  @ViewChild('input') inputElement: IonInput;

  dataTable: STPLogSyncDetailsModel = {} as STPLogSyncDetailsModel;
  constructor(public barcodeScanner: BarcodeScanner, public dataServ: DataService, public alertController: AlertController,
    public toastController: ToastController, public axService: AxService, private keyboard: Keyboard,
    public paramService: ParameterService,public loadingController: LoadingController) {
  }

  ngOnInit() {

    this.user = this.dataServ.userId
    this.getPoLineData();

    setTimeout(() => {
      this.inputElement.setFocus();
      this.keyboard.hide();
    }, 150);
  }

  keyboardHide() {
    this.keyboard.hide();
  }
  getPoLineData() {
    this.dataServ.getPO$.subscribe(res => {
      this.poHeader = res;
      if (this.poHeader.scannedQty) {
        this.scannedQty = this.poHeader.scannedQty;
      } else {
        this.scannedQty = 0;
      }
      this.poLineList = this.poHeader.PurchLines;
      console.log(this.poHeader)
    })
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
  toggleDetails(poLine: PurchLineModel, i) {
    poLine.toggle = !poLine.toggle;
    let id = "#Recinput" + i;
    $(document).ready(function () {
      $(id).focus();
    });
  }
  ngOnDestroy() {
    this.poHeader.scannedQty = this.scannedQty;
  }
  searchBarcode() {
    var visibleLine = [];

    if (this.barcode != null && this.barcode.length > 3) {
      this.axService.getItemFromBarcode(this.barcode).subscribe(res => {
        var flag = false;
        var counter = 0;
        var multiLine = 0;
        this.poLineList.forEach(el => {
          counter++;
          if (el.ItemId == res.ItemId && el.UnitId.toLowerCase() == res.Unit.toLowerCase()) {
            if (!el.isVisible) {
              this.scannedQty++;
            }
            el.isVisible = true;
            el.toggle = false;
            el.QtyToReceive = null;
            flag = true;
            el.updatableQty = [];
            el.balance = el.Qty - el.QtyReceived;
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
  onEnter(poLine: PurchLineModel) {
    if (this.qtyRecCheck(poLine)) {
      this.saveLine(poLine);
    }
  }
  saveLine(poLine: PurchLineModel) {
    poLine.isSaved = true;
    poLine.toggle = true;


    poLine.updatableQty.push(poLine.QtyToReceive);
    poLine.QtyReceived = poLine.QtyReceived + poLine.QtyToReceive;
    poLine.QtyToReceive = null;
  }

  async savePO() {
    this.poLineList.forEach(el => {
      var dataTable = {} as STPLogSyncDetailsModel;
      if (el.isSaved && !el.dataSavedToList) {
        dataTable.BarCode = el.BarCode;
        dataTable.DeviceId = "52545f17-74ca-e75e-3518-990821491968";
        dataTable.DocumentDate = this.poHeader.OrderDate;
        dataTable.ItemId = el.ItemId;
        dataTable.DocumentNum = this.poHeader.PurchId;
        dataTable.DocumentType = 1;
        dataTable.ItemLocation = this.paramService.Location.LocationId;
        dataTable.UserLocation = this.paramService.Location.LocationId;
        dataTable.LineNum = el.LineNo;

        var sum = 0;
        el.updatableQty.forEach(data => {
          sum = sum + data;
        })

        dataTable.Quantity = sum;
        dataTable.TransactionType = 2;
        dataTable.UnitId = el.UnitId;
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
  clearQtyToRec(poLine: PurchLineModel) {
    poLine.QtyToReceive = null;
  }
  qtyRecCheck(poLine: PurchLineModel) {
    if ((poLine.QtyReceived + poLine.QtyToReceive) > poLine.Qty) {
      this.presentToast("Rec item cannot be greater than Qty");
      poLine.btnDisable = true;
      return false;
    } else {
      poLine.balance = poLine.Qty - (poLine.QtyToReceive + poLine.QtyReceived);
      poLine.btnDisable = false;
      return true;
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
  cancelBtn(poLine: PurchLineModel) {
    poLine.QtyReceived = 0;
    poLine.QtyToReceive = 0;
    poLine.balance = poLine.Qty;
  }

}
