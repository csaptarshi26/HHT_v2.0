import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import {DropdownModule} from 'primeng/dropdown';

import { ReceivingPage } from './receiving.page';
import { IonicSelectableModule } from 'ionic-selectable';
const routes: Routes = [
  {
    path: '',
    component: ReceivingPage
  }
];

@NgModule({
  imports: [
    CommonModule,DropdownModule,
    FormsModule,
    IonicModule, IonicSelectableModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ReceivingPage]
})
export class ReceivingPageModule {}
