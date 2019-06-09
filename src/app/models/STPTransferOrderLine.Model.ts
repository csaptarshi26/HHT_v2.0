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
    updatableQty: number;
    qtyDesc: any;
    BarCode: any;
    //qtyReceivedFromServer:any;

    inputQty:number;

    isVisible: boolean;
    isSaved: boolean;

    dataSavedToList: boolean;

    btnDisable: boolean = true;
}