import { Component, OnInit, ViewChild, ElementRef, TemplateRef  } from '@angular/core';
import { FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import Swal from 'sweetalert2';

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

// SERVICES
import { ProductService } from '../../../services/product.service';
import { ClientService } from '../../../services/client.service';
import { SearchService } from '../../../services/search.service';
import { InvoiceService } from '../../../services/invoice.service';
import { TurnoService } from '../../../services/turno.service';
import { DepartmentService } from '../../../services/department.service';
import { MesasService } from '../../../services/mesas.service';

// INTERFACES
import { Carrito, _payments, LoadCarrito } from '../../../interfaces/carrito.interface';
import { LoadInvoice } from '../../../interfaces/invoice.interface';
import { LoadTurno, _movements } from '../../../interfaces/load-turno.interface';
import { LoadMesaId } from '../../../interfaces/load-mesas.interface';
import { Kit } from '../../../models/kits.model';

@Component({
  selector: 'app-mesa',
  templateUrl: './mesa.component.html',
  styles: [
  ]
})
export class MesaComponent implements OnInit {

  public carrito: LoadCarrito[] = [];
  public comanda: LoadCarrito[] = [];
  public mesa: Mesa;

  public productUp: Carrito[] = [];

  public facturar: boolean;

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
                private printerService: NgxPrinterService,) {

                  this.printWindowSubscription = this.printerService.$printWindowOpen.subscribe(
                    val => {}
                  );
              
                  this.$printItems = this.printerService.$printItems;

                }

  ngOnInit(): void {

    
      
      // TURNOS
      this.cargarTurno();

      // PRODUCTOS
      this.cargarProductos();

      // DEPARTAMENTOS
      this.cargarDepartamentos();

      // CARGAR MESA
      this.activatedRoute.params.subscribe( ({id}) => {

        this.mesaID = id;
        
        this.cargarMesa(id);
        
      });

    if (localStorage.getItem('turno') !== null) {
      this.facturar = true;
    }else{
      this.facturar = false;
    }

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
              qty: mesa.carrito[i].qty,
              price: mesa.carrito[i].price
            });
                        
          }

          this.sumarTotales();

        });


  }

  /** ================================================================
   *  BUSCAR CODIGO
  ==================================================================== */
  @ViewChild('searchCode') searchCode: ElementRef;
  buscarCodigo(code: string){

    this.productService.cargarProductoCodigo(code)
    .subscribe( (product) => {
                  
            if (product === null || product.status === false) {
              Swal.fire('Error', 'No existe el producto, verifica el codigo de barras o si el producto a sido desactivado!', 'error');
              this.searchCode.nativeElement.value = '';
              this.searchCode.nativeElement.onFocus = true;
              return;              
            }            
            
            // PEDIMOS LA CANTIDAD
            if (product.type === 'Granel') {

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
              
            }else{

              const qty:number = 1;

              // GUARDAR AL CARRITO
              this.carritoTemp(product, qty, product.price);
              // GUARDAR AL CARRITO

            }            
            
            // LIMPIAR INPUT
            this.searchCode.nativeElement.value = '';
            this.searchCode.nativeElement.onFocus = true;
            
          }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });
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

    if ( validarItem === -1 ) {

      // AGREGAMOS EL PRODUCTO
      this.productUp.push({
        product: product.pid,
        qty,
        price: precio
      });

      // AGREGAMOS A LA COMANDA
      this.comanda.push({
        product: product.name,
        qty,  
        price: precio
      });
      

    }else{
      
      let qtyTemp = this.productUp[validarItem].qty;
      qtyTemp += qty;

      this.productUp[validarItem].qty = qtyTemp;
      this.comanda[validarItem].qty = qtyTemp;
      
    }
    
    this.mesa.carrito =  this.productUp;

    this.mesasServices.updateMesa(this.mesa, this.mesaID)
        .subscribe( (resp:{ok: boolean, mesa: Mesa}) => {       

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });
    
    this.cargarMesa(this.mesaID);

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
            .subscribe( (resp:{ok: boolean, mesa: Mesa}) => {        

            }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });
        
        this.cargarMesa(this.mesaID);

        Swal.fire('Eliminado!', 'El producto se a eliminado con exito.', 'success');
      }
    })   

  }

  /** ================================================================
   *  SUMAR TOTALES
  ==================================================================== */
  sumarTotales(){
    
    this.total = 0;
    if (this.carrito.length > 0) {
      
      for (let i = 0; i < this.carrito.length; i++) {
        
        this.total += (this.carrito[i].price * this.carrito[i].qty);        
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

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });
    
    this.cargarMesa(this.mesaID);
    
  }

  /** ================================================================
   *  CREAR CLIENTE
  ==================================================================== */
  public newClientForm = this.fb.group({
    name: ['' , [Validators.required, Validators.minLength(3)]],
    cedula: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', [Validators.email, Validators.minLength(7)]],
    phone: ['', [Validators.minLength(3)]]
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
  cargarProductos(){

    
    this.cargando = true;
    this.sinResultados = true;
    this.productService.cargarProductos(this.desde)
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

    this.searchProduct.nativeElement.value = '';

    this.listaProductos = [];
    this.totalProductos = 0;

    this.productTemp = producto;

  }

  /** ================================================================
   *  ENVIAR PRODUCTO AL CARRITO TEMPORAL POR EL BUSCADOR
  ==================================================================== */
  evniarAlCarrito( qty:number, mayoreo: boolean, code: string ){

    if (code === '' || this.productTemp.price === 0) {
      Swal.fire('Atención', 'No has seleccionado ningun producto', 'info');
      return;
    }

    if (Number(qty) === 0 || qty < 0) {
      Swal.fire('Atención', 'No has seleccionado una cantidad validad', 'info');
      return;
    }

    let precio: number;

    if (!mayoreo) {
      precio = this.productTemp.price;
    }else{
      precio = this.productTemp.wholesale;
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
    client: ['', [Validators.required]],
    type: ['efectivo', [Validators.required]],
    payments: [''],
    mesero: [''],
    mesa: [''],
    products: [''],
    credito: [this.credit],
    fechaCredito: ['']
  })

  /** ================================================================
   *  AGREGAR METODO DE PAGO
  ==================================================================== */
  @ViewChild('descripcionAdd') descripcionAdd: ElementRef;
  @ViewChild('montoAdd') montoAdd: ElementRef;
  public vueltos: number = 0;

  focusMonto(){
        
    this.montoAdd.nativeElement.focus();

  }

  agregarPagos(type: string, amount:number, description:string = ''){

    if (type === 'credito') {
      this.credit = true;
      this.descripcionAdd.nativeElement.value = '';
      this.montoAdd.nativeElement.value = '';
      return;
    }

    if (amount === 0 || amount < 1) {
      Swal.fire('Atención', 'No has agregado un monto', 'info');
      return;      
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

    }   

  }
  
  /** ================================================================
   *   CREAR FACTURA
  ==================================================================== */
  @ViewChild('fechCredito') fechCredito: ElementRef;  
  crearFactura(){

    if (this.totalPagos < this.total && !this.credit) {
      Swal.fire('Importante', 'El monto del pago es diferente al del total, porfavor verificar', 'warning');
      return;      
    }

    if (this.invoiceForm.value.fechaCredito === '' && this.credit) {
      Swal.fire('Importante', 'Debe de asignar una fecha de caducida a la factura a credito', 'warning');
      return;      
    }

    try {

      this.invoiceForm.setValue({
        amount: this.total,
        client: this.clienteTemp.cid,
        type: this.invoiceForm.value.type,
        payments: this.payments, 
        products: this.carrito,
        credito: this.credit,
        mesa: this.mesaID,
        mesero: this.meserID,
        fechaCredito: this.invoiceForm.value.fechaCredito
      });      
      
      this.invoiceService.createInvoice(this.invoiceForm.value, this.turno.tid)

          .subscribe( (resp:{ok: boolean, invoice: Invoice } ) => {              

            this.invoiceForm.reset({
              type: 'efectivo'
            });

            this.total = 0;
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
            
            this.cargarMesa(this.mesaID);
            // LIMPIAMOS LA MESA

            // AGREGAMOS LA FACTURA AL TURNO
            this.turno.sales.push({
              facturas: resp.invoice.iid
            });

            this.turnoService.updateTurno(this.turno, this.turno.tid)
            .subscribe((resp) => {}, (err) =>{
              Swal.fire('Error', err.error.msg, 'error');
            }); 
            // AGREGAMOS LA FACTURA AL TURNO
                
            Swal.fire('Success', `Se ha creado la factura <strong> #${ resp.invoice.invoice }</strong>, exitosamente`, 'success');
            
            window.open(`./dashboard/ventas/print/${ resp.invoice.iid }`, '_blank');


          }, (err) => {
            Swal.fire('Error', err.error.msg, 'error');
          });
      
    } catch (err) {   

      console.log(err);
      
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

    this.turnoService.getTurnoId(localStorage.getItem('turno'))
        .subscribe( (turno) => {

          this.turno = turno;
          this.movimientos = turno.movements;
                    
        });

  }
  
  /** ================================================================
   *   REGISTRAR ENTRADAS Y SALIDAS
  ==================================================================== */
  @ViewChild('montoE') montoE: ElementRef;
  @ViewChild('descriptionE') descriptionE: ElementRef;

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

  // FIN DE LA CLASE
}
