import { PipesModule } from './../../pipes/mod.pipe.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SalesListPage } from './sales-list.page';

const routes: Routes = [
  {
    path: '',
    component: SalesListPage
  }
];

@NgModule({
  imports: [
    CommonModule,PipesModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SalesListPage]
})
export class SalesListPageModule {}
