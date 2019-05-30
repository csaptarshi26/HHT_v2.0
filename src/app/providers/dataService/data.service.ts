import { Injectable } from '@angular/core';
import { BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  public userId:any;

  private purchaseSub = new BehaviorSubject<any>(0);
  getPO$ = this.purchaseSub.asObservable();

  private purchaseReturnSub = new BehaviorSubject<any>(0);
  getReturnPO$ = this.purchaseReturnSub.asObservable();

  private transferOrderSub = new BehaviorSubject<any>(0);
  getTO$ = this.transferOrderSub.asObservable();

  private transferOrderInSub = new BehaviorSubject<any>(0);
  getTOIn$ = this.transferOrderInSub.asObservable();

  private itemListSub = new BehaviorSubject<any>(0);
  getItemList$ = this.itemListSub.asObservable();

  constructor() { }

  setPO(data) {
    this.purchaseSub.next(data);
  }

  setPOReturn(data) {
    this.purchaseReturnSub.next(data);
  }

  setTO(data){
    this.transferOrderSub.next(data);
  }
  
  setToIn(data){
    this.transferOrderInSub.next(data);
  }

  setItemList(data){
    this.itemListSub.next(data);
  }
  
}
