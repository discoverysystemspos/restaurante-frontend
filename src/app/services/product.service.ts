import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators'

// INTERFACES
import { LoadProduct, LoadCost } from '../interfaces/load-products.interface';

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
    
    return this.http.post(`${base_url}/products`, formData, this.headers)
        .pipe(
          delay(200),
          map( resp => {
            return resp;
          })
        );

  }

  /** ================================================================
   *   CARGAR PRODUCTOS
  ==================================================================== */
  cargarProductos(endPoitn: string){
    const endPoint = `/products${endPoitn}`;
    return this.http.get<LoadProduct>(`${base_url}${endPoint}`, this.headers)
            .pipe(
              map( resp => {
                return resp;
              })
            );
  }

  /** ================================================================
   *   CARGAR COSTS PRODUCTOS
  ==================================================================== */
  cargarProductoCost(){
    const endPoint = `/products/cost/`;
    return this.http.get<LoadCost>(`${base_url}${endPoint}`, this.headers)
            .pipe(
              map( resp => {
                return resp;
              })
            );
  }

  /** ================================================================
   *   CARGAR PRODUCTOS ELIMINADOS
  ==================================================================== */
  cargarProductosEliminados(){
    const endPoint = `/products/eliminados`;
    return this.http.get<LoadProduct>(`${base_url}${endPoint}`, this.headers);
  }

  /** ================================================================
   *   CARGAR PRODUCTOS POR ID
  ==================================================================== */
  cargarProductoId( id: string){
    const endPoint = `/products/${id}`;
    return this.http.get(`${base_url}${endPoint}`, this.headers)
            .pipe(
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
                      map( resp => {
                        return resp;
                      })
                    );
  }

  /** ================================================================
   *   ACTUALIZAR PRODUCTO
  ==================================================================== */
  actualizarProducto(formData:any, _id:string, inventario: boolean = false){
    return this.http.put(`${base_url}/products/${_id}?inventario=${inventario}`, formData, this.headers);
  }

  /** ================================================================
   *   ACTUALIZAR PRODUCTO EXCEL
  ==================================================================== */
  actualizarProductoExcel(formData:any){
    return this.http.put(`${base_url}/products/excel/update`, formData, this.headers);
  }

  /** ================================================================
   *   REPAIR INVENTARIO
  ==================================================================== */
  repararInventario(){
    return this.http.put(`${base_url}/products/repair/inventario`, '',this.headers);
  }

  /** ================================================================
   *   RESET INVENTARIO
  ==================================================================== */
  resetInventario(){
    return this.http.put(`${base_url}/products/reset/inventario`, '',this.headers);
  }

  /** ================================================================
   *   IVA A TODOS
  ==================================================================== */
  ivaAllProducts(formData:any){
    return this.http.put(`${base_url}/products/iva/all`, formData,this.headers);
  }

  /** ================================================================
   *   AJUSTAR INVENTARIO
  ==================================================================== */
  ajustarInventario(id: string, data: any){
    return this.http.put(`${base_url}/products/ajustar/inventario/${id}`, data,this.headers);
  }

  /** ================================================================
   *   DELETE PRODUCTO
  ==================================================================== */
  deleteProduct( _id: string){
    return this.http.delete(`${base_url}/products/${_id}`, this.headers);
  }

  /** ================================================================
   *   ACTUALIZAR PRODUCTO
  ==================================================================== */
  productExcel(){
    const endPoint = `/products/excel/`;
    return this.http.get<LoadProduct>(`${base_url}${endPoint}`)
                    .pipe(
                      map( resp => {
                        return resp;
                      })
                    );
  }

  // FIN DE LA CLASE
}
