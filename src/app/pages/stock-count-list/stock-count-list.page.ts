import { Keyboard } from '@ionic-native/keyboard/ngx';
import { AxService } from './../../providers/axService/ax.service';
import { AlertController, ToastController, LoadingController, ModalController, Events } from '@ionic/angular';
import { StorageService } from 'src/app/providers/storageService/storage.service';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ItemModel } from 'src/app/models/STPItem.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataService } from 'src/app/providers/dataService/data.service';
import { STPLogSyncDetailsModel } from 'src/app/models/STPLogSyncData.model';
import { IonInfiniteScroll } from '@ionic/angular';
import * as math from 'mathjs';
declare var $: any;

@Component({
  selector: 'app-stock-count-list',
  templateUrl: './stock-count-list.page.html',
  styleUrls: ['./stock-count-list.page.scss'],
})
export class StockCountListPage implements OnInit {

  itemList: ItemModel[] = [];
  selectedItem: ItemModel = {} as ItemModel;
  updateDataTableList: STPLogSyncDetailsModel[] = [];
  user: any;
  valueUpdated: boolean = false;
  index: any = 0;
  errMsg: any = "";
  countNumber: any;
  pageType: any = "";
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  constructor(public dataServ: DataService, public toastController: ToastController, public axService: AxService, private keyboard: Keyboard,
    public paramService: ParameterService, public storageService: StorageService, public loadingController: LoadingController,
    public router: Router, public alertController: AlertController, public events: Events,
    public modalController: ModalController, private activateRoute: ActivatedRoute) {

    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
  }

  ngOnInit() {
    this.user = this.paramService.userId
    //this.getItemsFromStorage()
    this.getItemList();
  }
  trackByFn(index, item) {
    return index; // or item.id
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
      console.log(this.itemList)
    }, error => {

    })
    this.dataServ.getStockCountNumber$.subscribe(res => {
      this.countNumber = res;
    }, error => {

    })

  }
  qtyCheck(item: ItemModel) {
    if (item.quantity > 999999) {
      this.errMsg = "Qty cann't be greater than 999999";
      //this.presentToast("Qty cann't be greater than 999999");
      return false;
    } else if (!item.quantity || item.quantity < 0) {
      this.errMsg = "Qty cann't be blank";
      //this.presentToast("Qty cann't be blank");
      return false;
    } else if (item.quantity < 0) {
      this.errMsg = "Qty cann't be in negetive";
      //this.presentToast("Qty cann't be in negetive");
      return false;
    }
    else {
      var allSpecialChar = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
      var format = /[\+\-\*\/]/;
      if (allSpecialChar.test(item.quantity)) {
        if (format.test(item.quantity)) {
          let rs = math.evaluate(item.quantity);
          if (rs.toString().includes("Infinity")) {
            this.errMsg = "Can't divide by 0";
            item.quantity = 0;
            return;
          } else if (Number(rs) > 999999) {
            this.errMsg="Qty cann't be greater than 999999";
            item.quantity = 0;
            return false;
          } else if (Number(rs) < 0) {
            this.errMsg = "Qty cann't be greater than 999999";
            item.quantity = 0;
            return false;
          } else {
            item.quantity = Math.floor(rs);
            console.log(item.quantity);
            return true;
          }
        } else {
          this.errMsg = "Invalid Expression";
          return false;
        }
      }
    }
  }

    async presentAlert(msg) {
      const alert = await this.alertController.create({
        header: 'Error!',
        message: msg,
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


    async saveItem() {
      var lineNum = 1;

      this.itemList.forEach(el => {
        var dataTable = {} as STPLogSyncDetailsModel;
        if (el.isSaved && !el.dataSavedToList) {
          dataTable.BarCode = el.BarCode;
          dataTable.DeviceId = this.paramService.deviceID;
          dataTable.DocumentDate = new Date();//this.poHeader.OrderDate;
          dataTable.ItemId = el.ItemId;
          
          dataTable.ItemLocation = this.paramService.Location.LocationId;
          dataTable.UserLocation = this.paramService.Location.LocationId;
          dataTable.LineNum = lineNum;
          dataTable.CountNumber = el.CountNumber;
          dataTable.zone = el.zone.ZoneId;
          if (el.quantity == 0 || el.quantity < 0 || el.quantity == "") {
            this.presentAlert("Qty can't be blank");
            return false;
          }
          if (this.pageType == "out") {
            dataTable.Quantity = - el.quantity;
            dataTable.DocumentType = 14;
          } else {
            dataTable.Quantity = el.quantity;
            dataTable.DocumentType = 15;
          }

          dataTable.TransactionType = 5;
          dataTable.UnitId = el.Unit;
          dataTable.User = this.user;

          el.dataSavedToList = true;
          el.visible = false;
          this.updateDataTableList.push(dataTable)
        }
      })
      console.log(this.updateDataTableList);
      if (this.updateDataTableList.length > 0) {
        const loading = await this.loadingController.create({
          message: 'Please Wait'
        });
        await loading.present();
        this.axService.updateStagingTable(this.updateDataTableList).subscribe(res => {
          if (res) {
            this.presentToast("Line Updated successfully");
            this.updateDataTableList = [];
            this.itemList.splice(0);
            this.valueUpdated = true;
            this.storageService.clearItemList();
            this.router.navigateByUrl('/home');

          } else {
            this.presentToast("Error Updating Line");
          }
          loading.dismiss();
        }, error => {
          loading.dismiss();
          this.presentToast("Connection Error");
          console.log(error.message);
        })
      } else {
        this.presentToast("Line Already Saved");
      }
    }


    async presentToast(msg) {
      const toast = await this.toastController.create({
        message: msg,
        duration: 2000,
        position: 'top'
      });
      toast.present();
    }
    ngOnDestroy() {
      if (this.valueUpdated) {
        this.paramService.itemUpdated = true;
      } else {
        this.paramService.itemUpdated = false;
        //this.storageService.setItemList(this.itemList);
      }

    }

    deleteLine(item: ItemModel, i) {
      this.presentAlertForCancel(item, i);
    }

    async presentAlertForCancel(item: ItemModel, i) {
      const alert = await this.alertController.create({
        header: 'Confirmation',
        message: `Are you sure you want to delete this line? `,
        buttons: [
          {
            text: 'Yes',
            handler: () => {
              this.itemList.splice(i, 1);
              this.itemList = [...this.itemList];
              this.paramService.itemChanged = true;
              //this.storageService.setItemList(this.itemList);
              this.dataServ.setitemListFromSCList(this.itemList);
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

    presentAlertForItem(item: ItemModel) {
      //document.getElementById('id01').style.display = 'block'
      this.selectedItem = item;
      let self = this;
      //$('.ui.modal').modal('show');
      $('.ui.modal').modal({
        onHide: function () {
          return self.qtyCheck(item);
        }
      }).modal('show');
    }
    onEnter(item: ItemModel) {
      if (this.qtyCheck(item)) {
        $('.ui.modal').modal('hide');
      }
    }

  }
