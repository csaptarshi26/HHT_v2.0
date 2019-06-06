import { StorageService } from './../../providers/storageService/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { AxService } from './../../providers/axService/ax.service';
import { DataService } from './../../providers/dataService/data.service';
import { PurchTableModel } from './../../models/STPPurchTable.model';
import { Component, OnInit } from '@angular/core';
import { PurchLineModel } from 'src/app/models/STPPurchTableLine.model';
import { STPLogSyncDetailsModel } from 'src/app/models/STPLogSyncData.model';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
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
  scannedQty: any = 0;
  pageType: any;

  itemBarcode: any = "";
  updateDataTableList: STPLogSyncDetailsModel[] = [];

  qtyList: any[] = [];

  poLine: PurchLineModel = {} as PurchLineModel;
  count: any = -1;
  dataTable: STPLogSyncDetailsModel = {} as STPLogSyncDetailsModel;

  constructor(public dataServ: DataService, public alertController: AlertController, private activateRoute: ActivatedRoute,
    public toastController: ToastController, public axService: AxService, private keyboard: Keyboard,
    public paramService: ParameterService, public loadingController: LoadingController,
    public router: Router, public storageServ: StorageService) {
    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
  }

  ngOnInit() {
    this.getPoLineData();
    //this.getStorageData();
    this.user = this.dataServ.userId
    setTimeout(() => {
      this.keyboard.hide();
    }, 150);
  }

  getStorageData() {
    this.storageServ.getAllValuesFromStorage.subscribe((res) => {

    }, (error) => {

    }, () => {
      if (this.paramService.POSavedHeader != null) {
        this.poLineList = this.paramService.POSavedHeader.PurchLines;
        console.log(this.poLineList);
      }else{
        
      }
    });
  }

  keyboardHide() {
    this.keyboard.hide();
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
    document.getElementById("barcodeInput").focus();
    this.keyboard.hide();
  }


  searchBarcode() {
    if (this.barcode != null && this.barcode.length > 3) {

      this.axService.getItemFromBarcode(this.barcode).subscribe(res => {
        var flag = false;
        var counter = 0;
        var multiLine = 0;
        this.poLineList.forEach(el => {
          counter++;
          if (el.ItemId == res.ItemId && el.UnitId.toLowerCase() == res.Unit.toLowerCase()) {
            this.count++
            el.inputQty = 0;
            //el.qtyReceivedFromServer = el.QtyReceived;
            el.isVisible = true;
            el.toggle = false;
            //el.QtyToReceive = 0;
            flag = true;
            //el.updatableQty = 0;
            //el.balance = el.Qty - el.QtyReceived;
            el.qtyDesc = res.Description;
            el.BarCode = res.BarCode;
            this.poLine = el;
            multiLine++;
          }
        });

        console.log(this.poLine);

        $(document).ready(function () {
          $("#Recinput").focus();
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
    console.log(poLine);
    console.log(this.poLineList)
    this.storageServ.setPOItemList(this.poLineList);
    var sum = 0;
    this.qtyList.forEach(data => {
      sum += data;
    })
    this.scannedQty = sum;
    this.clearBarcode();
  }
  calculateSum() {
    var sum = 0;
    this.qtyList.forEach(el => {
      sum = sum + el;
    })

    return sum;
  }
  
  clearQtyToRec(poLine: PurchLineModel) {
    poLine.inputQty = 0;
  }
  qtyRecCheck(poLine: PurchLineModel) {
    poLine.isSaved = false;
    if (this.pageType == "Receive") {
      if ((poLine.QtyReceived + poLine.inputQty) > poLine.Qty) {
        this.presentToast("Rec item cannot be greater than Qty");
        //poLine.btnDisable = true;
        return false;
      } else {
        poLine.QtyToReceive -= poLine.inputQty;
        poLine.QtyReceived += poLine.inputQty;
        poLine.updatableQty += poLine.inputQty;
        this.qtyList[this.count] = poLine.updatableQty;
        poLine.inputQty = 0;
        return true;
      }
    } else {
      if ((poLine.QtyReceived + poLine.inputQty) > (-poLine.Qty)) {
        this.presentToast("Rec item cannot be greater than Qty");
        //poLine.btnDisable = true;
        return false;
      } else {
        poLine.QtyToReceive -= -poLine.inputQty;
        poLine.QtyReceived += poLine.inputQty;
        poLine.updatableQty += poLine.inputQty;
        this.qtyList[this.count] = poLine.updatableQty;
        poLine.inputQty = 0;
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
  cancelBtn(poLine: PurchLineModel) {
    if (this.pageType == "Receive") {
      poLine.QtyReceived -= poLine.updatableQty;
      poLine.QtyToReceive += poLine.updatableQty;
    } else {
      poLine.QtyReceived -= poLine.updatableQty;
      poLine.QtyToReceive -= poLine.updatableQty;
    }
    poLine.updatableQty = 0;
  }
  showList() {
    if (this.pageType == "Receive") {
      this.dataServ.setPOReceiveList(this.poLineList);
    } else {
      this.dataServ.setPOReturnList(this.poLineList);
    }
    this.router.navigateByUrl('/purchase-list/' + this.pageType);
  }
}
