import { InventLocationLineModel } from './../../models/STPInventLocationLine.model';
import { InventLocationModel } from './../../models/STPInventLocation.model';
import { ParameterService } from './../../providers/parameterService/parameter.service';
import { AxService } from './../../providers/axService/ax.service';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, Events } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { StorageService } from 'src/app/providers/storageService/storage.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  userId: string = "Admin";
  password: string = "1234";
  selectedInventory: InventLocationModel;
  selectedWarehouse:InventLocationLineModel;

  warehouseList:InventLocationLineModel[]=[];

  inventList: InventLocationModel [] =[];


  constructor(public router: Router, public menuCtrl: MenuController, public events: Events,
    public toastController: ToastController, public axService: AxService,
    public storageService: StorageService, public paramService: ParameterService) {


  }

  ngOnInit() {
    this.getStorageData();
    this.getInventoryLocation();
    this.menuCtrl.enable(false);
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
          this.storageService.setLocationId(this.selectedWarehouse.LocationId);
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
  legalEntitySelected(){
    this.warehouseList = this.selectedInventory.InventLocations;
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
    });
  }

  navigatingToHome() {
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
