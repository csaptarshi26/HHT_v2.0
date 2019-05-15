import { IonicSelectableModule } from 'ionic-selectable';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TransferInPage } from './transfer-in.page';

const routes: Routes = [
  {
    path: '',
    component: TransferInPage
  }
];

@NgModule({
  imports: [
    CommonModule,IonicSelectableModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TransferInPage]
})
export class TransferInPageModule {}
