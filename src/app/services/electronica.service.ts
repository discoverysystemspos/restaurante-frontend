import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';

// INTERFACES
import { DataicoInterface } from '../interfaces/dataico.interface';
import { LoadInvoice } from '../interfaces/invoice.interface';
import { Actions, FacturaElectronica, InvoiceElectronic, Item, Tax } from '../models/invoiceelectronic.model';
import { Impuestos } from '../models/impuestos.model';

const dataico_url = environment.dataico_url;

@Injectable({
  providedIn: 'root'
})
export class ElectronicaService {

  constructor(  private http: HttpClient) { }

  /** ================================================================
   *   GET HEADERS
  ==================================================================== */
  get headers() {
    return {
      headers: {
        'auth-token': '4facc5070884f0e15d9dc05c3ee4fb6b'
      }
    }
  }

  /** ================================================================
   *  ENVIAR FACTURA A DATAICO
  ==================================================================== */
  postFacturaDataico(invoice: LoadInvoice, dataico: DataicoInterface, impuestos: Impuestos[]){

    let fecha = new Date();
    let { _id, ...customer } = dataico.customer;
    let {  ...actions } = dataico.actions;
    delete actions._id;
    delete dataico.numbering._id;

    let items: Item[] = [];

    for (const product of invoice.products) {

      // let impuesto = impuestos.filter( tax => tax._id === product.product.taxid );
      let impuesto = impuestos.find(imp => imp.taxid === product.product.taxid );

      let tax: Tax[] = [];

      tax.push({
        "tax-category": "IVA",
        "tax-amount": impuesto.valor
      });
      
      let item: Item = {
        sku: product.product.code,
        quantity: product.qty,
        price: product.price,
        description: product.product.name,
        taxes: tax,
      }

      items.push(item);

    }

    // SETEAR ALGUNOS DATOS
    dataico.customer.city = dataico.customer.city.toUpperCase();
    dataico.customer.department = dataico.customer.department.toUpperCase();   

    let factura: FacturaElectronica = {
      issue_date: `${fecha.getDate()}/${fecha.getMonth()+1}/${fecha.getFullYear()}`,
      invoice_type_code: dataico.invoice_type_code,
      items: items,
      payment_means_type: 'DEBITO',
      operation: dataico.operation,
      number: invoice.invoice.toString(),
      numbering: dataico.numbering,
      dataico_account_id: dataico.dataico_account_id,
      payment_date: `${fecha.getDate()}/${fecha.getMonth()+1}/${fecha.getFullYear()}`,
      env: 'PRODUCCION',
      customer: dataico.customer,
      payment_means: 'DEBIT_CARD'
    };
    
    let data: InvoiceElectronic = {
      actions: dataico.actions,
      invoice: factura
    };

    console.log(data);
    console.log(this.headers);
    

    return this.http.post(`${dataico_url}/invoices`, data, this.headers)

    
  }

  

}
