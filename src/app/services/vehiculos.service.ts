import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// MODELS
import { Vehiculo } from '../models/vehiculos.model';

import { environment } from '../../environments/environment';
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class VehiculosService {

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
   *  LOAD VEHICULOS QUERY
  ==================================================================== */
  loadVehiculos(query: any){    
    return this.http.post<{ok: boolean, vehiculos: Vehiculo[], total: number}>(`${base_url}/vehiculos/query`, query, this.headers);
  }

  /** ================================================================
   *   CREATE VEHICULOS
  ==================================================================== */
  createVehiculo( formData: any ){    
    return this.http.post<{ok: boolean, vehiculo: Vehiculo}>(`${base_url}/vehiculos`, formData, this.headers);
  }

  /** ================================================================
   *  UPDATE VEHICULO
  ==================================================================== */
  updateVehiculo(formData: any, id: string){    
    return this.http.put<{ok: boolean, vehiculo: Vehiculo}>(`${base_url}/vehiculos/${id}`, formData, this.headers);
  }
}
