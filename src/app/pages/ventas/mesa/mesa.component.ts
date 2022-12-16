import { Component, OnInit, ViewChild, ElementRef, TemplateRef, HostListener, ViewChildren, QueryList  } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import Swal from 'sweetalert2';
import * as SerialPort from 'serialport';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {UUID} from 'uuid-generator-ts';

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

// INTERFACES
import { Carrito, _payments, LoadCarrito, _notas } from '../../../interfaces/carrito.interface';
import { LoadInvoice } from '../../../interfaces/invoice.interface';
import { LoadTurno, _movements } from '../../../interfaces/load-turno.interface';
import { LoadMesaId } from '../../../interfaces/load-mesas.interface';
import { Impuestos } from 'src/app/models/impuestos.model';
import { Banco } from 'src/app/models/bancos.model';
import { BancosService } from '../../../services/bancos.service';

@Component({
  selector: 'app-mesa',
  templateUrl: './mesa.component.html',
  styles: [
  ]
})
export class MesaComponent implements OnInit {

  public carrito: LoadCarrito[] = [];
  public comanda: LoadCarrito[] = [];
  public comandaTemp: LoadCarrito[] = [];
  public mesa: Mesa;
  public empresa: Datos;


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
                private bancosService: BancosService) {

                  // CARGAR INFORMACION DEL USUARIO
                  this.user = this.userService.user;                  

                  this.printWindowSubscription = this.printerService.$printWindowOpen.subscribe(
                    val => {}
                  );
              
                  this.$printItems = this.printerService.$printItems;

                }

  ngOnInit(): void {

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
  cargarDatos(){

    this.empresaService.getDatos()
        .subscribe( datos => {
          this.empresa = datos;   
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
              iva: mesa.carrito[i].iva
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
          if (this.mesa.nota.length > 0) {
            this.notas = this.mesa.nota;         
          }else{
            this.notas = [];
          }
          

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

    if (this.mayor) {  
      this.priceProductSelected = this.productSelected.wholesale;
    }else{
      this.priceProductSelected = this.productSelected.price;
    }

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

  // ACTIVAR MAYOREO
  public mayor: boolean = false;
  mayoreoApp(){

    if (!this.mayor) {    
      this.mayor = true;  
      this.priceProductSelected = this.productSelected.wholesale;
    }else{
      this.mayor = false;
      this.priceProductSelected = this.productSelected.price;
    }

  }

  /** ================================================================
   *  MODAL PRODUCTO CODE
  ==================================================================== */
  @ViewChild('modalProductSeleted', { static: true }) modalProductSeleted: TemplateRef<any>;
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

        this.basculaService.loadPeso()
            .subscribe( resp => {
              this.qtySelect = resp;
            });
      }
    }

    this.modal.open(this.modalProductSeleted);

    // LIMPIAR INPUT
    this.searchCode.nativeElement.value = '';
    this.searchCode.nativeElement.onFocus = true;

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
      if (code.slice(0,4) === this.empresa.basculacode) {
        codigo = code.slice(4,7);       
        
        if(this.empresa.basculatype === 'peso'){

          let m = Number(code.slice(7,9));
          let d = Number(code.slice(9,12));

          cantidad = parseFloat(m+'.'+d);


        }else if(this.empresa.basculatype === 'precio'){
          precio = Number(code.slice(7,12));
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

            // SI ES GRANEL
            if (product.type === 'Granel') {
              // SI ESTA USANDO BASCULA

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
                
                this.basculaService.loadPeso()
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

        this.basculaService.loadPeso()
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
   *  ALMACENAR PRODUCTO TEMPORAL EN EL CARRITO
  ==================================================================== */
  public total: number = 0;
  public comandas: _comanda[] = [];
  public ingredientes: _ingredientes[] = [];
  public inventarioNew: number = 0;
  public inventarioNewB: boolean = false;

  carritoTemp( product: any, qty: number, precio: number, nota: string = '' ){

    this.inventarioNew = 0;
    this.inventarioNewB = false;   
    
    const validarItem = this.productUp.findIndex( (resp) =>{      
      if (resp.product === product.pid ) {
        return true;
      }else {
        return false;
      }
    });
    
    let ivaP:number = 0;

    if (product.tax) {

      ivaP = Number(product.price * qty) * Number(product.taxid?.valor / 100);      
      
    }

    if ( validarItem === -1 ) {


      // AGREGAMOS EL PRODUCTO
      this.productUp.push({
        product: product.pid,
        qty,
        price: precio,
        iva: ivaP
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
              iva: resp.mesa.carrito[i].iva
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
              iva: resp.mesa.carrito[i].iva
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
                  iva: resp.mesa.carrito[i].iva
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
   *  SUMAR TOTALES
  ==================================================================== */
  public totalCosto:number = 0;
  public iva:number = 0;
  public base:number = 0;
  sumarTotales(){
    
    this.total = 0;
    this.base = 0;
    this.iva = 0;
    this.totalCosto = 0;

    this.impuestos.map( (impuesto) => {
      impuesto.total = 0;
    });

    if (this.carrito.length > 0) {
      
      for (let i = 0; i < this.carrito.length; i++) {

        this.total += (this.carrito[i].price * this.carrito[i].qty);
        this.base += (this.carrito[i].price * this.carrito[i].qty);
        this.totalCosto += (this.carrito[i].product.cost * this.carrito[i].qty);

        if (this.empresa.decimal! === false) {          
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

    }else {
      this.productUp = [];
      this.comanda = [];
      this.comandas = [];

      this.impuestos.map( (impuesto) => {
        impuesto.total = 0;
      });

    }

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
  public newClientForm = this.fb.group({
    name: ['' , [Validators.required, Validators.minLength(3)]],
    cedula: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', [Validators.email, Validators.minLength(7)]],
    phone: ['', [Validators.minLength(3)]],
    city: ['', [Validators.minLength(3)]],
    address: ['', [Validators.minLength(3)]]
  });
  public formSubmitted: boolean = false;

  crearCliente(){

    this.formSubmitted = true;

    if (this.newClientForm.invalid) {
      return;
    }

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

        

        this.basculaService.loadPeso()
            .subscribe( resp => {

              qty = resp;
              this.cantidad.nativeElement.value = qty;
              
              console.log(resp);
              
              return;                    

            });        
      }
      
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
    descuento: false
  })

  /** ================================================================
   *  AGREGAR METODO DE PAGO
  ==================================================================== */
  @ViewChild('descripcionAdd') descripcionAdd: ElementRef;
  @ViewChild('montoAdd') montoAdd: ElementRef;
  public vueltos: number = 0;
  public pago: number = 0;

  focusMonto(){
    this.montoAdd.nativeElement.value = this.total;  
    this.montoAdd.nativeElement.focus();
  }

  agregarPagos(type: string, amount:number, description:string = '', credito: boolean){
    
    // Setear a number
    // amount = Number(amount);    

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
  public factura: LoadInvoice;
  public facturando: boolean = false;
  
  @ViewChild('fechCredito') fechCredito: ElementRef;  
  crearFactura(){

    this.facturando = true;

    if(!this.credit){

      this.invoiceForm.value.apartado = false;
      if (this.totalPagos < this.total) {
        this.facturando = false;
        Swal.fire('Importante', 'El monto del pago es diferente al del total, porfavor verificar', 'warning');
        return;      
      }

    }else{
      if (this.invoiceForm.value.fechaCredito === '') {
        this.facturando = false;
        Swal.fire('Importante', 'Debe de asignar una fecha de caducida a la factura a credito', 'warning');
        return;      
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
      descuento: this.formDescuento.value.descuento,
      porcentaje: this.formDescuento.value.porcentaje
    });

    if(!this.clienteTemp){
      this.invoiceForm.value.client = '';
    }

    try {

      
      
      this.invoiceService.createInvoice(this.invoiceForm.value, this.user.turno)
          .subscribe( (resp:{ok: boolean, invoice: LoadInvoice } ) => {
            
            this.factura = resp.invoice;

            this.invoiceForm.reset({
              type: 'efectivo',
              descuento: false,
              porcentaje: 0
            });

            this.total = 0;
            this.iva = 0;
            this.base = 0;
            
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

            // LIMPIAMOS LAS NOTAS DE LAS COMANDA
            this.mesa.nota = [];
            this.mesa.descuento = false;
            this.mesa.porcentaje = 0;

            this.mesa.deleteClient = true;
            
            this.mesasServices.updateMesa(this.mesa, this.mesaID)
            .subscribe( (resp:{ok: boolean, mesa: Mesa}) => {      

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

  entradaSalida(type: string, descripcion: string, monto: number){

    // COMPROBAR QUE NO VENGA VACIO
    if ( descripcion === '' || monto === 0) {
      Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
      return;      
    }
    // COMPROBAR QUE NO VENGA VACIO
    
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

      this.entradasService.createMovimiento(movi)
          .subscribe( ({movimiento}) => {

            Swal.fire('Estupendo!', 'Se ha guardado exitosament', 'success')            

          }, (err) => {
            console.log(err);
            Swal.fire('Error', err.error.msg, 'error');            
          });

    }, (err) =>{
      Swal.fire('Error', err.error.msg, 'error');
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
  printDiv2() {
    this.printerService.printDiv('printDiv2');
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
        
        if (cant <= 0) {
          it.qty = 1;          
        } else if(cant > item.product.inventario){
          it.qty = item.product.inventario;
          Swal.fire('Error', `No puedes agregar mas de ${item.product.inventario}`, 'warning');
        }else{
          it.qty = cant;          
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
              iva: resp.mesa.carrito[i].iva
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
  
  // FIN DE LA CLASE 
}
