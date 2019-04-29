import { Injectable } from '@angular/core';
import { BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private poLineSub = new BehaviorSubject<any>(0);
  getPoLine$ = this.poLineSub.asObservable();
  constructor() { }

  setPOLine(data) {
    this.poLineSub.next(data)
  }
}
