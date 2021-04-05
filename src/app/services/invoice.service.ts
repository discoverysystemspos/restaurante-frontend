import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators'

// INTERFACES
import { LoadInvoice, ListInvoice } from '../interfaces/invoice.interface';

import { environment } from '../../environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  constructor(private http: HttpClient) { }
  
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
   *   CREATE INVOICE
  ==================================================================== */
  createInvoice(formData:any, turno: string){    
    return this.http.post(`${ base_url }/invoice/${turno}`, formData, this.headers);
  }

  /** ================================================================
   *   UPDATE INVOICE
  ==================================================================== */
  updateInvoice(formData:any, id: string){    
    return this.http.put(`${ base_url }/invoice/pago/${id}`, formData, this.headers);
  }

  /** ================================================================
   *   LOAD INVOICE DATE
  ==================================================================== */
  loadInvoicesDate(date: Date){        
    return this.http.get<ListInvoice>(`${base_url}/invoice/date/${date}`, this.headers)
                .pipe(
                  map( resp => {
                    return resp;
                  })
                );
  }

  /** ================================================================
   *   LOAD INVOICE
  ==================================================================== */
  loadInvoices( desde: number = 0 ){
    return this.http.get<ListInvoice>(`${ base_url }/invoice?desde=${ desde }`, this.headers)
                    .pipe(
                      delay(500),
                      map( resp => {
                        return resp;
                      })
                    );

  }

  /** ================================================================
   *   LOAD INVOICE ID
  ==================================================================== */
  loadInvoiceId( id: string ){
    return this.http.get(`${base_url}/invoice/${id}`, this.headers)
                    .pipe(
                      map( (resp: {ok: boolean, invoice: LoadInvoice} ) => resp.invoice)
                    );

  }

  /** ================================================================
   *   RETURN INVOICE ID
  ==================================================================== */
  returnInvoice(id: string){
    return this.http.delete(`${base_url}/invoice/${id}`, this.headers);
  }

  /** ================================================================
   *   DELETE PRODUCT INVOICE
  ==================================================================== */
  deleteProductInvoice(factura: string, product: string){

    return this.http.delete(`${base_url}/invoice/${factura}/product/${product}`, this.headers);

  }


  // FIN CLASE
}
