import { InventLocationLineModel } from './../../models/STPInventLocationLine.model';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { TransferOrderModel } from './../../models/STPTransferOrder.model';
import { ParameterService } from './../../providers/parameterService/parameter.service';
import { STPLogSyncDetailsModel } from './../../models/STPLogSyncData.model';
import { AxService } from 'src/app/providers/axService/ax.service';
import { DataService } from 'src/app/providers/dataService/data.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Component, OnInit, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ToastController, IonInput, AlertController, LoadingController } from '@ionic/angular';
import { TransferOrderLine } from 'src/app/models/STPTransferOrderLine.Model';
import { ItemModel } from 'src/app/models/STPItem.model';
import { StorageService } from 'src/app/providers/storageService/storage.service';
declare var $: any;
@Component({
  selector: 'app-stock-count',
  templateUrl: './stock-count.page.html',
  styleUrls: ['./stock-count.page.scss'],
})
export class StockCountPage implements OnInit {

  barcode: string;
  warehouseList: InventLocationLineModel[] = [];
  currentLoc: InventLocationLineModel = {} as InventLocationLineModel;
  selectedWarehouse: InventLocationLineModel = {} as InventLocationLineModel;

  updateDataTableList: STPLogSyncDetailsModel[] = [];
  item: ItemModel = {} as ItemModel;
  itemList: ItemModel[] = [];
  scannedQty: any = 0;
  user: any;

  editField: boolean = false;

  constructor(public barcodeScanner: BarcodeScanner, public dataServ: DataService, public alertController: AlertController,
    public toastController: ToastController, public axService: AxService, private keyboard: Keyboard,
    public paramService: ParameterService, private router: Router,
    public loadingController: LoadingController, public storageServ: StorageService) {
  }
  ngOnInit() {
    this.user = this.dataServ.userId
    setTimeout(() => {
      this.keyboard.hide();
    }, 200);
    this.keyboard.hide();
    this.currentLoc = this.paramService.Location;
    this.getWarehouse();
  }
  keyboardHide() {
    this.keyboard.hide();
  }
  clearBarcode() {
    this.barcode = "";
    document.getElementById("barcodeInput").focus();
    this.keyboard.hide();
  }

  getWarehouse() {
    this.warehouseList = this.paramService.wareHouseList;
    this.warehouseList.forEach(el => {
      if (el.LocationId == this.currentLoc.LocationId) {
        var index = this.warehouseList.indexOf(el);
        if (index > -1) {
          this.warehouseList.splice(index, 1);
        }
      }
    })
  }
  notify() {
    if (this.editField) {
      this.item.isEditable = true;
    } else {
      this.item.isEditable = false;
    }
  }
  async barcodeScan() {
    if (this.barcode != null && this.barcode.length > 3) {
      var flag = false;
      const loading = await this.loadingController.create({
        message: 'Please Wait',

      });
      await loading.present();
      this.axService.getItemFromBarcode(this.barcode).subscribe(res => {
        this.item = res;
        loading.dismiss();
        if (this.item.ItemId == null || this.item.ItemId == "") {
          flag = true;
          this.presentToast("Barcode Not Found");
        } else {
          this.scannedQty++;
          if (this.editField) {
            this.item.isEditable = true;
            $(document).ready(function () {
              $("#qtyInput").focus();
            });
          } else {
            this.item.quantity = 1;
            this.item.isEditable = false;
          }
          this.item.isSaved = true;
          this.item.visible = true;
          this.itemList.push(this.item);
          this.itemList.reverse();
          this.clearBarcode();
        }
      }, error => {
        loading.dismiss();
        flag = true;
      });
      loading.dismiss();
      if (flag) {
        this.presentToast("Barcode Not Found");
      }
    }
  }
  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }
  onEnter() {
    $(document).ready(function () {
      $("#barcodeInput").focus();
    });
  }


  showList() {
    this.storageServ.setItemList(this.itemList);
    this.dataServ.setItemList(this.itemList);
    this.router.navigateByUrl('/stock-count-list');
  }

  async update() {
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
          this.storageServ.clearItemList();
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
}
