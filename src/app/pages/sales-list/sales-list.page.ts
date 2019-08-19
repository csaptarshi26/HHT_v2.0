import { AxService } from './../../providers/axService/ax.service';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from './../../providers/dataService/data.service';
import { Component, OnInit } from '@angular/core';
import { SalesLineModel } from 'src/app/models/STPSalesLine.model';
import { STPLogSyncDetailsModel } from 'src/app/models/STPLogSyncData.model';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { StorageService } from 'src/app/providers/storageService/storage.service';
import { SalesTable } from 'src/app/models/STPSalesTable.model';
import { RoleModel } from 'src/app/models/STPRole.model';
@Component({
  selector: 'app-sales-list',
  templateUrl: './sales-list.page.html',
  styleUrls: ['./sales-list.page.scss'],
})
export class SalesListPage implements OnInit {

  soHeader: SalesTable;
  salesLineList: SalesLineModel[] = [];
  updateDataTableList: STPLogSyncDetailsModel[] = [];
  user: any;
  dataUpdatedToServer: boolean = false;
  pageType: any;

  soItemSotrageList: any = [];
  role: RoleModel = {} as RoleModel;
  constructor(public dataServ: DataService, public toastController: ToastController, public axService: AxService, private keyboard: Keyboard,
    public paramService: ParameterService, public storageService: StorageService, public loadingController: LoadingController,
    public router: Router, private activateRoute: ActivatedRoute, public alertController: AlertController) {
    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
  }

  ngOnInit() {
    this.role = this.paramService.userRole;
    this.getsalesLineList();
    this.user = this.paramService.userId
    //this.getItemsFromStorage()
  }
  ngOnDestroy() {

    this.storageService.getAllValuesFromStorage.subscribe((res) => {

    }, (error) => {

    }, () => {
      if (this.paramService.SOItemList != null) {
        this.soItemSotrageList = this.paramService.SOItemList;
      } else {
        this.soItemSotrageList = [];
      }

      if (this.dataUpdatedToServer) {
        this.removeElementFromStorageList();
      } else {
        var flag = 0;
        this.soItemSotrageList.forEach(el => {
          if (el.poNo == this.soHeader.DocumentNo) {
            el.type = this.pageType;
            el.soNo = this.soHeader.DocumentNo;
            el.soHeader = this.soHeader;
            flag = 1;
          }
        });
        if (flag == 0) {
          this.soItemSotrageList.push(
            {
              type: this.pageType,
              soNo: this.soHeader.DocumentNo,
              soHeader: this.soHeader,
            }
          )
        }
        this.storeDataInStorage();
        this.paramService.SOItemList = this.soItemSotrageList;
      }
    });
  }
  removeElementFromStorageList() {
    if (this.soItemSotrageList != null) {
      //this.soItemSotrageList = this.soItemSotrageList.slice();
      this.soItemSotrageList.forEach(el => {
        if (el.type == this.pageType && el.soNo == this.soHeader.DocumentNo) {
          var index = this.soItemSotrageList.indexOf(el);
          if (index > -1) {
            this.soItemSotrageList.splice(index, 1);
          }
        }
      })
      this.storeDataInStorage();
      this.paramService.SOItemList = this.soItemSotrageList;
    }
  }

  storeDataInStorage() {
    this.storageService.setSOItemList(this.soItemSotrageList);
  }

  getsalesLineList() {
    if (this.pageType == 'Sales-Order') {
      this.dataServ.getSO$.subscribe(res => {
        this.soHeader = res;
        console.log(this.soHeader)
      })

      this.dataServ.getSOList$.subscribe(res => {
        this.salesLineList = res;
        console.log(this.salesLineList);
      }, error => {

      })
    } else {
      this.dataServ.getSOReturn$.subscribe(res => {
        this.soHeader = res;
        console.log(this.soHeader)
      })
      this.dataServ.getSOReturnList$.subscribe(res => {
        this.salesLineList = res;
        console.log(this.salesLineList);
      }, error => {

      })
    }

    this.salesLineList.forEach(el => {

      if (this.soHeader.CountNumber == "1") {
        el.inputQty = el.updatableCount1Qty;
      } else if (this.soHeader.CountNumber == "2") {
        el.inputQty = el.updatableCount2Qty;
      }
    })
  }

  async saveItem() {
    var lineNum = 1;

    this.salesLineList.forEach(el => {
      var dataTable = {} as STPLogSyncDetailsModel;
      if (el.isSaved && !el.dataSavedToList) {
        dataTable.BarCode = el.BarCode;
        dataTable.DeviceId = this.paramService.deviceID;
        dataTable.DocumentDate = new Date();//this.poHeader.OrderDate;
        dataTable.DocumentNum = el.DocumentNo;
        dataTable.ItemId = el.ItemNumber;
        dataTable.CountNumber = this.soHeader.CountNumber;
        if (this.pageType == "Sales-Order") {
          dataTable.DocumentType = 1;
        } else {
          dataTable.DocumentType = 2;
        }
        dataTable.ItemLocation = this.paramService.Location.LocationId;
        dataTable.UserLocation = this.paramService.Location.LocationId;
        dataTable.LineNum = lineNum;
        if (this.soHeader.CountNumber == "1") {
          dataTable.Quantity = el.updatableCount1Qty;
        } else if (this.soHeader.CountNumber == "2") {
          dataTable.Quantity = el.updatableCount2Qty;
        }
        dataTable.TransactionType = 1;
        dataTable.UnitId = el.UnitOfMeasure;
        dataTable.User = this.user;

        el.dataSavedToList = true;
        //el.visible = false;
        lineNum++;
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
          //this.presentError("Line Updated successfully");
          this.updateDataTableList = [];
          this.salesLineList = [];
          this.dataUpdatedToServer = true;
          this.presentAlert();
          console.log(this.salesLineList)

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

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Confirmation!',
      message: 'Line Updated Successfully',
      buttons: [
        {
          text: 'Okay',
          handler: () => {
            this.router.navigateByUrl('/sales');
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

  saveLine(soLine: SalesLineModel) {
    if (soLine.Quantity == 0) {
      soLine.isSaved = false;
    }
    if (this.qtyRecCheck(soLine)) {
      soLine.isSaved = true;
    } else {
      soLine.isSaved = false;
    }

    console.log(this.salesLineList);

    // this.storageService.setSOItemList(this.soHeader);
  }
  clearQtyToRec(soLine: SalesLineModel) {

  }
  recQtyChanged(soLine: SalesLineModel) {
    soLine.isSaved = false;
  }
  qtyRecCheck(soLine: SalesLineModel) {
    if (this.pageType == "Sales-Order") {
      if (this.soHeader.CountNumber == "1") {
        if ((soLine.QtyShipped + soLine.inputQty - soLine.updatableCount1Qty) > soLine.Quantity) {
          this.presentError("Rec item cannot be greater than Qty");
          return false;
        } else {
          soLine.QtyToShip = soLine.QtyToShip + soLine.updatableCount1Qty - soLine.inputQty;
          soLine.QtyShipped = soLine.QtyShipped - soLine.updatableCount1Qty + soLine.inputQty;
          soLine.updatableCount1Qty = soLine.inputQty;
          //this.qtyList[this.count] = soLine.updatableQty;
          return true;
        }
      } else if (this.soHeader.CountNumber == "2") {
        if ((soLine.QtyShipped + soLine.inputQty - soLine.updatableCount2Qty) > soLine.Quantity) {
          this.presentError("Rec item cannot be greater than Qty");
          return false;
        } else {
          soLine.QtyToShip = soLine.QtyToShip + soLine.updatableCount2Qty - soLine.inputQty;
          soLine.QtyShipped = soLine.QtyShipped - soLine.updatableCount2Qty + soLine.inputQty;
          soLine.updatableCount2Qty = soLine.inputQty;
          //this.qtyList[this.count] = soLine.updatableQty;
          return true;
        }
      }

    } else {
      if (this.soHeader.CountNumber == "1") {
        if ((soLine.QtyReceived + soLine.inputQty - soLine.updatableCount1Qty) > soLine.Quantity) {
          this.presentError("Rec item cannot be greater than Qty");
          return false;
        } else {
          soLine.QtyToReceive = soLine.QtyToReceive + soLine.updatableCount1Qty - soLine.inputQty;
          soLine.QtyReceived = soLine.QtyReceived - soLine.updatableCount1Qty + soLine.inputQty;
          soLine.updatableCount1Qty = soLine.inputQty;
          //this.qtyList[this.count] = soLine.updatableQty;
          return true;
        }
      } else if (this.soHeader.CountNumber == "2") {
        if ((soLine.QtyReceived + soLine.inputQty - soLine.updatableCount2Qty) > soLine.Quantity) {
          this.presentError("Rec item cannot be greater than Qty");
          return false;
        } else {
          soLine.QtyToReceive = soLine.QtyToReceive + soLine.updatableCount2Qty - soLine.inputQty;
          soLine.QtyReceived = soLine.QtyReceived - soLine.updatableCount2Qty + soLine.inputQty;
          soLine.updatableCount2Qty = soLine.inputQty;
          //this.qtyList[this.count] = soLine.updatableQty;
          return true;
        }
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
              if (this.soHeader.CountNumber == "1") {
                soLine.QtyShipped -= soLine.updatableCount1Qty;
                soLine.QtyToShip += soLine.updatableCount1Qty;
              } else if (this.soHeader.CountNumber == "2") {
                soLine.QtyShipped -= soLine.updatableCount2Qty;
                soLine.QtyToShip += soLine.updatableCount2Qty;
              }

            } else {
              if (this.soHeader.CountNumber == "1") {
                soLine.QtyReceived -= soLine.updatableCount1Qty;
                soLine.QtyToReceive += soLine.updatableCount1Qty;
              } else if (this.soHeader.CountNumber == "2") {
                soLine.QtyReceived -= soLine.updatableCount2Qty;
                soLine.QtyToReceive += soLine.updatableCount2Qty;
              }

            }
            if (this.soHeader.CountNumber == "1") {
              soLine.updatableCount1Qty = 0;
            } else if (this.soHeader.CountNumber == "2") {
              soLine.updatableCount2Qty = 0;
            }

            soLine.inputQty = 0;
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

  valueChanged(soLine: SalesLineModel) {
    soLine.isSaved = false;
  }
}
