export class SalesLineModel {
    DocumentNo: any;
    DocumentType: any;
    ItemNumber: any;
    LineNo: any;
    QtyReceived: number;
    QtyShipped: number;
    QtyToReceive: number;
    QtyToShip: number;
    Quantity: number;
    UnitOfMeasure: any;
    VariantCode: any;
    CountNumber:any;

    QtyReceivedServer: any;
    inputQty: number;
    updatableQty: number;

    qtyDesc: any;
    BarCode: any;
    btnDisable: boolean;
    isSaved: boolean;
    dataSavedToList: boolean;
    isVisible: boolean;
}