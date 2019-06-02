export class SalesLineModel {
    DocumentNo: any;
    DocumentType: any;
    ItemNumber: any;
    LineNo: any;
    QtyReceived: any;
    QtyShipped: any;
    QtyToReceive: any;
    QtyToShip: any;
    Quantity: any;
    UnitOfMeasure: any;
    VariantCode: any;

    qtyReceivedFromServer: any;
    balance: any;
    updatableQty: any[]
    qtyDesc:any;
    BarCode:any;
    btnDisable:boolean;
    isSaved:boolean;
    dataSavedToList:boolean;
    isVisible:boolean;
}