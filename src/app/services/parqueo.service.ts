import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Parqueo } from '../models/parqueo.model';
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ParqueoService {

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
   *  CREATE PARQUEO
  ==================================================================== */
  createParqueo(formData: any){    
    return this.http.post<{ok: boolean, parqueo: Parqueo}>(`${base_url}/parqueos`, formData, this.headers);
  }
  
  /** ================================================================
   *  LOAD PARQUEO
  ==================================================================== */
  loadParqueos(query: any){    
    return this.http.post<{ok: boolean, total: number, parqueos: Parqueo[]}>(`${base_url}/parqueos/query`, query, this.headers);
  }

  /** ================================================================
   *  UPDATE PARQUEO
  ==================================================================== */
  updateParqueo(formData: any, id: string){    
    return this.http.put<{ok: boolean, parqueo: Parqueo}>(`${base_url}/parqueos/${id}`, formData, this.headers);
  }
}
