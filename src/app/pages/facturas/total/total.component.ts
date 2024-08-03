import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { Datos, comisiones } from '../../../models/empresa.model';
import { Client } from 'src/app/models/client.model';

// EXCEL
import * as XLSX from 'xlsx';
import { ImpuestosService } from 'src/app/services/impuestos.service';
import { Impuestos } from 'src/app/models/impuestos.model';

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

  public user!: User;

  constructor(  private invoiceService: InvoiceService,
                private searchService: SearchService,
                private mesasService: MesasService,
                private impuestosService: ImpuestosService,
                private empresaService: EmpresaService,
                private userService: UserService) { 

                  this.user = userService.user;

                }

  ngOnInit(): void {

    // CARGAR DATOS
    this.cargarDatos();

    // CARGAR MESAS
    this.cargarMesas();

    // CARGAR VENDEDORES
    this.cargarVendedore();

    // CARGAR FACTURAS
    this.cargarFacturas();

    // IMPUESTOS
    this.cargarImpuestos();
    
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

    this.impuestos.map( impuesto => {
      impuesto.total = 0;
    });

    this.searchService.search('invoice', client)
        .subscribe( ({resultados}) => {

          // COMPROBAR SI EXISTEN RESULTADOS
          if (resultados.length === 0) {
            this.sinResultados = false;
            this.cargando = false;
            this.facturas = [];
            this.resultado = 0;
            return;                
          }
          
          this.facturas = resultados;
          this.totalFacturas = resultados.length;
          this.cargando = false;

          for (const factura of resultados) {

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

    this.impuestos.map( impuesto => {
      impuesto.total = 0;
    });

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

          this.totalAmount = 0;
          this.totalCost = 0;
          this.totalIva = 0;
          this.totalTip = 0;
          
          for (const factura of invoices) {
            this.totalAmount += factura.amount;
            this.totalCost += factura.cost;
            this.totalIva += factura.iva;

            if (factura.tip) {
              this.totalTip += factura.tip;              
            }
            
            for (const product of factura.products) {
              
              if (product.mayor) {                  
                factura.mayor = true;
              }
              
              
              if( this.empresa.impuesto ){
  
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
  public totalIva: number = 0;
  public totalTip: number = 0;

  buscar(inicial:Date, final: Date, cajeros:string, estado:boolean, credito:boolean){

    this.totalAmount = 0;    
    this.totalCost = 0;    
    this.totalIva = 0;    
    this.totalTip = 0;    
    this.sinResultados = true;

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
      let initial = new Date(inicial.getTime() + 1000 * 60 * 60 * 5);

      final = new Date(final);
      let end = new Date(final.getTime() + 1000 * 60 * 60 * 5);      
      // SET HOURS 

      let url = document.URL.split(':');
      if (url[0] === 'https') {
        initial = new Date(inicial.getTime() + 1000 * 60 * 60 - 7200000); 
        end = new Date(final.getTime() + 1000 * 60 * 60 - 3600000);        
      }      
               
      this.sinResultados = true;
      this.invoiceService.loadInvoicesDate(initial, end, cajeros, estado, credito)
          .subscribe(({total, invoices, montos, costos, iva}) => {

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
            this.totalIva = iva;

            for (const factura of invoices) {
              
              if (factura.tip) {
                this.totalTip += factura.tip;              
              }
              
              for (const product of factura.products) {
                
                if (product.mayor) {                  
                  factura.mayor = true;
                }
                
                if( this.empresa.impuesto || this.empresa.tip ){
                  if (product.product.taxid) {
                    
                    this.impuestos.map( (impuesto) => {
        
                      if (impuesto.taxid === product.product.taxid) {
                        
                        impuesto.total += Math.round(((product.qty * product.price) * impuesto.valor)/100);
      
                      }
        
                    });
                  }    
    
                }
    
              }
              
            }

            this.comisionCalcular(this.totalAmount);
            

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

  /** ================================================================
   *   CALCULAR COMISIONES
  ==================================================================== */
  public comision: number = 0;
  public porcentaje: number = 0;
  comisionCalcular(monto: number){

    this.comision = 0;
    this.porcentaje = 0;

    for (const com of this.empresa.comisiones) {

      if (monto >= com.monto) {
        this.porcentaje = com.comision;
      }

    }

    this.comision = (monto * this.porcentaje)/100;

  }

  /** ================================================================
   *   BUSCAR POR CONTROL
  ==================================================================== */
  buscarControl(control: any){

    this.totalAmount = 0;    
    this.totalCost = 0;    
    this.totalIva = 0;    
    this.totalTip = 0;    
    this.sinResultados = true;

    this.impuestos.map( impuesto => {
      impuesto.total = 0;
    });

    this.invoiceService.postQueryInvoice({control})
      .subscribe(({total, invoices, montos, costos, iva}) => {

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
        this.totalIva = iva;

        this.comisionCalcular(this.totalAmount);

        for (const factura of invoices) {
          
          
          if (factura.tip) {
            this.totalTip += factura.tip;              
          }
          for (const product of factura.products) {
            

            if (product.mayor) {                  
              factura.mayor = true;                
            }
            
            if( this.empresa.impuesto ){
              this.impuestos.map( (impuesto) => {
                
                if (impuesto.taxid === product.product.taxid) {
                  
                  impuesto.total += Math.round(((product.qty * product.price) * impuesto.valor)/100);

                }
  
              });

            }

          }
        }
        

      }, (err) => {
          console.log(err);          
        });

  }

  /** ================================================================
   *   EXPORTAR EXCEL
  ==================================================================== */
  exportar(){

    let invoices = [];

    console.log(this.facturas);
    

    for (const invoi of this.facturas) {

      let clienteName = `${invoi.client?.name || 'CONSUMIDOR FINAL'}`;
      let clienteCedula = `${invoi.client?.cedula || '0000000'}`;
      let usuario = `${invoi.user.name}`;
      let number: any = invoi.invoice;
      
      if (invoi.cufe) {
        number = invoi.number;        
      }
      

      for (const item of invoi.products) {

        let porc = 0;
        if (item.product.tax) {
          porc = item.product.taxid.valor;
          
        }
        
        invoices.push({
          fecha: invoi.fecha,
          invoice: number, 
          "razón social": clienteName,
          "Tipo de Documento": invoi.client?.party_identification_type || 'CC',
          "Identificación": clienteCedula,
          "Tipo de persona": invoi.client?.party_type || 'PERSONA_NATURAL',
          "Tipo de regimen": invoi.client?.tax_level_code || 'NO_RESPONSABLE_DE_IVA',
          Codigo: item.product.code,
          Producto: item.product.name,
          Cantidad: item.qty,
          "Valor Sin IVA": item.price,
          "IVA": ((item.price * porc)/100).toFixed(2),
          "Porcentaje de IVA": porc,
          "Total": ((item.price+((item.price * porc)/100)) * item.qty).toFixed(2),
          usuario
        })
      }
      


    }

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


  //  FIN DE LA CLASE
}
