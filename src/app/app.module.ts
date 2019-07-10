import { DataService } from './providers/dataService/data.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { AxService } from './providers/axService/ax.service';
import { ParameterService } from './providers/parameterService/parameter.service';
import { StorageService } from './providers/storageService/storage.service';
import { HTTP } from '@ionic-native/http/ngx';
import { Storage, IonicStorageModule } from '@ionic/storage';
import { UniqueDeviceID } from '@ionic-native/unique-device-id/ngx';
import { IonicSelectableModule } from 'ionic-selectable';
import { Keyboard } from '@ionic-native/keyboard/ngx';

import { HideKeyboardModule } from 'hide-keyboard';
import { ModPipe } from './pipes/mod.pipe';
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot({hardwareBackButton: false}),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    IonicSelectableModule,
    HideKeyboardModule
  ],
  providers: [
    StatusBar,
    Keyboard,
    UniqueDeviceID,
    BarcodeScanner,
    SplashScreen,
    AxService,
    ParameterService,
    StorageService,
    DataService,
    HTTP,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
