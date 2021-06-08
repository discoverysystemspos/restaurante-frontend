import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators';

// INTERFACES
import { LoadLogProducts } from '../interfaces/load-log-products.interface';

import { environment } from '../../environments/environment';
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class LogProductsService {

  constructor(private http: HttpClient) { }

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
   *  LOAD LOGS PRODUCTS
  ==================================================================== */
  loadLogP(desde:number, limite){
    
    return this.http.get<LoadLogProducts>(`${base_url}/log/products?desde=${desde}&limite=${limite}`, this.headers)
                .pipe(
                  map( resp => {
                      return resp;
                    })
                )

  }

}
