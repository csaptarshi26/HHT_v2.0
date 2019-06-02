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

  salesLineList: SalesLineModel[] = [];


  constructor(public dataServ: DataService, public axService: AxService, public router: Router,
    public paramService: ParameterService, private activateRoute: ActivatedRoute) {

    this.pageType = this.activateRoute.snapshot.paramMap.get('pageName');
    console.log(this.pageType)
  }

  customerSelected() {
    this.getSalesOrder();
  }
  ngOnInit() {
    this.getcustomerList();
  }
  getcustomerList() {
    this.axService.getCustomerList().subscribe(res => {
      this.customerList = res;
      this.customerList.forEach(el => {
        el.displayText = el.CustAccount + " - " + el.Name;
      })
    }, error => {
      console.log(error);
    })
  }
  getSalesOrder() {
    this.axService.getSalesOrder(this.selectedCustomer.CustAccount).subscribe(res => {
      this.salesList = res;
      console.log(res);
    }, error => {
      console.log(error);
    })
  }
  navigateToNext() {
    if (this.pageType == "Sales-Order"){
      this.dataServ.setSO(this.selectedSalesTable);
    }else{
      this.dataServ.setSOReturn(this.selectedSalesTable);
    }
    this.router.navigateByUrl('/sales-line/' + this.pageType);

  }
}
