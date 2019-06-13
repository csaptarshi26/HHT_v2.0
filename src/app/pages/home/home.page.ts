import { Router } from '@angular/router';
import { MenuController, AlertController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/app/providers/storageService/storage.service';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  dataAreadId: any;
  location: any;

  constructor(public router: Router, public menuCtrl: MenuController, public paramService: ParameterService,
    public alertCtrl: AlertController, public sotrageService: StorageService) { }

  ngOnInit() {
    this.dataAreadId = this.paramService.dataAreaId;
    this.location = this.paramService.Location;

    this.menuCtrl.enable(true);
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
            this.sotrageService.clearStorageValues();
            this.router.navigateByUrl("/")
          }
        }
      ]
    });
    confirm.present();
  }

}
