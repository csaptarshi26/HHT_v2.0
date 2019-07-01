import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { StockCountListPage } from './stock-count-list.page';
import {DialogModule} from 'primeng/dialog';
import {ButtonModule} from 'primeng/button';
const routes: Routes = [
  {
    path: '',
    component: StockCountListPage
  }
];

@NgModule({
  imports: [
    DialogModule,ButtonModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [StockCountListPage]
})
export class StockCountListPageModule {}
