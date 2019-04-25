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
  
  constructor(public router:Router,public menuCtrl:MenuController,public paramService:ParameterService,
    public alertCtrl: AlertController,public sotrageService:StorageService) { }

  ngOnInit() {
    this.menuCtrl.enable(true);
  }

  logoff(){
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
            this.sotrageService.clearStorageValues();
            this.router.navigateByUrl("/")
          }
        }
      ]
    });
    confirm.present();
  }

}
