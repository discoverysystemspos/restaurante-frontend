import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// MODELS
import { Product } from '../../models/product.model';

// SERVICES
import { ProductService } from '../../services/product.service';
import { SearchService } from '../../services/search.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styles: [
  ]
})
export class ProductosComponent implements OnInit {

  public totalProductos: number = 0;
  public productos: Product[] = [];
  public productosTemp: Product[] = [];
  
  public resultado: number = 0;
  public desde: number = 0;
  public cargando: boolean = true;
  public sinResultados: boolean = true;

  public btnAtras: string = '';
  public btnAdelante: string = '';

  constructor( private productService: ProductService,
                private searchService: SearchService,
                private fb:FormBuilder) { }

  ngOnInit(): void {
    
    this.cargarProductos();

    this.cargarCosto();

  }

  /** ================================================================
   *   CARGAR PRODUCTOS
  ==================================================================== */
  cargarProductos(){

    
    this.cargando = true;
    this.sinResultados = true;
    this.productService.cargarProductos(this.desde)
        .subscribe(({total, products}) => {
            
          // COMPROBAR SI EXISTEN RESULTADOS
          if (products.length === 0) {
            this.sinResultados = false;
            this.cargando = false;
            this.productos = [];
            this.resultado = 0;
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
            return;                
          }
          // COMPROBAR SI EXISTEN RESULTADOS
        
          this.totalProductos = total;
          this.productos = products;
          this.productosTemp = products;
          this.resultado = 0;
          this.cargando = false;

          // BOTONOS DE ADELANTE Y ATRAS          
          if (this.desde === 0 && this.totalProductos > 10) {
            this.btnAtras = 'disabled';
            this.btnAdelante = '';
          }else if(this.desde === 0 && this.totalProductos < 11){
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
          }else if((this.desde + 10) >= this.totalProductos){
            this.btnAtras = '';
            this.btnAdelante = 'disabled';
          }else{
            this.btnAtras = '';
            this.btnAdelante = '';
          }   
          // BOTONOS DE ADELANTE Y ATRAS    
            
        });

  }

  /** ================================================================
   *   CARGAR COST PRODUCTOS
  ==================================================================== */
  public totalCost: number;
  public totalPrice: number;
  cargarCosto(){

    this.productService.cargarProductoCost()
    .subscribe(({costo, precio}) => {

      this.totalCost = costo;
      this.totalPrice = precio;

    });

  }

  /** ================================================================
   *   CAMBIAR PAGINA
  ==================================================================== */
  cambiarPagina (valor: number){
    this.desde += valor;

    if (this.desde < 0) {
      this.desde = 0;
    }else if( this.desde > this.totalProductos ){
      this.desde -= valor;
    }

    this.cargarProductos();

  }
    
  /** ================================================================
   *   BUSCAR
  ==================================================================== */
  buscar( termino:string ){

    this.sinResultados = true;

    if (termino.length === 0) {
      this.productos = this.productosTemp;
      this.resultado = 0;
      return;
    }else{
      this.sinResultados = true;

      this.searchService.search('products', termino)
            .subscribe(({total, resultados}) => {
              
              // COMPROBAR SI EXISTEN RESULTADOS
              if (resultados.length === 0) {
                this.sinResultados = false;
                this.productos = [];
                this.resultado = 0;
                return;                
              }
              // COMPROBAR SI EXISTEN RESULTADOS

              this.totalProductos = total;
              this.productos = resultados; 
              this.resultado = resultados.length;          
            });
    }    

  }

  /** ================================================================
   *   BORRAR Producto
  ==================================================================== */
  borrarProducto(_id: string){

    this.productService.deleteProduct(_id)
        .subscribe(resp =>{
          Swal.fire('Estupendo', 'Se ha borrado el Producto exitosamente!', 'success');
          this.cargarProductos();
        }, (err) =>{
          Swal.fire('Error', err.error.msg, 'error');
        });
  }

  // FIN DE LA CLASE
}
