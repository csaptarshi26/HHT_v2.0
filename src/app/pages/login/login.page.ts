import { DataService } from './../../providers/dataService/data.service';
import { InventLocationLineModel } from './../../models/STPInventLocationLine.model';
import { InventLocationModel } from './../../models/STPInventLocation.model';
import { ParameterService } from './../../providers/parameterService/parameter.service';
import { AxService } from './../../providers/axService/ax.service';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, Events, AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { StorageService } from 'src/app/providers/storageService/storage.service';
import { UniqueDeviceID } from '@ionic-native/unique-device-id/ngx';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  userId: string = "";
  password: string = "";
  selectedInventory: InventLocationModel;
  selectedWarehouse: InventLocationLineModel;

  warehouseList: InventLocationLineModel[] = [];

  inventList: InventLocationModel[] = [];
  currentDate: Date;
  expirationDate:Date;
  constructor(public router: Router, public menuCtrl: MenuController, public events: Events,
    public toastController: ToastController, public axService: AxService, private uniqueDeviceID: UniqueDeviceID,
    public storageService: StorageService, public paramService: ParameterService,
    public dataService: DataService, public alertController: AlertController) {


  }

  ngOnInit() {
    this.expirationDate = new Date('07-31-2019');
    console.log(this.expirationDate);
    this.getCurrentDate();
    this.getStorageData();
    this.getInventoryLocation();
    this.menuCtrl.enable(false);
  }

  getCurrentDate() {
    this.axService.getCurrentDate().subscribe(res => {
      this.currentDate = new Date(res.toString());      
      if(this.currentDate.toISOString().slice(0, 10) >= this.expirationDate.toISOString().slice(0, 10)){
        this.presentAlertForExpiration();
      }
    }, error => {
      console.log(error);
    })
  }

  async presentAlertForExpiration() {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Your license expired`,
      buttons: [
        {
          text: 'Okay',
          handler: () => {
            navigator['app'].exitApp();
          }
        }
      ]
    });

    await alert.present();
  }
  checkForm(): boolean {
    if (this.userId == "") {
      this.presentToast("User name is required");
      return false;
    } else if (this.password == "") {
      this.presentToast("Password is required");
      return false;
    } else if (this.selectedInventory == null) {
      this.presentToast("Please select warehouse");
      return false;
    } else {
      return true;
    }
  }
  logIn() {
    if (this.checkForm()) {
      this.axService.checkUser(this.userId, this.password).subscribe(res => {
        if (res) {
          this.storageService.setAuthenticated(res);
          this.storageService.setDataAreaId(this.selectedInventory.DataAreaId);
          this.storageService.setLocation(this.selectedWarehouse);
          this.storageService.setWarehouseForLegalEntity(this.warehouseList);
          this.router.navigateByUrl('/home');
        } else {
          this.presentToast("Invalid credentials");
        }
      }, error => {
        this.presentToast("Connection Error");
        console.log(error);
      })
    }
  }
  legalEntitySelected() {
    this.warehouseList = this.selectedInventory.InventLocations;
    this.paramService.wareHouseList = this.warehouseList;
  }

  getInventoryLocation() {
    if (this.paramService.inventLocationList == null || this.paramService.inventLocationList.length == 0) {
      this.axService.getInventoryLocation().subscribe(res => {
        this.inventList = res;
        this.storageService.setInventLocationList(res);

      }, error => {
        console.log(error);
      })
    } else {
      this.inventList = this.paramService.inventLocationList;
    }
  }

  getStorageData() {
    this.storageService.getAllValuesFromStorage.subscribe((res) => {

    }, (error) => {

    }, () => {
      if (this.paramService.authenticated) {
        this.events.publish('loggedin');
        this.navigatingToHome();
      } else {
        this.events.publish('loggedOut');
      }
      if (this.paramService.deviceID == null) {
        this.uniqueDeviceID.get().then((uuid: any) => {
          this.paramService.deviceID = uuid;
          this.storageService.setDeviceID(uuid);
          console.log(uuid)
        }).catch((error: any) => {
          console.log(error)
        });
      }
    });
  }

  navigatingToHome() {
    this.dataService.userId = this.userId;
    this.router.navigateByUrl('/home');
  }
  async presentToast(msg: any) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      position: "top"
    });
    toast.present();
  }
}
