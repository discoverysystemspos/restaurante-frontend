import { Component, OnInit } from '@angular/core';

// SERVICES
import { InvoiceService } from '../../../services/invoice.service';
import { MesasService } from '../../../services/mesas.service';

// INTERFACES
import { LoadInvoice } from '../../../interfaces/invoice.interface';

// MODELS
import { Mesa } from '../../../models/mesas.model';

@Component({
  selector: 'app-credito',
  templateUrl: './credito.component.html',
  styles: [
  ]
})
export class CreditoComponent implements OnInit {

  // FACTURAS
  public totalFacturas: number = 0;
  public facturas: LoadInvoice[] = [];
  public facturasTemp: LoadInvoice[] = [];
  // FACTURAS

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
                private mesasService: MesasService) { }

  ngOnInit(): void {

    // CARGAR FACTURAS
    this.cargarFacturas();
    
    // CARGAR MESAS
    this.cargarMesas();


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
          }else if(this.desde > this.facturas.length){
            this.btnAtras = '';
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
   *   BUSCAR FACTURA
  ==================================================================== */
  // buscar(termino){
    
  //   this.sinResultados = true;
  //   if (termino === null) {
  //     this.facturas = this.facturasTemp;
  //     this.resultado = 0;
  //     return;
  //   }else{

  //     if (!termino) {
  //       this.facturas = this.facturasTemp;
  //       this.resultado = 0;
  //       return;
  //     }

  //     this.sinResultados = true;
  //     this.invoiceService.loadInvoicesDate(termino)
  //         .subscribe(({total, invoices}) => {

  //           // COMPROBAR SI EXISTEN RESULTADOS
  //           if (invoices.length === 0) {
  //             this.sinResultados = false;
  //             this.facturas = [];
  //             this.resultado = 0;
  //             return;                
  //           }
  //           // COMPROBAR SI EXISTEN RESULTADOS
            
  //           this.totalFacturas = total;
  //           this.facturas = invoices; 
  //           this.resultado = invoices.length; 

  //         });
          
  //   }

  // }

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

    if (filtro1.length === 0) {
      this.sinResultados = false;
      this.sumarMonto = 0;
      this.facturas = filtro1;
    }else{

      this.facturas = filtro1;

      for (let i = 0; i < filtro1.length; i++) {

        if (filtro1[i].credito) {          
          this.sumarMonto += filtro1[i].amount;  
        }

      }

    }

    
  }




  // FIN DE LA CLASE

}
