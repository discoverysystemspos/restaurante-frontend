import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';

// INTERFACES
import { DataicoInterface } from '../interfaces/dataico.interface';
import { LoadInvoice } from '../interfaces/invoice.interface';
import { Actions, FacturaElectronica, InvoiceElectronic, Item, Tax } from '../models/invoiceelectronic.model';
import { Impuestos } from '../models/impuestos.model';

const base_url = environment.base_url;
const dataico_url = environment.dataico_url;

@Injectable({
  providedIn: 'root'
})
export class ElectronicaService {

  constructor(  private http: HttpClient) { }

  /** ================================================================
   *   GET TOKEN
  ==================================================================== */
  get token():string {
    return localStorage.getItem('token') || '';
  }

  /** ================================================================
   *   GET HEADERS
  ==================================================================== */
  get headers() {
    return {
      headers: {
        'x-token': this.token
      }
    }
  }

  /** ================================================================
   *  ENVIAR FACTURA A DATAICO
  ==================================================================== */
  postFacturaDataico(invoice: LoadInvoice, dataico: DataicoInterface, impuestos: Impuestos[]){

    // SETEAR FECHA
    let d = new Date();
    let f = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`.split('/');
    (Number(f[0]) < 10)? f[0] = `0${f[0]}` : f[0];
    (Number(f[1]) < 10)? f[1] = `0${f[1]}` : f[1];
    let fecha = `${f[0]}/${f[1]}/${f[2]}`;
    // SETEAR FECHA

    let { _id, ...customer } = dataico.customer;
    let {  ...actions } = dataico.actions;
    delete actions._id;
    delete dataico.numbering._id;

    let items: Item[] = [];

     for (const product of invoice.products)  {

      // let impuesto = impuestos.filter( tax => tax._id === product.product.taxid );
      let impuesto = impuestos.find(imp => imp.taxid === product.product.taxid );

      let tax: Tax[] = [];

      tax.push({
        "tax-category": "IVA",
        "tax-rate":   impuesto.valor
      });
      
      let item: Item = {
        "sku":          product.product.code,
        "quantity":     product.qty,
        "price":        product.price,
        "description":  product.product.name,
        "taxes":        tax
      }

      items.push(item);

    }

    // SETEAR ALGUNOS DATOS
    dataico.customer.city = dataico.customer.city.toUpperCase();
    dataico.customer.department = dataico.customer.department.toUpperCase();   

    // "issue_date": `${fecha.getDate()}/${fecha.getMonth()+1}/${fecha.getFullYear()}`,
    let factura: FacturaElectronica = {
      "issue_date": fecha,
      "invoice_type_code": dataico.invoice_type_code,
      "items": items,
      "payment_means_type": 'DEBITO',
      "number": "822",
      "numbering": dataico.numbering,
      "dataico_account_id": dataico.dataico_account_id,
      "payment_date": fecha,
      "env": 'PRODUCCION',
      "customer": dataico.customer,
      "payment_means": 'DEBIT_CARD'
    };
    
    let data: InvoiceElectronic = {
      actions: dataico.actions,
      invoice: factura
    };

    data.invoice.customer.city = '001';
    data.invoice.customer.department = '54';    

    return this.http.post(`${base_url}/electronica/${dataico.authtoken}`, data, this.headers)

  }

  

}
