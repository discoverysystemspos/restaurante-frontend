import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Bodega } from '../models/bodegas.model';
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class BodegasService {

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
   *  CREATE BANCOS
  ==================================================================== */
  createBodega(formData: any){    
    return this.http.post<{ok: boolean, bodega: Bodega}>(`${base_url}/bodega`, formData, this.headers);
  }

  /** ================================================================
   *  LOAD BANCOS
  ==================================================================== */
  loadBodegas(query: any){    
    return this.http.post<{ok: boolean, bodegas: Bodega[], total: number}>(`${base_url}/bodega/query`, query, this.headers);
  }

  /** ================================================================
   *  LOAD BANCO ID
  ==================================================================== */
  loadBodegaId( banco: string ){
    return this.http.get<{ok: boolean, bodega: Bodega}>(`${base_url}/bodega/${banco}`, this.headers);
  }

  /** ================================================================
   *  UPDATE BANCO
  ==================================================================== */
  updateBodega(formData: any, id: string){    
    return this.http.put<{ok: boolean, bodega: Bodega}>(`${base_url}/bodega/${id}`, formData, this.headers);
  }
}
