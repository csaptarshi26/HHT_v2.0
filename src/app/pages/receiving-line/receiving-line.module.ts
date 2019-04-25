import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ReceivingLinePage } from './receiving-line.page';

const routes: Routes = [
  {
    path: '',
    component: ReceivingLinePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ReceivingLinePage]
})
export class ReceivingLinePageModule {}
