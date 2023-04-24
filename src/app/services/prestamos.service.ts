import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Prestamo } from '../models/prestamos.model';

import { environment } from '../../environments/environment';
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class PrestamosService {

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
   *  LOAD PRESTAMOS
  ==================================================================== */
  loadPrestamos(desde: number, hasta: number){    
    return this.http.get<{ok: boolean, prestamos: Prestamo[], total: number }>(`${base_url}/prestamos?desde=${desde}&hasta=${hasta}`, this.headers);
  }

  /** ================================================================
   *  CREATE PRESTAMOS
  ==================================================================== */
  createPrestamo(formData: any){
    return this.http.post<{ok: boolean, prestamo: Prestamo}>(`${base_url}/prestamos`, formData, this.headers);
  }

  /** ================================================================
   *  LOAD PRESTAMO ID
  ==================================================================== */
  loadPrestamoID(id: string){
    return this.http.get<{ok: boolean, prestamo: Prestamo}>(`${base_url}/prestamos/${id}`, this.headers);
  }

  /** ================================================================
   *  LOAD PRESTAMO ID
  ==================================================================== */
  loadPrestamosDates(fecha: number){
    return this.http.get<{ok: boolean, prestamos: Prestamo[], total: number}>(`${base_url}/prestamos/date/${fecha}`, this.headers);
  }

  /** ================================================================
   *  LOAD PRESTAMOS CLIENT
  ==================================================================== */
  loadPrestamoClient(client: string){
    return this.http.get<{ok: boolean, prestamos: Prestamo[], total: number}>(`${base_url}/prestamos/client/${client}`, this.headers);
  }

  /** ================================================================
   *  UPDATE PRESTAMO
  ==================================================================== */
  updatePrestamo(formData: any, id: string){
    return this.http.put<{ok: boolean, prestamo: Prestamo}>(`${base_url}/prestamos/${id}`, formData, this.headers);
  }


}
