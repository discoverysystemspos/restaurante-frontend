import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Compra } from '../models/compras.model';

import { environment } from '../../environments/environment';
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ComprasService {

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
   *  CREATE COMPRA
  ==================================================================== */
  createCompra(formData: any){    
    return this.http.post<{ok: boolean, compra: Compra}>(`${base_url}/compras`, formData, this.headers);
  }
  
  /** ================================================================
   *  LOAD COMPRA
  ==================================================================== */
  loadCompras(query: any){    
    return this.http.post<{ok: boolean, total: number, compras: Compra[]}>(`${base_url}/compras/query`, query, this.headers);
  }

  /** ================================================================
   *  LOAD COMPRA
  ==================================================================== */
  loadCompraID(compra: any){    
    return this.http.get<{ok: boolean, compra: Compra}>(`${base_url}/compras/one/${compra}`, this.headers);
  }

  /** ================================================================
   *  UPDATE COMPRA
  ==================================================================== */
  updateCompra(formData: any, id: string){    
    return this.http.put<{ok: boolean, compra: Compra}>(`${base_url}/compras/${id}`, formData, this.headers);
  }

  /** ================================================================
   *  RETURN COMPRA
  ==================================================================== */
  returnCompra(id: string){
    return this.http.delete<{ok: boolean, msg: string}>(`${base_url}/compras/${id}`, this.headers)
  }

}
