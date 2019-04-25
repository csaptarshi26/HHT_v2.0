import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

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
import { IonicSelectableModule } from 'ionic-selectable';
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),    
    AppRoutingModule,
    HttpClientModule,
    IonicSelectableModule
    
  ],
  providers: [
    StatusBar,
    BarcodeScanner,
    SplashScreen,
    AxService,
    ParameterService,
    StorageService,
    HTTP,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
