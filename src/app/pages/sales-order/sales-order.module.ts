import { IonicSelectableModule } from 'ionic-selectable';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SalesOrderPage } from './sales-order.page';

const routes: Routes = [
  {
    path: '',
    component: SalesOrderPage
  }
];

@NgModule({
  imports: [
    CommonModule,IonicSelectableModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SalesOrderPage]
})
export class SalesOrderPageModule {}
