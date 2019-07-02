import { InventLocationLineModel } from './../../models/STPInventLocationLine.model';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { TransferOrderModel } from './../../models/STPTransferOrder.model';
import { ParameterService } from './../../providers/parameterService/parameter.service';
import { STPLogSyncDetailsModel } from './../../models/STPLogSyncData.model';
import { AxService } from 'src/app/providers/axService/ax.service';
import { DataService } from 'src/app/providers/dataService/data.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Component, OnInit, Input, SimpleChanges, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ToastController, IonInput, AlertController, LoadingController } from '@ionic/angular';
import { TransferOrderLine } from 'src/app/models/STPTransferOrderLine.Model';
import { ItemModel } from 'src/app/models/STPItem.model';
import { StorageService } from 'src/app/providers/storageService/storage.service';
declare var $: any;

@Component({
  selector: 'app-item-information',
  templateUrl: './item-information.page.html',
  styleUrls: ['./item-information.page.scss'],
})
export class ItemInformationPage implements OnInit {


  barcode: string;
  item: ItemModel = {} as ItemModel;
  itemList: ItemModel[] = [];

  @ViewChild("input") barcodeInput: IonInput;

  constructor(public barcodeScanner: BarcodeScanner, public dataServ: DataService, public alertController: AlertController,
    public toastController: ToastController, public axService: AxService, private keyboard: Keyboard,
    public paramService: ParameterService, private router: Router,
    public loadingController: LoadingController, public storageServ: StorageService,
    private changeDetectorref: ChangeDetectorRef) {

    let instance = this;
    (<any>window).plugins.intentShim.registerBroadcastReceiver({
      filterActions: ['com.steeples.hht.ACTION'
        // 'com.zebra.ionicdemo.ACTION',
        // 'com.symbol.datawedge.api.RESULT_ACTION'
      ],
      filterCategories: ['android.intent.category.DEFAULT']
    },
      function (intent) {
        //  Broadcast received
        instance.barcode = "";
        console.log('Received Intent: ' + JSON.stringify(intent.extras));
        instance.barcode = intent.extras['com.symbol.datawedge.data_string'];
        changeDetectorref.detectChanges();
      });
  }

  ngOnInit() {
  }

  setBarcodeFocus() {
    this.barcode = "";
    setTimeout(() => {
      this.barcodeInput.setFocus();
    }, 150);
    setTimeout(() => {
      this.keyboard.hide();
    }, 150);
  }

  keyboardHide() {
    this.keyboard.hide();
  }
  clearBarcode() {
    this.barcode = "";
    this.setBarcodeFocus();
  }


  async barcodeScan() {
    this.storageServ.setItemList(this.itemList);
    if (this.barcode != null && this.barcode.length > 3) {
      var flag = false;
      const loading = await this.loadingController.create({
        message: 'Please Wait',

      });
      await loading.present();
      this.axService.getItemFromBarcodeWithOUM(this.barcode).subscribe(res => {
        this.item = res;
        this.item.visible = true;
        loading.dismiss();
      }, error => {
        loading.dismiss();
        flag = true;
        this.presentToast("Connection Error");
      });
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
}
