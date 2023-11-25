import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Typeparq } from '../models/typearq.model';

import { environment } from '../../environments/environment';
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class TypeparqService {

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
   *  CREATE TYPEPARQ
  ==================================================================== */
  createTypeparq(formData: any){    
    return this.http.post<{ok: boolean, typeparq: Typeparq}>(`${base_url}/typeparq`, formData, this.headers);
  }
  
  /** ================================================================
   *  LOAD TYPEPARQ
  ==================================================================== */
  loadTypeparqs(query: any){    
    return this.http.post<{ok: boolean, total: number, typeparqs: Typeparq[]}>(`${base_url}/typeparq/query`, query, this.headers);
  }

  /** ================================================================
   *  UPDATE ALQUILER
  ==================================================================== */
  updateTypeparq(formData: any, id: string){    
    return this.http.put<{ok: boolean, typeparq: Typeparq}>(`${base_url}/typeparq/${id}`, formData, this.headers);
  }

}
