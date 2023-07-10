import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { Alquiler } from 'src/app/models/alquileres.model';
import { Client } from 'src/app/models/client.model';
import { Product } from 'src/app/models/product.model';

import { AlquileresService } from 'src/app/services/alquileres.service';
import { SearchService } from 'src/app/services/search.service';
import { ProductService } from 'src/app/services/product.service';

interface _item {
    product: string;
    producto: Product;
    qty: number;
    price: number;
    dias: number;
    entregado: boolean;
    desde?: Date;
    hasta?: Date;
}

interface _query{
  desde: number;
  hasta: number;
  client?: string;
}

@Component({
  selector: 'app-alquileres',
  templateUrl: './alquileres.component.html',
  styles: [
  ]
})
export class AlquileresComponent implements OnInit {

  public resultado: number = 0;
  public cargando: boolean = true;
  public sinResultados: boolean = true;

  public btnAtras: string = '';
  public btnAdelante: string = '';

  constructor(  private alquileresService: AlquileresService,
                private fb: FormBuilder,
                private searchService: SearchService,
                private productService: ProductService) { }

  ngOnInit(): void {

    // CARGAR ALQUILERES
    this.cargarAlquileres();
  }

  /** ================================================================
   *   CARGAR ALQUILERES
  ==================================================================== */
  public query: _query = {
    desde: 0,
    hasta: 50
  };
  public alquileres: Alquiler[] = [];
  public alquileresTemp: Alquiler[] = [];
  public total: number = 0;
  cargarAlquileres(){

    this.alquileresService.loadAlquileres(this.query)
        .subscribe( ({alquileres, total}) => {

          this.alquileres = alquileres;
          this.alquileresTemp = alquileres;
          this.total = total;
          this.cargando = false;

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');
        })

  }

  /** ================================================================
   *   CREAR ALQUILER
  ==================================================================== */
  @ViewChild('inAddress') inAddress: ElementRef;
  public formSubmitted: boolean = false;
  public createForm = this.fb.group({
    client: '',
    monto: 0,
    address: '',
    items: [],
    amount: 0
  });
  
  crearAlquiler(){

    this.createForm.value.address = this.inAddress.nativeElement.value;

    if (this.items.length === 0) {
      Swal.fire('Atención', 'Debes de agregar un producto para poder crear el alquiler', 'warning');
      return;
    }

    this.formSubmitted = true;

    if (this.createForm.invalid) {
      return;
    }
    
    this.createForm.value.client = this.clientS.cid;
    this.createForm.value.amount = this.amount;
    this.createForm.value.items = this.items;
    

    this.alquileresService.createAlquiler(this.createForm.value)
        .subscribe( ({alquiler}) => {

          delete this.clientS;
          this.amount = 0;

          this.descontarInventario();

          this.cargarAlquileres();
          Swal.fire('Estupendo', 'Se ha creado el alquiler exitosamente!', 'success');

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        });
    
  }
  
  /** ================================================================
   *  VALIDAR
  ==================================================================== */
  campoValido(campo: string): boolean{

    if (this.createForm.get(campo).invalid && this.formSubmitted) {      
      return true;
    }else{
      return false;
    }

  }

  /** ================================================================
   *  DESCONTAR ITEMS DEL INVENTARIO
  ==================================================================== */
  descontarInventario(){

    if (this.items.length > 0) {
      
      for (const item of this.items) {        
        
        let inventario:number = Number(item.producto.inventario - item.qty);
        let out = false;
        let low = false;

        if (inventario <= 0) {
          out = true;
        }else if( inventario < item.producto.min &&  inventario > 0){
          out = false;
          low = true;
        }
        
        let update = {
          inventario, 
          code: item.producto.code, 
          name: item.producto.name, 
          low, 
          out
        }

        this.productService.actualizarProducto( update, item.product )
            .subscribe( (resp) => {
              
              // ELIMINAMOS LOS ITEMS
              this.eliminarItem(item);
              
            }, (err) => {
              console.log(err);
              
            })


      }

    }

  }

  /** ================================================================
  /** ================================================================
  /** ================================================================
  /** ================================================================
  /** ================================================================
  /** ================================================================
  /** ================================================================
   *   CLIENTES BUSCAR
  ==================================================================== */
  @ViewChild('searchC') searchC: ElementRef;
  public listClients: Client[] = [];
  public clientS!: Client;
  searchClient(termino: string){

    if (termino.length === 0 || termino.length < 3) {
      this.listClients = [];
      return;
    }

    this.searchService.search('clients', termino)
        .subscribe( ({resultados}) => {

          this.listClients = resultados;
          
        }, (err) => {
          console.log(err);
          
        });

  }

  /** ================================================================
   *   SEARCH CLIENT
  ==================================================================== */
  public clients: any[] = [];
  public clientSeleted: Client;
  buscarClient(termino: string){

    this.listClients = [];
    
    if (termino.length < 1) {
      this.listClients = [];
      return;      
    }
    
    this.searchService.search('clients', termino)
    .subscribe( ({resultados}) => {      

        this.clients = resultados;          

      }, (err) => {
        console.log(err);
        
      });

  }

  /** ================================================================
   *   BUSCAR ALQUILERES DEL CLIENTE
  ==================================================================== */
  @ViewChild('searchCl') searchCl: ElementRef;
  /**
   * The function "buscarAlquilerClient" clears the search input, resets the clients array, sets the
   * query client to the given cid, and loads the rentals.
   * @param {string} cid - string - the client ID to search for in the rental database.
   */
  buscarAlquilerClient(cid: string){

    this.searchCl.nativeElement.value = '';
    this.clients = [];

    this.query.client = cid;

    this.cargarAlquileres();
    
  }

  /** ================================================================
  /** ================================================================
  /** ================================================================
  /** ================================================================
  /** ================================================================
  /** ================================================================
  /** ================================================================
   *   PRODUCTOS BUSCAR
  ==================================================================== */
  @ViewChild('searchP') searchP: ElementRef;
  public listProducts: Client[] = [];
  public items: _item[] = [];
  public productS: Product;
  searchProduct(termino: string){

    if (termino.length === 0 || termino.length < 3) {
      this.listClients = [];
      return;
    }

    this.searchService.search('products', termino)
        .subscribe( ({resultados}) => {

          this.listProducts = resultados;
          

        }, (err) => {
          console.log(err);
          
        });

  }

  /** ================================================================
   *   AGREGAR PRODUCTOS
  ==================================================================== */
  agregarItems(qty: number, dias: number, price: number){

    let item: _item = {
      product: this.productS.pid,
      producto: this.productS,
      qty,
      price: price,
      dias: dias,
      entregado: false
    }

    this.items.push(item);
    this.sumarTotales();

    this.searchP.nativeElement.value = '';
    this.searchP.nativeElement.focus();

  }

  /** ================================================================
   *   ELIMINAR PRODUCTOS
  ==================================================================== */
  eliminarItem(item: any){

    this.items.splice(item, 1);
    this.sumarTotales();

  }

  /** ================================================================
   *   SUMAR TOTALES
  ==================================================================== */
  public amount: number = 0;
  sumarTotales(){

    this.amount = 0;

    for (const item of this.items) {
      this.amount += ((item.price * item.qty) * item.dias);
    }

  }

  /** ================================================================
   *   CANCELAR ALQUILER
  ==================================================================== */
  statusUpdate(alquiler: Alquiler){

    let status = false;
    if( !alquiler.status ){
      status = true;
    }

    this.alquileresService.updateAlquiler({status}, alquiler.alid)
        .subscribe( ({alquiler}) => {

          Swal.fire('Estupendo', 'Se ha cambiado el estado del alquiler exitosamente', 'success');
          this.alquileres.map( (alq) => {

            if (alq.alid === alquiler.alid) {
              alq.status = status;
            }

          })

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  

  // FIN DE LA CLASE
}
