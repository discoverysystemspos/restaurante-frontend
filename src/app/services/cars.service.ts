import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Car } from '../models/cars.model';

import { environment } from '../../environments/environment';
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class CarsService {

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
   *  CREATE CAR
  ==================================================================== */
  createCar(formData: any){    
    return this.http.post<{ok: boolean, car: Car}>(`${base_url}/cars`, formData, this.headers);
  }
  
  /** ================================================================
   *  LOAD CAR
  ==================================================================== */
  loadCars(query: any){    
    return this.http.post<{ok: boolean, total: number, cars: Car[]}>(`${base_url}/cars/query`, query, this.headers);
  }

  /** ================================================================
   *  UPDATE CAR
  ==================================================================== */
  updateCar(formData: any, id: string){    
    return this.http.put<{ok: boolean, car: Car}>(`${base_url}/cars/${id}`, formData, this.headers);
  }
}
