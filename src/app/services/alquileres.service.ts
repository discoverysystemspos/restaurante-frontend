import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Alquiler } from '../models/alquileres.model';
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class AlquileresService {

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
   *  CREATE ALQUILER
  ==================================================================== */
  createAlquiler(formData: any){
    
    return this.http.post<{ok: boolean, alquiler: Alquiler}>(`${base_url}/alquileres`, formData, this.headers);

  }
  
  /** ================================================================
   *  LOAD ALQUILERES
  ==================================================================== */
  loadAlquileres(query: any){    
    return this.http.get<{ok: boolean, total: number, alquileres: Alquiler[]}>(`${base_url}/alquileres`, this.headers);
  }


  // FIN DE LA CLASE
}
