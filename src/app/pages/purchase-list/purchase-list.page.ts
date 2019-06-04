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

  constructor(public dataServ: DataService, private activateRoute: ActivatedRoute,
    public toastController: ToastController, public axService: AxService,
    public paramService: ParameterService, public loadingController: LoadingController,
    public router: Router, public storageServ: StorageService, public alertController: AlertController) {
    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
  }

  ngOnInit() {
    this.getPoLineData();
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
  }


  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
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

        if (this.pageType == "Receive") {
          dataTable.Quantity = el.updatableQty;
        } else {
          dataTable.Quantity = -el.updatableQty;
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
      this.axService.updateStagingTable(this.updateDataTableList).subscribe(res => {
        if (res) {
          this.updateDataTableList = [];
          this.poLineList = [];
          this.dataUpdatedToServer = true;
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
    if (!this.dataUpdatedToServer) {
      this.storageServ.clearPoItemList();
    } else {
      this.storageServ.setPOItemList(this.poLineList);
    }
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
    //console.log(this.qtyList)

    // var sum = 0;
    // this.qtyList.forEach(data => {
    //   sum += data;
    // })
    // this.scannedQty = sum;
    this.storageServ.setPOItemList(this.poLineList);
  }

  clearQtyToRec(poLine: PurchLineModel) {
    poLine.inputQty = 0;
  }
  qtyRecCheck(poLine: PurchLineModel) {
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
        poLine.QtyToReceive -= poLine.inputQty;
        poLine.QtyReceived += poLine.inputQty;
        poLine.updatableQty += poLine.inputQty;
        this.qtyList[this.count] = poLine.updatableQty;
        poLine.inputQty = 0;
        return true;
      }
    }
  }
  cancelBtn(poLine: PurchLineModel) {
    if (this.pageType == "Receive") {
      poLine.QtyReceived -= poLine.updatableQty;
      poLine.QtyToReceive += poLine.updatableQty;
    } else {
      poLine.QtyReceived -= poLine.updatableQty;
      poLine.QtyToReceive += poLine.updatableQty;
    }
    poLine.updatableQty = 0;
  }
}
