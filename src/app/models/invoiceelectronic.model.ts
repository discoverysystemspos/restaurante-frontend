// To parse this data:
//
//   import { Convert, InvoiceElectronic } from "./file";
//
//   const invoiceElectronic = Convert.toInvoiceElectronic(json);

export interface InvoiceElectronic {
    actions: Actions;
    invoice: FacturaElectronica;
}

export interface Actions {
    send_dian:   boolean;
    send_email:  boolean;
    email:       string;
    pdf:         string;
    attachments: Attachment[];
}

export interface Attachment {
    name: string;
    data: string;
}

export interface FacturaElectronica {
    issue_date:         string;
    invoice_type_code:  'FACTURA_VENTA' | 'FACTURA_EXPORTACION' | 'FACTURA_CONTINGENCIA';
    charges:            Charge[];
    order_reference:    string;
    items:              Item[];
    payment_means_type: 'DEBITO' | 'CRÉDITO';
    retentions:         InvoiceRetention[];
    prepayments:        Prepayment[];
    operation:          'ESTANDAR' | 'AIU' | 'MANDATO' | 'EXPORTACION' | 'SS_RECAUDO' | 'SS_CUFE' | 'SS_CUDE' | 'SS_POS' | 'SS_NUM' | 'SS_REPORTE' | 'SS_SIN_APORTE';
    number:             string;
    numbering:          Numbering;
    dataico_account_id: string;
    payment_date:       string;
    env:                'PRUEBAS' | 'PRODUCCION';
    notes:              string[];
    customer:           Customer;
    payment_means:      'CREDIT_ACH' | 'DEBIT_ACH' | 'CASH' | 'CREDIT_AHORRO' | 'DEBIT_AHORRO' | 'CHEQUE' | 'CREDIT_TRANSFER' | 'DEBIT_TRANSFER' | 'BANK_TRANSFER' | 'MUTUAL_AGREEMENT' | 'CREDIT_BANK_TRANSFER' | 'DEBIT_INTERBANK_TRANSFER' | 'DEBIT_BANK_TRANSFER' | 'CREDIT_CARD' | 'DEBIT_CARD';
}

export interface Charge {
    "base-amount": number;
    reason:        string;
    discount:      boolean;
}

export interface Customer {
    department:                string;
    address_line:              string;
    party_type:                'PERSONA_JURIDICA' | 'PERSONA_NATURAL';
    city:                      string;
    tax_level_code:            'SIMPLIFICADO' | 'RESPONSABLE_DE_IVA' | 'NO_RESPONSABLE_DE_IVA' | 'COMUN';
    email:                     string;
    country_code:              'CO';
    first_name:                string;
    phone:                     string;
    party_identification_type: 'TE' | 'PEP' | 'TI' | 'RC' | 'CC' | 'CE' | 'PASAPORTE' | 'IE' | 'NIT_OTRO_PAIS' | 'NIT';
    company_name:              string;
    family_name:               string;
    regimen:                   'AUTORRETENEDOR' | 'AGENTE_RETENCION_IVA' | 'ORDINARIO' | 'SIMPLE' | 'GRAN_CONTRIBUYENTE';
    party_identification:      string;
}

export interface AssociatedDocument {
    issue_date:                  string;
    dian_authorization_number:   string;
    cufe:                        string;
    medical_fee_code:            string;
    medical_user_identification: string;
    number:                      string;
    amount:                      string;
    type_code:                   string;
    cude:                        string;
    description:                 string;
}

export interface User {
    coverage:                 string;
    policy_number:            string;
    second_last_name:         string;
    contract_number:          string;
    provider_code:            string;
    PAGOS_COMPARTIDOS:        number;
    user_type:                string;
    CUOTA_RECUPERACION:       number;
    payment_modality:         string;
    "mipres-delivery-number": string;
    mipres_number:            string;
    CUOTA_MODERADORA:         number;
    identification:           string;
    last_name:                string;
    first_name:               string;
    identification_type:      string;
    COPAGO:                   number;
    second_first_name:        string;
    authorization_number:     string;
}

export interface Item {
    sku:                            string;
    "mandante-identification":      string;
    taxes:                          Tax[];
    "measuring-unit":               string;
    quantity:                       number;
    retentions:                     ItemRetention[];
    "mandante-identification-type": string;
    "original-price":               number;
    "discount-rate":                number;
    price:                          number;
    description:                    string;
}

export interface ItemRetention {
    "tax-category": string;
    "tax-rate":     number;
    "base-amount":  number;
    amount:         number;
}

export interface Tax {
    "tax-category":    string;
    "tax-rate":        number;
    "tax-amount":      number;
    "tax-description": string;
    "tax-base":        number;
    "base-amount":     number;
}

export interface Numbering {
    resolution_number: string;
    prefix:            string;
    flexible:          boolean;
}

export interface Prepayment {
    amount:      number;
    description: string;
}

export interface InvoiceRetention {
    tax_category: string;
    tax_rate:     number;
}

// Converts JSON strings to/from your types
export class Convert {
    public static toInvoiceElectronic(json: string): InvoiceElectronic {
        return JSON.parse(json);
    }

    public static invoiceElectronicToJson(value: InvoiceElectronic): string {
        return JSON.stringify(value);
    }
}
