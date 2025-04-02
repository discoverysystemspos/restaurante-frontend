import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// PRINTER
import { NgxPrinterService } from 'projects/ngx-printer/src/lib/ngx-printer.service';
import { PrintItem } from 'projects/ngx-printer/src/lib/print-item';
import { ngxPrintMarkerPosition } from 'projects/ngx-printer/src/public_api';

// SERVICES
import { PedidosService } from '../../services/pedidos.service';

// MODELS
import { Pedido } from 'src/app/models/pedido.models';
import Swal from 'sweetalert2';
import { Observable, Subscription } from 'rxjs';
import { EmpresaService } from '../../services/empresa.service';
import { Datos } from '../../models/empresa.model';
import { ImpuestosService } from 'src/app/services/impuestos.service';
import { Impuestos } from 'src/app/models/impuestos.model';
import { ClientService } from 'src/app/services/client.service';
import { HttpClient } from '@angular/common/http';
import { Client } from 'src/app/models/client.model';
import { FormBuilder, Validators } from '@angular/forms';
import { InvoiceService } from 'src/app/services/invoice.service';
import { Invoice } from 'src/app/models/invoice.model';
import { LoadInvoice } from 'src/app/interfaces/invoice.interface';
import { MesasService } from 'src/app/services/mesas.service';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { ElectronicaService } from 'src/app/services/electronica.service';
import { DataicoService } from 'src/app/services/dataico.service';
import { DataicoInterface } from 'src/app/interfaces/dataico.interface';
import { BancosService } from 'src/app/services/bancos.service';
import { Banco } from 'src/app/models/bancos.model';

interface _Department {
  codigo: string,
  departamento: string,
}

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styles: [
  ]
})
export class PedidoComponent implements OnInit {

  @ViewChild('PrintTemplate')
  private PrintTemplateTpl: TemplateRef<any>;

  title = 'ngx-printer-demo';

  printWindowSubscription: Subscription;
  $printItems: Observable<PrintItem[]>;
  public user: User;

  constructor(  private printerService: NgxPrinterService,
                private pedidosService: PedidosService,
                private clientService: ClientService,
                private invoiceService: InvoiceService,
                private http: HttpClient,
                private fb: FormBuilder,
                private mesasService: MesasService,
                private bancosService: BancosService,
                private activatedRoute: ActivatedRoute,
                private impuestosService: ImpuestosService,
                private electronicaService: ElectronicaService,
                private dataicoService: DataicoService,
                private userService: UserService,
                private empresaService: EmpresaService) {

                  this.user = userService.user;

                  this.printWindowSubscription = this.printerService.$printWindowOpen.subscribe(
                    val => {
                      console.log('Print window is open:', val);
                    }
                  );
              
                  this.$printItems = this.printerService.$printItems;

                 }

  ngOnInit(): void {

    this.cargarImpuestos();
    this.cargarDatos();
    this.loadDepartmentAndCitys();
    this.loadTicket();
    this.loadDataDataico();
    this.cargarBancos();

  }

  /** ================================================================
   *   CARGAR MESA
  ==================================================================== */
  public ticket: string = '';
  loadTicket(){

    this.mesasService.loadMesas(0)
        .subscribe( ({mesas}) => {
          
          this.ticket = mesas[0].mid;

        })

  }

  /** ================================================================
     *   CARGAR BANCOS
    ==================================================================== */
    public bancos: Banco[] = [];
    cargarBancos(){
  
      this.bancosService.loadBancos()
          .subscribe( ({bancos}) => {
  
            this.bancos = bancos.filter( banco => banco.status === true);          
  
          });
  
    }

  /** ================================================================
     *  OBTENER DATOS DE LA FACTURA ELECTRONICA
    ==================================================================== */
    public dataDataico: boolean = false;
    public dataico: DataicoInterface;
    loadDataDataico(){
  
      this.dataicoService.loadDataDataico()
          .subscribe( ({dataico}) => {
  
            delete dataico.actions._id;
            delete dataico.actions.email;
            delete dataico.actions.attachments;
            delete dataico.datid;
            delete dataico.customer;
            delete dataico.numbering._id;
  
            if (dataico) {
              this.dataDataico = true;
              this.dataico = dataico;
            }          
  
          }, (err) => {
            console.log(err);
            
          });
  
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
            })
  
  
            this.activatedRoute.params.subscribe( ({id}) => {
  
              this.pedidoID = id;
      
              this.cargarPedido(this.pedidoID);
              
            });
  
          });
  
    }

  /** ================================================================
   *   IMPRIMIR
  ==================================================================== */
  printDiv() {
    this.printerService.printDiv('printDiv');
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
   *   CARGAR PEDIDO
  ==================================================================== */
  public pedido: any;
  public pedidoID: string;  
  public base: number = 0;
  public iva: number = 0;

  cargarPedido(id: string){
    
    this.pedidosService.loadPedidoOne(id)
        .subscribe( ({pedido}) => {

          this.pedido = pedido;
          console.log(pedido);
          

          for (const product of pedido.products) {

            this.base += product.price;
            
            if( this.empresa.impuesto ){

              if(product.product.taxid){

                this.impuestos.map( (impuesto) => {
    
                  if (impuesto.taxid === product.product.taxid._id) {                  
                    impuesto.total += Math.round(((product.qty * product.price) * impuesto.valor)/100);
                    this.iva += impuesto.total;
                  }
    
                });              
              }

            }

          }

          this.cargagarFactura();
          
          
        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

  }

  /** ================================================================
   *   CARGAR FACTURA
  ==================================================================== */
  public factura!: LoadInvoice;
  cargagarFactura(){

    this.invoiceService.postQueryInvoice( {pedido: this.pedido.peid} )
        .subscribe( ({invoices}) => {

          if (invoices.length > 0) {
            this.factura = invoices[0]
          }

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  /** ================================================================
   *   CAMBIAR ESTADO DEL PEDIDO
  ==================================================================== */
  cambiarEstado(estado: string){

    this.pedido.estado = estado;

    this.pedidosService.actualizarEstatusPedido(this.pedido, this.pedidoID)
        .subscribe( (resp: {pedido}) => {

          this.pedido = resp.pedido;

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); }); 

  }

  /** ================================================================
   *   CANCELAR PEDIDO
  ==================================================================== */
  cancelarPedido(){

    Swal.fire({
      title: 'Estas Seguro?',
      text: "De cancelar este pedido!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, cancelar!'
    }).then((result) => {
      if (result.isConfirmed) {

        this.pedido.status = false;
        this.pedido.estado = 'Cancelado';

        this.pedidosService.actualizarEstatusPedido(this.pedido, this.pedidoID)
        .subscribe( (resp: {pedido}) => {

          this.pedido = resp.pedido;

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

      }


    });

  }

  /** ================================================================
     *  OBTENER DEPARTAMENTOS Y CIUDADES
    ==================================================================== */
    public departments: _Department[] = [];
    public cities: any[] = [];
    loadDepartmentAndCitys(){
  
      this.http.get('assets/json/departamentos.json')
          .subscribe( (data: any) => {          
            this.departments = data;            
          });
  
      this.http.get('assets/json/ciudades.json')
      .subscribe( (data: any) => {          
        this.cities = data;          
      })
  
    }
  
      /** ================================================================
     *  OBTENER CIUDADES DEPENDIENDO DEL DEPARTAMENTO
    ==================================================================== */
    public ListCities: any[] = [];
    searchCities(department: string){
  
      this.ListCities = [];
  
      if (department.length === 0 ) {
        return;
      }
  
      this.ListCities = this.cities.filter( city =>  department === city.departamento );
  
    }
  
    /** ================================================================
     *  SELECCIONAR CLIENTE searchClient
    ==================================================================== */
    seleccionarCliente(pedido: Pedido){

      this.newClientForm.setValue({

        party_type: 'PERSONA_NATURAL',
        tax_level_code: 'NO_RESPONSABLE_DE_IVA',
        party_identification_type: 'CC',
        company_name: '',
        first_name: pedido.cliente.first_name,
        family_name: pedido.cliente.family_name,
        department: '',
        address_line: pedido.direccion,
        regimen: 'SIMPLE',
        party_identification: '',
        codigodepartamento: '',
        codigociudad: '',
        sendemail: false,
        name: pedido.cliente.first_name +' '+pedido.cliente.family_name,
        cedula: pedido.cliente.cedula,
        email: '',
        phone: pedido.telefono,
        city: '',
        address: pedido.direccion,

      })
          
    }
  
    /** ================================================================
     *  CREAR CLIENTE
    ==================================================================== */
    @ViewChild('btnCreateClient') btnCreateClient: ElementRef<any>;
    public formSubmitted: boolean = false;
    public newClientForm = this.fb.group({
      party_type: ['PERSONA_NATURAL', [Validators.required]],
      tax_level_code: ['NO_RESPONSABLE_DE_IVA', [Validators.required]],
      party_identification_type: ['CC', [Validators.required]],
      company_name: '',
      first_name: '',
      family_name: '',
      department: '',
      address_line: '',
      regimen: ['SIMPLE',],
      party_identification: '',
      codigodepartamento: '',
      codigociudad: '',
      sendemail: false,
      // OLD
      name: '',
      cedula: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      city: '',
      address: ['', [Validators.required]]
    });
    
  
    async crearCliente(){    
  
      this.formSubmitted = true;
  
      if (this.newClientForm.invalid) {
        return;
      }
  
      // OBTENER CODIGO DEL DEPARTAMENTO Y CIUDAD
      let codigoD = await this.departments.find( departamento => this.newClientForm.value.department === departamento.departamento );
      let codigoC = await this.cities.find( city => this.newClientForm.value.city === city.ciudad );
      this.newClientForm.value.codigodepartamento  = codigoD.codigo;
      this.newClientForm.value.codigociudad  = codigoC.codigo;
  
      if (this.newClientForm.value.party_type === 'PERSONA_NATURAL') {      
        this.newClientForm.value.name = `${this.newClientForm.value.first_name} ${this.newClientForm.value.family_name}`
      }else{
        this.newClientForm.value.name = this.newClientForm.value.company_name;
      }
  
      this.newClientForm.value.party_identification = this.newClientForm.value.cedula;
  
      this.clientService.createClient(this.newClientForm.value)
          .subscribe(({client}) => {            

            this.pedidosService.actualizarEstatusPedido({client: client.cid, clientedb: true}, this.pedido.peid)
                .subscribe( (resp: {pedido}) => {
                  this.pedido.client = resp.pedido.client;
                  this.pedido.clientedb = resp.pedido.clientedb;

                  Swal.fire('Estupendo', 'Se ha creado el cliente exitosamente!', 'success');
        
                  this.formSubmitted = false;
                  this.newClientForm.reset();          
                }, (err) => {
                  console.log(err);
                  Swal.fire('Error', err.error.msg, 'error');                  
                })
  
            
          }, (err) =>{
            Swal.fire('Error', err.error.msg, 'error');
          });
  
    }
  
    /** ================================================================
     *  CAMPO VALIDO
    ==================================================================== */
    campoValido(campo: string): boolean{
  
      if (this.formSubmitted && this.newClientForm.get(campo).invalid) {
        return true;
      }else{
        return false;
      }
    
    }

    /** ================================================================
   *   PAGOS
  ==================================================================== */
  @ViewChild ('montoP') montoP!: ElementRef;
  public payments: any[] = [];
  public restante: number = 0;
  public total: number = 0;
  addPay(monto: any, type: string){

    monto = Number(monto);
    if (this.payments.length > 0 && this.restante >= 0 ) {
      return;
    }

    if(monto > (this.restante * -1 ) && this.restante < 0){
      monto = (this.restante * -1);
    }

    this.payments.push({
      type,
      amount: monto,
      description: ''
    });

    this.restante = 0;
    for (const pay of this.payments) {
      this.restante = this.restante + pay.amount;
    }

    this.restante = this.restante - this.pedido.amount;    

  }

  delPay(pay: any){    

    this.payments.splice( pay, 1 );
    this.restante = 0;
    for (const pay of this.payments) {
      this.restante = this.restante + pay.amount;
    }

    this.restante = this.restante - this.pedido.amount;

  }

  /** ================================================================
   *   CREAR FACTURA
  ==================================================================== */
  public facturando: boolean = false;
  crearFactura( send_dian: boolean ){

    this.facturando = true;

    let data: any = {
      amount: this.pedido.amount,
      cost: 0,
      type: 'efectivo',
      payments: this.payments, 
      products: this.pedido.products,
      credito: false,
      mesa: this.ticket,
      mesero: this.user.uid,
      fechaCredito: '',
      turno: this.user.turno,
      iva: this.iva,
      base: this.base,
      pago: this.pedido.amount,
      vueltos: 0,
      nota: this.pedido.comentario,
      apartado: false,
      descuento: false,
      porcentaje: 0,
      pedido: this.pedido.peid,
      fecha: new Date(),
      tip: 0,
      datafon: 0,
    }

    this.invoiceService.createInvoice(data, this.user.turno)
        .subscribe( (resp:{ok: boolean, invoice: LoadInvoice } ) => {
          this.factura = resp.invoice;
          if (this.empresa.electronica && send_dian) {
            
            this.electronicaService.postFacturaDataico(this.factura, this.dataico, this.impuestos)
                .subscribe( (resp: {status, invoice, ok}) => {
                                          
                  if (resp.status === 500) {
                    Swal.fire('Atención', 'No se pudo enviar la factura electronica a la DIAN, ve a la factura y vuelve a enviarla, si el problema persiste, ponte en contacto', 'warning');
                    window.open(`./dashboard/factura/${ this.factura.iid }`, '_blank');
                  }
                  if (resp.invoice.cufe) {
                    this.factura.cufe = resp.invoice.cufe;
                    this.factura.number = resp.invoice.number;
                  }
                  window.open(`./dashboard/factura/${ this.factura.iid }`, '_blank');
                    setTimeout( () => {        
                      window.location.reload();
                    },1000);
                  
                }, (err) => {
                  console.log(err);
                  
                });
            
            
          }else{
            
            window.open(`./dashboard/factura/${ this.factura.iid }`, '_blank');
            setTimeout( () => {        
              window.location.reload();
            },1000);
          }
          
        })
    
   
  
  }


  // FIN DE LA CLASE
}
