import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
declare var $: any;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages = [
    { title: 'Home', url: '/home', icon: 'home' },
    { title: 'Purchase Order', url: '/purchase', icon: '' },
    { title: 'Sales Order', url: '/sales', icon: '' },
    { title: 'Transfer', url: '/transfer', icon: '' },
    { title: 'Stock Count', url: '/stock-count', icon: '' },
    { title: 'Inventory Adjustment', url: '/inventory', icon: '' },
    { title: 'Log Out', url: '/', icon: '' }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public Keyboard: Keyboard
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.hide();
      this.splashScreen.hide();
    });
  }

  ngAfterViewInit() {
    // This element never changes.
    let ionapp = document.getElementsByTagName("ion-app")[0];

    window.addEventListener('keyboardDidShow', async (event) => {
        // Move ion-app up, to give room for keyboard
        let kbHeight: number = event["keyboardHeight"];
        let viewportHeight: number = $(window).height();
        let inputFieldOffsetFromBottomViewPort: number = viewportHeight - $(':focus')[0].getBoundingClientRect().bottom;
        let inputScrollPixels = kbHeight - inputFieldOffsetFromBottomViewPort;

        // Set margin to give space for native keyboard.
        console.log(inputFieldOffsetFromBottomViewPort)
        if(inputFieldOffsetFromBottomViewPort<300){
          ionapp.style["margin-top"] = "-10%";
        }
        ionapp.style["margin-bottom"] = kbHeight.toString() + "px";      
        // But this diminishes ion-content and may hide the input field...
        if (inputScrollPixels > 0) {
            // ...so, get the ionScroll element from ion-content and scroll correspondingly
            // The current ion-content element is always the last. If there are tabs or other hidden ion-content elements, they will go above.
            let ionScroll = await $("ion-content").last()[0].getScrollElement();
            setTimeout(() => {
                $(ionScroll).animate({
                    scrollTop: ionScroll.scrollTop + inputScrollPixels
                }, 300);
            }, 300); // Matches scroll animation from css.
        }
    });
    window.addEventListener('keyboardDidHide', () => {
        // Move ion-app down again
        // Scroll not necessary.
        ionapp.style["margin-bottom"] = "0px";
        
        ionapp.style["margin-top"] = "0%";
    });
}
}
