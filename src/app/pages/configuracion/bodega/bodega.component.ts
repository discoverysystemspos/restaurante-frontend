import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Bodega } from 'src/app/models/bodegas.model';
import { Product } from 'src/app/models/product.model';
import { Traslado } from 'src/app/models/traslados.model';
import { BodegasService } from 'src/app/services/bodegas.service';
import { SearchService } from 'src/app/services/search.service';
import { TrasladosService } from 'src/app/services/traslados.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bodega',
  templateUrl: './bodega.component.html',
  styleUrls: ['./bodega.component.css']
})
export class BodegaComponent implements OnInit {

  constructor(  private activatedRoute: ActivatedRoute,
                private bodegasService: BodegasService,
                private trasladosService: TrasladosService,
                private searchService: SearchService
  ) { 

    activatedRoute.params.subscribe( ({id}) => {

      this.loadBodega(id);

    })

  }

  ngOnInit(): void {
  }

  /** ================================================================
   *   LOAD BODEGAth
  ==================================================================== */
  public bodega: Bodega;
  loadBodega(id: string){

    this.bodegasService.loadBodegaId(id)
        .subscribe( ({bodega}) => {

          this.bodega = bodega;
          this.loadTraslados();

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  /** ================================================================
   *   LOAD TRASLADOS OF BODEGA
  ==================================================================== */
  public traslados: Traslado[] = [];
  public query: any = {
    desde: 0,
    hasta: 50,
    sort: {fecha : -1}
  }

  loadTraslados(){

    this.query.bodega = this.bodega.bid;
    
    this.trasladosService.loadTraslados(this.query)
        .subscribe( ({traslados}) => {

          this.traslados = traslados;

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  /** ================================================================
   *   BUSCAR PRODUCTO
  ==================================================================== */
  @ViewChild('search') search: ElementRef;  
  @ViewChild('psCode') psCode: ElementRef;  
  @ViewChild('psName') psName: ElementRef;
  @ViewChild('psCost') psCost: ElementRef;
  @ViewChild('psPrice') psPrice: ElementRef;
  @ViewChild('psWholesale') psWholesale: ElementRef;
  @ViewChild('psQty') psQty: ElementRef;

  public productS: Product;
  public listProducts: any[] = [];
  searchProduct(termino: string){

    if (termino.length === 0) {
      return;
    }

    this.searchService.search('products', termino)
        .subscribe( (resp) => {

          this.listProducts = resp.resultados;
          

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  selectProduct(product: Product){

    this.psCode.nativeElement.value = product.code;
    this.psName.nativeElement.value = product.name;
    this.psCost.nativeElement.value = product.cost;
    this.psPrice.nativeElement.value = product.price;
    this.psWholesale.nativeElement.value = product.wholesale;
    this.psQty.nativeElement.focus();
    
    this.listProducts = [];
    this.productS = product;
    
    this.search.nativeElement.value = '';
  }

  /** ================================================================
   *   AGREGAR PRODUCT
  ==================================================================== */
  public items: any[] = [];
  agregarProducto(qty: any){

    qty = Number(qty);

    if(qty <= 0 ){
      Swal.fire('Atención', 'debes de agregar una cantidad valida', 'warning');
      return;
    }

    if(Number(this.psCost.nativeElement.value) <= 0 ){
      Swal.fire('Atención', 'debes de agregar un precio de costo valido', 'warning');
      return;
    }

    if(Number(this.psCost.nativeElement.value) <= 0 ){
      Swal.fire('Atención', 'debes de agregar un precio de venta valido', 'warning');
      return;
    }

    if (Number(this.psWholesale.nativeElement.value) > 0) {
      this.items.push({
        product: this.productS,
        code: this.psCode.nativeElement.value,
        qty,
        cost: this.psCost.nativeElement.value,
        price: this.psPrice.nativeElement.value,
        wholesale: this.psWholesale.nativeElement.value
      })
      
    }else{
      this.items.push({
        product: this.productS,
        code: this.psCode.nativeElement.value,
        qty,
        cost: this.psCost.nativeElement.value,
        price: this.psCost.nativeElement.value
      })
    }

    this.psCode.nativeElement.value = '';
    this.psName.nativeElement.value = '';
    this.psCost.nativeElement.value = '';
    this.psPrice.nativeElement.value = '';
    this.psWholesale.nativeElement.value = '';
    this.psQty.nativeElement.value = '';

    delete this.productS;
    this.search.nativeElement.focus();    

  }

  /** ================================================================
   *   DELETE PRODUCT
  ==================================================================== */
  deleteProduct(i: any){

    this.items.splice(i,1);

  }

}
