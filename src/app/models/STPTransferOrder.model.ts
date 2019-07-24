import { TransferOrderLine } from './STPTransferOrderLine.Model';

export class TransferOrderModel {
    JournalId: any;
    JournalLine: TransferOrderLine[];
    ReceiveDate: any;
    TransferFrom: any;
    TransferTo: any;
    scannedQty:any;
    CountNumber:any;
}