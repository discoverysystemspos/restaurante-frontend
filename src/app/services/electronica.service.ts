import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';

// INTERFACES
import { DataicoInterface } from '../interfaces/dataico.interface';
import { LoadInvoice } from '../interfaces/invoice.interface';
import { Actions, Customer, FacturaElectronica, InvoiceElectronic, Item, Tax } from '../models/invoiceelectronic.model';
import { Impuestos } from '../models/impuestos.model';

const base_url = environment.base_url;
const dataico_url = environment.dataico_url;

interface _Department {
  codigo: string,
  departamento: string,
}

interface _City {
  "codigo departamento": string,
  departamento: string,
  codigo: string,
  ciudad: string,
}

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
  postFacturaDataico(invoice: LoadInvoice, dataico: DataicoInterface, impuestos: Impuestos[]) {
    
    let customer: Customer = {
      department: '68',
      city: '001',
      address_line: 'No aplica',
      party_type: 'PERSONA_NATURAL',
      tax_level_code: 'NO_RESPONSABLE_DE_IVA',
      email: 'ivsmca90@gmail.com',
      country_code: 'CO',
      first_name: 'Consumidor',
      family_name: 'Final',
      phone: '3166078657',
      party_identification_type: 'CC',
      company_name: '',
      regimen: 'SIMPLE',
      party_identification: '222222222222' ,
    };

    if (invoice.client) {
      customer = {
        department:                 invoice.client.codigodepartamento,
        city:                       invoice.client.codigociudad,
        address_line:               invoice.client.address,
        party_type:                 invoice.client.party_type,
        tax_level_code:             invoice.client.tax_level_code,
        email:                      invoice.client.email,
        country_code:               invoice.client.country_code,
        first_name:                 invoice.client.first_name,
        phone:                      invoice.client.phone,
        party_identification_type:  invoice.client.party_identification_type,
        company_name:               invoice.client.company_name,
        family_name:                invoice.client.family_name,
        regimen:                    invoice.client.regimen,
        party_identification:       invoice.client.cedula
      }
    }

    if(customer.party_type === 'PERSONA_JURIDICA'){
      delete customer.first_name;
      delete customer.family_name;
    }else{
      delete customer.company_name;
    }    

    // SETEAR FECHA
    let d = new Date();
    let f = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`.split('/');
    (Number(f[0]) < 10)? f[0] = `0${f[0]}` : f[0];
    (Number(f[1]) < 10)? f[1] = `0${f[1]}` : f[1];
    let fecha = `${f[0]}/${f[1]}/${f[2]}`;
    // SETEAR FECHA
   
    let {  ...actions } = dataico.actions;
    delete actions._id;
    delete dataico.numbering._id;

    let items: Item[] = [];

     for (const product of invoice.products)  {      

      // let impuesto = impuestos.filter( tax => tax._id === product.product.taxid );
      let impuesto = product.product.taxid;

      let tax: Tax[] = [];

      let type = '94';
      if (product.product.type === 'Granel') {
        type = 'AB';
      }else if(product.product.type === 'Paquete'){
        type = 'PA';
      }

      tax.push({
        "tax-category": impuesto.taxcategory,
        "tax-rate":   impuesto.valor
      });
      
      let item: Item = {
        "sku":            product.product.code,
        "quantity":       product.qty,
        "price":          product.price,
        "description":    product.product.name,
        "taxes":          tax,
        "measuring-unit": type
      }

      items.push(item);

    }

    
    
    // "issue_date": `${fecha.getDate()}/${fecha.getMonth()+1}/${fecha.getFullYear()}`,
    let factura: FacturaElectronica = {
      "issue_date": fecha,
      "invoice_type_code": dataico.invoice_type_code,
      "items": items,
      "payment_means_type": 'DEBITO',
      "number": invoice.invoice.toString(),
      "numbering": dataico.numbering,
      "dataico_account_id": dataico.dataico_account_id,
      "payment_date": fecha,
      "env": 'PRODUCCION',
      "customer": customer,
      "payment_means": 'DEBIT_CARD'
    };

    dataico.actions.send_email = true;
    
    let data: InvoiceElectronic = {
      actions: dataico.actions,
      invoice: factura
    }; 

    let desde;
    
    if(!dataico.desde || dataico.desde === 0){
      desde = 0;
    }else{
      desde = (dataico.desde - 1);
    }

    console.log(data);
    

    return this.http.post(`${base_url}/electronica/${dataico.authtoken}/${invoice.iid}/${desde}`, data, this.headers)

  }
  
  // FIN DE LA CLASE
}
