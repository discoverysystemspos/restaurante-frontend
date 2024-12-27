import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Compra } from 'src/app/models/compras.model';
import { Proveedor } from 'src/app/models/proveedor.model';
import { ComprasService } from 'src/app/services/compras.service';
import { SearchService } from 'src/app/services/search.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-facturas-compras',
  templateUrl: './facturas-compras.component.html',
  styleUrls: ['./facturas-compras.component.css']
})
export class FacturasComprasComponent implements OnInit {
  

  constructor(  private comprasService: ComprasService,
                private searchService: SearchService,
  ) { }

  ngOnInit(): void {
    this.loadQueryInvoices(); 
  }

  /** ================================================================
   *   BUSCAR QUERY
  ==================================================================== */
  public facturas: Compra[] = [];
  public resultado: number = 0;
  public total: number = 0;
  public totalAmount: number = 0;
  public totalAbonado: number = 0;
  public cargando: boolean = true;
  public query: any = {
    desde: 0,
    hasta: 50,
    sort: {invoice: -1}
  }

  loadQueryInvoices(){

    this.totalAmount = 0; 
    this.totalAbonado = 0;
    this.cargando = true;

    this.comprasService.loadCompras(this.query)
        .subscribe( ({compras, total}) => {
          
          this.total = total;
          this.cargando = false;
          this.facturas = compras; 
          this.resultado = compras.length;

          for (const compra of compras) {

            if (!compra.status) {
              return;
            }

            this.totalAmount += compra.amount;

            if (compra.credito) {
              
              for (const paid of compra.payments) {
                this.totalAbonado += paid.amount;
              }
              
            }

          }


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
    
    this.loadQueryInvoices();
    
  }

  /** ================================================================
   *   CHANGE LIMITE
  ==================================================================== */
  limiteChange( cantidad: any ){  

    this.query.hasta = Number(cantidad);    
    this.loadQueryInvoices();

  }

  /** ================================================================
   *   RECARGAR
  ==================================================================== */
  recargar(){
    this.query ={
      desde: 0,
      hasta: 50,
      sort: {invoice: -1}
    }

    this.loadQueryInvoices();
  }

  /** ================================================================
     *   BUSCAR CLIENTE
    ==================================================================== */
    public sinResultadosProveedor: boolean = false;
    public cargandoProveedor: boolean = true;
    public listaProveedores: Proveedor[] = [];
    public listaProveedoresTemp: Proveedor[] = [];
    public totalProveedores: number = 0;
    public proveedor: Proveedor;
    @ViewChild('searchClient') searchClient: ElementRef;
    buscarProveedor(termino: string){
  
      this.cargandoProveedor = false;
      this.sinResultadosProveedor = false;
  
      if (termino.length === 0) {
        this.listaProveedores = this.listaProveedoresTemp;
        this.sinResultadosProveedor = true;
        this.cargandoProveedor = true;
        return;
      }else{
      
        this.searchService.search('proveedores', termino)
            .subscribe(({total, resultados}) => {   
              
            this.cargandoProveedor = false;
            
            // COMPROBAR SI EXISTEN RESULTADOS
            if (resultados.length === 0) {
              this.listaProveedores = [];
              this.totalProveedores = 0;
              this.sinResultadosProveedor = true;
              return;                
            }
            // COMPROBAR SI EXISTEN RESULTADOS
            
            this.listaProveedores = resultados;
            this.totalProveedores = total;
  
          });
      }
  
    }

    /** ================================================================
     *   SELECT CLIENT
    ==================================================================== */
    selectC(proveedor: Proveedor){
  
      this.proveedor = proveedor;
      this.query.proveedor = this.proveedor.provid!;
      this.loadQueryInvoices();
      this.searchClient.nativeElement.value = '';
      this.listaProveedores = [];
  
    }

    /** ================================================================
    *   DELETE CLIENT CLIENT
    ==================================================================== */
    deleteProveedor(){
      delete this.query.proveedor;
      delete this.proveedor;
      this.loadQueryInvoices();
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

    this.loadQueryInvoices();   
    
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

    this.loadQueryInvoices();   

  }

  /** ================================================================
   *   TIPO DE FACTURA
  ==================================================================== */
  searchInvoiceType(type: string){

    if (type === 'all') {
      delete this.query.credito;      
    }else if (type === 'credito') {
      this.query.credito = true;      
    }else{
      this.query.credito = false;
    }

    this.loadQueryInvoices();

  }


}
