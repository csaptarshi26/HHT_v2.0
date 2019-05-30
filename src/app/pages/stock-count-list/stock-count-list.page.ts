import { Keyboard } from '@ionic-native/keyboard/ngx';
import { AxService } from './../../providers/axService/ax.service';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { StorageService } from 'src/app/providers/storageService/storage.service';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ItemModel } from 'src/app/models/STPItem.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataService } from 'src/app/providers/dataService/data.service';
import { STPLogSyncDetailsModel } from 'src/app/models/STPLogSyncData.model';


@Component({
  selector: 'app-stock-count-list',
  templateUrl: './stock-count-list.page.html',
  styleUrls: ['./stock-count-list.page.scss'],
})
export class StockCountListPage implements OnInit {

  itemList: ItemModel[] = [];
  updateDataTableList: STPLogSyncDetailsModel[] = [];
  user: any;
  valueUpdated: boolean = false;

  constructor(public dataServ: DataService, public toastController: ToastController, public axService: AxService, private keyboard: Keyboard,
    public paramService: ParameterService, public storageService: StorageService, public loadingController: LoadingController,
    public router: Router) {
  }

  ngOnInit() {
    this.user = this.dataServ.userId
    this.getItemsFromStorage()
    this.getItemList();
  }
  getItemsFromStorage() {
    this.storageService.getAllValuesFromStorage.subscribe((res) => {

    }, (error) => {

    }, () => {

    });
  }

  getItemList() {
    this.dataServ.getItemList$.subscribe(res => {
      this.itemList = res;
      console.log(this.itemList);
    }, error => {

    })
    if (this.itemList.length == 0) {
      this.itemList = this.paramService.ItemList;
    }
  }

  async saveItem() {
    var lineNum = 1;

    this.itemList.forEach(el => {
      var dataTable = {} as STPLogSyncDetailsModel;
      if (el.isSaved && !el.dataSavedToList) {
        dataTable.BarCode = el.BarCode;
        dataTable.DeviceId = "52545f17-74ca-e75e-3518-990821491968";
        dataTable.DocumentDate = new Date();//this.poHeader.OrderDate;
        dataTable.ItemId = el.ItemId;
        dataTable.DocumentType = 7;
        dataTable.ItemLocation = this.paramService.Location.LocationId;
        dataTable.UserLocation = this.paramService.Location.LocationId;
        dataTable.LineNum = lineNum;

        dataTable.Quantity = el.quantity;
        dataTable.TransactionType = 5;
        dataTable.UnitId = el.Unit;
        dataTable.User = this.user;

        el.dataSavedToList = true;
        el.visible = false;
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
          this.itemList = [];
          this.valueUpdated = true;
          this.storageService.clearItemList();
          console.log(this.itemList)

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

  backBtn() {
    if (this.valueUpdated) {
      this.paramService.itemUpdated = true;
    } else {
      this.paramService.itemUpdated = false;
    }
  }
}
