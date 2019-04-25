import { ParameterService } from 'src/app/providers/parameterService/parameter.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.page.html',
  styleUrls: ['./purchase.page.scss'],
})
export class PurchasePage implements OnInit {

  constructor(public paramService:ParameterService) { }

  ngOnInit() {
    
  }

}
