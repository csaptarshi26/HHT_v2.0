import { Keyboard } from '@ionic-native/keyboard/ngx';
import { AxService } from 'src/app/providers/axService/ax.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/providers/dataService/data.service';
import { ItemModel } from './../../models/STPItem.model';
import { Component, OnInit } from '@angular/core';
import { STPLogSyncDetailsModel } from 'src/app/models/STPLogSyncData.model';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { StorageService } from 'src/app/providers/storageService/storage.service';

@Component({
  selector: 'app-inventory-line',
  templateUrl: './inventory-line.page.html',
  styleUrls: ['./inventory-line.page.scss'],
})
export class InventoryLinePage implements OnInit {

  itemList: ItemModel[] = [];
  updateDataTableList: STPLogSyncDetailsModel[] = [];
  user: any;
  valueUpdated: boolean = false;
  pageType:any;

  constructor(public dataServ: DataService, public toastController: ToastController, public axService: AxService, private keyboard: Keyboard,
    public paramService: ParameterService, public storageService: StorageService, public loadingController: LoadingController,
    public router: Router,private activateRoute: ActivatedRoute,
    public alertController:AlertController) {
      this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
  }
  ngOnInit() {
    this.user = this.dataServ.userId
    //this.getItemsFromStorage()
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
  }

  async saveItem() {
    var lineNum = 1;

    this.itemList.forEach(el => {
      var dataTable = {} as STPLogSyncDetailsModel;
      if (el.isSaved && !el.dataSavedToList && el.quantity > 0) {
        dataTable.BarCode = el.BarCode;
        dataTable.DeviceId = "52545f17-74ca-e75e-3518-990821491968";
        dataTable.DocumentDate = new Date();//this.poHeader.OrderDate;
        dataTable.ItemId = el.ItemId;
        if(this.pageType == "Positive-adj"){
          dataTable.DocumentType = 5;
        }else{
          dataTable.DocumentType = 6;
        }
        dataTable.Quantity = el.quantity;
        dataTable.ItemLocation = this.paramService.Location.LocationId;
        dataTable.UserLocation = this.paramService.Location.LocationId;
        dataTable.LineNum = lineNum;        
        dataTable.TransactionType = 4;
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
            this.router.navigateByUrl('/inventory');  
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
  ngOnDestroy() {
    if (this.valueUpdated) {
      this.storageService.clearInventoryItemList();
    } else {
      this.storageService.setInventoryItemList(this.itemList);
    }
  }

  deleteLine(item: ItemModel) {
    this.presentAlertForCancel(item);
  }

  async presentAlertForCancel(item: ItemModel) {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Are you sure you want to delete this line? `,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            for (var i = 0; i < this.itemList.length; i++) {
              if (this.itemList[i].ItemId == item.ItemId) {
                if (i > -1) {
                  this.itemList.splice(i, 1);
                  console.log("deleted")
                  break;
                }
              }
            }
            // this.itemList.forEach(el => {
            //   if (el.ItemId == item.ItemId) {
            //     var index = this.itemList.indexOf(el);
            //     if (index > -1) {
            //       this.itemList.splice(index, 1);

            //     }
            //   }
            // });
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

}
