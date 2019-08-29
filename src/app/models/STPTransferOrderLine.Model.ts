export class TransferOrderLine {
    DocumentNo: any;
    ItemNo: any;
    LineNo: any;
    QtyReceived: number;
    QtyShipped: number;
    QtyToReceive: number;
    QtyToShip: number;
    Quantity: number;
    UnitOfMeasure: any;
    VariantCode: any;
    headerCountNumber:any;
    
    qtyDesc: any;
    BarCode: any;

    qtyReceivedFromServer:any;
    qtyShippedFromServer:any;
    
    updatableCount1Qty: any;
    updatableCount2Qty: any;
    Count1Qty:any;
    Count2Qty:any;
    
    inputQty:number;

    isVisible: boolean;
    isSaved: boolean;

    dataSavedToList: boolean;

    btnDisable: boolean = true;
}