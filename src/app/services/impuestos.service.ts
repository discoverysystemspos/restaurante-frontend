import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators';

// INTERFACES
import { LoadImpuestos } from '../interfaces/load-impuesto.interface';

import { environment } from '../../environments/environment';
import { Impuesto } from '../models/impuesto.model';
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ImpuestosService {

  constructor(  private http:HttpClient) { }

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
   *  CREATE IMPUESTOS
  ==================================================================== */
  createImpuesto(formData: any){
    
    return this.http.post<{ok: boolean, tax: Impuesto}>(`${base_url}/tax`, formData, this.headers);

  }

  /** ================================================================
   *  LOAD IMPUESTOS
  ==================================================================== */
  loadImpuestos(){
    
    return this.http.get<LoadImpuestos>(`${base_url}/tax`, this.headers)
                .pipe(
                  map( resp => {
                      return resp;
                    })
                )

  }

  /** ================================================================
   *  LOAD IMPUESTO ID
  ==================================================================== */
  loadImpuestoId( impuesto: string ){

    return this.http.get(`${base_url}/tax/impuesto/${impuesto}`, this.headers)
                .pipe(
                  map( (resp: { ok: boolean, tax: Impuesto}) =>{
                    return resp.tax
                  })
                )

  }

  /** ================================================================
   *  UPDATE IMPUESTO
  ==================================================================== */
  updateImpuesto(formData: any, id: string){
    
    return this.http.put<{ok: boolean, tax: Impuesto}>(`${base_url}/tax/${id}`, formData, this.headers);

  }

  /** ================================================================
   *  UPDATE ESTATUS IMPUESTO
  ==================================================================== */
  statusUpdateImpuestos(id: string){
    
    return this.http.delete<{ok: boolean, tax: Impuesto}>(`${base_url}/tax/${id}`, this.headers)
                .pipe(
                  map( (resp: {ok: boolean, tax: Impuesto}) => { 
                    return resp.tax 
                  })
                );

  }


  // FIN DE LA CLASE
}
