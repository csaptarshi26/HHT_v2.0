import { DataService } from './../../providers/dataService/data.service';
import { ItemModel } from './../../models/STPItem.model';
import { InventLocationLineModel } from './../../models/STPInventLocationLine.model';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { AlertController, LoadingController, ToastController, IonInput } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AxService } from './../../providers/axService/ax.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { StorageService } from 'src/app/providers/storageService/storage.service';
import { STPLogSyncDetailsModel } from 'src/app/models/STPLogSyncData.model';
declare var $: any;
@Component({
  selector: 'app-inventory-header',
  templateUrl: './inventory-header.page.html',
  styleUrls: ['./inventory-header.page.scss'],
})
export class InventoryHeaderPage implements OnInit {

  pageType: any;
  barcode: string;
  warehouseList: InventLocationLineModel[] = [];
  currentLoc: InventLocationLineModel = {} as InventLocationLineModel;
  selectedWarehouse: InventLocationLineModel = {} as InventLocationLineModel;

  updateDataTableList: STPLogSyncDetailsModel[] = [];
  item: ItemModel = {} as ItemModel;
  itemList: ItemModel[] = [];
  scannedQty: any = 0;
  user: any;

  qtyList: any[] = [];

  editField: boolean = false;
  count: any = -1;

  @ViewChild("input") barcodeInput: IonInput;
  @ViewChild("qtyInput") qtyInput: IonInput;

  constructor(public axService: AxService, public paramService: ParameterService,
    public alertController: AlertController, private activateRoute: ActivatedRoute,
    public toastController: ToastController, private keyboard: Keyboard,
    private router: Router, public storageServ: StorageService,
    public loadingController: LoadingController, public dataServ: DataService) {

    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
    console.log(this.pageType)
  }

  ngOnInit() {
    this.user = this.dataServ.userId
    this.currentLoc = this.paramService.Location;
  }
  setBarcodeFocus() {
    setTimeout(() => {
      this.barcodeInput.setFocus();
    }, 150);
    setTimeout(() => {
      this.keyboard.hide();
    }, 150);
  }
  ionViewWillEnter() {
    this.setBarcodeFocus();
    console.log(this.paramService.itemUpdated)
    if (this.paramService.itemUpdated) {
      this.item = {} as ItemModel;
      this.itemList = [];
      this.scannedQty = 0;
    }
  }
  keyboardHide() {
    this.keyboard.hide();
  }
  clearBarcode() {
    this.barcode = "";
    this.setBarcodeFocus();
  }


  notify() {
    if (this.editField) {
      this.item.isEditable = true;
    } else {
      this.item.isEditable = false;
    }
  }

  confirm(item: ItemModel) {
    if (item.quantity < 0) {
      item.isSaved = false;
    } else {
      item.isSaved = true;
    }
    this.qtyList[this.count] = this.item.quantity;
    this.scannedQty = this.calculateSum();
  }

  calculateSum() {
    var sum = 0;
    this.qtyList.forEach(el => {
      sum = sum + el;
    })

    return sum;
  }
  async barcodeScan() {

    if (this.barcode != null && this.barcode.length > 3) {
      this.count++;
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
          this.presentToast("This item barcode not in order list");
        } else {
          setTimeout(() => {
            this.qtyInput.setFocus();
          }, 150);
          this.item.quantity = 0;
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
        this.presentToast("This item barcode not in order list");
        this.setBarcodeFocus();
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



  showList() {
    this.storageServ.setItemList(this.itemList);
    this.dataServ.setItemList(this.itemList);
    this.router.navigateByUrl('/inventory-line/' + this.pageType);
  }


}
