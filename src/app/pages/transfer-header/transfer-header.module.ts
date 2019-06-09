import { IonicSelectableModule } from 'ionic-selectable';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TransferHeaderPage } from './transfer-header.page';

const routes: Routes = [
  {
    path: '',
    component: TransferHeaderPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,IonicSelectableModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TransferHeaderPage]
})
export class TransferHeaderPageModule {}
