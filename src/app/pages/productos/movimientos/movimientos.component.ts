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
  public query: any = {
    desde: 0,
    hasta: 50,
    sort: {fecha: -1}
  }
  
  cargarLogProductos(){

    this.cargando = true;
    this.sinResultados = true;
    this.monto = 0;

    this.logProductsServices.loadLogProductsQuery(this.query)
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
          this.resultado = products.length;
          this.cargando = false;

          for (const log of products) {
            this.monto += log.monto || 0;
          }


        });

  }

  /** ================================================================
   *   CAMBIAR PAGINA
  ==================================================================== */
  @ViewChild('mostrar') mostrar!: ElementRef;
  cambiarPagina (valor: Number){

    this.query.desde += valor;

    if (this.query.desde < 0) {
      this.query.desde = 0;
    }

    this.cargarLogProductos();

  }

  /** ================================================================
   *   CAMBIAR LIMITE
  ==================================================================== */
  limiteChange( cantidad: any ){  

    this.query.hasta = Number(cantidad);    
    this.cargarLogProductos();

  }

  /** ================================================================
   *   BUSCAR
  ==================================================================== */
  public monto: number = 0;
  buscar( termino:string ){

    if (termino.length <= 0) {
      delete this.query['$or'];
      this.cargarLogProductos();
      return;
    }

    const regex = { $regex: termino, $options: 'i' }; // Construir regex      
    this.query.$or = [
      { name: regex },
      { code: regex },
      { description: regex },
      { type: regex },
      { departamento: regex }
    ];

    this.cargarLogProductos();

  }


  buscarPor(inicial:Date, final: Date){

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

    this.cargarLogProductos();

  }

  /** ================================================================
   *   BUSCAR DEPARTAMENTO
  ==================================================================== */
  searchDepartment(departamento: string){    
    
    if (departamento === 'all') {
      delete this.query.departamento;      
    }else{
      this.query.departamento = departamento;
    }

    this.cargarLogProductos();

  }

  // FIN DE LA CLASE
}
