import { PurchLineModel } from './STPPurchTableLine.model';


export class PurchTableModel {
    InvoiceId: any;
    InvoiceDate: any;
    PurchLines: PurchLineModel[];
    PurchId: any;
    VendorAccount: any;
    OrderDate: any;
    scannedQty: any;
    constructor() {

    }
}