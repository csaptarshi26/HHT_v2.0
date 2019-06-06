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

  constructor(public dataServ: DataService, public toastController: ToastController, public axService: AxService, private keyboard: Keyboard,
    public paramService: ParameterService, public storageService: StorageService, public loadingController: LoadingController,
    public router: Router, private activateRoute: ActivatedRoute, public alertController: AlertController) {
    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
  }

  ngOnInit() {
    this.getsalesLineList();
    this.user = this.dataServ.userId
    //this.getItemsFromStorage()
  }
  ngOnDestroy() {
    if (!this.dataUpdatedToServer) {
      this.storageService.clearSOItemList();
    } else {
      this.storageService.setSOItemList(this.salesLineList);
    }
  }
  getItemsFromStorage() {
    this.storageService.getAllValuesFromStorage.subscribe((res) => {

    }, (error) => {

    }, () => {

    });
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




  }

  async saveItem() {
    var lineNum = 1;

    this.salesLineList.forEach(el => {
      var dataTable = {} as STPLogSyncDetailsModel;
      if (el.isSaved && !el.dataSavedToList) {
        dataTable.BarCode = el.BarCode;
        dataTable.DeviceId = "52545f17-74ca-e75e-3518-990821491968";
        dataTable.DocumentDate = new Date();//this.poHeader.OrderDate;
        dataTable.DocumentNum = el.DocumentNo;
        dataTable.ItemId = el.ItemNumber;
        if (this.pageType == "Sales-Order") {
          dataTable.DocumentType = 1;
        } else {
          dataTable.DocumentType = 2;
        }
        dataTable.ItemLocation = this.paramService.Location.LocationId;
        dataTable.UserLocation = this.paramService.Location.LocationId;
        dataTable.LineNum = lineNum;
        dataTable.Quantity = el.updatableQty;
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
          this.presentToast("Line Updated successfully");
          this.updateDataTableList = [];
          this.salesLineList = [];
          this.dataUpdatedToServer = true;
          this.presentAlert();
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
  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  saveLine(soLine: SalesLineModel) {
    if(soLine.Quantity == 0){
      soLine.isSaved = false;
    }
    if (this.qtyRecCheck(soLine)) {
      soLine.isSaved = true;
    } else {
      soLine.isSaved = false;
    }
    console.log(this.salesLineList);

    this.storageService.setSOItemList(this.salesLineList);
  }
  clearQtyToRec(soLine: SalesLineModel) {
    soLine.inputQty = 0;
  }
  recQtyChanged(soLine: SalesLineModel) {
    soLine.isSaved = false;
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
        //this.qtyList[this.count] = soLine.updatableQty;
        soLine.inputQty = 0;
        return true;
      }
    } else {
      if ((soLine.QtyReceived + soLine.QtyToReceive) > soLine.Quantity) {
        this.presentToast("Rec item cannot be greater than Qty");
        return false;
      } else {
        soLine.QtyToReceive -= soLine.inputQty;
        soLine.QtyReceived += soLine.inputQty;
        soLine.updatableQty += soLine.inputQty;
        //this.qtyList[this.count] = soLine.updatableQty;
        soLine.inputQty = 0;
        return true;
      }
    }
  }
  cancelBtn(soLine: SalesLineModel) {
    soLine.QtyShipped -= soLine.updatableQty;
    soLine.QtyToShip += soLine.updatableQty;
    soLine.updatableQty = 0;
  }

}
