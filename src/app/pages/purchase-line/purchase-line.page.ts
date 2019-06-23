import { StorageService } from './../../providers/storageService/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { AxService } from './../../providers/axService/ax.service';
import { DataService } from './../../providers/dataService/data.service';
import { PurchTableModel } from './../../models/STPPurchTable.model';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PurchLineModel } from 'src/app/models/STPPurchTableLine.model';
import { STPLogSyncDetailsModel } from 'src/app/models/STPLogSyncData.model';
import { ToastController, LoadingController, AlertController, IonInput } from '@ionic/angular';
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


  qtyList: any[] = [];

  poLine: PurchLineModel = {} as PurchLineModel;
  count: any = -1;


  @ViewChild("input") barcodeInput: IonInput;
  @ViewChild("Recinput") qtyInput: IonInput;

  constructor(public dataServ: DataService, public alertController: AlertController, private activateRoute: ActivatedRoute,
    public toastController: ToastController, public axService: AxService, private keyboard: Keyboard,
    public paramService: ParameterService, public loadingController: LoadingController,
    public router: Router, public storageServ: StorageService) {
    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');

  }
  ionViewWillEnter() {
    this.setBarcodeFocus();
  }
  ngOnInit() {
    this.getPoLineData();
    //this.getStorageData();
    this.user = this.dataServ.userId
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
    setTimeout(() => {
      this.barcodeInput.setFocus();
    }, 150);
  }

  setBarcodeFocus() {
    setTimeout(() => {
      this.barcodeInput.setFocus();
    }, 150);
    setTimeout(() => {
      this.keyboard.hide();
    }, 150);
  }

  searchBarcode() {
    if (this.barcode != null && this.barcode.length > 3) {

      this.axService.getItemFromBarcode(this.barcode).subscribe(res => {
        var flag = false;
        var counter = 0;
        if (res.Unit != "" || res.Unit != null) {
          this.poLineList.forEach(el => {
            counter++;
            if (el.ItemId == res.ItemId && el.UnitId.toLowerCase() == res.Unit.toLowerCase()) {
              this.count++
              el.inputQty = 0;
              el.isVisible = true;
              el.toggle = false;
              el.QtyReceivedServer = el.QtyReceived;
              flag = true;
              el.qtyDesc = res.Description;
              el.BarCode = res.BarCode;
              this.poLine = el;
              return;
            }
          });

          console.log(this.poLine);
          if (!flag) {
            this.barcode = "";
            this.setBarcodeFocus();
            this.presentToast("This item barcode not in order list");
          } else {
            setTimeout(() => {
              this.qtyInput.setFocus();
            }, 150);
          }
        } else {
          var multiple = 0;
          var multiPoLineList: PurchLineModel[] = [];
          this.poLineList.forEach(el => {
            counter++;
            if (el.ItemId == res.ItemId) {
              this.count++;
              flag = true;

              el.inputQty = 0;
              // el.isVisible = true;
              el.QtyReceivedServer = el.QtyReceived;

              el.qtyDesc = res.Description;
              el.BarCode = res.BarCode;
              multiPoLineList.push(el);
              // this.poLine = el;
            }
          });

          console.log(this.poLine);
          if (!flag) {
            this.barcode = "";
            this.setBarcodeFocus();
            this.presentToast("This item barcode not in order list");
          } else {
            if (multiPoLineList.length == 1) {
              this.poLine = multiPoLineList.pop();
              this.poLine.isVisible = true;
            } else {
              this.presentAlertRadio(multiPoLineList);
            }

          }
        }

      }, error => {
        this.barcode = "";
        this.setBarcodeFocus();
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
        poLine.QtyReceived += -poLine.inputQty;
        poLine.updatableQty += poLine.inputQty;
        this.qtyList[this.count] = poLine.updatableQty;
        poLine.inputQty = 0;
        return true;
      }
    }
  }
  async presentAlert(poLine: PurchLineModel) {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Are you sure you want to clear the entered data? `,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            if (this.pageType == "Receive") {
              poLine.QtyReceived -= poLine.updatableQty;
              poLine.QtyToReceive += poLine.updatableQty;
            } else {
              poLine.QtyReceived -= -poLine.updatableQty;
              poLine.QtyToReceive -= poLine.updatableQty;
            }
            poLine.updatableQty = 0;
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
  cancelBtn(poLine: PurchLineModel) {
    this.presentAlert(poLine);
  }
  showList() {
    if (this.pageType == "Receive") {
      this.dataServ.setPOReceiveList(this.poLineList);
    } else {
      this.dataServ.setPOReturnList(this.poLineList);
    }
    this.router.navigateByUrl('/purchase-list/' + this.pageType);
  }

  async presentAlertRadio(multiPoLineList: PurchLineModel[]) {
    var inputArr = [];
    multiPoLineList.forEach(el => {
      inputArr.push({
        name: el.UnitId,
        type: 'radio',
        label: el.UnitId,
        value: el
      })
    })
    const alert = await this.alertController.create({
      header: 'Select UOM',
      inputs: inputArr,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data: PurchLineModel) => {
            data.isVisible = true;
            this.poLine = data;
            console.log(data);
            // setTimeout(() => {
            //   this.qtyInput.setFocus();
            // }, 150);
          }
        }
      ]
    });

    await alert.present();
  }
}
