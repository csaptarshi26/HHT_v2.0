import { ZoneModel } from 'src/app/models/STPZone.model';
export class ItemModel {
    BarCode: any;
    Description: any;
    ItemId: any;
    Unit: any;
    UnitFactor: any;
    CountNumber:any;
    quantity: any;
    zone:ZoneModel;

    visible: boolean;
    toggle: boolean;
    isSaved: boolean;
    isEditable: boolean;
    dataSavedToList: boolean;
    confirmed: boolean;
}