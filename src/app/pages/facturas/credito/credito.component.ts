import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

// SERVICES
import { InvoiceService } from '../../../services/invoice.service';
import { MesasService } from '../../../services/mesas.service';

// INTERFACES
import { LoadInvoice } from '../../../interfaces/invoice.interface';

// MODELS
import { Mesa } from '../../../models/mesas.model';
import { Client } from 'src/app/models/client.model';
import { SearchService } from 'src/app/services/search.service';
import { log } from 'console';

// EXCEL
import * as XLSX from 'xlsx';
import { ImpuestosService } from 'src/app/services/impuestos.service';
import { Impuestos } from 'src/app/models/impuestos.model';
import { EmpresaService } from 'src/app/services/empresa.service';
import { Datos } from 'src/app/models/empresa.model';
import Swal from 'sweetalert2';

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
                private mesasService: MesasService,
                private impuestosService: ImpuestosService,
                private empresaService: EmpresaService,
                private searchService: SearchService,) { }

  ngOnInit(): void {

    // CARGAR DATOS
    this.cargarDatos();

    // CARGAR DATOS
    this.cargarImpuestos();

    // CARGAR FACTURAS
    this.cargarFacturas();
    
    // CARGAR MESAS
    this.cargarMesas();


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
   *   CARGAR IMPUESTOS
  ==================================================================== */
  public impuestos: Impuestos[] = [];
  cargarImpuestos(){

    this.impuestosService.loadImpuestos()
        .subscribe( ({taxes}) => {

          this.impuestos = taxes;

          this.impuestos.map( impuesto => {
            impuesto.total = 0;
          });

        });

  }

  /** ================================================================
   *  CARGAR FACTURAS
  ==================================================================== */
  public totalAmount: number = 0;
  public totalAbonado: number = 0;
  public totalIva: number = 0;
  public totalCost: number = 0;
  cargarFacturas(){

    this.cargando = true;
    this.sinResultados = true;

    this.totalAbonado = 0;
    this.totalAmount = 0;

    this.impuestos.map( impuesto => {
      impuesto.total = 0;
    });

    this.invoiceService.loadInvoicesCredito(this.desde)
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

          this.totalAbonado = 0;
          this.totalAmount = 0;
          this.totalIva = 0;
          this.totalCost = 0;
          
          for (const factura of this.facturas) {
            
            this.totalAmount += factura.amount;
            this.totalCost += factura.cost;
            this.totalIva += factura.iva;

            for (const pago of factura.paymentsCredit) {              
              this.totalAbonado += pago.amount;
            }

            if( this.empresa.impuesto ){

              for (const product of factura.products) {
  
                this.impuestos.map( (impuesto) => {
    
                  if (impuesto.taxid === product.product.taxid) {
                    
                    impuesto.total += Math.round(((product.qty * product.price) * impuesto.valor)/100);
  
                  }
    
                });
  
              }
  
            }

          }

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

  /** ================================================================
   *   BUSCAR CLIENTE
  ==================================================================== */
  public sinResultadosClientes: boolean = false;
  public cargandoCliente: boolean = true;
  public listaClientes: Client[] = [];
  public listaClientesTemp: Client[] = [];
  public totalClientes: number = 0;
  @ViewChild('searchClient') searchClient: ElementRef;
  buscarCliente(termino: string){

    this.cargandoCliente = false;
    this.sinResultadosClientes = false;

    if (termino.length === 0) {
      this.listaClientes = this.listaClientesTemp;
      this.sinResultadosClientes = true;
      this.cargandoCliente = true;
      return;
    }else{
    
      this.searchService.search('clients', termino)
          .subscribe(({total, resultados}) => {   
            
          this.cargandoCliente = false;
          
          // COMPROBAR SI EXISTEN RESULTADOS
          if (resultados.length === 0) {
            this.listaClientes = [];
            this.totalClientes = 0;
            this.sinResultadosClientes = true;
            return;                
          }
          // COMPROBAR SI EXISTEN RESULTADOS
          
          this.listaClientes = resultados;
          this.totalClientes = total;

        });
    }

  }

  /** ================================================================
   *   BUSCAR FACTURA SEGUN EL CLIENTE
  ==================================================================== */
  searchInvoice(client: string){

    this.listaClientes = [];
    this.listaClientesTemp = [];
    this.searchClient.nativeElement.value = '';

    this.cargando = true;
    this.sinResultados = true;

    this.totalAbonado = 0;
    this.totalAmount = 0;

    this.impuestos.map( impuesto => {
      impuesto.total = 0;
    });

    this.invoiceService.loadInvoiceCreditClient(client, true)
        .subscribe( (invoices) => {

          console.log(invoices);

          // COMPROBAR SI EXISTEN RESULTADOS
          if (invoices.length === 0) {
            this.sinResultados = false;
            this.cargando = false;
            this.facturas = [];
            this.resultado = 0;
            return;                
          }
          
          this.facturas = invoices;
          this.totalFacturas = invoices.length;
          this.cargando = false;

          this.totalAbonado = 0;
          this.totalAmount = 0;
          
          for (const factura of this.facturas) {
            
            this.totalAmount += factura.amount;

            for (const pago of factura.paymentsCredit) {              
              this.totalAbonado += pago.amount;
            }

            if( this.empresa.impuesto ){

              for (const product of factura.products) {
  
                this.impuestos.map( (impuesto) => {
    
                  if (impuesto.taxid === product.product.taxid) {
                    
                    impuesto.total += Math.round(((product.qty * product.price) * impuesto.valor)/100);
  
                  }
    
                });
  
              }
  
            }

          }
          
    });
    

  }

  /** ================================================================
   *   CARGAR FACTURAS VENCIDAS
  ==================================================================== */
  facturasVencidas(){

    this.cargando = true;
    this.sinResultados = true;

    const hoy = new Date();

    this.totalAbonado = 0;
    this.totalAmount = 0;

    this.impuestos.map( impuesto => {
      impuesto.total = 0;
    });

    this.invoiceService.loadInvoicesVencidas(hoy)
        .subscribe( ({invoices}) => {          

          // COMPROBAR SI EXISTEN RESULTADOS
          if (invoices.length === 0) {
            this.sinResultados = false;
            this.cargando = false;
            this.facturas = [];
            this.resultado = 0;
            return;                
          }
          
          this.facturas = invoices;
          this.totalFacturas = invoices.length;
          this.cargando = false;

          this.totalAbonado = 0;
          this.totalAmount = 0;
          
          for (const factura of this.facturas) {
            
            this.totalAmount += factura.amount;

            for (const pago of factura.payments) {              
              this.totalAbonado += pago.amount;
            }

            if( this.empresa.impuesto ){

              for (const product of factura.products) {
  
                this.impuestos.map( (impuesto) => {
    
                  if (impuesto.taxid === product.product.taxid) {
                    
                    impuesto.total += Math.round(((product.qty * product.price) * impuesto.valor)/100);
  
                  }
    
                });
  
              }
  
            }

          }
          
    });

  }

  /** ================================================================
   *   BUSCAR FACTURAS A CREDITOS POR VENDEDORES MESAS
  ==================================================================== */
  buscarVendedores(mesa:string){

    this.cargando = true;
    this.sinResultados = true;

    this.totalAbonado = 0;
    this.totalAmount = 0;

    this.impuestos.map( impuesto => {
      impuesto.total = 0;
    });

    this.invoiceService.loadInvoiceCreditCajeroMesa(mesa)
        .subscribe( ({ total, invoices }) => {

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

          this.totalAbonado = 0;
          this.totalAmount = 0;
          this.totalIva = 0;
          this.totalCost = 0;
          
          for (const factura of this.facturas) {
            
            this.totalAmount += factura.amount;
            this.totalIva += factura.amount;
            this.totalCost += factura.amount;

            for (const pago of factura.payments) {              
              this.totalAbonado += pago.amount;
            }

            if( this.empresa.impuesto ){

              for (const product of factura.products) {
  
                this.impuestos.map( (impuesto) => {
    
                  if (impuesto.taxid === product.product.taxid) {
                    
                    impuesto.total += Math.round(((product.qty * product.price) * impuesto.valor)/100);
  
                  }
    
                });
  
              }
  
            }

          }

        });

  }

  /** ================================================================
   *   BUSCAR FACTURAS A CREDITOS POR VENDEDORES MESAS
  ==================================================================== */
  buscar(inicial:Date, final: Date, cajeros:string, estado:boolean, credito:boolean){
    
    this.sinResultados = true;
    this.totalAbonado = 0;
    this.totalAmount = 0;
    this.totalIva = 0;
    this.totalCost = 0;

    this.impuestos.map( impuesto => {
      impuesto.total = 0;
    });
    
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

            for (const factura of this.facturas) {
            
              this.totalAmount += factura.amount;
              this.totalIva += factura.amount;
              this.totalCost += factura.amount;
  
              for (const pago of factura.payments) {              
                this.totalAbonado += pago.amount;
              }

              if( this.empresa.impuesto ){

                for (const product of factura.products) {
    
                  this.impuestos.map( (impuesto) => {
      
                    if (impuesto.taxid === product.product.taxid) {
                      
                      impuesto.total += Math.round(((product.qty * product.price) * impuesto.valor)/100);
    
                    }
      
                  });
    
                }
    
              }
  
            }
            

          });
          
    }

  }

  /** ================================================================
   *   EXPORTAR EXCEL
  ==================================================================== */
  exportar(){

    let invoices = [];

    for (const invoi of this.facturas) {

      let cliente = `${invoi.client?.name || 'Ocasional'} - ${invoi.client?.cedula || '0000000'}`;
      let usuario = `${invoi.user.name}`;
      
      let { invoice, amount, cost, base, type, iva, fecha } = invoi;

      invoices.push({
        invoice, 
        cliente,
        type, 
        cost,
        base, 
        iva, 
        amount, 
        fecha,
        usuario
      })

    }

    let datos = [
      {
        total: this.totalAmount + this.totalIva,
        ganancias: this.totalAmount - this.totalCost,
        iva: this.totalIva
      }
    ]

    invoices = invoices.concat(datos)

    /* generate a worksheet */
    var ws = XLSX.utils.json_to_sheet(invoices);

    /* add to workbook */
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Facturas");

    /* title */
    let title = 'Invoices.xls';

    /* write workbook and force a download */
    XLSX.writeFile(wb, title);


  }


  // FIN DE LA CLASE
}
