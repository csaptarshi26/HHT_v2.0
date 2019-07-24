import { LoadingController, IonInput, AlertController } from '@ionic/angular';
import { InventLocationLineModel } from './../../models/STPInventLocationLine.model';
import { DataService } from 'src/app/providers/dataService/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AxService } from './../../providers/axService/ax.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { TransferOrderModel } from 'src/app/models/STPTransferOrder.model';
import { StorageService } from 'src/app/providers/storageService/storage.service';
declare var $: any;
@Component({
  selector: 'app-transfer-header',
  templateUrl: './transfer-header.page.html',
  styleUrls: ['./transfer-header.page.scss'],
})
export class TransferHeaderPage implements OnInit {

  pageType: any;
  warehouseList: InventLocationLineModel[] = [];
  currentLoc: InventLocationLineModel = {} as InventLocationLineModel;

  toWarehouse: InventLocationLineModel = {} as InventLocationLineModel;
  fromWarehouse: InventLocationLineModel = {} as InventLocationLineModel;

  transOrderList: TransferOrderModel[] = [];
  selectedTrans: TransferOrderModel = {} as TransferOrderModel;

  toSotrageItemList: any[] = [];
  itemExistsInStorage: boolean;

  constructor(public dataServ: DataService, public axService: AxService,
    public paramService: ParameterService, private activateRoute: ActivatedRoute,
    public router: Router, public loadingController: LoadingController,
    public alertController: AlertController, public storageService: StorageService) {

    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
  }


  ngOnInit() {
   
    $('.ui.dropdown').dropdown({ fullTextSearch: true });
    this.itemExistsInStorage = false;
    this.getItemsFromStorage();
    this.currentLoc = this.paramService.Location;
    this.getWarehouse();

  }
  async fromListSelected() {
    //this.fromWarehouse = warehouse;
    const loading = await this.loadingController.create({
      message: 'Please Wait'
    });
    await loading.present();
    this.axService.readTransferOrders(this.paramService.Location.LocationId, this.fromWarehouse.LocationId).subscribe(res => {
      loading.dismiss();
      this.transOrderList = res;
    }, error => {
      loading.dismiss();
      console.log(error)
    })
  }
  getWarehouse() {
    this.warehouseList = this.paramService.wareHouseList.slice();
    this.warehouseList.forEach(el => {
      if (el.LocationId == this.currentLoc.LocationId) {
        var index = this.warehouseList.indexOf(el);
        if (index > -1) {
          this.warehouseList.splice(index, 1);
        }
      }
    })
  }

  async ToListSelected() {
    const loading = await this.loadingController.create({
      message: 'Please Wait'
    });
    await loading.present();
    this.axService.readTransferOrders(this.toWarehouse.LocationId, this.paramService.Location.LocationId).subscribe(res => {
      console.log(res);
      loading.dismiss();
      this.transOrderList = res;
    }, error => {
      loading.dismiss();
      console.log(error)
    })
  }

  navigateToNext() {
    if (this.pageType == "Transfer-in") {
      this.dataServ.setToIn(this.selectedTrans);
      this.router.navigateByUrl('/transfer-line/' + 'Transfer-in');
    } else {
      this.dataServ.setTO(this.selectedTrans);
      this.router.navigateByUrl('/transfer-line/' + 'Transfer-out');
    }

  }

  async presentAlert(toItem: TransferOrderModel) {
    const alert = await this.alertController.create({
      header: 'Data Exits!',
      message: `There is Unsaved data for this Order Number, 
      Click Continue to proceed with Unsaved data `,
      buttons: [
        {
          text: 'Continue',
          handler: () => {
            this.selectedTrans = toItem;
          }
        },
        {
          text: 'Discard',
          handler: () => {

          }
        }
      ]
    });

    await alert.present();
  }

  toNoSelected() {
    var toItem: TransferOrderModel;
    this.selectedTrans.CountNumber = "1";
    this.getTransferOrderLine();
    if (this.toSotrageItemList != null || this.toSotrageItemList.length != 0) {
      this.toSotrageItemList.forEach(el => {
        if (el.toNo == this.selectedTrans.JournalId && el.type == this.pageType) {
          this.itemExistsInStorage = true;
          toItem = el.toHeader;
        }
      })
      if (this.itemExistsInStorage) {
        this.presentAlert(toItem);
      }
    }
  }

  getItemsFromStorage() {
    this.storageService.getAllValuesFromStorage.subscribe((res) => {

    }, (error) => {

    }, () => {
      if (this.paramService.TOItemList != null) {
        this.toSotrageItemList = this.paramService.TOItemList;
      }
    });
  }

  getTransferOrderLine() {
    this.axService.readTransOrdersLine(this.selectedTrans.JournalId).subscribe(res => {
      this.selectedTrans.JournalLine = res;
      console.log(res);
    }, error => {
      console.log(error)
    })
  }
}
