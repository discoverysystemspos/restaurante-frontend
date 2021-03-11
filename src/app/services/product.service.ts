import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators'

// INTERFACES
import { LoadProduct } from '../interfaces/load-products.interface';

// MODELS
import { Product } from '../models/product.model';

import { environment } from '../../environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  public product: Product;

  constructor( private http: HttpClient ) { }

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
   *   CREATE PRODUCT
  ==================================================================== */
  createProduct(formData:any){
    
    return this.http.post(`${base_url}/products`, formData, this.headers);

  }

  /** ================================================================
   *   CARGAR PRODUCTOS
  ==================================================================== */
  cargarProductos(desde: number = 0){
    const endPoint = `/products?desde=${desde}`;
    return this.http.get<LoadProduct>(`${base_url}${endPoint}`, this.headers)
            .pipe(
              delay(500),
              map( resp => {
                return resp;
              })
            );
  }

  /** ================================================================
   *   CARGAR PRODUCTOS POR ID
  ==================================================================== */
  cargarProductoId( id: string){
    const endPoint = `/products/${id}`;
    return this.http.get(`${base_url}${endPoint}`, this.headers)
            .pipe(
              delay(500),
              map( (resp: {ok: boolean, product: Product} ) => resp.product)
            );
  }

  /** ================================================================
   *   CARGAR PRODUCTOS POR CODIGO
  ==================================================================== */
  cargarProductoCodigo( code: string ){
    const endPoint = `/products/code/${code}`;
    return this.http.get(`${base_url}${endPoint}`, this.headers)
              .pipe(
                map( (resp: {ok: boolean, product: Product} ) => resp.product)
              );
  }

  /** ================================================================
   *   CARGAR PRODUCTOS POR DEPARTAMENTO
  ==================================================================== */
  cargarProductoDepartamento( department: string ){
    const endPoint = `/products/department/${department}`;
    return this.http.get<LoadProduct>(`${base_url}${endPoint}`, this.headers)
                    .pipe(
                      delay(500),
                      map( resp => {
                        return resp;
                      })
                    );
  }

  /** ================================================================
   *   ACTUALIZAR PRODUCTO
  ==================================================================== */
  actualizarProducto(formData:any, _id:string){
    return this.http.put(`${base_url}/products/${_id}`, formData, this.headers);
  }

  /** ================================================================
   *   DELETE PRODUCTO
  ==================================================================== */
  deleteProduct( _id: string){
    return this.http.delete(`${base_url}/products/${_id}`, this.headers);
  }

  // FIN DE LA CLASE
}
