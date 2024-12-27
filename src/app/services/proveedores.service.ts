import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators'


// MODEL
import { Proveedor } from '../models/proveedor.model';
import { LoadProveedores } from '../interfaces/load-proveedor.interface';

import { environment } from '../../environments/environment';
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {

  public proveedor: Proveedor

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
   *   CARGAR PROVEEDORES
  ==================================================================== */
  cargarProveedores(desde: number = 0){
    
    const endPoint = `/proveedores?desde=${desde}`;
    return this.http.get<LoadProveedores>(`${base_url}${endPoint}`, this.headers)
            .pipe(
              delay(500),
              map( resp => {
                return resp;
              })
            );

  }

  /** ================================================================
   *  LOAD PROVEEDORES QUERY
  ==================================================================== */
  loadProveedores(query: any){    
    return this.http.post<{ok: boolean, proveedores: Proveedor[], total: number}>(`${base_url}/proveedores/query`, query, this.headers);
  }

  /** ================================================================
   *   CREATE PROVEEDORES
  ==================================================================== */
  createProveedor( formData: any ){    
    return this.http.post<{ok: boolean, proveedor: Proveedor}>(`${base_url}/proveedores`, formData, this.headers);
  }

  /** ================================================================
   *  UPDATE PROVEEDOR
  ==================================================================== */
  updateProveedor(formData: any, id: string){    
    return this.http.put<{ok: boolean, proveedor: Proveedor}>(`${base_url}/proveedores/${id}`, formData, this.headers);
  }

  // FIN DE LA CLASE
}
