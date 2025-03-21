import { Component, OnInit, ViewChild, ElementRef, TemplateRef, HostListener, ViewChildren, QueryList  } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import Swal from 'sweetalert2';
import * as SerialPort from 'serialport';
import { HttpClient } from '@angular/common/http';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {UUID} from 'uuid-generator-ts';

import { QRCodeModule } from 'angularx-qrcode';

// PRINTER
import { NgxPrinterService } from 'projects/ngx-printer/src/lib/ngx-printer.service';
import { PrintItem } from 'projects/ngx-printer/src/lib/print-item';
import { ngxPrintMarkerPosition } from 'projects/ngx-printer/src/public_api';

// MODELS
import { Product } from '../../../models/product.model';
import { Client } from '../../../models/client.model';
import { Invoice } from '../../../models/invoice.model';
import { Department } from '../../../models/department.model';
import { Mesa, _comanda, _ingredientes } from '../../../models/mesas.model';
import { Kit } from '../../../models/kits.model';
import { User } from '../../../models/user.model';
import { Datos } from '../../../models/empresa.model';
import { Impuestos } from 'src/app/models/impuestos.model';
import { Banco } from 'src/app/models/bancos.model';

// SERVICES
import { ProductService } from '../../../services/product.service';
import { ClientService } from '../../../services/client.service';
import { SearchService } from '../../../services/search.service';
import { InvoiceService } from '../../../services/invoice.service';
import { TurnoService } from '../../../services/turno.service';
import { DepartmentService } from '../../../services/department.service';
import { MesasService } from '../../../services/mesas.service';
import { EmpresaService } from '../../../services/empresa.service';
import { UserService } from '../../../services/user.service';
import { BasculaService } from '../../../services/bascula.service';
import { PedidosService } from '../../../services/pedidos.service';
import { EntradasService } from 'src/app/services/entradas.service';
import { ImpuestosService } from 'src/app/services/impuestos.service';
import { DataicoService } from 'src/app/services/dataico.service';
import { ElectronicaService } from 'src/app/services/electronica.service';
import { BancosService } from '../../../services/bancos.service';

// INTERFACES
import { Carrito, _payments, LoadCarrito, _notas } from '../../../interfaces/carrito.interface';
import { LoadInvoice } from '../../../interfaces/invoice.interface';
import { LoadTurno, _movements } from '../../../interfaces/load-turno.interface';
import { LoadMesaId } from '../../../interfaces/load-mesas.interface';
import { DataicoInterface } from 'src/app/interfaces/dataico.interface';
import { Entradas } from 'src/app/models/entradas.model';
import { Vehiculo } from 'src/app/models/vehiculos.model';
import { FileUploadService } from 'src/app/services/file-upload.service';

interface _Department {
  codigo: string,
  departamento: string,
}

@Component({
  selector: 'app-mesa',
  templateUrl: './mesa.component.html',
  styleUrls: ['./mesa.component.css']
})
export class MesaComponent implements OnInit {

  public carrito: LoadCarrito[] = [];
  public comanda: LoadCarrito[] = [];
  public comandaTemp: LoadCarrito[] = [];
  public mesa: Mesa;
  
  public productUp: Carrito[] = [];

  public facturar: boolean;

  public user: User;

  public menu: boolean = true;

  serialPort: typeof SerialPort;

  // PRINT
  @ViewChild('PrintTemplate')
  private PrintTemplateTpl: TemplateRef<any>;

  title = 'ngx-printer-demo';

  printWindowSubscription: Subscription;
  $printItems: Observable<PrintItem[]>;

  public basculaT: string = '1';
  public puertoBascula: string = 'COM1';

  constructor(  private productService: ProductService,
                private clientService: ClientService,
                private searchService: SearchService,
                private fb: FormBuilder,
                private invoiceService: InvoiceService,
                private turnoService: TurnoService,
                private departmentService: DepartmentService,
                private activatedRoute: ActivatedRoute,
                private mesasServices: MesasService,
                private router: Router,
                private printerService: NgxPrinterService,
                private empresaService: EmpresaService,
                private userService: UserService,
                private basculaService: BasculaService,
                private pedidoService: PedidosService,
                private entradasService: EntradasService,
                private modal: NgbModal,
                private impuestosService: ImpuestosService,
                private bancosService: BancosService,
                private dataicoService: DataicoService,
                private electronicaService: ElectronicaService,
                private http: HttpClient,
                private fileUploadService: FileUploadService) {

                  // CARGAR INFORMACION DEL USUARIO
                  this.user = this.userService.user;                  

                  this.printWindowSubscription = this.printerService.$printWindowOpen
                  .subscribe(val => {});
              
                  this.$printItems = this.printerService.$printItems;

                  

                }

  ngOnInit(): void {

    // TECLAS DE FUNCION
    document.addEventListener('keyup', (event) => {

      // FACTURAR
      if (event.key === 'F2' || event.key === 'F4' || event.key === '-') {
        if (this.user.cerrada) {
          Swal.fire('Atención', 'Debes de abrir caja primero', 'info');
          return;
        }
        (event.key === 'F2' || event.key === '-')? this.crearFactura(false) : this.crearFactura(true);
      }

      if (event.key === '/') {
        this.searchProduct.nativeElement.focus();
      }

      if (event.key === '*') {
        this.montoAdd.nativeElement.focus();
      }

    });    

    if (!localStorage.getItem('menu')) {
      this.menu = true
    }else{
      this.menu = JSON.parse(localStorage.getItem('menu'));
    }
      
      // TURNOS
      this.cargarTurno();

      // DATOS
      this.cargarDatos();

      // PRODUCTOS
      this.cargarProductos();

      // DEPARTAMENTOS
      this.cargarDepartamentos();
      
      // IMPUESTOS
      this.cargarImpuestos();
      
      // BANCOS
      this.cargarBancos();

      // CARGAR MESA
      this.activatedRoute.params.subscribe( ({id}) => {

        this.mesaID = id;
        
        this.cargarMesa(id);
        
      });

    // CARGAR TODAS LAS MESAS
    this.cargarMesasAll();

    if (!this.user.cerrada) {
      this.facturar = true;
    }else{
      this.facturar = false;
    }
    
    
    
  }

  /** ================================================================
   *  OBTENER DEPARTAMENTOS Y CIUDADES
  ==================================================================== */
  public departments: _Department[] = [];
  public cities: any[] = [];
  loadDepartmentAndCitys(){

    let JsonCity: string = 'assets/json/ciudades.json';
    let JsonDepartment: string = 'assets/json/departamentos.json';

    if (this.empresa.pais === 'USA') {
      JsonCity = 'assets/json/usaciudades.json';
      JsonDepartment = 'assets/json/usadepartamentos.json';
    }

    this.http.get(JsonDepartment)
        .subscribe( (data: any) => {          
          this.departments = data;            
        });

    this.http.get(JsonCity)
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
   *   CARGAR IMPUESTOS
  ==================================================================== */
  public impuestos: Impuestos[] = [];
  cargarImpuestos(){

    this.impuestosService.loadImpuestos()
        .subscribe( ({taxes}) => {
          this.impuestos = taxes;
        });

  }

  /** ================================================================
   *   CAMBIAR MENU
  ==================================================================== */
  changeMenu(menu : boolean){

    if (menu) {
      menu = false;
    }else{
      menu = true;
    }

    this.menu = menu;
    localStorage.setItem('menu', JSON.stringify(menu));
    

  }

  /** ================================================================
   *   CARGAR TODAS LAS MESAS
  ==================================================================== */
  public totalMesas: Mesa[] = [];
  cargarMesasAll(){

    this.mesasServices.loadMesas(0)
        .subscribe( ({mesas}) => {
          this.totalMesas = mesas;
        });
  }

  /** ================================================================
   *   CAMBIAR MESA
  ==================================================================== */
  cambiarMesa(mesaNew: Mesa){

    Swal.fire({
      title: 'Atencion',
      text: "Estas seguro de cambiar de mesa",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, cambiar mesa',
      cancelButtonText: 'Cancelar'
    }).then((result) => {  
      
      if (result.isConfirmed) {
    
        mesaNew.disponible = false;
        mesaNew.carrito = this.mesa.carrito;
        mesaNew.comanda = this.mesa.comanda;
        mesaNew.nota = this.mesa.nota;
        
        this.mesasServices.updateMesa(mesaNew, mesaNew.mid)
            .subscribe( resp => {

              this.mesa.disponible = true;
              this.mesa.carrito = [];
              this.mesa.comanda = [];
              this.mesa.nota = [];
              
              this.mesasServices.updateMesa(this.mesa, this.mesaID)
                  .subscribe( resp => {

                    Swal.fire('Estupendo', `Se ha cambiado ha ${ mesaNew.name } Satisfactoriamente`, 'success');

                    this.cargarMesasAll();

                    this.router.navigateByUrl(`dashboard/ventas/mesa/${mesaNew.mid}`);

              }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });
      }
    });

  }
  

  /** ================================================================
   *   CARGAR DATOS DE LA EMPRESA
  ==================================================================== */
  public empresa: Datos;
  public ticketHeader: any;
  public ticketfooter: any;
  cargarDatos(){

    this.empresaService.getDatos()
        .subscribe( datos => {
          this.empresa = datos;
          
          this.ticketHeader =  this.empresa.header.split('\n');
          this.ticketfooter =  this.empresa.footer.split('\n');

          if (this.empresa?.electronica) {
            this.loadDataDataico();      
          }

          if (this.empresa.bascula) {
            if (localStorage.getItem('bascula')) {
              this.basculaT = localStorage.getItem('bascula');
            }

            if (localStorage.getItem('puertoBascula')) {
              this.puertoBascula = localStorage.getItem('puertoBascula');
            }
          }
          
          this.loadDepartmentAndCitys();

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });
  }
  
  /** ================================================================
   *  CARGAR DATOS DE LA MESA
  ==================================================================== */
  public mesaID: string;
  public meserID: string;
  cargarMesa(id: string){

    this.productUp = [];
    this.carrito = [];
    this.comanda = [];

    this.mesasServices.loadMesaId(id)
        .subscribe( (mesa: any) => {
          this.mesaID = mesa.mid;
          this.carrito = mesa.carrito;
          this.mesa = mesa;

          // DESCUENTOS          
          this.formDescuento.setValue({
            descuento: mesa.descuento || false,
            porcentaje: mesa.porcentaje || 0
          });
          // DESCUENTOS
          
          this.comandas = mesa.comanda;
          
         if (!mesa.disponible && mesa.cliente) {
           this.clienteTemp = mesa.cliente;
           this.clienteTemp.cid = mesa.cliente._id;
         }         
                
          this.meserID = mesa.mesero._id;

          for (let i = 0; i < mesa.carrito.length; i++) {

            this.productUp.push({
              product: mesa.carrito[i].product._id,
              qty: mesa.carrito[i].qty,
              price: mesa.carrito[i].price,
              iva: mesa.carrito[i].iva,
              mayor: mesa.carrito[i].mayor
            });
            
            this.comanda.push({
              product: mesa.carrito[i].product.name,
              tipo: mesa.carrito[i].product.tipo,
              comanda: mesa.carrito[i].product.comanda,
              qty: mesa.carrito[i].qty,
              price: mesa.carrito[i].price
            });
                        
          }

          this.comandaTemp = this.comanda;

          // OBTENER NOTAS DE LA COMANDAS
          if (this.mesa.nota) {            
            if (this.mesa.nota.length > 0) {
              this.notas = this.mesa.nota;         
            }else{
              this.notas = [];
            }          
          }

          this.invoiceForm.reset({
            type: 'efectivo',
            nota: mesa.notaf || '',
            placa: mesa.placa || '',
            images: mesa.images || [],
          });

          this.sumarTotales();

        });


  }
  /** ================================================================
   *  CAMBIAR VALOR
  ==================================================================== */
  cambiarValor( valor: number ) {

    if (this.qtySelect < 0) {
      this.qtySelect = 0;
    }

    if ( this.qtySelect >= this.productSelected.inventario && valor >= 0 && this.productSelected.type !== 'Paquete') {
      return this.qtySelect = this.productSelected.inventario;
    }

    if ( this.qtySelect <= 0 && valor < 0 ) {
      return this.qtySelect = 0;
    }

    this.qtySelect = this.qtySelect + valor;

  }


  // CAMBIAR CANTIDADES DE LOS PRODUCTOS
  onChange( nuevoValor: number ){

    if (this.qtySelect < 0) {
      this.qtySelect = 0;
    }
    
    if( nuevoValor > this.productSelected.inventario && this.productSelected.type !== 'Paquete' ) {
      this.qtySelect = this.productSelected.inventario;
    } else if ( nuevoValor <= 0 && this.productSelected.type !== 'Paquete') {
      this.qtySelect = 0;
    } else {
      this.qtySelect = nuevoValor;
    }

    if (this.mayor) {   
      this.priceProductSelected = this.productSelected.wholesale;
    }else{
      this.priceProductSelected = this.productSelected.price;
    }

  }

  // ACTIVAR MAYOREO O DISTRIBUIDOR
  @ViewChild('cMayor') cMayor: ElementRef
  @ViewChild('cDis') cDis: ElementRef
  public mayor: boolean = false;
  mayoreoApp(mayor: boolean){

    if (mayor) {
      this.priceProductSelected = this.productSelected.wholesale;
    }else{
      this.priceProductSelected = this.productSelected.price;
    }

  }

  distribuidorApp(distribuidor: boolean){

    if (distribuidor) {
      this.priceProductSelected = this.productSelected.distribuidor;
    }else{
      this.priceProductSelected = this.productSelected.price;
    }

  }

  /** ================================================================
   *  CHANGE PRICE CALCULADORA
  ==================================================================== */
  appendV(value: any){

    if (value === 'del') {
      this.priceProductSelected = Number(this.priceProductSelected.toString().slice(0, -1));
      return;
    }

    this.priceProductSelected = Number(this.priceProductSelected.toString() + value);
    

  }

  /** ================================================================
   *  MODAL PRODUCTO CODE
  ==================================================================== */
  @ViewChild('modalProductSeleted', { static: true }) modalProductSeleted: TemplateRef<any>;
  @ViewChild('btnAddPr') btnAddPr: ElementRef;
  
  public productSelected: Product;
  public qtySelect : number = 1;
  public priceProductSelected: number = 0;
  modalProducto ( product : Product ) {

    

    this.priceProductSelected = 0;
    this.mayor = false;
    
    if (product.inventario === 0 && product.type !== 'Paquete') {
      Swal.fire('Error', 'El producto esta agotado. Porfavor, verifica el stock de este prodcuto.', 'error');             
      return;
    }
    
    this.productSelected = product;
    this.qtySelect = 1;
    this.priceProductSelected = product.price;

    // SI ES GRANEL
    if (product.type === 'Granel') {
      // SI ESTA USANDO BASCULA
      if (this.empresa.bascula) {

        this.basculaService.loadPeso(this.basculaT, this.puertoBascula)
            .subscribe( resp => {
              this.qtySelect = resp;
            });
      }
    }else if(product.type === 'Paquete' && product.bascula ){

      if (this.empresa.bascula) {

        this.basculaService.loadPeso(this.basculaT, this.puertoBascula)
            .subscribe( resp => {
              this.qtySelect = resp;
            });
      }

    }

    this.modal.open(this.modalProductSeleted);

    // LIMPIAR INPUT
    this.searchCode.nativeElement.value = '';
    // this.searchCode.nativeElement.onFocus = true;

  }

  /** ================================================================
   *  BUSCAR CODIGO
  ==================================================================== */  
  @ViewChild('searchCode') searchCode: ElementRef;
  // public peso: number;
  buscarCodigo(code: string){

    if (code.length === 0) {
      return;      
    }

    
    let codigo = '';
    let cantidad:any = 1;
    let precio = 0;
    

    if (code.includes('+')) {
      
      let newCode = code.split('+');

      codigo = newCode[1];
      cantidad = Number(newCode[0]);

    }else{

      // COMPROBAR SI ES CODIGO DE BARRA CON PESO O PRECIO
      let digitos = this.empresa.basculacode.length;
      let digCode = digitos + 3;
      let totalCode = code.length - 1;
      

      if (code.slice(0,digitos) === this.empresa.basculacode) {
        codigo = code.slice(digitos, digCode);        
        
        if(this.empresa.basculatype === 'peso'){

          let cant = Number(code.slice(digCode , totalCode))/1000;

          cantidad = cant.toFixed(3);

        }else if(this.empresa.basculatype === 'precio'){
          precio = Number(code.slice(digCode , totalCode));
        }

      }else{
        codigo = code;
      }
    }

    this.productService.cargarProductoCodigo(codigo)
    .subscribe( (product) => {
                  
            if (product === null || product.status === false) {
              Swal.fire('Error', 'No existe el producto, verifica el codigo de barras o si el producto a sido desactivado!', 'error');
              this.searchCode.nativeElement.value = '';
              this.searchCode.nativeElement.onFocus = true;
              return;              
            }

            let digitos = this.empresa.basculacode.length;
            let digCode = digitos + 3;

            // SI ES GRANEL
            if (product.type === 'Granel') {
              // SI ESTA USANDO BASCULA

              if (code.slice(0,digitos) === this.empresa.basculacode) {

                if(this.empresa.basculatype === 'precio'){
                  cantidad = precio / product.price;
                }

                // GUARDAR AL CARRITO
                this.searchCode.nativeElement.value = '';
                this.searchCode.nativeElement.onFocus = true;
                this.carritoTemp(product, cantidad, product.price);
                // GUARDAR AL CARRITO
                return;
                
              }

              
              if (this.empresa.bascula) {                
                
                this.basculaService.loadPeso(this.basculaT, this.puertoBascula)
                .subscribe( resp => {
                  cantidad = resp;

                  this.searchCode.nativeElement.value = '';
                  this.searchCode.nativeElement.onFocus = true;
                  this.carritoTemp(product, cantidad, product.price)

                  return;

                });

              }else {

                if (this.empresa.fruver) {

                  Swal.fire({
                    title: 'Cantidad',
                    input: 'text',
                    inputAttributes: {
                      autocapitalize: 'off'
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Confirmar',
                    showLoaderOnConfirm: true,
                    preConfirm: (resp) => {
                      
                      return resp;
                    }
                  }).then((result) => {
          
                    if (result.value > 0) {
                      
                      cantidad = result.value;
                      this.searchCode.nativeElement.value = '';
                      this.searchCode.nativeElement.onFocus = true;
          
                      // GUARDAR AL CARRITO
                      this.carritoTemp(product, cantidad, product.price);
                      // GUARDAR AL CARRITO
          
                      return;
                    }else{
                      return;
                    }                
                    
                  });

                  
                }else{
                  this.searchCode.nativeElement.value = '';
                  this.searchCode.nativeElement.onFocus = true;
                  this.carritoTemp(product, cantidad, product.price);
                  return;

                }

              }
              
            }else if( product.type === 'Paquete' && product.bascula ){

              if (code.slice(0,4) === this.empresa.basculacode) {

                if(this.empresa.basculatype === 'precio'){
                  cantidad = precio / product.price;
                }

                // GUARDAR AL CARRITO
                this.searchCode.nativeElement.value = '';
                this.searchCode.nativeElement.onFocus = true;
                this.carritoTemp(product, cantidad, product.price);
                // GUARDAR AL CARRITO
                return;
                
              }

              
              if (this.empresa.bascula) {                
                
                this.basculaService.loadPeso(this.basculaT, this.puertoBascula)
                .subscribe( resp => {
                  cantidad = resp;

                  this.searchCode.nativeElement.value = '';
                  this.searchCode.nativeElement.onFocus = true;
                  this.carritoTemp(product, cantidad, product.price)

                  return;

                });

              }else {

                if (this.empresa.fruver) {

                  Swal.fire({
                    title: 'Cantidad',
                    input: 'text',
                    inputAttributes: {
                      autocapitalize: 'off'
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Confirmar',
                    showLoaderOnConfirm: true,
                    preConfirm: (resp) => {
                      
                      return resp;
                    }
                  }).then((result) => {
          
                    if (result.value > 0) {
                      
                      cantidad = result.value;
                      this.searchCode.nativeElement.value = '';
                      this.searchCode.nativeElement.onFocus = true;
          
                      // GUARDAR AL CARRITO
                      this.carritoTemp(product, cantidad, product.price);
                      // GUARDAR AL CARRITO
          
                      return;
                    }else{
                      return;
                    }                
                    
                  });

                  
                }else{
                  this.searchCode.nativeElement.value = '';
                  this.searchCode.nativeElement.onFocus = true;
                  this.carritoTemp(product, cantidad, product.price);
                  return;

                }

              }

            }else{
              this.searchCode.nativeElement.value = '';
              this.searchCode.nativeElement.onFocus = true;
              this.carritoTemp(product, cantidad, product.price);
            }
                        
            // this.modalProducto(product);
            
          }, (err) =>         
            { 
              console.log(err);
              Swal.fire('Error', err.error.msg, 'error'); 
            }
          );
  }

  /** ================================================================
   *  AGREGAR PRODUCTO POR BOTON
  ==================================================================== */
  btnAddProducto( product: any, qty: number, precio: number ){
    
    if (product.type === 'Granel') {

      if (this.empresa.bascula) {

        this.basculaService.loadPeso(this.basculaT, this.puertoBascula)
            .subscribe( resp => {

              qty = resp;

              // GUARDAR AL CARRITO
              this.carritoTemp(product, qty, product.price);
              // GUARDAR AL CARRITO

              return;                    

            });                
        
      }else{             

        Swal.fire({
          title: 'Cantidad',
          input: 'text',
          inputAttributes: {
            autocapitalize: 'off'
          },
          showCancelButton: true,
          confirmButtonText: 'Confirmar',
          showLoaderOnConfirm: true,
          preConfirm: (resp) => {
            
            return resp;
          }
        }).then((result) => {

          if (result.value > 0) {
            
            qty = result.value;

            // GUARDAR AL CARRITO
            this.carritoTemp(product, qty, product.price);
            // GUARDAR AL CARRITO

            return;
          }else{
            return;
          }                
          
        });
      }
      
    }else{

      // // GUARDAR AL CARRITO
      // this.carritoTemp(product, qty, product.price);
      // // GUARDAR AL CARRITO

      Swal.fire({
        title: 'Cantidad',
        input: 'text',
        inputAttributes: {
          autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        showLoaderOnConfirm: true,
        preConfirm: (resp) => {
          
          return resp;
        }
      }).then((result) => {

        if (result.value > 0) {
          
          const qty:number = result.value;

          // GUARDAR AL CARRITO
          this.carritoTemp(product, qty, product.price);
          // GUARDAR AL CARRITO

          return;
        }              
        
      });

    } 

  }


  /** ================================================================
   *  ANTES ALMACENAR PRODUCTO TEMPORAL EN EL CARRITO
  ==================================================================== */
  @ViewChild('searchProductCodeN') searchProductCodeN: ElementRef;
  carritoTempBefored( product: any, qty: number, precio: number, nota: string = '', newPrice: boolean = false ){

    this.searchProductCodeN.nativeElement.value = '';
    delete this.productSelected;
    delete this.qtySelect;
    
    setTimeout( () =>{
      this.searchProductCodeN.nativeElement.focus();
    }, 500);

    this.carritoTemp(product, qty, precio, nota, newPrice);

  }

  /** ================================================================
   *  ALMACENAR PRODUCTO TEMPORAL EN EL CARRITO
  ==================================================================== */
  public total: number = 0;
  public comandas: _comanda[] = [];
  public ingredientes: _ingredientes[] = [];
  public inventarioNew: number = 0;
  public inventarioNewB: boolean = false;

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  carritoTemp( product: any, qty: number, precio: number, nota: string = '', newPrice: boolean = false ){

    // SI ES UNA MESA
    if (this.mesa.img === 'mesa.svg') {
      
      this.carrito = [];
      this.comanda = [];

    this.mesasServices.loadMesaId(this.mesaID)
        .subscribe( (mesa: any) => {

          this.carrito = mesa.carrito;
          this.mesa = mesa;
          
          this.comandas = mesa.comanda;

          for (let i = 0; i < mesa.carrito.length; i++) {
            
            this.comanda.push({
              product: mesa.carrito[i].product.name,
              tipo: mesa.carrito[i].product.tipo,
              comanda: mesa.carrito[i].product.comanda,
              qty: mesa.carrito[i].qty,
              price: mesa.carrito[i].price
            });
                        
          }

          this.comandaTemp = this.comanda;  

          this.sumarTotales();

          /** ===================================
           * 
           */

          let mayor = false;

          if (this.clienteTemp) {
            if (this.clienteTemp.mayoreo) {
              precio = product.wholesale;
            }
          }

          if (newPrice) {
            precio = (precio / (qty * 1000)) * 1000;
          }
      
          if(product.mayoreo > 0 && qty >= product.mayoreo){
            precio = product.wholesale;
            mayor = true;
          }
      
          this.inventarioNew = 0;
          this.inventarioNewB = false;
      
          if(this.comanda.length === 0){
            this.mesa.fecha   = new Date(); 
          }
          
          const validarItem = this.productUp.findIndex( (resp) =>{      
            if (resp.product === product.pid ) {
              return true;
            }else {
              return false;
            }
          });

          let ivaP:number = 0;

    if (product.tax) {
      ivaP = Number(precio * qty) * Number(product.taxid?.valor / 100);
    }

    if ( validarItem === -1 ) {


      // AGREGAMOS EL PRODUCTO
      this.productUp.push({
        product: product.pid,
        qty,
        price: precio,
        iva: ivaP,
        mayor
      });

      // AGREGAMOS A LA COMANDA
      this.comanda.push({
        product: product.name,
        comanda: product.comanda,
        tipo: product.tipo,
        qty,  
        price: precio
      });

      
      this.inventarioNew = product.inventario - qty;
      this.inventarioNewB = true;
            

    }else{
      
      let qtyTemp = this.productUp[validarItem].qty;
      qtyTemp += Number(qty);

      
      let ivaTemp = this.productUp[validarItem].iva;
      ivaTemp += Number(ivaP);
      
      this.productUp[validarItem].iva = ivaTemp;
      this.productUp[validarItem].qty = qtyTemp;
      this.comanda[validarItem].qty = qtyTemp;
      
      if (product.mayoreo > 0 &&  qtyTemp >= product.mayoreo) {
        this.productUp[validarItem].price = product.wholesale;    
        this.productUp[validarItem].mayor = true;  
      }else{
        this.productUp[validarItem].price = precio;
        this.productUp[validarItem].mayor = false;  
      }

      this.inventarioNew = product.inventario - qtyTemp;
      this.inventarioNewB = true;
      
      setTimeout( () => {
        this.inventarioNewB = false;        
      }, 2500);
      
    }

    this.mesa.carrito =  this.productUp;

    // COMANDA NUEVA
    this.ingredientes = [];
    
    if (this.mesa.img === 'mesa.svg') {
      
      // AGREGAR LOS INGREDIENTES
      for (let i = 0; i < product.kit.length; i++) {
        
        this.ingredientes.push({

          name: product.kit[i].product.name,
          qty: product.kit[i].qty,
          status: true

        });
        
      }
      
      if (qty > 1) {

        for (let i = 0; i < qty; i++) {
          this.comandas.push({
            product: product.pid,
            ingredientes: this.ingredientes,
            qty: 1,
            nota: nota,
            estado: 'pendiente'
          });
          
        }
        
      }else{

        this.comandas.push({
          product: product.pid,
          ingredientes: this.ingredientes,
          qty: 1,
          nota: nota,
          estado: 'pendiente'
        });

      }

    }

    // GUARDAR LA INFORMACION DE LA COMANDA
    this.mesa.comanda = this.comandas;    

    this.mesasServices.updateMesa(this.mesa, this.mesaID)
        .subscribe( (resp:{ok: boolean, mesa: any}) => { 
          
          this.carrito = resp.mesa.carrito;
          this.productUp = [];
          this.comanda = [];
          this.comandas = [];

          this.comandas = resp.mesa.comanda;

          for (let i = 0; i < resp.mesa.carrito.length; i++) {

            this.productUp.push({
              product: resp.mesa.carrito[i].product._id,
              qty: resp.mesa.carrito[i].qty,
              price: resp.mesa.carrito[i].price,
              iva: resp.mesa.carrito[i].iva,
              mayor: resp.mesa.carrito[i].mayor,
            });
            
            this.comanda.push({
              product:  resp.mesa.carrito[i].product.name,
              comanda:  resp.mesa.carrito[i].product.comanda,
              tipo:     resp.mesa.carrito[i].product.tipo,
              qty:      resp.mesa.carrito[i].qty,
              price:    resp.mesa.carrito[i].price
            });
                        
          }
          this.comandaTemp = this.comanda;

          this.sumarTotales();

          // this.cargarMesa(this.mesaID);

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });
          

    });
          
    }else{


      let mayor = false;

    if (this.clienteTemp) {
      if (this.clienteTemp.mayoreo) {
        precio = product.wholesale;
      }
    }

    
    if (newPrice) {
      precio = (precio / (qty * 1000)) * 1000;
    }

    if(product.mayoreo > 0 && qty >= product.mayoreo){
      precio = product.wholesale;
      mayor = true;
    }

    this.inventarioNew = 0;
    this.inventarioNewB = false;

    if(this.comanda.length === 0){
      this.mesa.fecha   = new Date(); 
    }
    
    const validarItem = this.productUp.findIndex( (resp) =>{      
      if (resp.product === product.pid ) {
        return true;
      }else {
        return false;
      }
    });
    
    let ivaP:number = 0;

    if (product.tax) {
      ivaP = Number(precio * qty) * Number(product.taxid?.valor / 100);
    }

    if ( validarItem === -1 ) {


      // AGREGAMOS EL PRODUCTO
      this.productUp.push({
        product: product.pid,
        qty,
        price: precio,
        iva: ivaP,
        mayor
      });

      // AGREGAMOS A LA COMANDA
      this.comanda.push({
        product: product.name,
        comanda: product.comanda,
        tipo: product.tipo,
        qty,  
        price: precio
      });

      
      this.inventarioNew = product.inventario - qty;
      this.inventarioNewB = true;
            

    }else{
      
      let qtyTemp = this.productUp[validarItem].qty;
      qtyTemp += Number(qty);

      
      let ivaTemp = this.productUp[validarItem].iva;
      ivaTemp += Number(ivaP);
      
      this.productUp[validarItem].iva = ivaTemp;
      this.productUp[validarItem].qty = qtyTemp;
      this.comanda[validarItem].qty = qtyTemp;
      
      if (product.mayoreo > 0 &&  qtyTemp >= product.mayoreo) {
        this.productUp[validarItem].price = product.wholesale;    
        this.productUp[validarItem].mayor = true;  
      }else{
        this.productUp[validarItem].price = precio;
        this.productUp[validarItem].mayor = false;  
      }

      this.inventarioNew = product.inventario - qtyTemp;
      this.inventarioNewB = true;
      
      setTimeout( () => {
        this.inventarioNewB = false;        
      }, 2500);
      
    }
    
    this.mesa.carrito =  this.productUp;

    // COMANDA NUEVA
    this.ingredientes = [];
    
    if (this.mesa.img === 'mesa.svg') {
      
      // AGREGAR LOS INGREDIENTES
      for (let i = 0; i < product.kit.length; i++) {
        
        this.ingredientes.push({

          name: product.kit[i].product.name,
          qty: product.kit[i].qty,
          status: true

        });
        
      }
      
      if (qty > 1) {

        for (let i = 0; i < qty; i++) {
          this.comandas.push({
            product: product.pid,
            ingredientes: this.ingredientes,
            qty: 1,
            nota: nota,
            estado: 'pendiente'
          });
          
        }
        
      }else{

        this.comandas.push({
          product: product.pid,
          ingredientes: this.ingredientes,
          qty: 1,
          nota: nota,
          estado: 'pendiente'
        });

      }

    }

    // GUARDAR LA INFORMACION DE LA COMANDA
    this.mesa.comanda = this.comandas;    

    this.mesasServices.updateMesa(this.mesa, this.mesaID)
        .subscribe( (resp:{ok: boolean, mesa: any}) => { 
          
          this.carrito = resp.mesa.carrito;
          this.productUp = [];
          this.comanda = [];
          this.comandas = [];

          this.comandas = resp.mesa.comanda;

          for (let i = 0; i < resp.mesa.carrito.length; i++) {

            this.productUp.push({
              product: resp.mesa.carrito[i].product._id,
              qty: resp.mesa.carrito[i].qty,
              price: resp.mesa.carrito[i].price,
              iva: resp.mesa.carrito[i].iva,
              mayor: resp.mesa.carrito[i].mayor,
            });
            
            this.comanda.push({
              product:  resp.mesa.carrito[i].product.name,
              comanda:  resp.mesa.carrito[i].product.comanda,
              tipo:     resp.mesa.carrito[i].product.tipo,
              qty:      resp.mesa.carrito[i].qty,
              price:    resp.mesa.carrito[i].price
            });
                        
          }
          this.comandaTemp = this.comanda;

          this.sumarTotales();

          // this.cargarMesa(this.mesaID);

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

    }

    
    

  }

  /** ================================================================
   *  ELIMINAR INGREDIENTES
  ==================================================================== */
  eliminarIngredientes(ingrediente: string, y: number ){

    // FOR 
    for (let i = 0; i < this.comandas.length; i++) {
      
      this.comandas[i].ingredientes.findIndex( (resp) =>{ 
        
        if (this.comandas[i].ingredientes.length < 2) {
          Swal.fire('Atencion', 'No se pueden eliminar todos los ingredientes', 'info');
          return;
        }
        
        if (resp._id === ingrediente ) {
          
          // this.comandas[i].ingredientes.splice(y, 1);
          
          if (this.comandas[i].ingredientes[y].status === true) {            
            this.comandas[i].ingredientes[y].status = false;
          }else {
            this.comandas[i].ingredientes[y].status = true;
          }

          return true;
        }else {
          return false;
        }
      });
      
    };
    // FOR 

    // ACTUALZAR COMANDA
    this.mesa.comanda = this.comandas;
    this.comandas = [];

    this.mesasServices.updateMesa(this.mesa, this.mesaID)
        .subscribe( (resp:{ok: boolean, mesa: any}) => {

          this.carrito = resp.mesa.carrito;
          this.comandas = resp.mesa.comanda;
          this.productUp = [];
          this.comanda = [];
          
          for (let i = 0; i < resp.mesa.carrito.length; i++) {

            this.productUp.push({
              product: resp.mesa.carrito[i].product._id,
              qty: resp.mesa.carrito[i].qty,
              price: resp.mesa.carrito[i].price,
              iva: resp.mesa.carrito[i].iva,
              mayor: resp.mesa.carrito[i].mayor
            });
            
            this.comanda.push({
              product: resp.mesa.carrito[i].product.name,
              comanda: resp.mesa.carrito[i].product.comanda,
              tipo: resp.mesa.carrito[i].product.tipo,
              qty: resp.mesa.carrito[i].qty,
              price: resp.mesa.carrito[i].price
            });
                        
          }

          this.comandaTemp = this.comanda;

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

  }

  /** ================================================================
   *  ELIMINAR PRODUCTO DEL CARRITO CARRITO
  ==================================================================== */
  eliminarProductoCarrito( i: number, product: any ){

    Swal.fire({
      title: 'Estas Seguro?',
      text: "De eliminar este producto del carrito!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {

        this.productUp.splice(i, 1);
        this.comanda.splice(i, 1);

        // MODIFICAR COMANDAS
        let comandasTemp = [];
        this.comandas.map( (item:any) => {          
          if (item.product._id !== product._id) {            
            comandasTemp.push(item);            
          }
        });
        this.comandas = comandasTemp;
        // MODIFICAR COMANDAS
       
        this.mesa.comanda = this.comandas;
        this.mesa.carrito =  this.productUp;

        if(this.comanda.length === 0){
          delete this.mesa.comanda;
        }

        this.mesasServices.updateMesa(this.mesa, this.mesaID)
            .subscribe( (resp:{ok: boolean, mesa: any}) => {

              this.carrito = resp.mesa.carrito;
              this.productUp = [];
              this.comanda = [];
              
              for (let i = 0; i < resp.mesa.carrito.length; i++) {

                this.productUp.push({
                  product: resp.mesa.carrito[i].product._id,
                  qty: resp.mesa.carrito[i].qty,
                  price: resp.mesa.carrito[i].price,
                  iva: resp.mesa.carrito[i].iva,
                  mayor: resp.mesa.carrito[i].mayor
                });
                
                this.comanda.push({
                  product: resp.mesa.carrito[i].product.name,
                  comanda: resp.mesa.carrito[i].product.comanda,
                  tipo: resp.mesa.carrito[i].product.tipo,
                  qty: resp.mesa.carrito[i].qty,
                  price: resp.mesa.carrito[i].price
                });
                            
              }

              this.comandaTemp = this.comanda;

              this.sumarTotales();

              // this.cargarMesa(this.mesaID);

            }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });
        

        Swal.fire('Eliminado!', 'El producto se a eliminado con exito.', 'success');
      }
    })   

  }

  /** ================================================================
   *  CONVERTIR AL MAYOREO LOS PRODUCTOS
  ==================================================================== */
  mayoreoChange(){

    this.productUp = [];
    
    this.carrito.map((it) => {
      
      if (!it.mayor) {
        it.price = it.product.wholesale;
        it.mayor = true;
      }

      this.productUp.push({
        qty: it.qty,
        product: it.product._id,
        price: it.price,
        mayor: it.mayor
      })
      
    });

    this.mesa.carrito = this.productUp;
    
    this.mesasServices.updateMesa(this.mesa, this.mesaID)
        .subscribe( (resp:{ok: boolean, mesa: any}) => { 
          
          this.carrito = resp.mesa.carrito;
          this.mesa.carrito = resp.mesa.carrito;

          this.productUp = [];
          this.comanda = [];
          this.comandas = [];

          this.comandas = resp.mesa.comanda;

          for (let i = 0; i < resp.mesa.carrito.length; i++) {

            this.productUp.push({
              product: resp.mesa.carrito[i].product._id,
              qty: resp.mesa.carrito[i].qty,
              price: resp.mesa.carrito[i].price,
              iva: resp.mesa.carrito[i].iva,
              mayor: resp.mesa.carrito[i].mayor
            });
            
            this.comanda.push({
              product:  resp.mesa.carrito[i].product.name,
              comanda:  resp.mesa.carrito[i].product.comanda,
              tipo:     resp.mesa.carrito[i].product.tipo,
              qty:      resp.mesa.carrito[i].qty,
              price:    resp.mesa.carrito[i].price
            });
                        
          }
          this.comandaTemp = this.comanda;          

          this.inputChange = false;

          this.sumarTotales();          

          // this.cargarMesa(this.mesaID);

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

    
    

  }
  /** ================================================================
   *  ACTIVE DATAFON
  ==================================================================== */
  activeDatafon(datafon: boolean){   

    this.sumarTotales(datafon)
  }

  /** ================================================================
   *  CAMBIAR PROPINA
  ==================================================================== */
  changeTip(tip: any){
    
    tip = Number(tip);

    if (tip >= 0) {

      this.total = 0;
      this.base = 0;
      this.iva = 0;
      this.totalCosto = 0;
      this.totalTip = 0;

      this.impuestos.map( (impuesto) => {
        impuesto.total = 0;
      });

      if (this.carrito.length > 0) {
        
        for (let i = 0; i < this.carrito.length; i++) {

          this.total += (this.carrito[i].price * this.carrito[i].qty);
          this.base += (this.carrito[i].price * this.carrito[i].qty);
          this.totalCosto += (this.carrito[i].product.cost * this.carrito[i].qty);

          if (this.empresa?.decimal === false) {          
            this.total = Math.round(this.total);
            this.base = Math.round(this.base);
            this.totalCosto = Math.round(this.totalCosto);
          }
          

          // SUMAR IMPUESTOS
          if (this.empresa?.impuesto!) {          
            this.impuestos.map( (impuesto) => {            
              
              if (impuesto.taxid === this.carrito[i].product.taxid) {
                impuesto.total += this.carrito[i].iva;
              }

            })

            this.iva += Math.round(this.carrito[i].iva);         
            
          }
          // SUMAR IMPUESTOS
          
        }

        if (this.mesa.descuento) {
          this.total = this.total - Math.round((this.total * this.mesa.porcentaje)/100);
        }

        if (this.empresa?.impuesto) {
          this.total += this.iva;
        }

        if (this.empresa.tip) {
          this.totalTip = tip;        
          this.tipIn.nativeElement.value = tip;        
          this.total += tip;
        }

      }else {
        this.productUp = [];
        this.comanda = [];
        this.comandas = [];

        this.impuestos.map( (impuesto) => {
          impuesto.total = 0;
        });

      }
      
    }
  }

  /** ================================================================
   *  SUMAR TOTALES
  ==================================================================== */
  public totalCosto:number = 0;
  public totalItems:number = 0;
  public totalTip:number = 0;
  public checkDatafon: boolean = false;
  public datafon:number = 0;
  public iva:number = 0;
  public base:number = 0;
  sumarTotales( datafon: boolean = false ){
    
    this.total = 0;
    this.base = 0;
    this.iva = 0;
    this.datafon = 0;
    this.totalCosto = 0;
    this.totalTip = 0;
    this.totalItems = 0;

    this.impuestos.map( (impuesto) => {
      impuesto.total = 0;
    });

    if (this.carrito.length > 0) {
      
      for (let i = 0; i < this.carrito.length; i++) {

        this.total += (this.carrito[i].price * this.carrito[i].qty);
        this.base += (this.carrito[i].price * this.carrito[i].qty);
        this.totalCosto += (this.carrito[i].product.cost * this.carrito[i].qty);

        if (this.empresa?.decimal === false) {          
          this.total = Math.round(this.total);
          this.base = Math.round(this.base);
          this.totalCosto = Math.round(this.totalCosto);
        }
        

        // SUMAR IMPUESTOS
        if (this.empresa?.impuesto!) {          
          this.impuestos.map( (impuesto) => {            
            
            if (impuesto.taxid === this.carrito[i].product.taxid) {
              impuesto.total += this.carrito[i].iva;
            }

          })

          this.iva += Math.round(this.carrito[i].iva);         
          
        }
        // SUMAR IMPUESTOS

        // SUMAR ITEMS
        this.totalItems += this.carrito[i].qty;
        
      }

      if (this.mesa.descuento) {
        this.total = this.total - Math.round((this.total * this.mesa.porcentaje)/100);
      }

      if (this.empresa?.impuesto) {
        this.total += this.iva;
      }

      if (this.empresa?.tip) {
        this.totalTip = (this.total * this.empresa.propina) / 100;        
        this.tipIn.nativeElement.value = this.totalTip;        
        this.total += this.totalTip;
      }

      if (datafon) {
        this.datafon = this.redondearCent((this.total * this.empresa.comidatafon) / 100) ;
        this.total += this.datafon;
      }else{
        this.datafon = 0;
        this.total -= this.datafon;
      }

      this.total = this.redondearCent(this.total);
      this.base = this.redondearCent(this.base);
      this.iva = this.redondearCent(this.iva);
      this.totalCosto = this.redondearCent(this.totalCosto);
      this.totalTip = this.redondearCent(this.totalTip);

    }else {
      this.productUp = [];
      this.comanda = [];
      this.comandas = [];

      this.impuestos.map( (impuesto) => {
        impuesto.total = 0;
      });

      this.totalItems = 0;

    }

    this.focusMonto();

  }

  /** ================================================================
   *  REDONDEAR CENTESIMA
  ==================================================================== */
  redondearCent(monto: number){

    return monto;
    // return Math.round(monto / 100) * 100;
    // return monto;
  }

  /** ============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * CLIENTES - CLIENTES - CLIENTES - CLIENTES  
  ==================================================================== */
  public listaClientes: Client[] = [];
  public listaClientesTemp: Client[] = [];
  public totalClientes: number = 0;
  public clienteTemp: Client = {
    name : '',
    cedula: '',
    phone: '',
    email: '',
    address: '',
    city: ''
  };

  /** ================================================================
   *  BUSCAR CLIENTE
  ==================================================================== */
  public sinResultadosClientes: boolean = false;
  public cargandoCliente: boolean = true;

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
   *  SELECCIONAR CLIENTE searchClient
  ==================================================================== */
  @ViewChild('searchClient') searchClient: ElementRef;
  seleccionarCliente(cliente: Client){
    
    this.clienteTemp = cliente;

    this.searchClient.nativeElement.value = '';
    this.listaClientes = [];
    this.totalClientes = 0;
    this.cargandoCliente = true;
    this.sinResultadosClientes = false;

    this.mesa.cliente = this.clienteTemp.cid

    this.mesasServices.updateMesa(this.mesa, this.mesaID)
        .subscribe( (resp:{ok: boolean, mesa: Mesa}) => {       
          
          this.cargarMesa(this.mesaID);
          
        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });    
    
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

    // OBTENER CODIGO DEL DEPARTAMENTO Y CIUDAD
    let ciudaQ = await this.cities.find( city =>  {
      if ( this.newClientForm.value.city === city.ciudad && this.newClientForm.value.department === city.departamento) {
        return city
      }
    });
    
    this.newClientForm.value.codigodepartamento  = ciudaQ['codigo departamento'];
    this.newClientForm.value.codigociudad  = ciudaQ['codigo'];

    this.formSubmitted = true;

    if (this.newClientForm.invalid) {
      return;
    }

    if (this.newClientForm.value.party_type === 'PERSONA_NATURAL') {      
      this.newClientForm.value.name = `${this.newClientForm.value.first_name} ${this.newClientForm.value.family_name}`
    }else{
      this.newClientForm.value.name = this.newClientForm.value.company_name;
    }

    this.newClientForm.value.party_identification = this.newClientForm.value.cedula;

    this.clientService.createClient(this.newClientForm.value)
        .subscribe((resp: any) => {

          Swal.fire('Estupendo', 'Se ha creado el cliente exitosamente!', 'success');

          this.formSubmitted = false;
          this.newClientForm.reset();          
          
        }, (err) =>{
          Swal.fire('Error', err.error.msg, 'error');
        });

  }

  /** ================================================================
   *  CAMPO VALIDO
  ==================================================================== */
  campoValido(campo: string): boolean{

    if ( this.newClientForm.get(campo).invalid &&  this.formSubmitted) {      
      return true;      
    } else{
            
      return false;
    }
  
  }

  /** ============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   *  PRODUCTOS - PRODUCTOS - PRODUCTOS - PRODUCTOS
  ==================================================================== */
  @ViewChild('searchProduct') searchProduct: ElementRef;
  public listaProductos: Product[] = [];
  public listaProductosTemp: Product[] = [];
  public totalProductos: number = 0;

  public resultado: number = 0;
  public desde: number = 0;
  public cargando: boolean = true;
  public sinResultados: boolean = true;
  public btnAtras: string = '';
  public btnAdelante: string = '';

  /** ================================================================
   *  CARGAR PRODUCTOS POR CATEGORIA
  ==================================================================== */
  cargarProductosDepartamento(department: string){

    
    this.cargando = true;
    this.sinResultados = true;
    this.productService.cargarProductoDepartamento(department)
        .subscribe(({total, products}) => {
            
          // COMPROBAR SI EXISTEN RESULTADOS
          if (products.length === 0) {
            this.sinResultados = false;
            this.cargando = false;
            this.listaProductos = [];
            this.resultado = 0;
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
            return;                
          }
          // COMPROBAR SI EXISTEN RESULTADOS
        
          this.totalProductos = total;
          this.listaProductos = products;
          this.listaProductosTemp = products;
          this.resultado = 0;
          this.cargando = false;
          

          // BOTONOS DE ADELANTE Y ATRAS          
          if (this.desde === 0 && this.totalProductos > 10) {
            this.btnAtras = 'disabled';
            this.btnAdelante = '';
          }else if(this.desde === 0 && this.totalProductos < 11){
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
          }else if(this.desde > this.listaProductos.length){
            this.btnAtras = '';
            this.btnAdelante = 'disabled';
          }else if((this.desde + 10) >= this.totalProductos){
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
   *  CARGAR PRODUCTOS
  ==================================================================== */
  public endPoint: string = `?desde=${this.desde}&status=true`;
  cargarProductos(){
   
    this.cargando = true;
    this.sinResultados = true;
    this.productService.cargarProductos(this.endPoint)
        .subscribe(({total, products}) => {
            
          // COMPROBAR SI EXISTEN RESULTADOS
          if (products.length === 0) {
            this.sinResultados = false;
            this.cargando = false;
            this.listaProductos = [];
            this.resultado = 0;
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
            return;                
          }
          // COMPROBAR SI EXISTEN RESULTADOS
        
          this.totalProductos = total;
          this.listaProductos = products;
          this.listaProductosTemp = products;
          this.resultado = 0;
          this.cargando = false;
          

          // BOTONOS DE ADELANTE Y ATRAS          
          if (this.desde === 0 && this.totalProductos > 10) {
            this.btnAtras = 'disabled';
            this.btnAdelante = '';
          }else if(this.desde === 0 && this.totalProductos < 11){
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
          }else if(this.desde > this.listaProductos.length){
            this.btnAtras = '';
            this.btnAdelante = 'disabled';
          }else if((this.desde + 10) >= this.totalProductos){
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
   *  BUSCAR PRODUCTOS CODE NEW
  ==================================================================== */
  @ ViewChild('cantidadCo') cantidadCo: ElementRef;
  @ ViewChild('precioCo') precioCo: ElementRef;
  
  buscarProductoCode(code: string){

    let codigo = '';
    let cantidad:any = 1;    

    if (code.includes('+')) {
      
      let newCode = code.split('+');

      codigo = newCode[1];
      cantidad = Number(newCode[0]);

    }else{

      // COMPROBAR SI ES CODIGO DE BARRA CON PESO O PRECIO
      let digitos = this.empresa.basculacode.length;
      let digCode = digitos + 3;
      let totalCode = code.length - 1;
      

      if (code.slice(0,digitos) === this.empresa.basculacode) {
        codigo = code.slice(digitos, digCode);        
        
        if(this.empresa.basculatype === 'peso'){

          let cant = Number(code.slice(digCode , totalCode))/1000;

          cantidad = cant.toFixed(3);

        }

      }else{
        codigo = code;
      }
    }

    this.qtySelect = cantidad;

    this.productService.cargarProductoCodigo(Number(codigo).toString())
        .subscribe( (product) => {
          

          this.productSelected = product;
          this.priceProductSelected = product.price;
          setTimeout( ()=> {

            this.precioCo.nativeElement.focus();
          }, 300 )

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');
          
        }) 
    

  }

  /** ================================================================
   *  BUSCAR PRODUCTOS
  ==================================================================== */
  buscarProducto( termino: string ){
    
    if (termino.length < 3) {
      this.listaProductos = this.listaProductosTemp;
      return;
    }else{
      
      const status = true;
      this.searchService.search('products', termino)
          .subscribe(({total, resultados}) => {
              
            // COMPROBAR SI EXISTEN RESULTADOS
            if (resultados.length === 0) {
              this.listaProductos = [];
              this.totalProductos = 0;
              return;                
            }
            // COMPROBAR SI EXISTEN RESULTADOS

            this.listaProductos = resultados;
            this.totalProductos = total;
  
          });

    }

  }

  /** ================================================================
   *  LOAD BASCULA
  ==================================================================== */
  loadBascula(i: any, product: Product){

    if (this.empresa.bascula) {        

      this.basculaService.loadPeso(this.basculaT, this.puertoBascula)
          .subscribe( resp => {

            this.changeCant(resp, product);                

          });        
    }
    

  }

  /** ================================================================
   *  SELECCIONAR PRODUCTO
  ==================================================================== */
  @ViewChild('cantidad') cantidad: ElementRef;
  public productTemp: Product = {
    code: '',
    name: '',
    type: '',
    cost: 0,
    gain: 0,
    price: 0,
    wholesale: 0,
    getImage: ''
  };

  seleccionarProducto( producto: Product ){

    if (producto.type !== 'Paquete') {
      if (producto.out) {
        Swal.fire('Error', 'El producto esta agotado. Porfavor, verifica el stock de este prodcuto.', 'error');             
        return;
      }else{
        if (producto.low) {
          Swal.fire({
            icon: 'warning',
            title: 'Pocas unidades de este productos, verificar inventario',
            showConfirmButton: true,
            timer: 1500
          });
        }
      }             
    }

    this.searchProduct.nativeElement.value = '';

    this.listaProductos = [];
    this.totalProductos = 0;

    this.productTemp = producto;

    // SI ES GRANEL
    let qty:number = 1;
    if (producto.type === 'Granel') {

      if (this.empresa.bascula) {        

        this.basculaService.loadPeso(this.basculaT, this.puertoBascula)
            .subscribe( resp => {

              qty = resp;
              this.cantidad.nativeElement.value = qty;
              
              return;                    

            });        
      }
      
    }else if(producto.type === 'Paquete' && producto.bascula ){

      this.basculaService.loadPeso(this.basculaT, this.puertoBascula)
            .subscribe( resp => {

              qty = resp;
              this.cantidad.nativeElement.value = qty;
              
              return;                    

            }); 

    }else{      
      this.cantidad.nativeElement.value = qty;
    }
    // SI ES GRANEL

  }

  /** ================================================================
   *  ENVIAR PRODUCTO AL CARRITO TEMPORAL POR EL BUSCADOR
  ==================================================================== */
  @ViewChild('precio') newPrice: ElementRef;
  @ViewChild('precioM') newPrice2: ElementRef;
  evniarAlCarrito( qty:number, mayoreo: boolean, code: string, change: boolean = false){

    if (code === '' || this.productTemp.price === 0) {
      Swal.fire('Atención', 'No has seleccionado ningun producto', 'info');
      return;
    }

    if (Number(qty) === 0 || qty < 0) {
      Swal.fire('Atención', 'No has seleccionado una cantidad validad', 'info');
      return;
    }

    let precio: number;

    if (change) {

      if (!mayoreo) {
        precio = this.newPrice.nativeElement.value;
      }else{
        precio = this.newPrice2.nativeElement.value;
      }
      
    }else{

      if (!mayoreo) {
        precio = this.productTemp.price;
      }else{
        precio = this.productTemp.wholesale;
      }
    }
    
    // GUARDAR AL CARRITO
    this.carritoTemp(this.productTemp, qty, precio);
    // GUARDAR AL CARRITO

    this.productTemp = {
      code: '',
      name: '',
      type: '',
      cost: 0,
      gain: 0,
      price: 0,
      wholesale: 0,
      getImage: ''
    };

    this.searchProduct.nativeElement.onFocus = true;

  }

  /** ================================================================
   *  COMPROBAR PRECIOS
  ==================================================================== */
  @ViewChild('comprobarPrecio') comprobarPrecio: ElementRef;
  public productoCom: Product;
  comprobrarPrecio(code: string){

    this.productService.cargarProductoCodigo(code)
        .subscribe((producto) => {

          this.productoCom = producto;

          this.comprobarPrecio.nativeElement.value = '';
          this.comprobarPrecio.nativeElement.focus();          

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

  }

  /** ============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * INVOICE - INVOICE - INVOICE - INVOICE  
  ==================================================================== */
  
  public payments: _payments[] = [];
  public credit: boolean = false;

  public invoiceForm = this.fb.group({
    amount: ['', [Validators.required, Validators.min(this.total)]],
    cost: [''],
    client: ['', [Validators.required]],
    type: ['efectivo', [Validators.required]],
    payments: [''],
    mesero: [0],
    mesa: [''],
    products: [''],
    credito: [this.credit],
    fechaCredito: [''],
    turno: [''],
    iva: [''],
    base:[''],
    pago: [0],
    vueltos: [0],
    nota: [''],
    apartado: false,
    porcentaje: 0,
    fecha: new Date(),
    descuento: false,
    marca: false,
    tip: 0,
    datafon: 0,
    electronica: false,
    placa: '',
    images: [],
  })

  /** ================================================================
   *  AGREGAR SALDO
  ==================================================================== */
  @ViewChild('montoAddd') montoAddd: ElementRef;
  @ViewChild('descripcionAddd') descripcionAddd: ElementRef;
  @ViewChildren('cantP') cantP: QueryList<any>;
  public saldo: number = 0;
  addSaldo(price: any, qty: any){

    qty = Number(qty);
    this.saldo += price*qty;   

    this.montoAddd.nativeElement.value = this.saldo;   

  }

  /** ================================================================
   *  AGREGAR METODO DE PAGO
  ==================================================================== */
  @ViewChild('descripcionAdd') descripcionAdd: ElementRef;
  @ViewChild('montoAdd') montoAdd: ElementRef;
  public vueltos: number = 0;
  public pago: number = 0;
  

  focusMonto(){
    this.montoAdd.nativeElement.value = this.total;  
    // this.montoAdd.nativeElement.focus();
  }

  agregarPagos(type: string, amount:number, description:string = '', credito: boolean){
    
    // Setear a number
    // amount = Number(amount);    

    this.saldo = 0;
    this.descripcionAddd.nativeElement.value = '';
    this.montoAddd.nativeElement.value = '';

    this.cantP.forEach( itt => {      
      itt.nativeElement.value = '';      
    })
    

    if (credito) {
      this.credit = true;
      // amount = this.total;
    }else{
      this.credit = false;
    }

    if (amount === 0 || amount < 1) {
      Swal.fire('Atención', 'No has agregado un monto', 'info');
      return;      
    }

    if(type === 'efectivo'){      
      this.pago += amount;
    }

    let totales = Number( this.total - this.totalPagos );

    // COMPROBAR SI EL MONTO ES MAYOR AL RESTANTE
    if ( amount > totales) {

      this.vueltos = (amount - totales);
      amount = Number( this.total - this.totalPagos );
      
    }else{
      amount = amount;
      this.vueltos = (amount - totales);
    }

    this.payments.push({
      type,
      amount,
      description
    });

    this.descripcionAdd.nativeElement.value = '';
    this.montoAdd.nativeElement.value = '';

    this.sumarPagos();
  }
  /** ================================================================
   *   ELIMINAR METODO DE PAGO
  ==================================================================== */
  eliminarPagos( item: any ){

    this.pago -= Number(item.amount);    
    
    const i = this.payments.indexOf(item);

    if ( i !== -1 ) { this.payments.splice(i, 1); }

    this.sumarPagos();

    this.vueltos = (this.total - this.totalPagos);

  }
  /** ================================================================
   *   LIMPIAR METODO DE PAGO
  ==================================================================== */
  limpiarPagos(tipo: string = ''){

    if (tipo !== 'credito') {      
      this.credit = false;     
    }else{
      this.credit = true;
    }

    this.payments = [];
    this.vueltos = 0;
    this.totalPagos = 0;
    this.pago = 0;

    this.sumarPagos();
  }

  /** ================================================================
   *   SUMAR METODO DE PAGO
  ==================================================================== */
  public totalPagos:number = 0;
  sumarPagos(){
    
    this.totalPagos = 0;
    if (this.payments.length > 0) {
      
      for (let i = 0; i < this.payments.length; i++) {
        
        this.totalPagos += Number( this.payments[i].amount );        
      }

    }else{
      this.pago = 0;
    }

  }

  /** ================================================================
   *   AGREGAR DESCUENTO
  ==================================================================== */
  public formDescuento = this.fb.group({
    descuento: [false],
    porcentaje: [0, [Validators.min(0), Validators.required]]
  });

  descuentos(){

    if (this.formDescuento.value.porcentaje <= 0) {
      this.formDescuento.value.descuento = false;
      this.formDescuento.value.porcentaje = 0;
    }else{
      this.formDescuento.value.descuento = true;
    }    
    
    this.mesasServices.updateMesa(this.formDescuento.value, this.mesaID)
    .subscribe( (resp:{mesa:Mesa, ok:boolean}) => {
      
        this.mesa.descuento = resp.mesa.descuento;
        this.mesa.porcentaje = resp.mesa.porcentaje;
        this.sumarTotales();
               
        Swal.fire('Estupendo', 'Se a actualizado correctamente', 'success');
      
      });


  }
  
  /** ================================================================
   *   CREAR FACTURA
  ==================================================================== */
  @ViewChild('tipIn') tipIn: ElementRef;
  @ViewChild('datafIn') datafIn: ElementRef;
  @ViewChild('fechCredito') fechCredito: ElementRef;
  public factura: LoadInvoice;
  public facturando: boolean = false;
  
  crearFactura( send_dian: boolean  = false){

    if (send_dian) {
      if (!this.empresa.electronica) {
        Swal.fire('Atención', 'Debes de configurar la facturación electronica para crear facturas electronicas', 'info');
        return;
      }
    }

    this.facturando = true;

    if(!this.credit){

      this.invoiceForm.value.apartado = false;

      if (!this.empresa.paiddirect) {
        if (this.totalPagos < this.total) {
          this.facturando = false;
          Swal.fire('Importante', 'El monto del pago es diferente al del total, porfavor verificar', 'warning');
          return;      
        }        
      }

      if (this.totalPagos === 0) {
        this.agregarPagos('efectivo', this.total, '', false)
      }else{
        if (this.totalPagos < this.total) {
          this.facturando = false;
          Swal.fire('Importante', 'El monto del pago es diferente al del total, porfavor verificar', 'warning');
          return;      
        } 
      }

    }else{
      if (this.invoiceForm.value.fechaCredito === '') {
        this.facturando = false;
        Swal.fire('Importante', 'Debe de asignar una fecha de caducida a la factura a credito', 'warning');
        return;      
      }

      if (!this.clienteTemp.cedula) {
        this.facturando = false;
        Swal.fire('Importante', 'Debe de asignar un cliente a la factura a credito', 'warning');
        return;      
      }
    }

    if (this.empresa?.datafon) {
      
      if (Number(this.datafIn.nativeElement.value) > 0) {
        this.datafon = Number(this.datafIn.nativeElement.value);
      }else{
        this.datafon = 0
      }
    }

    this.invoiceForm.setValue({
      amount: this.total,
      cost: this.totalCosto,
      client: this.clienteTemp.cid || '',
      type: this.invoiceForm.value.type,
      payments: this.payments, 
      products: this.carrito,
      credito: this.credit,
      mesa: this.mesaID,
      mesero: this.meserID,
      fechaCredito: this.invoiceForm.value.fechaCredito,
      turno: this.user.turno,
      iva: this.iva,
      base: this.base,
      pago: this.pago,
      vueltos: this.vueltos,
      nota: this.invoiceForm.value.nota,
      apartado: this.invoiceForm.value.apartado,
      marca: this.invoiceForm.value.marca,
      descuento: this.formDescuento.value.descuento,
      porcentaje: this.formDescuento.value.porcentaje,
      fecha: this.invoiceForm.value.fecha || new Date(),
      tip: 0,
      datafon: this.datafon,
      electronica: send_dian,
      placa: this.invoiceForm.value.placa,
      images: this.mesa.images || [],
    });

    if(!this.clienteTemp){
      this.invoiceForm.value.client = '';      
    }

    if (this.empresa.tip) {
      this.invoiceForm.value.tip = Number(this.tipIn.nativeElement.value);
      this.invoiceForm.value.amount = this.total - this.totalTip;
    }

    try {
      
      this.invoiceService.createInvoice(this.invoiceForm.value, this.user.turno)
          .subscribe( (resp:{ok: boolean, invoice: LoadInvoice } ) => {
                       
            this.factura = resp.invoice;
            this.factura.totalItems = this.totalItems;

            this.invoiceForm.reset({
              type: 'efectivo',
              descuento: false,
              marca: this.factura.marca,
              porcentaje: 0
            });

            this.total = 0;
            this.iva = 0;
            this.base = 0;
            this.totalItems = 0;
            
            this.carrito = [];
            this.payments = [];
            this.clienteTemp = {
              name : '',
              cedula: '',
              phone: '',
              email: '',
              address: '',
              city: '',
              cid: '',
              
            };

            // BORRAMOS LA FECHA CREDITO
            this.credit = false;

            // LIMPIAMOS LA MESA
            this.mesa.carrito = [];
            this.mesa.images = [];

            // LIMPIAMOS LAS NOTAS DE LAS COMANDA
            this.mesa.nota = [];
            this.mesa.notaf = '';
            this.mesa.placa = '';
            this.mesa.descuento = false;
            this.mesa.porcentaje = 0;

            this.mesa.deleteClient = true;
            
            this.mesasServices.updateMesa(this.mesa, this.mesaID)
              .subscribe( (resp:{ok: boolean, mesa: Mesa}) => {
                
                // TODO DESARROLLO NORMAL
                if (this.empresa.electronica && send_dian) {
                  
                  this.electronicaService.postFacturaDataico(this.factura, this.dataico, this.impuestos)
                      .subscribe( (resp: {status, invoice, ok}) => {

                        this.facturando = false;
                        
                        // TODO: OLD 
                        if (resp.status === 500) {
                          Swal.fire('Atención', 'No se pudo enviar la factura electronica a la DIAN, ve a la factura y vuelve a enviarla, si el problema persiste, ponte en contacto', 'warning');
                          window.open(`./dashboard/factura/${ this.factura.iid }`, '_blank');
                        }

                        if (resp.invoice.cufe) {
                          this.factura.cufe = resp.invoice.cufe;
                          this.factura.number = resp.invoice.number;
                        }

                        if (this.empresa.printpos) {              
                          // window.open(`./dashboard/ventas/print/${ resp.invoice.iid }`, '_blank');
                          // IMPRIMIR FACTURA
                          setTimeout( () => {
                            this.printDiv2();                      
                          },2000);
                          
                        }else{
                          window.open(`./dashboard/factura/${ this.factura.iid }`, '_blank');
                          setTimeout( () => {             
                            window.location.reload();
                          },1000);
                        }
                        
                      }, (err) => {
                        console.log(err);
                        
                      });
                      // TODO: OLD
                  
                  
                }else{

                  if (this.empresa.printpos) {              
                    // window.open(`./dashboard/ventas/print/${ resp.invoice.iid }`, '_blank');
                    // IMPRIMIR FACTURA
                    setTimeout( () => {
                      this.printDiv2();                      
                    },2000);
                    
                  }else{
                    window.open(`./dashboard/factura/${ this.factura.iid }`, '_blank');
                    setTimeout( () => {             
                      window.location.reload();
                    },1000);
                  }
                }

                // TODO: PRUEBAS
                // if (this.empresa.printpos) {              
                //   // window.open(`./dashboard/ventas/print/${ resp.invoice.iid }`, '_blank');
                //   // IMPRIMIR FACTURA
                //   setTimeout( () => {
                //     this.printDiv2();                      
                //   },2000);
                  
                // }else{
                //   window.open(`./dashboard/factura/${ this.factura.iid }`, '_blank');
                //   setTimeout( () => {             
                //     window.location.reload();
                //   },1000);
                // }

              
            }, (err) => { 
              this.facturando = false;
              Swal.fire('Error', err.error.msg, 'error'); 
            });
            



          }, (err) => {
            this.facturando = false;
            Swal.fire('Error', err.error.msg, 'error');
          });
      
    } catch (err) {      
      this.facturando = false;   
      Swal.fire('Error', err.error.msg, 'error');
      
    }    

  }

  /** ============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * CAJA - CAJA - CAJA - CAJA  
  ==================================================================== */
  public turno: LoadTurno;
  cargarTurno(){

    if (this.user.cerrada === false) {
      
      this.turnoService.getTurnoId(this.user.turno)
          .subscribe( (turno) => {
            this.turno = turno;
            this.movimientos = turno.movements;                    
          });
    }

  }
  
  /** ================================================================
   *   REGISTRAR ENTRADAS Y SALIDAS
  ==================================================================== */
  @ViewChild('montoE') montoE: ElementRef;
  @ViewChild('descriptionE') descriptionE: ElementRef;
  @ViewChild('montoS') montoS: ElementRef;
  @ViewChild('descriptionS') descriptionS: ElementRef;

  public movimientos: _movements[] = [];
  public sendMovimiento: boolean = false;
  public movimiento: Entradas;

  entradaSalida(type: string, descripcion: string, monto: number){

    // COMPROBAR QUE NO VENGA VACIO
    if ( descripcion === '' || monto === 0) {
      Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
      return;      
    }
    // COMPROBAR QUE NO VENGA VACIO

    this.sendMovimiento = true;
    
    // COMPROBAR EL TIPO SALIDA
    if (type === 'salida') {
      monto = monto * -1;            
    }
    // COMPROBAR EL TIPO SALIDA
    
    // AGREGAR EL MOVIMIENTO AL OBJECTO
    this.movimientos.push({
      type,
      descripcion,
      monto
    });

    this.turno.movements = this.movimientos;
    // AGREGAR EL MOVIMIENTO AL OBJECTO
    
    // GUARDAR ACTUALIZAR EN LA BASE DE DATOS
    this.turnoService.updateTurno(this.turno, this.turno.tid)
    .subscribe((resp) => {
      
      this.montoE.nativeElement.value = '';
      this.descriptionE.nativeElement.value = '';
      
      this.montoS.nativeElement.value = '';
      this.descriptionS.nativeElement.value = '';

      let movi = {
        monto,
        descripcion,
        type,
        turno: this.turno.tid,
      }

      this.sendMovimiento = false;

      this.entradasService.createMovimiento(movi)
          .subscribe( ({movimiento}) => {

            Swal.fire('Estupendo!', 'Se ha guardado exitosament', 'success');
            
            if (type === 'salida') {
              this.movimiento = movimiento;
              
              setTimeout( () => {
                this.printerService.printDiv('printDiv4');                   
              },2000);
            }

          }, (err) => {
            console.log(err);
            Swal.fire('Error', err.error.msg, 'error');            
          });

    }, (err) =>{
      Swal.fire('Error', err.error.msg, 'error');
      this.sendMovimiento = false;
    }); 
    // GUARDAR ACTUALIZAR EN LA BASE DE DATOS

  }

  /** ============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   *  DEPARTAMENTOS - DEPARTAMENTOS - DEPARTAMENTOS - DEPARTAMENTOS
  ==================================================================== */
  public departmentos: Department[] = [];
  public departmentosTemp: Department[] = [];
  public totalDepartamentos: number = 0;

  cargarDepartamentos(){
    this.cargando = true;
    this.sinResultados = true;

    this.departmentService.loadDepartment()
        .subscribe(({ total, departments }) =>{   

          this.totalDepartamentos = total;
          this.departmentos = departments;
          this.departmentosTemp = departments;
          this.resultado = 0;
          this.cargando = false;

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); }
        )
  }
  /** ================================================================
   *   ELIMINAR COMENTARIO DE LA COMANDA
  ==================================================================== */
  eliminarComentario( i: number ){

    this.mesa.nota.splice(i,1);
    let data =  { nota: this.mesa.nota, add: false }
        
    this.mesasServices.updateNotaMesa(data, this.mesaID, false)
    .subscribe( resp => {
      
      this.nota.nativeElement.value = '';
      this.nota.nativeElement.focus = true;
      
    });    

  }

  /** ================================================================
   *   FILTRAR COMANDA
  ==================================================================== */
  public timeComanda: Date;
  timeCommand(){
    this.timeComanda = new Date();
  }

  /** ================================================================
   *   FILTRAR COMANDA
  ==================================================================== */
  filtrarComanda(tipo:string){

    if (tipo === 'Todos') {
      this.comanda = this.comandaTemp;
      return;
    }

    const filtro = this.comandaTemp.filter( command => {
      return command.tipo === tipo;
    });

    this.comanda = filtro;

    return;
    

  }

  /** ================================================================
   *   ELIMINAR PRODUCTO DE LA COMANDA
  ==================================================================== */
  eliminarProductoComanda(i: number){
        
    this.comanda.splice(i, 1);

  }

  /** ================================================================
   *   IMPRIMIR
  ==================================================================== */
  @ViewChild('nota') nota: ElementRef;
  printDiv() {
    this.printerService.printDiv('printDiv');
    
    this.nota.nativeElement.value = '';
  }

  /** ================================================================
   *   IMPRIMIR
  ==================================================================== */
  // @ViewChild ('printComandaC') printComandaC: ElementRef;
  public printComandaC: boolean = false;
  printDiv2() {
    this.printerService.printDiv('printDiv2');

    
    if (this.printComandaC) {
      setTimeout( () => {
        this.printerService.printDiv('printComanda');
      }, 2500)
    }

    setTimeout( () => {
      // Swal.fire('Success', `Se ha creado la factura <strong> #${ this.factura.invoice }</strong>, exitosamente`, 'success');
      Swal.fire({
        icon: 'success',
        title: `Factura #${ this.factura.invoice }`,
        text: `Se ha creado exitosamente`,
        showDenyButton: false,
        showCancelButton: false,
        confirmButtonText: `ok`,
      }).then((result) => {
        window.location.reload();
      })       
    },1500);
  }

  /** ================================================================
   *   ABRIR CAJA
  ==================================================================== */
  abrirCaja(){
    
    if (!this.user.cerrada) {

      Swal.fire('Ya existe una caja abierta', 'Debes de cerrar caja para poder abrir he iniciar un turno nuevo', 'warning');
      return;

    }
    
    Swal.fire({
      title: 'Monto Inicial de caja',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      showLoaderOnConfirm: true,
      preConfirm: (resp) => {
        
        return resp;
      }
      }).then((result) => {

        if (result.value > 0) {

          const initial:number = result.value;

          const open = {
            initial
          };

          this.turnoService.createCaja(open)
              .subscribe( (resp:{ ok:boolean, turno:any}) => {

                this.userService.user.turno = resp.turno.tid;
                this.userService.user.cerrada = false;
                this.facturar = true;
                
              });  
              
          return;
        }else{
          return;
        }                
        
    });


  }

  /** ================================================================
   *   COMANDA
  ==================================================================== */
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  public notas: _notas[] = [];
  enviarNota(msg: string){
    
    let nota = {};    
    
    nota = {
      nota: msg,
      date: new Date()
    }
    
    this.notas.push({
      nota: msg,
      date: new Date()
    });
    
    this.mesasServices.updateNotaMesa(nota, this.mesaID)
    .subscribe( resp => {
      
      this.nota.nativeElement.value = '';
      this.nota.nativeElement.focus = true;
      
    });
        
  }
  /** ================================================================
   *   SCROLL AL FONDO
  ==================================================================== */
  @ViewChildren('messages') messages: QueryList<any>;
  @ViewChild('content') content: ElementRef;

  ngAfterViewInit() {
    this.scrollToBottom();
    this.messages.changes.subscribe(this.scrollToBottom);
  }

  scrollToBottom = () => {
    try {
      this.content.nativeElement.scrollTop = this.content.nativeElement.scrollHeight;
    } catch (err) {}
  }

  /** ============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * PEDIDOS - PEDIDOS - PEDIDOS - PEDIDOS  
  ==================================================================== */
  public comentarios!: string;
  public uuid!: any;
  public ped: boolean;
  public btnPedido: boolean = true;

  public pedidoForm = this.fb.group({
    name: ['', [Validators.required]],
    telefono: ['', [Validators.required]],
    email: ['', [Validators.required]],
    cedula: ['', [Validators.required]],
    direccion: ['', [Validators.required]],
    ciudad: ['', [Validators.required]],
    departamento: ['', [Validators.required]],
    comentario: [''],
    products: ['', [Validators.required]],
    amount: ['', [Validators.required, Validators.min(1)]],
    paystatus: [''],
    referencia: [''],
    transaccion: [''],
    status: [true]
  });

  crearPedido(){

    this.btnPedido = false;

    this.uuid = new UUID();

    if( this.mesa.carrito.length === 0 ){
      Swal.fire('Atencion', 'No has agregado ningun producto', 'info');
      this.btnPedido = true;
      return;
    }

    this.pedidoForm.reset({
      name: this.clienteTemp?.name || '',
      telefono: this.clienteTemp?.phone || '',
      email: this.clienteTemp?.email || '',
      cedula: this.clienteTemp?.cedula || '',
      direccion: this.clienteTemp?.address || '',
      ciudad: this.clienteTemp?.city || '',
      departamento: this.clienteTemp?.department || '',
      comentario: '',
      products: this.mesa.carrito,
      amount: this.total,
    });

    this.ped = true;
    this.uuid = new UUID();
    this.pedidoForm.value.paystatus = 'PENDENT';
    this.pedidoForm.value.referencia = this.uuid.getDashFreeUUID();
    this.pedidoForm.value.transaccion = this.uuid.getDashFreeUUID();
    this.pedidoForm.value.status = true;
    this.pedidoForm.value.comentario = this.comentarios;
    
    this.pedidoService.createPedidos(this.pedidoForm.value, this.clienteTemp.cid, this.mesaID)
        .subscribe( resp => {   
          
          this.invoiceForm.reset({
            type: 'efectivo'
          });

          this.total = 0;
          this.iva = 0;
          this.base = 0;
          this.totalPagos = 0;
          this.carrito = [];
          this.payments = [];
          this.clienteTemp = {
            name : '',
            cedula: '',
            phone: '',
            email: '',
            address: '',
            city: '',
            cid: ''
          };

          // BORRAMOS LA FECHA CREDITO
          this.credit = false;

          // LIMPIAMOS LA MESA
          this.mesa.carrito = [];

          // LIMPIAMOS LAS NOTAS DE LAS COMANDA
          this.mesa.nota = [];

          // LIMPIAMOS LAS COMANDAS
          this.mesa.comanda = [];
          
          this.mesasServices.updateMesa(this.mesa, this.mesaID)
          .subscribe( (resp:{ok: boolean, mesa: Mesa}) => {
            
            this.btnPedido = true;
            this.pedidoForm.reset();

            Swal.fire('Exito!', 'el pedido se ha creado correctamente', 'success');

          });          

        });
  }

  /** ============================================================================================
   * PREFACTURA - PREFACTURA - PREFACTURA - PREFACTURA  
  ==================================================================== */
  prefactura(){

    this.printerService.printDiv('copiaPre');

  }

  /** ============================================================================================
   * CAMBIAR CANTIDADES
  ==================================================================== */
  public inputChange: boolean = false;

  changeCant(cant: any, item: any){    
    
    this.inputChange = true;
    
    this.mesa.carrito.map((it) => {

      if(it._id === item._id){
        
        if (cant < 0) {
          Swal.fire('Error', 'debes de agregar una catidad validad', 'error');      
        } else if(cant > item.product.inventario){
          it.qty = item.product.inventario;
          Swal.fire('Error', `No puedes agregar mas de ${item.product.inventario}`, 'warning');
        }else{
          it.qty = cant;          
        }

        if (item.product.mayoreo > 0 && it.qty >= item.product.mayoreo) {
          it.price = item.product.wholesale;
          it.mayor = true;
        }else{
          it.price = item.product.price;
          it.mayor = false;
        }
        
        if (item.product.tax) {
          it.iva = ((item.price * item.product.impuesto[0].valor)/100) * item.qty ;
        }        

      }

      return it;
    });
    
    this.mesasServices.updateMesa(this.mesa, this.mesaID)
        .subscribe( (resp:{ok: boolean, mesa: any}) => { 
          
          this.carrito = resp.mesa.carrito;
          this.mesa.carrito = resp.mesa.carrito;

          this.productUp = [];
          this.comanda = [];
          this.comandas = [];

          this.comandas = resp.mesa.comanda;

          for (let i = 0; i < resp.mesa.carrito.length; i++) {

            this.productUp.push({
              product: resp.mesa.carrito[i].product._id,
              qty: resp.mesa.carrito[i].qty,
              price: resp.mesa.carrito[i].price,
              iva: resp.mesa.carrito[i].iva,
              mayor: resp.mesa.carrito[i].mayor
            });
            
            this.comanda.push({
              product:  resp.mesa.carrito[i].product.name,
              comanda:  resp.mesa.carrito[i].product.comanda,
              tipo:     resp.mesa.carrito[i].product.tipo,
              qty:      resp.mesa.carrito[i].qty,
              price:    resp.mesa.carrito[i].price
            });
                        
          }
          this.comandaTemp = this.comanda;          

          this.inputChange = false;

          this.sumarTotales();          

          // this.cargarMesa(this.mesaID);

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

  }

  /** ============================================================================================
   * GUARDAR NOTA
  ============================================================================================== */
  saveNota(notaf: string){

    this.mesasServices.updateMesa({notaf}, this.mesaID)
        .subscribe( resp => {
          this.mesa.notaf = notaf;
        }, (err) => {
          console.log(err);          
        })
  }

  /** ============================================================================================
   * GUARDAR PLACA
  ============================================================================================== */
  savePlaca(placa: string){

    this.mesasServices.updateMesa({placa}, this.mesaID)
        .subscribe( resp => {
          this.mesa.placa = placa;
        }, (err) => {
          console.log(err);          
        })
  }

  /** ================================================================
   *  CONFIG SWIPER
  ==================================================================== */  
  public config = {
    slidesPerView:1,
    spaceBetween:10,
    centeredSlides: true,
    navigation: true,
    pagination: { clickable: true, dynamicBullets: true },
    breakpoints:{
      '450': {
        slidesPerView: 2,
        spaceBetween: 20,
        centeredSlides: false,
      },
      '640': {
        slidesPerView: 3,
        spaceBetween: 30,
        centeredSlides: false,
      },
      '768': {
        slidesPerView: 3,
        spaceBetween: 40,
        centeredSlides: false,
      },
    }

  }

  /** ======================================================================
   * SEARCH VEHICULO
  ====================================================================== */
  public vehiculos: Vehiculo[] = [];
  public resultados: number = 0;
  buscarV( termino:string ){

    let query = `desde=${0}&hasta=${20}`;

    if (termino.length === 0) {
      this.vehiculos = [];
      this.resultados = 0;
      return;
    }
    
    this.searchService.search('vehiculo', termino, false, query)
        .subscribe( ({resultados}) => {

          this.vehiculos = resultados;          

        });   

  }

  /** ======================================================================
   * SELECT VEHICULO
  ====================================================================== */
  @ViewChild ('searchV') searchV: ElementRef;
  @ViewChild ('placaIn') placaIn: ElementRef;
  selectV(vehiculo: Vehiculo){

    vehiculo.client.cid = vehiculo.client._id;
    this.placaIn.nativeElement.value = vehiculo.placa
    
    this.seleccionarCliente(vehiculo.client);
    this.savePlaca(vehiculo.placa);
    this.vehiculos = [];
    this.searchV.nativeElement.value = '';

  }

  /** ================================================================
   *   ACTUALIZAR IMAGEN
  ==================================================================== */
  public imgTempP: any = null;
  public subirImagen!: any;
  cambiarImage(file: any): any{  
    
    this.subirImagen = file.target.files[0];
    
    if (!this.subirImagen) { return this.imgTempP = null }    
    
    const reader = new FileReader();
    const url64 = reader.readAsDataURL(file.target.files[0]);
        
    reader.onloadend = () => {
      this.imgTempP = reader.result;      
    }

  }

  /** ================================================================
   *  SUBIR IMAGEN
  ==================================================================== */
  @ViewChild('fileImg') fileImg!: ElementRef;
  public imgPerfil: string = 'no-image';
  subirImg(){
    
    this.fileUploadService.updateImage( this.subirImagen, 'taller', this.mesaID)
    .then( 
      (resp:{ date: Date, nombreArchivo: string, ok: boolean }) => {
        
        this.cargarMesa(this.mesaID);
      }
    );
    
    this.fileImg.nativeElement.value = '';
    this.imgTempP = null;
    
  }

  /** ================================================================
   *  ELIMINAR IMAGEN
  ==================================================================== */
  deleImg(img: string){

    this.fileUploadService.deleteFile(img, this.mesaID, 'mesa')
        .subscribe( (resp: {mesa: Mesa}) => {
          
          this.mesa.images = resp.mesa.images;
          Swal.fire('Estupendo', 'Se ha eliminado la imagen exitosamente!', 'success');
          
        }, (err)  => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        });

  }
  
  // FIN DE LA CLASE 
}
