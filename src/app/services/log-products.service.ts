import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators';

// INTERFACES
import { LoadLogProducts } from '../interfaces/load-log-products.interface';

import { environment } from '../../environments/environment';
import { LogProductsModel } from '../models/log-products';
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
   *  LOAD LOGS PRODUCTS QUERY
  ==================================================================== */
  loadLogProductsQuery(query: any){
    return this.http.post<LoadLogProducts>(`${base_url}/log/products/query`, query, this.headers)
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

  /** ================================================================
   *  LOAD LOGS PRODUCTS DATE
  ==================================================================== */
  loadDateLogs(initial: Date, end: Date, query: string){
    return this.http.get<{ products: LogProductsModel[], ok: boolean }>(`${base_url}/log/products/query/date?initial=${initial}&end=${end}&query=${query}`, this.headers);
  }

  /** ================================================================
   *  LOAD LOGS PRODUCTS DATE
  ==================================================================== */
  loadOneProductLogs(initial: Date = new Date , end: Date = new Date, code: string, fecha: string, desde : number = 0, limite: number = 10){
    return this.http.get<{ products: LogProductsModel[], ok: boolean, total: number }>(`${base_url}/log/products/product/${code}/date?initial=${initial}&end=${end}&fecha=${fecha}&desde=${desde}&limite=${limite}`, this.headers);
  }

}
