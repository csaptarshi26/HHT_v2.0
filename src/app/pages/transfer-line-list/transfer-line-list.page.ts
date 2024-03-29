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
import { RoleModel } from 'src/app/models/STPRole.model';
import * as math from 'mathjs';
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
  dataUpdatedToServer: boolean;

  dataTable: STPLogSyncDetailsModel = {} as STPLogSyncDetailsModel;
  toSotrageItemList: any = [];
  role: RoleModel = {} as RoleModel;
  constructor(public dataServ: DataService, public toastController: ToastController, public axService: AxService,
    public paramService: ParameterService, public storageServ: StorageService, public loadingController: LoadingController,
    public router: Router, private activateRoute: ActivatedRoute, public alertController: AlertController) {
    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
  }

  ngOnInit() {
    this.role = this.paramService.userRole;
    this.user = this.paramService.userId;
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
      if (this.toHeader.CountNumber == "1") {
        el.inputQty = el.updatableCount1Qty;
      } else if (this.toHeader.CountNumber == "2") {
        el.inputQty = el.updatableCount2Qty;
      }
    })
  }

  async presentMsg(msg) {
    const alert = await this.alertController.create({
      header: 'Success',
      message: msg,
      buttons: [
        {
          text: 'Okay',
          handler: () => {

          }
        }
      ]
    });

    await alert.present();
  }

  async presentError(msg) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: msg,
      buttons: [
        {
          text: 'Okay',
          handler: () => {

          }
        }
      ]
    });

    await alert.present();
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
        dataTable.DeviceId = this.paramService.deviceID;
        dataTable.DocumentDate = this.toHeader.ReceiveDate;
        dataTable.ItemId = el.ItemNo;
        dataTable.DocumentNum = this.toHeader.JournalId;
        dataTable.CountNumber = this.toHeader.CountNumber;
        if (this.pageType == "Transfer-out") {
          dataTable.DocumentType = 4;
        } else {
          dataTable.DocumentType = 3;
        }
        dataTable.Excessquantity = el.excesQty;
        dataTable.ItemLocation = this.paramService.Location.LocationId;
        dataTable.UserLocation = this.paramService.Location.LocationId;
        dataTable.LineNum = el.LineNo;

        if (this.toHeader.CountNumber == "1") {
          dataTable.Quantity = el.updatableCount1Qty;
        } else if (this.toHeader.CountNumber == "2") {
          dataTable.Quantity = el.updatableCount2Qty;
        }
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
      console.log(this.updateDataTableList);
      this.axService.updateStagingTable(this.updateDataTableList).subscribe(res => {
        if (res) {
          this.updateDataTableList = [];
          this.toLineList = [];
          this.dataUpdatedToServer = true;
          this.presentAlert();
        } else {
          this.presentError("Error Updating Line");
        }
        loading.dismiss();
      }, error => {
        loading.dismiss();
        console.log(error.message);
      })
    } else {
      this.presentError("Line Already Saved");
    }
  }
  clearQtyToRec(toLine: TransferOrderLine) {

  }
  recQtyChanged(toLine: TransferOrderLine) {
    toLine.isSaved = false;
  }
  qtyRecCheck(toLine: TransferOrderLine) {
    var allSpecialChar = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    var format = /[\+\-\*\/]/;
    if (allSpecialChar.test(toLine.inputQty)) {
      if (format.test(toLine.inputQty)) {
        let rs = math.evaluate(toLine.inputQty);
        if (rs.toString().includes("Infinity")) {
          this.presentError("Can't divide by 0");
          toLine.inputQty = 0;
          return false;
        } else if (Number(rs) > 999999) {
          this.presentError("Qty cann't be greater than 999999");
          toLine.inputQty = 0;
          return false;
        } else if (Number(rs) < 0) {
          this.presentError("Qty cann't be greater than 999999");
          toLine.inputQty = 0;
          return false;
        } else {
          toLine.inputQty = Math.floor(rs);
          console.log(toLine.inputQty);
        }
      } else {
        this.presentError("Invalid Expression");
        return false;
      }
    }


    if (this.toHeader.CountNumber == "1") {
      if (this.pageType == "Transfer-out") {
        if ((toLine.QtyShipped + toLine.inputQty - toLine.updatableCount1Qty) > toLine.Quantity ||
          (toLine.inputQty - toLine.updatableCount1Qty) > toLine.QtyToShip) {
          this.presentError("Rec item cannot be greater than Qty");
          return false;
        } else {
          toLine.QtyToShip = toLine.QtyToShip + toLine.updatableCount1Qty - toLine.inputQty;
          toLine.QtyShipped = toLine.QtyShipped - toLine.updatableCount1Qty + toLine.inputQty;
          toLine.updatableCount1Qty = toLine.inputQty;
          return true;
        }
      } else {
        if ((toLine.QtyReceived + toLine.inputQty - toLine.updatableCount1Qty) > toLine.Quantity ||
          (toLine.inputQty - toLine.updatableCount1Qty) > toLine.QtyToReceive) {
          this.presentError("Rec item cannot be greater than Qty");
          return false;
        } else {
          toLine.QtyToReceive = toLine.QtyToReceive + toLine.updatableCount1Qty - toLine.inputQty;
          toLine.QtyReceived = toLine.QtyReceived - toLine.updatableCount1Qty + toLine.inputQty;
          toLine.updatableCount1Qty = toLine.inputQty;
          return true;
        }
      }
    } else if (this.toHeader.CountNumber == "2") {
      if (this.pageType == "Transfer-out") {
        if ((toLine.QtyShipped + toLine.inputQty - toLine.updatableCount2Qty) > toLine.Quantity ||
          (toLine.inputQty - toLine.updatableCount2Qty) > toLine.QtyToShip) {
          this.presentError("Rec item cannot be greater than Qty");
          return false;
        } else {
          toLine.QtyToShip = toLine.QtyToShip + toLine.updatableCount2Qty - toLine.inputQty;
          toLine.QtyShipped = toLine.QtyShipped - toLine.updatableCount2Qty + toLine.inputQty;
          toLine.updatableCount2Qty = toLine.inputQty;
          return true;
        }
      } else {
        if ((toLine.QtyReceived + toLine.inputQty - toLine.updatableCount2Qty) > toLine.Quantity ||
          (toLine.inputQty - toLine.updatableCount2Qty) > toLine.QtyToReceive) {
          this.presentError("Rec item cannot be greater than Qty");
          return false;
        } else {
          toLine.QtyToReceive = toLine.QtyToReceive + toLine.updatableCount2Qty - toLine.inputQty;
          toLine.QtyReceived = toLine.QtyReceived - toLine.updatableCount2Qty + toLine.inputQty;
          toLine.updatableCount2Qty = toLine.inputQty;
          return true;
        }
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
            if (this.toHeader.CountNumber == "1") {
              if (this.pageType == "Transfer-out") {
                toLine.QtyShipped -= toLine.updatableCount1Qty;
                toLine.QtyToShip += toLine.updatableCount1Qty;
              } else {
                toLine.QtyReceived -= toLine.updatableCount1Qty;
                toLine.QtyToReceive += toLine.updatableCount1Qty;
              }
              toLine.updatableCount1Qty = 0;
              toLine.inputQty = 0;
            } else if (this.toHeader.CountNumber == "2") {
              if (this.pageType == "Transfer-out") {
                toLine.QtyShipped -= toLine.updatableCount2Qty;
                toLine.QtyToShip += toLine.updatableCount2Qty;
              } else {
                toLine.QtyReceived -= toLine.updatableCount2Qty;
                toLine.QtyToReceive += toLine.updatableCount2Qty;
              }
              toLine.updatableCount2Qty = 0;
              toLine.inputQty = 0;
            }
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

  ngOnDestroy() {
    this.storageServ.getAllValuesFromStorage.subscribe((res) => {

    }, (error) => {

    }, () => {
      if (this.paramService.TOItemList != null) {
        this.toSotrageItemList = this.paramService.TOItemList;
      } else {
        this.toSotrageItemList = [];
      }

      if (this.dataUpdatedToServer) {
        this.removeElementFromStorageList();
      } else {
        var flag = 0;
        this.toSotrageItemList.forEach(el => {
          if (el.poNo == this.toHeader.JournalId) {
            el.type = this.pageType,
              el.toNo = this.toHeader.JournalId,
              el.toHeader = this.toHeader
            flag = 1;
          }
        });
        if (flag == 0) {
          this.toSotrageItemList.push(
            {
              type: this.pageType,
              toNo: this.toHeader.JournalId,
              toHeader: this.toHeader,
            }
          )
        }
        this.storeDataInStorage();
        this.paramService.TOItemList = this.toSotrageItemList;
      }
    });
  }
  removeElementFromStorageList() {
    if (this.toSotrageItemList != null) {
      //this.toSotrageItemList = this.toSotrageItemList.slice();
      this.toSotrageItemList.forEach(el => {
        if (el.type == this.pageType && el.toNo == this.toHeader.JournalId) {
          var index = this.toSotrageItemList.indexOf(el);
          if (index > -1) {
            this.toSotrageItemList.splice(index, 1);
          }
        }
      })
      this.storeDataInStorage();
      this.paramService.TOItemList = this.toSotrageItemList;
    }
  }

  storeDataInStorage() {
    this.storageServ.setTOItemList(this.toSotrageItemList);
  }

}
