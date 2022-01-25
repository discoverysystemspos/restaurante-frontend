import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

// SERVICES
import { InvoiceService } from '../../../services/invoice.service';
import { SearchService } from '../../../services/search.service';
import { MesasService } from '../../../services/mesas.service';
import { UserService } from '../../../services/user.service';
import { EmpresaService } from '../../../services/empresa.service';

// INTERFACES
import { LoadInvoice } from '../../../interfaces/invoice.interface';

// MODELS
import { Mesa } from '../../../models/mesas.model';
import { User } from '../../../models/user.model';
import { Datos } from '../../../models/empresa.model';

@Component({
  selector: 'app-total',
  templateUrl: './total.component.html',
  styles: [
  ]
})
export class TotalComponent implements OnInit {

  public totalFacturas: number = 0;
  public facturas: LoadInvoice[] = [];
  public facturasTemp: LoadInvoice[] = [];;

  // MESAS
  public listaMesas: Mesa[] = [];
  public listaMesasTemp: Mesa[] = [];
  public totalMesas: number = 0;
  // MESAS

  public cargando: boolean = true;
  public sinResultados: boolean = true;
  public resultado: number = 0;
  public desde: number = 0;

  public btnAtras: string = '';
  public btnAdelante: string = '';

  constructor(  private invoiceService: InvoiceService,
                private searchService: SearchService,
                private mesasService: MesasService,
                private empresaService: EmpresaService,
                private userService: UserService,
                private mesaService: MesasService) { }

  ngOnInit(): void {

    // CARGAR DATOS
    this.cargarDatos();

    // CARGAR MESAS
    this.cargarMesas();

    // CARGAR VENDEDORES
    this.cargarVendedore();

    // CARGAR FACTURAS
    this.cargarFacturas();


  }

  /** ================================================================
   *   CARGAR DATOS DE LA EMPRESA
  ==================================================================== */
  public empresa: Datos;
  cargarDatos(){

    this.empresaService.getDatos()
        .subscribe( datos => {
          this.empresa = datos;   
        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });
  }

  /** ================================================================
   *   CARGAR VENDEDORES
  ==================================================================== */
  public vendedores: User[] = [];
  cargarVendedore(){

    this.userService.loadUsers()
    .subscribe( ({users}) => {
      
      this.vendedores = users;          
      
    }, (err) => { Swal.fire('Error', 'No se pueden cargar los vendedores', 'error') });
    
  }

  /** ================================================================
   *  CARGAR FACTURAS
  ==================================================================== */
  cargarFacturas(){

    this.cargando = true;
    this.sinResultados = true;

    this.invoiceService.loadInvoices(this.desde)
        .subscribe(({total, invoices}) => {

          // COMPROBAR SI EXISTEN RESULTADOS
          if (invoices.length === 0) {
            this.sinResultados = false;
            this.cargando = false;
            this.facturas = [];
            this.resultado = 0;
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
            return;                
          }
          // COMPROBAR SI EXISTEN RESULTADOS

          this.totalFacturas = total;
          this.facturas = invoices;
          this.facturasTemp = invoices;
          this.resultado = 0;
          this.cargando = false;

          // BOTONOS DE ADELANTE Y ATRAS          
          if (this.desde === 0 && this.totalFacturas > 10) {
            this.btnAtras = 'disabled';
            this.btnAdelante = '';
          }else if(this.desde === 0 && this.totalFacturas < 11){
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
          }else if((this.desde + 10) >= this.totalFacturas){
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
   *   BUSCAR MESA
  ==================================================================== */
  public totalAmount: number = 0;
  public totalCost: number = 0;

  buscar(inicial:Date, final: Date, cajeros:string, estado:boolean, credito:boolean){

    this.totalAmount = 0;    
    this.totalCost = 0;    
    this.sinResultados = true;
    
    if (inicial === null && final === null) {
      this.facturas = this.facturasTemp;
      this.resultado = 0;
      return;
    }else{

      if (!inicial) {
        this.facturas = this.facturasTemp;
        this.resultado = 0;
        return;
      }

      // SET HOURS      
      inicial = new Date(inicial);      
      const initial = new Date(inicial.getTime() + 1000 * 60 * 60 * 5);

      final = new Date(final);
      const end = new Date(final.getTime() + 1000 * 60 * 60 * 5);      
      // SET HOURS 
               
      this.sinResultados = true;
      this.invoiceService.loadInvoicesDate(initial, end, cajeros, estado, credito)
          .subscribe(({total, invoices, montos, costos}) => {

            // COMPROBAR SI EXISTEN RESULTADOS
            if (invoices.length === 0) {
              this.sinResultados = false;
              this.facturas = [];
              this.resultado = 0;
              return;                
            }
            // COMPROBAR SI EXISTEN RESULTADOS
            this.facturas = invoices; 
            this.resultado = invoices.length; 
            this.totalAmount = montos;
            this.totalCost = costos;
            

          });
          
    }

  }

  /** ================================================================
   *   CAMBIAR PAGINA
  ==================================================================== */
  cambiarPagina (valor: number){
    this.desde += valor;

    if (this.desde < 0) {
      this.desde = 0;
    }else if( this.desde > this.totalFacturas ){
      this.desde -= valor;
    }

    this.cargarFacturas();

  }

  /** ================================================================
   *   CARGAR MESAS
  ==================================================================== */
  cargarMesas(){

    this.mesasService.loadMesas(this.desde)
        .subscribe(({ total, mesas }) => {

          this.listaMesas = mesas;
          this.listaMesasTemp = mesas;
          this.totalMesas = total;

        })
  }

  /** ================================================================
   *   FILTRAR POR RUTA
  ==================================================================== */
  public sumarMonto: number = 0;
  filtroRuta (ruta: string){
    
    this.sumarMonto = 0;
    this.cargando = true;
    this.sinResultados = true;

    this.facturas = this.facturasTemp;

    const filtro1 = this.facturas.filter(function (el) {
      return el.mesa.name == ruta;
    });

    this.cargando = false;
    this.sinResultados = true;

    let facturasF:number = 0;
    for (let i = 0; i < filtro1.length; i++) {

      facturasF += i;

      if (filtro1[i].credito === false) { 

        this.facturas = filtro1;
        this.sumarMonto += filtro1[i].amount;  

      }      
    }

    if (facturasF === 0) {      
      this.sinResultados = false;
      this.sumarMonto = 0;
      this.facturas = filtro1;
    }

        
  }


  //  FIN DE LA CLASE
}
