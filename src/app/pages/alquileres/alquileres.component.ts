import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { Alquiler } from 'src/app/models/alquileres.model';
import { Client } from 'src/app/models/client.model';
import { Product } from 'src/app/models/product.model';

import { AlquileresService } from 'src/app/services/alquileres.service';
import { SearchService } from 'src/app/services/search.service';

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
                private searchService: SearchService) { }

  ngOnInit(): void {

    // CARGAR ALQUILERES
    this.cargarAlquileres();
  }

  /** ================================================================
   *   CARGAR ALQUILERES
  ==================================================================== */
  public query = {};
  public alquileres: Alquiler[] = [];
  public alquileresTemp: Alquiler[] = [];
  public total: number = 0;
  public desde: number = 0;
  public hasta: number = 50;
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
  public formSubmitted: boolean = false;
  public createForm = this.fb.group({
    client: '',
    monto: 0,
    address: ['', [Validators.required]],
    items: [],
    amount: 0,
    cotizacion: false
  });
  
  crearAlquiler(){

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
  /** ================================================================
  /** ================================================================
  /** ================================================================
  /** ================================================================
  /** ================================================================
  /** ================================================================
   *   PRODUCTOS BUSCAR
  ==================================================================== */
  // @ViewChild('searchC') searchC: ElementRef;
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

  // FIN DE LA CLASE
}
