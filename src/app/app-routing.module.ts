import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  { path: 'home', loadChildren: './pages/home/home.module#HomePageModule' },
  { path: 'purchase', loadChildren: './pages/purchase/purchase.module#PurchasePageModule' },
  { path: 'sales', loadChildren: './pages/sales/sales.module#SalesPageModule' },
  { path: 'transfer', loadChildren: './pages/transfer/transfer.module#TransferPageModule' },
  { path: 'stock-count', loadChildren: './pages/stock-count/stock-count.module#StockCountPageModule' },
  { path: 'inventory', loadChildren: './pages/inventory/inventory.module#InventoryPageModule' },
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
  { path: 'receiving', loadChildren: './pages/receiving/receiving.module#ReceivingPageModule' },
  { path: 'receiving-line', loadChildren: './pages/receiving-line/receiving-line.module#ReceivingLinePageModule' },
  { path: 'transfer-in', loadChildren: './pages/transfer-in/transfer-in.module#TransferInPageModule' },
  { path: 'transfer-out', loadChildren: './pages/transfer-out/transfer-out.module#TransferOutPageModule' },
  { path: 'return', loadChildren: './pages/return/return.module#ReturnPageModule' },
  { path: 'return-line', loadChildren: './pages/return-line/return-line.module#ReturnLinePageModule' },
  { path: 'transfer-line', loadChildren: './pages/transfer-line/transfer-line.module#TransferLinePageModule' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
