import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Traslado } from '../models/traslados.model';

import { environment } from '../../environments/environment';
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class TrasladosService {

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
   *  CREATE TRASLADO
  ==================================================================== */
  createTraslado(formData: any){    
    return this.http.post<{ok: boolean, traslado: Traslado}>(`${base_url}/traslados`, formData, this.headers);
  }

  /** ================================================================
   *  ENVIAR TRASLADO
  ==================================================================== */
  sendTraslado(formData: any, bodega: any){    
    return this.http.post<{ok: boolean, traslado: Traslado}>(`${bodega}/traslados`, formData, this.headers);
  }
  
  /** ================================================================
   *  LOAD TRASLADO
  ==================================================================== */
  loadTraslados(query: any){    
    return this.http.post<{ok: boolean, total: number, traslados: Traslado[]}>(`${base_url}/traslados/query`, query, this.headers);
  }

  /** ================================================================
   *  LOAD TRASLADO
  ==================================================================== */
  loadTrasladosBodega(query: any, bodega: string){    
    return this.http.post<{ok: boolean, total: number, traslados: Traslado[]}>(`${bodega}/traslados/query`, query, this.headers);
  }

  /** ================================================================
   *  LOAD TRASLADO
  ==================================================================== */
  loadTrasladoID(traslado: any){    
    return this.http.get<{ok: boolean, traslado: Traslado}>(`${base_url}/traslados/one/${traslado}`, this.headers);
  }

  /** ================================================================
   *  UPDATE TRASLADO
  ==================================================================== */
  updateTraslado(formData: any, id: string){    
    return this.http.put<{ok: boolean, traslado: Traslado}>(`${base_url}/traslados/${id}`, formData, this.headers);
  }

  /** ================================================================
   *  UPDATE TRASLADO
  ==================================================================== */
  updateTrasladoBodega(formData: any, id: string, bodega: any){    
    return this.http.put<{ok: boolean, traslado: Traslado}>(`${bodega}/traslados/${id}`, formData, this.headers);
  }
}
