import { Injectable } from '@angular/core';
import { PurchLineModel } from 'src/app/models/STPPurchTableLine.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  poLineList: PurchLineModel[] = [];
  private poLineSub = new BehaviorSubject(0);
  
  constructor() { }

  setPOLine(poLine){
    this.poLineSub.next(poLine);
    this.poLineSub.complete();
  }
  getPOLine(): Observable<any> {
    return this.poLineSub;
  }
}
