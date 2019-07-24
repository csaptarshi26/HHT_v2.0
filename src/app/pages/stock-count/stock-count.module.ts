import { HideKeyboardModule } from 'hide-keyboard';
import { IonicSelectableModule } from 'ionic-selectable';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { StockCountPage } from './stock-count.page';
import { Network } from '@ionic-native/network/ngx';

const routes: Routes = [
  {
    path: '',
    component: StockCountPage
  }
];

@NgModule({
  imports: [
    CommonModule,IonicSelectableModule,
    FormsModule,
    IonicModule,
    HideKeyboardModule,
    RouterModule.forChild(routes)
  ],
  declarations: [StockCountPage]
})
export class StockCountPageModule {}
