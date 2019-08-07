import { CheckUser } from './../../models/STPCheckUser.model';
import { AxService } from 'src/app/providers/axService/ax.service';
import { Router } from '@angular/router';
import { MenuController, AlertController } from '@ionic/angular';
import { Component, OnInit, ViewChild } from '@angular/core';
import { StorageService } from 'src/app/providers/storageService/storage.service';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { IonInfiniteScroll } from '@ionic/angular';
import { RoleModel } from 'src/app/models/STPRole.model';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  dataAreadId: any;
  location: any;

  checkUser: CheckUser = {} as CheckUser;
  userRole:RoleModel = {} as RoleModel;
  constructor(public router: Router, public menuCtrl: MenuController, public paramService: ParameterService,
    public alertCtrl: AlertController, public sotrageService: StorageService,
    public axservice: AxService) {

  }
  ngOnInit() {
    this.userRole = this.paramService.userRole;
    this.dataAreadId = this.paramService.dataAreaId;
    this.location = this.paramService.Location;
    //this.getDemoData();
    this.menuCtrl.enable(true);

    // this.axservice.getToken().subscribe(res => {
    //   console.log('Token ' + res);
     
    // })

    // this.axservice.testApi("").subscribe(res => {
    //   console.log(res);
    // },error=>{
    //   console.log(error)
    // })
  }
  ionViewDidEnter() {
    document.addEventListener("backbutton", function (e) {
      console.log("disable back button")
    }, false);
  }
  logoff() {
    this.confirmAlert();
  }
  async confirmAlert() {
    const confirm = await this.alertCtrl.create({
      header: "Logout",
      message: "Sure you want to logout?",
      buttons: [
        {
          text: 'Disagree',
          handler: () => {
          }
        },
        {
          text: 'Agree',
          handler: () => {
            this.paramService.wareHouseList = [];
            this.paramService.userRole = {} as RoleModel;
            this.sotrageService.clearStorageValues();
            this.router.navigateByUrl("/")
          }
        }
      ]
    });
    confirm.present();
  }

  getDemoData() {
    var barcodeList = [];
    var k = 2005050000000;
    var i = k;
    while (i < k + 5000000) {
      barcodeList.push(i);
      i++;
    }
    this.sotrageService.setDemoData(barcodeList);
  }
}
