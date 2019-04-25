import { DataService } from 'src/app/providers/dataService/data.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Component, OnInit } from '@angular/core';
import { PurchLineModel } from 'src/app/models/STPPurchTableLine.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-receiving-line',
  templateUrl: './receiving-line.page.html',
  styleUrls: ['./receiving-line.page.scss'],
})
export class ReceivingLinePage implements OnInit {

  barcode: string;
  subscription: Subscription;
  poLineList: PurchLineModel[] = [];

  constructor(public barcodeScanner: BarcodeScanner, public dataServ: DataService) {

  }

  ngOnInit() {
    this.getDataFromService();
  }

  getDataFromService() {
    this.subscription = this.dataServ.getPOLine().subscribe(data => {
      this.poLineList = data;
      console.log(this.poLineList)
    });
  }
  barcodeScan() {
    if (this.barcode == null) {
      this.barcodeScanner.scan().then(barcodeData => {
        console.log('Barcode data', barcodeData);
      }).catch(err => {
        console.log('Error', err);
      });
    } else {

    }
  }
}
