import { Router, ActivatedRoute } from '@angular/router';
import { AxService } from './../../providers/axService/ax.service';
import { DataService } from './../../providers/dataService/data.service';
import { Component, OnInit } from '@angular/core';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { StorageService } from 'src/app/providers/storageService/storage.service';
import { TransferOrderModel } from 'src/app/models/STPTransferOrder.model';
import { TransferOrderLine } from 'src/app/models/STPTransferOrderLine.Model';
import { STPLogSyncDetailsModel } from 'src/app/models/STPLogSyncData.model';

@Component({
  selector: 'app-transfer-line-list',
  templateUrl: './transfer-line-list.page.html',
  styleUrls: ['./transfer-line-list.page.scss'],
})
export class TransferLineListPage implements OnInit {

  pageType: any;
  toHeader: TransferOrderModel;
  toLineList: TransferOrderLine[] = [];
  user: any;
  toLine: TransferOrderLine = {} as TransferOrderLine;

  scannedQty: any;

  itemBarcode: any = "";
  updateDataTableList: STPLogSyncDetailsModel[] = [];

  dataTable: STPLogSyncDetailsModel = {} as STPLogSyncDetailsModel;

  constructor(public dataServ: DataService, public toastController: ToastController, public axService: AxService,
    public paramService: ParameterService, public storageService: StorageService, public loadingController: LoadingController,
    public router: Router, private activateRoute: ActivatedRoute, public alertController: AlertController) {
    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
  }

  ngOnInit() {
    this.getToLineData();
  }

  getToLineData() {
    if (this.pageType == 'Transfer-out') {
      this.dataServ.getTO$.subscribe(res => {
        this.toHeader = res;
      })

      this.dataServ.getTOList$.subscribe(res => {
        this.toLineList = res;
      })
    } else {
      this.dataServ.getTOIn$.subscribe(res => {
        this.toHeader = res;
      })
      this.dataServ.getTOInList$.subscribe(res => {
        this.toLineList = res;
      })
    }

    this.toLineList.forEach(el => {
      el.inputQty = el.updatableQty;
    })
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
          this.toLineList = [];
          this.presentAlert();
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
    
  }
  recQtyChanged(toLine: TransferOrderLine) {
    toLine.isSaved = false;
  }
  qtyRecCheck(toLine: TransferOrderLine) {
    if (this.pageType == "Transfer-out") {
      if ((toLine.QtyShipped + toLine.inputQty  - toLine.updatableQty) > toLine.Quantity || (toLine.inputQty - toLine.updatableQty) > toLine.QtyToShip) {
        this.presentToast("Rec item cannot be greater than Qty");
        return false;
      } else {
        toLine.QtyToShip = toLine.QtyToShip + toLine.updatableQty - toLine.inputQty;
        toLine.QtyShipped = toLine.QtyShipped - toLine.updatableQty + toLine.inputQty;
        toLine.updatableQty = toLine.inputQty;
        return true;
      }
    } else {
      if ((toLine.QtyReceived + toLine.inputQty - toLine.updatableQty) > toLine.Quantity || (toLine.inputQty - toLine.updatableQty) > toLine.QtyToReceive) {
        this.presentToast("Rec item cannot be greater than Qty");
        return false;
      } else {
        toLine.QtyToReceive = toLine.QtyToReceive + toLine.updatableQty - toLine.inputQty;
        toLine.QtyReceived = toLine.QtyReceived - toLine.updatableQty + toLine.inputQty;
        toLine.updatableQty = toLine.inputQty;
        return true;
      }
    }
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Confirmation!',
      message: 'Line Updated Successfully',
      buttons: [
        {
          text: 'Okay',
          handler: () => {
            this.router.navigateByUrl('/transfer'); 
          }
        }
      ]
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
}
