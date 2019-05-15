import { ParameterService } from './../../providers/parameterService/parameter.service';
import { STPLogSyncDetailsModel } from './../../models/STPLogSyncData.model';
import { AxService } from 'src/app/providers/axService/ax.service';
import { PurchTableModel } from 'src/app/models/STPPurchTable.model';
import { DataService } from 'src/app/providers/dataService/data.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Component, OnInit, Input } from '@angular/core';
import { PurchLineModel } from 'src/app/models/STPPurchTableLine.model';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ToastController } from '@ionic/angular';
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

  updateDataTableList: STPLogSyncDetailsModel[] = [];

  dataTable: STPLogSyncDetailsModel = {} as STPLogSyncDetailsModel;
  constructor(public barcodeScanner: BarcodeScanner, public dataServ: DataService,
    public toastController: ToastController, public axService: AxService,private keyboard: Keyboard,
    public paramService: ParameterService) {

  }

  ngOnInit() {
    this.user = this.dataServ.userId
    this.getPoLineData();
    this.keyboard.hide();
  }
  keyboardHide(){
    this.keyboard.hide();
  }
  getPoLineData() {
    this.poHeader = this.dataServ.PO;
    this.poLineList = this.poHeader.PurchLines;
    // this.dataServ.getPO$.subscribe(res => {
    //   this.poHeader = res;
    //   this.poLineList = this.poHeader.PurchLines;
    //   console.log(this.poHeader)
    // })
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

  toggleDetails(poLine: PurchLineModel) {
    poLine.toggle = !poLine.toggle;
  }
  searchBarcode() {
    var flag = false;
    this.poLineList.forEach(el => {
      if (el.BarCode == this.barcode) {
        el.isVisible = true;
        flag = true;
      }
    })
    if (!flag) {
      this.presentToast("Barcode not found");
    }
  }
  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }
  saveLine(poLine: PurchLineModel) {
    poLine.isSaved = true;
    poLine.toggle = true;
  }

  savePO() {
    this.poLineList.forEach(el => {
      if (el.isSaved && !el.dataSavedToList) {
        this.dataTable.BarCode = el.BarCode;
        this.dataTable.DeviceId = "5637144576";
        /*"52545f17-74ca-e75e-3518-990821491968"; this.paramService.deviceID;*/
        this.dataTable.DocumentDate = this.poHeader.OrderDate;
        this.dataTable.ItemId = el.ItemId;
        this.dataTable.DocumentNum = this.poHeader.PurchId;
        this.dataTable.DocumentType = "Order";
        this.dataTable.ItemLocation = this.paramService.Location.LocationId;
        this.dataTable.UserLocation = this.paramService.Location.LocationId;
        this.dataTable.LineNum = el.LineNo;
        this.dataTable.Quantity = el.Qty;
        this.dataTable.TransactionType = "Purchase";
        this.dataTable.UnitId = el.UnitId;
        this.dataTable.User = this.user;

        el.dataSavedToList = true;
        this.updateDataTableList.push(this.dataTable)
      }
    })

    console.log(this.updateDataTableList)
    this.axService.updateStagingTable(this.updateDataTableList).subscribe(res => {
      console.log(res);
    }, error => {
      console.log(error.message);
    })
  }
}
