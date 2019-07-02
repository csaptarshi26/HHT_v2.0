import { Keyboard } from '@ionic-native/keyboard/ngx';
import { SalesLineModel } from './../../models/STPSalesLine.model';
import { SalesTable } from './../../models/STPSalesTable.model';
import { AxService } from 'src/app/providers/axService/ax.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/providers/dataService/data.service';
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { STPLogSyncDetailsModel } from 'src/app/models/STPLogSyncData.model';
import { ToastController, AlertController, IonInput, LoadingController } from '@ionic/angular';
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

  @ViewChild("input") barcodeInput: IonInput;
  @ViewChild("Recinput") qtyInput: IonInput;

  constructor(public dataServ: DataService, public axService: AxService, public router: Router,
    public paramService: ParameterService, private activateRoute: ActivatedRoute, private keyboard: Keyboard,
    public toastController: ToastController, public alertController: AlertController,
    public loadingController: LoadingController,  private changeDetectorref: ChangeDetectorRef) {
    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');


    let instance = this;
    (<any>window).plugins.intentShim.registerBroadcastReceiver({
      filterActions: ['com.steeples.hht.ACTION'
        // 'com.zebra.ionicdemo.ACTION',
        // 'com.symbol.datawedge.api.RESULT_ACTION'
      ],
      filterCategories: ['android.intent.category.DEFAULT']
    },
      function (intent) {
        //  Broadcast received
        instance.barcode = "";
        console.log('Received Intent: ' + JSON.stringify(intent.extras));
        instance.barcode = intent.extras['com.symbol.datawedge.data_string'];
        changeDetectorref.detectChanges();
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
            el.isVisible = true;
            this.count++
            el.inputQty = 0;
            el.DocumentNo = this.soHeader.DocumentNo;
            flag = true;
            if (this.pageType == "Sales-Order") {
              el.QtyReceivedServer = el.QtyShipped;
            } else {
              el.QtyReceivedServer = el.QtyReceived;
            }
            el.qtyDesc = res.Description;
            el.BarCode = res.BarCode;

            visibleLine.push(counter);
            this.salesDetails = el;

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
    if (soLine.updatableQty == 0) {
      soLine.isSaved = false;
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
        soLine.updatableQty += soLine.inputQty;
        this.qtyList[this.count] = soLine.updatableQty;
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
        soLine.updatableQty += soLine.inputQty;
        this.qtyList[this.count] = soLine.updatableQty;
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
              soLine.QtyShipped -= soLine.updatableQty;
              soLine.QtyToShip += soLine.updatableQty;
            } else {
              soLine.QtyReceived -= soLine.updatableQty;
              soLine.QtyToReceive += soLine.updatableQty;
            }
            soLine.updatableQty = 0;
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
}
