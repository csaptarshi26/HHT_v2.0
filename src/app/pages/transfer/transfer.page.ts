import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
declare var $: any;
@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.page.html',
  styleUrls: ['./transfer.page.scss'],
})
export class TransferPage implements OnInit {

  constructor(public loadingController: LoadingController) { }

  ngOnInit() {
    
  }

}
