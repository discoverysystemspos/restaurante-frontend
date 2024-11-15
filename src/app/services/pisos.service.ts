import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Piso } from '../models/pisos.model';
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class PisosService {

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
   *  LOAD PISOS QUERY
  ==================================================================== */
  loadPisos(query: any){    
    return this.http.post<{ok: boolean, pisos: Piso[], total: number}>(`${base_url}/pisos/query`, query, this.headers);
  }

  /** ================================================================
   *   CREATE PISOS
  ==================================================================== */
  createPiso( formData: any ){    
    return this.http.post<{ok: boolean, piso: Piso}>(`${base_url}/pisos`, formData, this.headers);
  }

  /** ================================================================
   *  UPDATE PISOS
  ==================================================================== */
  updatePiso(formData: any, id: string){    
    return this.http.put<{ok: boolean, piso: Piso}>(`${base_url}/pisos/${id}`, formData, this.headers);
  }

  /** ================================================================
   *  DELETE PISOS
  ==================================================================== */
  deletePiso(id: string){    
    return this.http.delete<{ok: boolean, msg: string}>(`${base_url}/pisos/${id}`, this.headers);
  }
}
