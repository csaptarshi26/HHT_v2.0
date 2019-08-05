import { Injectable } from '@angular/core';
import { BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  public ScScannedQty:any;

  private purchaseSub = new BehaviorSubject<any>(0);
  getPO$ = this.purchaseSub.asObservable();

  private purchaseReturnSub = new BehaviorSubject<any>(0);
  getReturnPO$ = this.purchaseReturnSub.asObservable();

  private transferOrderSub = new BehaviorSubject<any>(0);
  getTO$ = this.transferOrderSub.asObservable();

  private transferOrderInSub = new BehaviorSubject<any>(0);
  getTOIn$ = this.transferOrderInSub.asObservable();




  private transferOrderListSub = new BehaviorSubject<any>(0);
  getTOList$ = this.transferOrderListSub.asObservable();

  private transferOrderInListSub = new BehaviorSubject<any>(0);
  getTOInList$ = this.transferOrderInListSub.asObservable();




  private itemListSub = new BehaviorSubject<any>(0);
  getItemList$ = this.itemListSub.asObservable();

  private salesOrderSub = new BehaviorSubject<any>(0);
  getSO$ = this.salesOrderSub.asObservable();

  private salesOrderReturnSub = new BehaviorSubject<any>(0);
  getSOReturn$ = this.salesOrderReturnSub.asObservable();

  private salesOrderListSub = new BehaviorSubject<any>(0);
  getSOList$ = this.salesOrderListSub.asObservable();

  private salesOrderReturnListSub = new BehaviorSubject<any>(0);
  getSOReturnList$ = this.salesOrderReturnListSub.asObservable();


  private POReceiveListSub = new BehaviorSubject<any>(0);
  getPOReceiveList$ = this.POReceiveListSub.asObservable();


  private POReturnListSub = new BehaviorSubject<any>(0);
  getPOReturnList$ = this.POReturnListSub.asObservable();

  private stockCountNumber = new BehaviorSubject<any>(0);
  getStockCountNumber$ = this.stockCountNumber.asObservable();

  private itemListFromSCList = new BehaviorSubject<any>(0);
  getitemListFromSCList$ = this.itemListFromSCList.asObservable();

  constructor() { }


  setitemListFromSCList(data) {
    this.itemListFromSCList.next(data);
  }
  setPO(data) {
    this.purchaseSub.next(data);
  }

  setStockCountNumber(data) {
    this.stockCountNumber.next(data);
  }


  setPOReturn(data) {
    this.purchaseReturnSub.next(data);
  }

  setPOReceiveList(data){
    this.POReceiveListSub.next(data);
  }

  setPOReturnList(data){
    this.POReturnListSub.next(data);
  }

  setTO(data){
    this.transferOrderSub.next(data);
  }
  
  setToIn(data){
    this.transferOrderInSub.next(data);
  }



  setTOList(data){
    this.transferOrderListSub.next(data);
  }
  
  setToInList(data){
    this.transferOrderInListSub.next(data);
  }




  setItemList(data){
    this.itemListSub.next(data);
  }

  setSO(data){
    this.salesOrderSub.next(data);
  }

  setSOReturn(data){
    this.salesOrderReturnSub.next(data);
  }

  setSOList(data){
    this.salesOrderListSub.next(data);
  }

  setSOReturnList(data){
    this.salesOrderReturnListSub.next(data);
  }
  
}
