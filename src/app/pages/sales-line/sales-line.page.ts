import { SalesLineModel } from './../../models/STPSalesLine.model';
import { SalesTable } from './../../models/STPSalesTable.model';
import { AxService } from 'src/app/providers/axService/ax.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/providers/dataService/data.service';
import { Component, OnInit } from '@angular/core';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { STPLogSyncDetailsModel } from 'src/app/models/STPLogSyncData.model';
import { ToastController, AlertController } from '@ionic/angular';
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
  updateDataTableList: STPLogSyncDetailsModel[] = [];

  qtyList: any[] = [];
  count: any = -1;

  dataTable: STPLogSyncDetailsModel = {} as STPLogSyncDetailsModel;
  constructor(public dataServ: DataService, public axService: AxService, public router: Router,
    public paramService: ParameterService, private activateRoute: ActivatedRoute,
    public toastController: ToastController, public alertController: AlertController) {
    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
  }

  ngOnInit() {
    this.user = this.dataServ.userId
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
    document.getElementById("barcodeInput").focus();
    //this.keyboard.hide();
  }

  searchBarcode() {
    var visibleLine = [];

    if (this.barcode != null && this.barcode.length > 3) {
      this.axService.getItemFromBarcode(this.barcode).subscribe(res => {
        var flag = false;
        var counter = 0;
        var multiLine = 0;
        this.soLineList.forEach(el => {
          counter++;
          if (el.ItemNumber == res.ItemId && el.UnitOfMeasure.toLowerCase() == res.Unit.toLowerCase()) {
            el.isVisible = true;
            // el.toggle = false;
            this.count++
            if (this.pageType == "Sales-Order") {
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

            this.salesDetails = el;
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
    if (this.qtyRecCheck(soLine)) {
      this.saveLine(soLine);
    }
  }
  saveLine(soLine: SalesLineModel) {
    soLine.isSaved = true;

    if (this.pageType == "Sales-Order") {
      let sum = 0;
      soLine.updatableQty[this.count] = soLine.QtyToShip;
      soLine.QtyShipped = soLine.QtyShipped + soLine.QtyToShip;
      soLine.QtyToShip = 0;

      this.qtyList[this.count] = soLine.QtyShipped;
      this.scannedQty = this.calculateSum();
    } else {
      let sum = 0;
      soLine.updatableQty[this.count]= soLine.QtyToReceive;
      soLine.QtyReceived = soLine.QtyReceived + soLine.QtyToReceive;
      soLine.QtyToReceive = 0;

      this.qtyList[this.count] = soLine.QtyReceived;
      this.scannedQty = this.calculateSum();
    }

    this.salesLineList.push(soLine);
  }
  calculateSum() {
    var sum = 0;
    this.qtyList.forEach(el => {
      sum = sum + el;
    })

    return sum;
  }
  clearQtyToRec(soLine: SalesLineModel) {
    if (this.pageType == "Sales-Order") {
      soLine.QtyToShip = 0;
    } else {
      soLine.QtyToReceive = 0;
    }
  }
  qtyRecCheck(soLine: SalesLineModel) {
    if (this.pageType == "Sales-Order") {
      if ((soLine.QtyShipped + soLine.QtyToShip) > soLine.Quantity) {
        this.presentToast("Rec item cannot be greater than Qty");
        soLine.btnDisable = true;
        return false;
      } else {
        soLine.balance = soLine.Quantity - (soLine.QtyToShip + soLine.QtyShipped);
        soLine.btnDisable = false;
        return true;
      }
    } else {
      if ((soLine.QtyReceived + soLine.QtyToReceive) > soLine.Quantity) {
        this.presentToast("Rec item cannot be greater than Qty");
        soLine.btnDisable = true;
        return false;
      } else {
        soLine.balance = soLine.Quantity - (soLine.QtyToReceive + soLine.QtyReceived);
        soLine.btnDisable = false;
        return true;
      }
    }
  }

  cancelBtn(soLine: SalesLineModel) {
    if (this.pageType == "Sales-Order") {
      soLine.QtyShipped = soLine.qtyReceivedFromServer;
      soLine.QtyToShip = 0;
      soLine.balance = soLine.Quantity - soLine.qtyReceivedFromServer;
    } else {
      soLine.QtyReceived = soLine.qtyReceivedFromServer;
      soLine.QtyToReceive = 0;
      soLine.balance = soLine.Quantity - soLine.qtyReceivedFromServer;
    }
  }

  showList() {
    this.dataServ.setSOList(this.salesLineList);
    this.router.navigateByUrl('/sales-list/' + this.pageType);
  }
}
