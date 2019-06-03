import { AxService } from './../../providers/axService/ax.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from './../../providers/dataService/data.service';
import { Component, OnInit } from '@angular/core';
import { SalesLineModel } from 'src/app/models/STPSalesLine.model';
import { STPLogSyncDetailsModel } from 'src/app/models/STPLogSyncData.model';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { StorageService } from 'src/app/providers/storageService/storage.service';

@Component({
  selector: 'app-sales-list',
  templateUrl: './sales-list.page.html',
  styleUrls: ['./sales-list.page.scss'],
})
export class SalesListPage implements OnInit {


  salesLineList: SalesLineModel[] = [];
  updateDataTableList: STPLogSyncDetailsModel[] = [];
  user: any;
  valueUpdated: boolean = false;
  pageType: any;

  constructor(public dataServ: DataService, public toastController: ToastController, public axService: AxService, private keyboard: Keyboard,
    public paramService: ParameterService, public storageService: StorageService, public loadingController: LoadingController,
    public router: Router, private activateRoute: ActivatedRoute) {
    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
  }

  ngOnInit() {
    this.getsalesLineList();
    this.user = this.dataServ.userId
    //this.getItemsFromStorage()
  }
  getItemsFromStorage() {
    this.storageService.getAllValuesFromStorage.subscribe((res) => {

    }, (error) => {

    }, () => {

    });
  }

  getsalesLineList() {
    this.dataServ.getSOList$.subscribe(res => {
      this.salesLineList = res;
      console.log(this.salesLineList);
    }, error => {

    })
  }

  async saveItem() {
    var lineNum = 1;

    this.salesLineList.forEach(el => {
      var dataTable = {} as STPLogSyncDetailsModel;
      if (el.isSaved && !el.dataSavedToList) {
        dataTable.BarCode = el.BarCode;
        dataTable.DeviceId = "52545f17-74ca-e75e-3518-990821491968";
        dataTable.DocumentDate = new Date();//this.poHeader.OrderDate;
        dataTable.ItemId = el.ItemNumber;
        if (this.pageType == "Sales-Order") {
          dataTable.DocumentType = 1;
        } else {
          dataTable.DocumentType = 2;
        }
        dataTable.ItemLocation = this.paramService.Location.LocationId;
        dataTable.UserLocation = this.paramService.Location.LocationId;
        dataTable.LineNum = lineNum;

        var sum = 0;
        el.updatableQty.forEach(data => {
          sum = sum + data;
        })
        dataTable.Quantity = sum;

        dataTable.TransactionType = 1;
        dataTable.UnitId = el.UnitOfMeasure;
        dataTable.User = this.user;

        el.dataSavedToList = true;
        //el.visible = false;
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
          this.salesLineList = [];
          this.valueUpdated = true;
          console.log(this.salesLineList)

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


  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }
  ngOnDestroy() {
    this.backBtn();
  }
  backBtn() {
    if (this.valueUpdated) {
      this.paramService.soLineUpdated = true;
    } else {
      this.paramService.soLineUpdated = false;
    }
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

}