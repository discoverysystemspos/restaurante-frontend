import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { _productTraslados, Traslado } from 'src/app/models/traslados.model';
import { SearchService } from 'src/app/services/search.service';
import { TrasladosService } from 'src/app/services/traslados.service';
import Swal from 'sweetalert2';

import { environment } from 'src/environments/environment';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { Bodega } from 'src/app/models/bodegas.model';
import { BodegasService } from 'src/app/services/bodegas.service';
import { Product } from 'src/app/models/product.model';


@Component({
  selector: 'app-traslados',
  templateUrl: './traslados.component.html',
  styleUrls: ['./traslados.component.css']
})
export class TrasladosComponent implements OnInit {

  public user!: User;

  constructor(  private trasladosService: TrasladosService,
                private bodegasService: BodegasService,
                private searchService: SearchService,
                private userService: UserService
  ) { 
    this.user = userService.user;
  }

  ngOnInit(): void {

    this.loadQueryTraslados();
  }

  /** ================================================================
     *   BUSCAR QUERY
    ==================================================================== */
    public traslados: Traslado[] = [];
    public resultado: number = 0;
    public total: number = 0;
    public cargando: boolean = true;
    public query: any = {
      desde: 0,
      hasta: 50,
      type: 'Enviado',
      sort: {fecha: -1}
    }
  
    loadQueryTraslados(){

      this.cargando = true;
      
      this.trasladosService.loadTraslados(this.query)
        .subscribe( ({traslados}) => {

              this.cargando = false;
              this.traslados = traslados;
              this.resultado = traslados.length;

            }, (err) => {
              console.log(err);
              Swal.fire('Error', err.error.msg, 'error');            
            })
  
    }
  
  
    /** ================================================================
     *   CAMBIAR PAGINA
    ==================================================================== */
    @ViewChild('mostrar') mostrar!: ElementRef;
    cambiarPagina (valor: number){
      
      this.query.desde += valor;
  
      if (this.query.desde < 0) {
        this.query.desde = 0;
      }
      
      this.loadQueryTraslados();
      
    }
  
    /** ================================================================
     *   CHANGE LIMITE
    ==================================================================== */
    limiteChange( cantidad: any ){  
  
      this.query.hasta = Number(cantidad);    
      this.loadQueryTraslados();
  
    }
  
    /** ================================================================
     *   RECARGAR
    ==================================================================== */
    recargar(){
      this.query ={
        desde: 0,
        hasta: 50,
        type: 'Enviado',
        sort: {fecha: -1}
      }
  
      this.loadQueryTraslados();
    }
  
    /** ================================================================
     *   SEARCH FOR DATE
    ==================================================================== */
    searchForDates(inicial:Date, final: Date){
  
      if (inicial === null && final === null || !inicial || !final) {
        return;
      }
  
      // SET HOURS      
      inicial = new Date(inicial);      
      let initial = new Date(inicial.getTime() + 1000 * 60 * 60 * 5);
  
      final = new Date(final);
      let end = new Date(final.getTime() + 1000 * 60 * 60 * 5);      
      // SET HOURS 
  
      let url = document.URL.split(':');
      if (url[0] === 'https') {
        initial = new Date(inicial.getTime() + 1000 * 60 * 60 - 7200000); 
        end = new Date(final.getTime() + 1000 * 60 * 60 - 3600000);        
      }
  
      this.query.$and = [{ fecha: { $gte: new Date(initial), $lt: new Date(end) } }];
  
      this.loadQueryTraslados();   
      
    }
  
    /** ================================================================
     *   LOAD FOR STATUS
    ==================================================================== */
    searchStatus(status: boolean){
  
      if (status) {
        delete this.query.status;
      }else{
        this.query.status = status;
      }
  
      this.loadQueryTraslados();   
  
    }
  
    /** ================================================================
     *   TIPO DE FACTURA
    ==================================================================== */
    searchTrasladosType(type: string){
  
      this.query.type = type;
  
      this.loadQueryTraslados();
  
    }

    /** ================================================================
     *   SEARCH REFERENCIA
    ==================================================================== */
    searchReferencia(referencia: string){

      if (referencia.length === 0) {
        this.query.type = 'Enviado';
        delete this.query.referencia;
      }else{
        this.query.referencia = referencia;
        delete this.query.type;
      }

      this.loadQueryTraslados();   
    }

    /** ================================================================
     *   SEARCH BODEGA
    ==================================================================== */
    public bodegasLists: Bodega[] = [];
    public queryB: any = {
      desde: 0,
      hasta: 10
    }

    searchBodega(termino: string){      

      if (termino.length <= 0) {
        delete this.queryB['$or'];
        this.bodegasLists = [];
        return;
      }

      const regex = { $regex: termino, $options: 'i' }; // Construir regex      
      this.queryB.$or = [
        { name: regex }
      ];      

      this.bodegasService.loadBodegas(this.queryB)
          .subscribe( ({bodegas}) => {

            this.bodegasLists = bodegas;
            console.log(bodegas);
            

          }, (err) => {
            console.log(err);
            Swal.fire('Error', err.error.msg, 'error');            
          })


    }

    /** ================================================================
     *   SEARHC PRODUCT
    ==================================================================== */
    public productsLists: Product[] = [];
    public productSeletec!: Product;
    searchProduct(termino: string){

      if (termino.length <= 0) {
        this.productsLists = [];
        return
      }

      this.searchService.search('products', termino)
          .subscribe( ({resultados}) => {
            this.productsLists = resultados;
          }, (err) => {
            console.log(err);
            Swal.fire('Error', err.error.msg, 'error');            
          })

    }

    /** ================================================================
     *   ADD PRODUCT
    ==================================================================== */
    @ViewChild ('qtyI') qtyI: ElementRef;
    @ViewChild ('searchP') searchP: ElementRef;
    addProduct(qty: any){

      if (!this.productSeletec) {
        return;
      }

      qty = Number(qty);

      this.formaData.products.push({
        code: this.productSeletec.code,
        name: this.productSeletec.name,
        type: this.productSeletec.type,
        qty: qty,
        cost: this.productSeletec.cost,
        gain: this.productSeletec.gain,
        price: this.productSeletec.price,
        wholesale: this.productSeletec.wholesale,
        distribuidor: this.productSeletec.distribuidor,
        confirmado: false,
      })

      delete this.productSeletec;
      this.qtyI.nativeElement.value = 0;
      this.searchP.nativeElement.value = '';
      this.searchP.nativeElement.focus();

    }

    /** ================================================================
     *   DEL PRODUCT
    ==================================================================== */
    delProduct(i: any){
      this.formaData.products.splice(i,1);
    }

    /** ================================================================
     *   CREATE
    ==================================================================== */
    public products: _productTraslados[] = [];
    public bodegaSelected!: Bodega;
    public formaData: any = {
      desde: environment.base_url,
      products: [],
      type: 'Enviado'
    }

    create(){

      if (this.formaData.products.length === 0) {
        Swal.fire('Atención', 'No has agregado productos', 'warning');
        return;
      }

      if (!this.bodegaSelected) {
        Swal.fire('Atención', 'No has seleccionado ninguna sucursal o bodega', 'warning');
        return;
      }

      this.formaData.bodega = this.bodegaSelected.bid;
      this.formaData.user = this.user.name;

      this.trasladosService.createTraslado(this.formaData)
          .subscribe( ({traslado}) => {
            this.traslados.push(traslado);

            this.formaData.type = 'Recibido';
            this.formaData.referencia = traslado.referencia;
            this.formaData.estado = 'En Camino';
            this.formaData.desde = traslado.desde;
            this.formaData.trasid = traslado._id;

            this.trasladosService.sendTraslado(this.formaData, `${this.bodegaSelected.endpoint}/api`)
                .subscribe( ({traslado}) => {

                  Swal.fire('Estupendo', 'se ha creado el traslado exitosamente', 'success');
                  delete this.bodegaSelected;
                  this.formaData = {
                    desde: environment.base_url,
                    user: this.user.name,
                    products: [],
                    type: 'Enviado'
                  }

                }, (err) => {
                  console.log(err);
                  Swal.fire('Error', err.error.msg, 'error');                  
                })

          }, (err) => {
            console.log(err);
            Swal.fire('Error', err.error.msg, 'error');            
          })

    }    

}
