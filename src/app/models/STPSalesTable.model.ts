import { SalesLineModel } from './STPSalesLine.model';
export class SalesTable {
    CustomerNo: any;
    DocumentDate: any;
    DocumentNo: any;
    DocumentType: any;
    ExternalDocumentNumber: any;
    InvoiceAmount: any;
    Location: any;
    OrderDate: any;
    Reference: any;
    SalesLine: SalesLineModel[]
}