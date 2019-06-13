import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    { title: 'Home', url: '/home', icon: 'home' },
    {title : 'Purchase Order', url:'/purchase',icon:''},
    {title : 'Sales Order', url:'/sales',icon:''},
    {title : 'Transfer', url:'/transfer',icon:''},
    {title : 'Stock Count', url:'/stock-count',icon:''},
    {title : 'Inventory Adjustment', url:'/inventory',icon:''},
    {title:'Log Out',url:'/',icon:''}
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.hide();
      this.splashScreen.hide();
    });
  }
}
