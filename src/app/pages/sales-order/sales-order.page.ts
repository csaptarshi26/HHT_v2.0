import { LoadingController, AlertController } from '@ionic/angular';
import { SalesLineModel } from './../../models/STPSalesLine.model';
import { SalesTable } from './../../models/STPSalesTable.model';
import { CustomerModel } from './../../models/STPCustomer.model';
import { IonicSelectableComponent } from 'ionic-selectable';
import { ActivatedRoute, Router } from '@angular/router';
import { AxService } from './../../providers/axService/ax.service';
import { DataService } from 'src/app/providers/dataService/data.service';
import { Component, OnInit } from '@angular/core';
import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { VendorsModel } from 'src/app/models/STPVendors.model';
import { PurchTableModel } from 'src/app/models/STPPurchTable.model';
import { PurchLineModel } from 'src/app/models/STPPurchTableLine.model';
import { StorageService } from 'src/app/providers/storageService/storage.service';
declare var $: any;
@Component({
  selector: 'app-sales-order',
  templateUrl: './sales-order.page.html',
  styleUrls: ['./sales-order.page.scss'],
})
export class SalesOrderPage implements OnInit {

  pageType: any;
  customerList: CustomerModel[] = [];
  selectedCustomer: CustomerModel;

  salesList: SalesTable[] = [];
  selectedSalesTable: SalesTable = {} as SalesTable;


  soStorageItemList: any[] = [];
  itemExistsInStorage: boolean;

  constructor(public dataServ: DataService, public axService: AxService, public router: Router,
    public paramService: ParameterService, private activateRoute: ActivatedRoute, public alertController: AlertController,
    public loadingController: LoadingController, public storageService: StorageService) {

    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
    console.log(this.pageType)
  }

  customerSelected(cust: CustomerModel) {
    this.selectedCustomer = cust;
    if (this.pageType == "Sales-Order") {
      this.getSalesOrder();
    } else {
      this.getSalesReturnOrder();
    }
  }

  soSelected(sales: SalesTable) {
    this.selectedSalesTable = sales;
    var soItem: SalesTable;
    this.getSalesLine();
    if (this.soStorageItemList != null || this.soStorageItemList.length != 0) {
      this.soStorageItemList.forEach(el => {
        if (el.soNo == this.selectedSalesTable.DocumentNo && el.type == this.pageType) {
          this.itemExistsInStorage = true;
          soItem = el.soHeader;
        }
      })
      if (this.itemExistsInStorage) {
        this.presentAlert(soItem);
      }
    }
  }
  ngOnInit() {
    $('.ui.dropdown').dropdown({ fullTextSearch: true });
    this.itemExistsInStorage = false;
    this.getItemsFromStorage();
    this.getcustomerList();
  }
  getcustomerList() {
    if (this.paramService.customerList) {
      this.customerList = this.paramService.customerList;
    }
    this.axService.getCustomerList().subscribe(res => {
      this.customerList = res;
      this.customerList.forEach(el => {
        el.displayText = el.CustAccount + " - " + el.Name;
      })
      this.storageService.setCustomerList(this.customerList);
    }, error => {
      console.log(error);
    })
  }
  async getSalesOrder() {
    const loading = await this.loadingController.create({
      message: 'Please Wait'
    });
    await loading.present();
    this.axService.getSalesOrder(this.selectedCustomer.CustAccount).subscribe(res => {
      loading.dismiss();
      this.salesList = res;
    }, error => {
      loading.dismiss();
      console.log(error);
    })
  }

  async getSalesReturnOrder() {
    const loading = await this.loadingController.create({
      message: 'Please Wait'
    });
    await loading.present();
    this.axService.getSalesReturnOrder(this.selectedCustomer.CustAccount).subscribe(res => {
      loading.dismiss();
      this.salesList = res;
    }, error => {
      loading.dismiss();
      console.log(error);
    })
  }
  navigateToNext() {
    if (!this.selectedSalesTable.CountNumber) {
      this.presentAlertError("Please Select Count Number.");
    } else {
      if (this.pageType == "Sales-Order") {
        this.dataServ.setSO(this.selectedSalesTable);
      } else {
        this.dataServ.setSOReturn(this.selectedSalesTable);
      }
      this.router.navigateByUrl('/sales-line/' + this.pageType);
    }
  }
  async presentAlertError(msg) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: msg,
      buttons: [
        {
          text: 'Okay',
          handler: () => {

          }
        }
      ]
    });

    await alert.present();
  }
  getItemsFromStorage() {
    this.storageService.getAllValuesFromStorage.subscribe((res) => {

    }, (error) => {

    }, () => {
      if (this.paramService.SOItemList != null) {
        this.soStorageItemList = this.paramService.SOItemList;
      }
    });
  }

  async presentAlert(soItem: SalesTable) {
    const alert = await this.alertController.create({
      header: 'Data Exits!',
      message: `There is Unsaved data for this Sales Order Number, 
      Click Continue to proceed with Unsaved data `,
      buttons: [
        {
          text: 'Continue',
          handler: () => {
            this.selectedSalesTable = soItem;
          }
        },
        {
          text: 'Discard',
          handler: () => {

          }
        }
      ]
    });

    await alert.present();
  }

  getSalesLine() {
    this.axService.getSalesLine(this.selectedSalesTable.DocumentNo).subscribe(res => {
      this.selectedSalesTable.SalesLine = res;
    }, error => {
      console.log(error);
    })
  }
}
