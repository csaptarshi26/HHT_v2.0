export class PurchLineModel {
    BarCode: any;
    ItemId: any;
    LineNo: any
    Qty: any;
    QtyReceived: any;
    QtyToReceive: any;
    UnitId: any;
    updatableQty: any[];
    UnitAmt: any;
    NetAmt: any;
    qtyDesc: any;

    balance: any;

    isVisible: boolean;
    isSaved: boolean;

    dataSavedToList: boolean;
    toggle: boolean = true;


    btnDisable: boolean = true;
    constructor() {

    }
}