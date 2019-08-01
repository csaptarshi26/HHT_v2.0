export class PurchLineModel {
    BarCode: any;
    ItemId: any;
    LineNo: any
    Qty: any;
    QtyReceived: any;
    QtyToReceive: any;
    UnitId: any;
    updatableCount1Qty: any;
    updatableCount2Qty: any;
    UnitAmt: any;
    NetAmt: any;
    qtyDesc: any;
    Count1Qty:any;
    Count2Qty:any;

    QtyReceivedServer: any;
    inputQty: any;
    isVisible: boolean;
    isSaved: boolean;

    dataSavedToList: boolean;
    toggle: boolean = true;

    headerCountNumber:any;

    btnDisable: boolean = true;
    constructor() {
        
    }
}