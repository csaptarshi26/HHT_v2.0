import { HideKeyboardModule } from 'hide-keyboard';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { InventoryHeaderPage } from './inventory-header.page';

const routes: Routes = [
  {
    path: '',
    component: InventoryHeaderPage
  }
];

@NgModule({
  imports: [
    CommonModule,HideKeyboardModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [InventoryHeaderPage]
})
export class InventoryHeaderPageModule {}
