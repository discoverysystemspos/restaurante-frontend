import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

// MODEL
import { LogProductsModel } from '../../../models/log-products';

// SERVICES
import { LogProductsService } from '../../../services/log-products.service';
import { SearchService } from '../../../services/search.service';
import { DepartmentService } from '../../../services/department.service';
import { Department } from '../../../models/department.model';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.component.html',
  styles: [
  ]
})
export class MovimientosComponent implements OnInit {

  public total: number = 0;
  public productosLog: LogProductsModel[] = [];
  public productosLogTemp: LogProductsModel[] = [];
  
  public resultado: number = 0;
  public desde: number = 0;
  public limite: number = 10;
  public cargando: boolean = true;
  public sinResultados: boolean = true;

  public btnAtras: string = '';
  public btnAdelante: string = '';

  constructor(  private logProductsServices: LogProductsService,
                private searchService: SearchService,
                private departmentService: DepartmentService ) { }

  ngOnInit(): void {

    // CARGAR LOG DE PRODUCTOS
    this.cargarLogProductos();

    // CARGAR DEPARTAMENTOS
    this.cargarDepartamento();

  }

  /** ================================================================
   *   CARGAR DEPARTAMENTOS
  ==================================================================== */
  public departamentos: Department[] = [];
  cargarDepartamento(){

    this.departmentService.loadDepartment()
        .subscribe( ({departments}) => {

          this.departamentos = departments;          

        });

  }

  /** ================================================================
   *   CARGAR LOG PRODUCTOS
  ==================================================================== */
  cargarLogProductos(){

    this.cargando = true;
    this.sinResultados = true;

    this.logProductsServices.loadLogP(this.desde, this.limite)
        .subscribe( ({ products, total }) => {

          // COMPROBAR SI EXISTEN RESULTADOS
          if (products.length === 0) {
            this.sinResultados = false;
            this.cargando = false;
            this.productosLog = [];
            this.resultado = 0;
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
            return;                
          }
          // COMPROBAR SI EXISTEN RESULTADOS

          this.total = total;
          this.productosLog = products;
          this.productosLogTemp = products;
          this.resultado = 0;
          this.cargando = false;

          // BOTONOS DE ADELANTE Y ATRAS          
          if (this.desde === 0 && this.total > this.limite) {
            this.btnAtras = 'disabled';
            this.btnAdelante = '';
          }else if(this.desde === 0 && this.total < (this.limite + 1)){
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
          }else if( this.desde >= this.total){
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
   *   CAMBIAR PAGINA
  ==================================================================== */
  cambiarPagina (direccion:string){

    let valor:number = 10;
    if (direccion === 'next') {
      valor = this.limite;
    }else if(direccion === 'back'){
      valor = this.limite * -1;
    }

    this.desde += valor;

    if (this.desde < 0) {
      this.desde = 0;
    }else if( this.desde > this.total ){
      this.desde -= valor;
    }

    this.cargarLogProductos();

  }

  /** ================================================================
   *   CAMBIAR LIMITE
  ==================================================================== */
  // @ViewChild('limit') limit: ElementRef;
  cambiarLimite(limite:number){

    this.limite = limite;
    // this.limit.nativeElement.value = this.limit;
    this.cargarLogProductos();    

  }

  /** ================================================================
   *   BUSCAR
  ==================================================================== */
  public monto: number = 0;
  buscar( termino:string ){

    this.sinResultados = true;
    this.monto = 0;

    if (termino.length === 0) {
      this.productosLog = this.productosLogTemp;
      this.resultado = 0;
      return;
    }else{
      this.sinResultados = true;

      this.searchService.search('log', termino)
            .subscribe(({total, resultados}) => {
              
              // COMPROBAR SI EXISTEN RESULTADOS
              if (resultados.length === 0) {
                this.sinResultados = false;
                this.productosLog = [];
                this.resultado = 0;
                return;                
              }
              // COMPROBAR SI EXISTEN RESULTADOS

              for (const log of resultados) {
                this.monto += log.monto || 0;
              }              

              this.total = total;
              this.productosLog = resultados; 
              this.resultado = resultados.length;

            });
    }    

  }


  buscarPor(inicial:Date, final: Date, departamento: string){

    this.monto = 0;
    this.sinResultados = true;

    if(departamento === 'none' && inicial === null && final === null){
      this.productosLog = this.productosLogTemp;
      this.resultado = 0;
      return;
    }

    // SET HOURS      
    inicial = new Date(inicial);      
    const initial = new Date(inicial.getTime());

    final = new Date(final);
    const end = new Date(final.getTime());      
    // SET HOURS 

    this.logProductsServices.loadDateLogs(initial, end, departamento)
        .subscribe( ({products}) => {

          // COMPROBAR SI EXISTEN RESULTADOS
          if (products.length === 0) {
            this.sinResultados = false;
            this.productosLog = [];
            this.resultado = 0;
            return;                
          }
          // COMPROBAR SI EXISTEN RESULTADOS

          for (const log of products) {
            this.monto += log.monto || 0;
          }   

          this.productosLog = products; 
          this.resultado = products.length;
          
        });

  }

  // FIN DE LA CLASE
}
