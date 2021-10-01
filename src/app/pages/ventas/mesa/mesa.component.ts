import { Component, OnInit, ViewChild, ElementRef, TemplateRef  } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import Swal from 'sweetalert2';
import * as SerialPort from 'serialport';

// PRINTER
import { NgxPrinterService } from 'projects/ngx-printer/src/lib/ngx-printer.service';
import { PrintItem } from 'projects/ngx-printer/src/lib/print-item';
import { ngxPrintMarkerPosition } from 'projects/ngx-printer/src/public_api';

// MODELS
import { Product } from '../../../models/product.model';
import { Client } from '../../../models/client.model';
import { Invoice } from '../../../models/invoice.model';
import { Department } from '../../../models/department.model';
import { Mesa } from '../../../models/mesas.model';
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

// INTERFACES
import { Carrito, _payments, LoadCarrito } from '../../../interfaces/carrito.interface';
import { LoadInvoice } from '../../../interfaces/invoice.interface';
import { LoadTurno, _movements } from '../../../interfaces/load-turno.interface';
import { LoadMesaId } from '../../../interfaces/load-mesas.interface';

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
                private basculaService: BasculaService) {

                  // CARGAR INFORMACION DEL USUARIO
                  this.user = this.userService.user;                  

                  this.printWindowSubscription = this.printerService.$printWindowOpen.subscribe(
                    val => {}
                  );
              
                  this.$printItems = this.printerService.$printItems;

                }

  ngOnInit(): void {
      
      // TURNOS
      this.cargarTurno();

      // DATOS
      this.cargarDatos();

      // PRODUCTOS
      this.cargarProductos();

      // DEPARTAMENTOS
      this.cargarDepartamentos();

      // CARGAR MESA
      this.activatedRoute.params.subscribe( ({id}) => {

        this.mesaID = id;
        
        this.cargarMesa(id);
        
      });

    if (!this.user.cerrada) {
      this.facturar = true;
    }else{
      this.facturar = false;
    }

    // SERIAL PORT
    
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
          
         if (!mesa.disponible && mesa.cliente) {
           this.clienteTemp = mesa.cliente;
           this.clienteTemp.cid = mesa.cliente._id;
         }         
                
          this.meserID = mesa.mesero._id;

          for (let i = 0; i < mesa.carrito.length; i++) {

            this.productUp.push({
              product: mesa.carrito[i].product._id,
              qty: mesa.carrito[i].qty,
              price: mesa.carrito[i].price
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
          

          this.sumarTotales();

        });


  }

  /** ================================================================
   *  BUSCAR CODIGO
  ==================================================================== */
  @ViewChild('searchCode') searchCode: ElementRef;
  // public peso: number;
  buscarCodigo(code: string){

    this.productService.cargarProductoCodigo(code)
    .subscribe( (product) => {
                  
            if (product === null || product.status === false) {
              Swal.fire('Error', 'No existe el producto, verifica el codigo de barras o si el producto a sido desactivado!', 'error');
              this.searchCode.nativeElement.value = '';
              this.searchCode.nativeElement.onFocus = true;
              return;              
            }
            
            if (product.type !== 'Paquete') {
              if (product.out) {
                Swal.fire('Error', 'El producto esta agotado. Porfavor, verifica el stock de este prodcuto.', 'error');             
                return;
              }else{
                if (product.low) {
                  Swal.fire({
                    icon: 'warning',
                    title: 'Pocas unidades de este productos, verificar inventario',
                    showConfirmButton: true,
                    timer: 1500
                  });
                }
              }             
            }
            
            // PEDIMOS LA CANTIDAD
            if (product.type === 'Granel') {

              if (this.empresa.bascula) {

                this.basculaService.loadPeso()
                    .subscribe( resp => {

                      const qty:number = resp;
    
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
                    
                    const qty:number = result.value;
    
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

              // const qty:number = 1;

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
                }else{

                  const qty:number = 1;

                  // GUARDAR AL CARRITO
                  this.carritoTemp(product, qty, product.price);
                  // GUARDAR AL CARRIT

                  return;
                }                
                
              });


            }            
            
            // LIMPIAR INPUT
            this.searchCode.nativeElement.value = '';
            this.searchCode.nativeElement.onFocus = true;
            
          }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });
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
        }else{

          const qty:number = 1;

          // GUARDAR AL CARRITO
          this.carritoTemp(product, qty, product.price);
          // GUARDAR AL CARRIT

          return;
        }                
        
      });

    } 

  }


  /** ================================================================
   *  ALMACENAR PRODUCTO TEMPORAL EN EL CARRITO
  ==================================================================== */
  public total: number = 0;
  carritoTemp( product: any, qty: number, precio: number ){ 

    const validarItem = this.productUp.findIndex( (resp) =>{      
      if (resp.product === product.pid ) {
        return true;
      }else {
        return false;
      }
    });
    
    let ivaP:number = 0;

    if (product.tax) {

      ivaP = Number(product.price * qty) * Number(product.impuesto[0].valor / 100);      
      
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
      

    }else{
      
      let qtyTemp = this.productUp[validarItem].qty;
      qtyTemp += Number(qty);

      let ivaTemp = this.productUp[validarItem].iva;
      ivaTemp += Number(ivaP);

      this.productUp[validarItem].iva = ivaTemp;
      this.productUp[validarItem].qty = qtyTemp;
      this.comanda[validarItem].qty = qtyTemp;
      
    }
    
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
   *  ELIMINAR PRODUCTO DEL CARRITO CARRITO
  ==================================================================== */
  eliminarProductoCarrito( i: number ){

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
    this.iva = 0;
    this.totalCosto = 0;
    if (this.carrito.length > 0) {
      
      for (let i = 0; i < this.carrito.length; i++) {
        
        this.total += (this.carrito[i].price * this.carrito[i].qty);
        this.totalCosto += (this.carrito[i].product.cost * this.carrito[i].qty);
        this.iva += this.carrito[i].iva;

      }

      this.base = this.total;

      if (this.empresa.responsable) {
        this.total = this.total + this.iva;
      }

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
  public endPoint: string = `?desde=${this.desde}`;
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
    
    if (termino.length === 0) {
      this.listaProductos = this.listaProductosTemp;
      return;
    }else{
      
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
    vueltos: [0]
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
      this.pago += Number(amount);
    }

    let totales = Number( this.total - this.totalPagos );

    // COMPROBAR SI EL MONTO ES MAYOR AL RESTANTE
    if ( Number(this.montoAdd.nativeElement.value) > totales) {
      amount= ( this.total - this.totalPagos );
      this.vueltos = (this.montoAdd.nativeElement.value - totales);
    }else{
      amount = this.montoAdd.nativeElement.value;
      this.vueltos = (this.montoAdd.nativeElement.value - totales);
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

    console.log(item);

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

    console.log('Pago con: ', this.pago);
    

  }
  
  /** ================================================================
   *   CREAR FACTURA
  ==================================================================== */
  public factura: LoadInvoice;
  @ViewChild('fechCredito') fechCredito: ElementRef;  
  crearFactura(){

    if(!this.credit){

      if (this.totalPagos < this.total) {
        Swal.fire('Importante', 'El monto del pago es diferente al del total, porfavor verificar', 'warning');
        return;      
      }

    }else{
      if (this.invoiceForm.value.fechaCredito === '') {
        Swal.fire('Importante', 'Debe de asignar una fecha de caducida a la factura a credito', 'warning');
        return;      
      }   
    }



    try {

      this.invoiceForm.setValue({
        amount: this.total,
        cost: this.totalCosto,
        client: this.clienteTemp.cid,
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
        vueltos: this.vueltos
      });      
      
      this.invoiceService.createInvoice(this.invoiceForm.value, this.user.turno)
          .subscribe( (resp:{ok: boolean, invoice: LoadInvoice } ) => {
            
            this.factura = resp.invoice;

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
            
            this.mesasServices.updateMesa(this.mesa, this.mesaID)
            .subscribe( (resp:{ok: boolean, mesa: Mesa}) => {      

            }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });
            
            // this.cargarMesa(this.mesaID);
            // LIMPIAMOS LA MESA

            // Swal.fire('Success', `Se ha creado la factura <strong> #${ resp.invoice.invoice }</strong>, exitosamente`, 'success');
              
            // TIPO DE IMPRESION POS O CARTA
            if (this.empresa.printpos) {              
              // window.open(`./dashboard/ventas/print/${ resp.invoice.iid }`, '_blank');
              // IMPRIMIR FACTURA
              setTimeout( () => {
                this.printDiv2();                      
              },1000);
              
            }else{
              window.open(`./dashboard/factura/${ resp.invoice.iid }`, '_blank');
            }


          }, (err) => {
            Swal.fire('Error', err.error.msg, 'error');
          });
      
    } catch (err) {         
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
  
  // FIN DE LA CLASE
}
