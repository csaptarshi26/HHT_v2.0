import { PipesModule } from './../../pipes/mod.pipe.module';
import { HideKeyboardModule } from 'hide-keyboard';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SalesLinePage } from './sales-line.page';

const routes: Routes = [
  {
    path: '',
    component: SalesLinePage
  }
];

@NgModule({
  imports: [
    CommonModule,HideKeyboardModule,
    FormsModule,PipesModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SalesLinePage]
})
export class SalesLinePageModule {}
