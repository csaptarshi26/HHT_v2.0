import { DataService } from 'src/app/providers/dataService/data.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Component, OnInit, Input } from '@angular/core';
import { PurchLineModel } from 'src/app/models/STPPurchTableLine.model';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'receiving-line',
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
    this.getPoLineData();

  }

  getPoLineData() {
    this.dataServ.getPoLine$.subscribe(res => {
      this.poLineList = res;
      console.log(res)
    })
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
