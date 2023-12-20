import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Domicilio } from '../models/domicilios.model';
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class DomiciliosService {

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
   *  CREATE DOMICILIO
  ==================================================================== */
  createDomicilio(formData: any){    
    return this.http.post<{ok: boolean, domicilio: Domicilio}>(`${base_url}/domicilios`, formData, this.headers);
  }
  
  /** ================================================================
   *  LOAD PARQUEO
  ==================================================================== */
  loadDomicilios(query: any){    
    return this.http.post<{ok: boolean, total: number, domicilios: Domicilio[]}>(`${base_url}/domicilios/query`, query, this.headers);
  }

  /** ================================================================
   *  UPDATE PARQUEO
  ==================================================================== */
  updateDomicilios(formData: any, id: string){    
    return this.http.put<{ok: boolean, domicilio: Domicilio}>(`${base_url}/domicilios/${id}`, formData, this.headers);
  }
}
