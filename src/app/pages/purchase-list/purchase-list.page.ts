import { StorageService } from 'src/app/providers/storageService/storage.service';
import { AxService } from 'src/app/providers/axService/ax.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from './../../providers/dataService/data.service';
import { Component, OnInit } from '@angular/core';
import { STPLogSyncDetailsModel } from 'src/app/models/STPLogSyncData.model';
import { PurchLineModel } from 'src/app/models/STPPurchTableLine.model';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { PurchTableModel } from 'src/app/models/STPPurchTable.model';
import { RoleModel } from 'src/app/models/STPRole.model';
import * as math from 'mathjs';

@Component({
  selector: 'app-purchase-list',
  templateUrl: './purchase-list.page.html',
  styleUrls: ['./purchase-list.page.scss'],
})
export class PurchaseListPage implements OnInit {

  poLineList: PurchLineModel[] = [];
  poHeader: PurchTableModel;
  user: any;
  pageType: any;

  dataUpdatedToServer: boolean;

  updateDataTableList: STPLogSyncDetailsModel[] = [];

  qtyList: any[] = [];

  poLine: PurchLineModel = {} as PurchLineModel;
  count: any = -1;
  dataTable: STPLogSyncDetailsModel = {} as STPLogSyncDetailsModel;

  poItemSotrageList: any = [];
  role: RoleModel = {} as RoleModel;

  constructor(public dataServ: DataService, private activateRoute: ActivatedRoute,
    public toastController: ToastController, public axService: AxService,
    public paramService: ParameterService, public loadingController: LoadingController,
    public router: Router, public storageServ: StorageService, public alertController: AlertController) {
    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
  }

  ngOnInit() {
    this.role = this.paramService.userRole;
    this.user = this.paramService.userId;
    console.log(this.user)
    this.getPoLineData();
  }

  ionViewWillEnter() {
    this.dataUpdatedToServer = false;
  }
  getPoLineData() {
    if (this.pageType == "Receive") {
      this.dataServ.getPOReceiveList$.subscribe(res => {
        this.poLineList = res;
        console.log(res);
      })
      this.dataServ.getPO$.subscribe(res => {
        this.poHeader = res;
      })
    } else {
      this.dataServ.getPOReturnList$.subscribe(res => {
        this.poLineList = res;
      })
      this.dataServ.getReturnPO$.subscribe(res => {
        this.poHeader = res;
      })
    }

    this.poLineList.forEach(el => {
      if (this.poHeader.CountNumber == "1") {
        el.inputQty = el.updatableCount1Qty;
      } else if (this.poHeader.CountNumber == "2") {
        el.inputQty = el.updatableCount2Qty;
      }

    })
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

  async savePO() {
    console.log(this.poLineList)
    this.poLineList.forEach(el => {
      var dataTable = {} as STPLogSyncDetailsModel;
      if (el.isSaved && !el.dataSavedToList) {
        dataTable.BarCode = el.BarCode;
        dataTable.DeviceId = this.paramService.deviceID;// this.paramService.deviceID;
        dataTable.DocumentDate = this.poHeader.OrderDate;
        dataTable.ItemId = el.ItemId;
        dataTable.DocumentNum = this.poHeader.PurchId;
        dataTable.ItemLocation = this.paramService.Location.LocationId;
        dataTable.UserLocation = this.paramService.Location.LocationId;
        dataTable.InvoiceId = this.poHeader.InvoiceId;
        dataTable.LineNum = el.LineNo;
        dataTable.InvoiceDate = this.poHeader.InvoiceDate;
        dataTable.CountNumber = this.poHeader.CountNumber;
        if (this.pageType == "Receive") {
          dataTable.DocumentType = 1;
        } else {
          dataTable.DocumentType = 2;
        }
        if (this.poHeader.CountNumber == "1") {
          dataTable.Quantity = el.updatableCount1Qty;
        } else if (this.poHeader.CountNumber == "2") {
          dataTable.Quantity = el.updatableCount2Qty;
        }
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
      console.log(this.updateDataTableList);
      try {
        this.axService.updateStagingTable(this.updateDataTableList).subscribe(res => {
          if (res) {
            this.updateDataTableList = [];
            this.poLineList = [];
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
      } catch (e) {

      }

    } else {
      this.presentError("Line Already Saved");
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
            this.router.navigateByUrl('/purchase');
          }
        }
      ]
    });

    await alert.present();
  }
  ngOnDestroy() {
    this.storageServ.getAllValuesFromStorage.subscribe((res) => {

    }, (error) => {

    }, () => {
      if (this.paramService.POItemList != null) {
        this.poItemSotrageList = this.paramService.POItemList;
      } else {
        this.poItemSotrageList = [];
      }

      if (this.dataUpdatedToServer) {
        this.removeElementFromStorageList();
      } else {
        var flag = 0;
        this.poItemSotrageList.forEach(el => {
          if (el.poNo == this.poHeader.PurchId) {
            el.type = this.pageType;
            el.poNo = this.poHeader.PurchId;
            el.poHeader = this.poHeader;
            flag = 1;
          }
        });
        if (flag == 0) {
          this.poItemSotrageList.push(
            {
              type: this.pageType,
              poNo: this.poHeader.PurchId,
              poHeader: this.poHeader
            }
          )
        }
        this.storeDataInStorage();
        this.paramService.POItemList = this.poItemSotrageList;
      }
    });
  }
  removeElementFromStorageList() {
    if (this.poItemSotrageList != null) {
      //this.poItemSotrageList = this.poItemSotrageList.slice();
      this.poItemSotrageList.forEach(el => {
        if (el.type == this.pageType && el.poNo == this.poHeader.PurchId) {
          var index = this.poItemSotrageList.indexOf(el);
          if (index > -1) {
            this.poItemSotrageList.splice(index, 1);
          }
        }
      })
      this.storeDataInStorage();
      this.paramService.POItemList = this.poItemSotrageList;
    }
  }

  storeDataInStorage() {
    this.storageServ.setPOItemList(this.poItemSotrageList);
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
    console.log(this.poLineList);


  }

  clearQtyToRec(poLine: PurchLineModel) {

  }
  qtyRecCheck(poLine: PurchLineModel) {
    poLine.isSaved = false;

    var allSpecialChar = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    var format = /[\+\-\*\/]/;
    if (allSpecialChar.test(poLine.inputQty)) {
      if (format.test(poLine.inputQty)) {
        let rs = math.evaluate(poLine.inputQty);
        if (rs.toString().includes("Infinity")) {
          this.presentError("Can't divide by 0");
          poLine.inputQty = 0;
          return false;
        } else if (Number(rs) > 999999) {
          this.presentError("Qty cann't be greater than 999999");
          poLine.inputQty = 0;
          return false;
        } else if (Number(rs) < 0) {
          this.presentError("Qty cann't be greater than 999999");
          poLine.inputQty = 0;
          return false;
        } else {
          poLine.inputQty = Math.floor(rs);
          console.log(poLine.inputQty);
        }
      } else {
        this.presentError("Invalid Expression");
        return false;
      }
    }


    if (this.pageType == "Receive") {
      if (this.poHeader.CountNumber == "1") {
        if ((poLine.QtyReceived + poLine.inputQty - poLine.updatableCount1Qty) > poLine.Qty) {
          this.presentError("Rec item cannot be greater than Qty");
          //poLine.btnDisable = true;
          return false;
        } else {
          poLine.QtyToReceive = poLine.QtyToReceive + poLine.updatableCount1Qty - poLine.inputQty;
          poLine.QtyReceived = poLine.QtyReceived - poLine.updatableCount1Qty + poLine.inputQty;
          poLine.updatableCount1Qty = poLine.inputQty;
          this.qtyList[this.count] = poLine.updatableCount1Qty;
          return true;
        }
      } else if (this.poHeader.CountNumber == "2") {
        if ((poLine.QtyReceived + poLine.inputQty - poLine.updatableCount2Qty) > poLine.Qty) {
          this.presentError("Rec item cannot be greater than Qty");
          //poLine.btnDisable = true;
          return false;
        } else {
          poLine.QtyToReceive = poLine.QtyToReceive + poLine.updatableCount2Qty - poLine.inputQty;
          poLine.QtyReceived = poLine.QtyReceived - poLine.updatableCount2Qty + poLine.inputQty;
          poLine.updatableCount2Qty = poLine.inputQty;
          this.qtyList[this.count] = poLine.updatableCount2Qty;
          return true;
        }
      }

    } else {
      if (this.poHeader.CountNumber == "1") {
        if ((this.mod(poLine.QtyReceived) + this.mod(poLine.inputQty)) > this.mod((poLine.Qty))) {
          this.presentError("Rec item cannot be greater than Qty");
          //poLine.btnDisable = true;
          return false;
        } else {
          poLine.QtyToReceive = poLine.QtyToReceive - poLine.updatableCount1Qty + poLine.inputQty;
          poLine.QtyReceived = poLine.QtyReceived + poLine.updatableCount1Qty - poLine.inputQty;
          poLine.updatableCount1Qty = poLine.inputQty;
          this.qtyList[this.count] = poLine.updatableCount1Qty;
          return true;
        }
      } else if (this.poHeader.CountNumber == "2") {
        if ((this.mod(poLine.QtyReceived) + this.mod(poLine.inputQty)) > this.mod((poLine.Qty))) {
          this.presentError("Rec item cannot be greater than Qty");
          //poLine.btnDisable = true;
          return false;
        } else {
          poLine.QtyToReceive = poLine.QtyToReceive - poLine.updatableCount2Qty + poLine.inputQty;
          poLine.QtyReceived = poLine.QtyReceived + poLine.updatableCount2Qty - poLine.inputQty;
          poLine.updatableCount2Qty = poLine.inputQty;
          this.qtyList[this.count] = poLine.updatableCount2Qty;
          return true;
        }
      }

    }
  }
  async presentAlertForCancel(poLine: PurchLineModel) {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Are you sure you want to clear the entered data? `,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            if (this.pageType == "Receive") {
              if (this.poHeader.CountNumber == "1") {
                poLine.QtyReceived -= Number(poLine.updatableCount1Qty);
                poLine.QtyToReceive += Number(poLine.updatableCount1Qty);
              } else if (this.poHeader.CountNumber == "2") {
                poLine.QtyReceived -= Number(poLine.updatableCount2Qty);
                poLine.QtyToReceive += Number(poLine.updatableCount2Qty);
              }
            } else {
              if (this.poHeader.CountNumber == "1") {
                poLine.QtyReceived -= Number(-poLine.updatableCount1Qty);
                poLine.QtyToReceive -= Number(poLine.updatableCount1Qty);
              } else if (this.poHeader.CountNumber == "2") {
                poLine.QtyReceived -= Number(-poLine.updatableCount1Qty);
                poLine.QtyToReceive -= Number(poLine.updatableCount1Qty);
              }
            }
            if (this.poHeader.CountNumber == "1") {
              poLine.updatableCount1Qty = 0;
            } else if (this.poHeader.CountNumber == "2") {
              poLine.updatableCount2Qty = 0;
            }
            poLine.inputQty = 0;
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
    this.presentAlertForCancel(poLine);
  }
  valueChanged(poLine: PurchLineModel) {
    poLine.isSaved = false;
  }
  mod(n: any) {
    if (n == 0) return 0;
    else if (n > 0) return n;
    else return -n;
  }
}
