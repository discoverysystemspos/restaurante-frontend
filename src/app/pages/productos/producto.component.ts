import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

// SERVICES
import { ProductService } from '../../services/product.service';
import { SearchService } from '../../services/search.service';
import { DepartmentService } from '../../services/department.service';
import { FileUploadService } from '../../services/file-upload.service';
import { ImpuestosService } from 'src/app/services/impuestos.service';
import { LogProductsService } from '../../services/log-products.service';

// MODELS
import { Product } from '../../models/product.model';
import { Kit } from 'src/app/models/kits.model';
import { Department } from '../../models/department.model';
import { Impuesto } from '../../models/impuesto.model';
import { Impuestos } from '../../models/impuestos.model';


@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html'
})


export class ProductoComponent implements OnInit {

  public producto: Product;

  public stockP: number;

  public searchProduct: Product[] = [];
  public kits: Kit[] = [];

  // FORMULARIO
  public formSubmitted = false;
  public upProductForm = this.fb.group({

    code: [''],
    name: [''],
    type: [''],
    cost: [''],
    gain: [''],
    price: [''],
    kit: [''],
    wholesale: [''],
    department: [''],
    min: ['' || 0],
    max: ['' || 0],
    expiration: [''],
    pid: [''],
    visibility: [true],
    comanda: [''],
    tipo: [''],
    description: [''],
    tax: [],
    taxid: [],
    impuestoT:[],
    valor: []
  });

  constructor(  private productService: ProductService,
                private fb:FormBuilder,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private searchService: SearchService,
                private departmentService: DepartmentService,
                private fileUploadService: FileUploadService,
                private impuestosService: ImpuestosService,
                private logProdcutsService: LogProductsService ) { }

  ngOnInit(): void {

    this.cargarDepartamentos();
    
    this.activatedRoute.params.subscribe( ({id}) => {

      this.productoID = id; 
      
      this.cargarImpuestos();

      this.cargarProducto(id);
      
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
   *   CARGAR PRODUCTO
  ==================================================================== */
  public costoN:number;
  public gananciaN:number;
  public precioN:number;
  public productoID: string;
  public productoImg: string;

  public priceIva: number = 0;

  public vendidos: number = 0;
  public comprados: number = 0;
  public devueltos: number = 0;

  cargarProducto(id: string){
    
    this.productService.cargarProductoId(id)
        .subscribe( product => {   

          this.producto = product;
          this.productoImg = product.img;
          
          this.vendidos = this.producto.sold;
          this.comprados = this.producto.bought;
          this.devueltos = this.producto.returned;
          
          const { code, name, department, type, cost, gain, expiration, visibility, price, returned, sold,  wholesale, pid, comanda, tipo, description, tax, impuesto, taxid } = product;
          
          // let department = '00';
          // if (this.producto.department) {
          //     department = product.department._id;
          // }

          const stock = product.stock || 0;
          const min = product.min || 0;
          const max = product.max || 0;

          this.costoN = cost || 0;
          this.gananciaN = gain || 20;
          this.precioN = price || 0;
          
          this.upProductForm.value.price = this.precioN;

          this.kits = product.kit;

          let expiracion;
          
          let impuestoT = '';
          let valorT = 0;
          
          if (expiration !==  null || expiration ) {            
            expiracion = expiration.toString().slice(0,10);          
          }

          if (tax) {
            impuestoT = taxid?.name;
            this.priceIva = Math.round(price * ((taxid?.valor/100)+1));
          }
          
          if (taxid) {
            this.upProductForm.reset({code, name, type, cost, price, visibility, wholesale, gain, department, min, max, expiration: expiracion, pid, comanda, tipo, description, tax, impuestoT, valor: valorT, taxid: taxid._id });
          }else{
            this.upProductForm.reset({code, name, type, cost, price, visibility, wholesale, gain, department, min, max, expiration: expiracion, pid, comanda, tipo, description, tax, impuestoT, valor: valorT, taxid: '' });
          }

          // CARGAR LOGS
          this.loadLogs();

        });
  }

  /** ================================================================
   *   ACTUALIZAR PRODUCTO
  ==================================================================== */

  /** ================================================================
   *   BUSCAR PRODUCTOS PARA EL PAQUETE O KIT
  ==================================================================== */
  public sinResultados = false;
  public cargando = false;
  public searchInput:string;

  buscar(termino:string){
    
    this.cargando = true;

    if (termino.length === 0) {
      this.sinResultados = false;
      this.searchProduct = [];
      return;
    }else{

      this.searchService.search('products', termino)
            .subscribe(({total, resultados}) => {
              this.cargando = false;
              // COMPROBAR SI EXISTEN RESULTADOS
              if (resultados.length === 0) {
                this.searchProduct = [];
                this.sinResultados = true;
                return;                
              }
              // COMPROBAR SI EXISTEN RESULTADOS
              
              this.searchProduct = resultados;

            }, (err) => {
                this.searchProduct = [];
                this.sinResultados = false;
                return;  
            });

    }

  }

  /** ================================================================
   *   SELECCIONAR PRODUCTO PARA EL PAQUETE O KIT
  ==================================================================== */
  @ViewChild('search') search: ElementRef;
  @ViewChild('qty') qty: ElementRef;

  public seleKit: Product;
  public inProducto:string = '';
  public btnAddKit: string = 'disabled';

  seleccionarProducto( product: Product ){

    this.searchProduct = [];
    this.sinResultados = false;
    this.search.nativeElement.value = '';
    this.seleKit = product;
    this.inProducto = product.name;

    if (this.inProducto !== '') {
      this.btnAddKit = '';
    }

  }

  /** ================================================================
   *   AGREGAR PRODUCTO AL PAQUETE O KIT
  ==================================================================== */
  agregarProductoKit( qty: any ){

    this.btnAddKit = 'disabled';
    this.inProducto = '';
    this.qty.nativeElement.value = '';

    if (qty === 0 || qty === '0' || qty === '' || qty < 0) {
      Swal.fire('Atención', 'No has agregado una cantidad', 'info');
      return;      
    }
    
    this.kits.push({
      qty, 
      product: {
        _id: this.seleKit.pid,
        name: this.seleKit.name
      }
    });
   
    this.upProductForm.value.kit = this.kits;    

  }

  /** ================================================================
   *   ELIMINAR PRODUCTO AL PAQUETE O KIT
  ==================================================================== */
  eliminarProductoKit( item: any ){
    
    const i = this.kits.indexOf(item);

    if ( i !== -1 ) { this.kits.splice(i, 1); }

    this.upProductForm.value.kit = this.kits;

  }

  /** ================================================================
   *   CARGAR DEPARTAMENTOS
  ==================================================================== */
  public departamentos: Department[] = [];

  cargarDepartamentos(){
    
    this.departmentService.loadDepartment()
        .subscribe( ({departments}) => {
            
            this.departamentos = departments;            
            
          }, (err) =>{
            Swal.fire('Error', err.error.msg, 'error');
          }
        );

  }

  /** ================================================================
   *  PORCENTAJE
  ==================================================================== */
  @ViewChild('pIva') pIva: ElementRef;
  @ViewChild('tax') tax: ElementRef;
  porcentaje(nombre:string, numero:any){    
    
    let porcentaje: number;
    
    switch (nombre) {
      case 'costo':
        
        this.costoN = parseFloat(numero);    
        
        porcentaje = (this.costoN * this.gananciaN)/100;
        
        this.precioN = (this.costoN / ( 1 - (this.gananciaN / 100)));     

        break;
      case 'ganancia':
        
        this.gananciaN = parseFloat(numero);
        
        porcentaje = (this.costoN * this.gananciaN)/100;

        this.precioN = (this.costoN / ( 1 - (this.gananciaN / 100)));   
        
        break;
        
      case 'precio':

        this.precioN = parseFloat(numero);
        
        porcentaje = ( this.costoN * 100 )/this.precioN;

        this.gananciaN = (porcentaje - 100) * -1;

        break;
    
      default:

        return;
        
        break;
    }

    this.gananciaN = Math.round(this.gananciaN*100)/100;
    this.upProductForm.value.price = Math.round(this.precioN*100)/100;

    if(this.tax.nativeElement.checked){

      let tax = this.impuestos.find( taxS =>  {

        if (taxS._id === this.selectTax || taxS.taxid === this.selectTax) {
          return taxS;
        }

      });

      this.pIva.nativeElement.value = Math.round( this.upProductForm.value.price * ((tax.valor / 100) +1 ));
    }
        

  }

  /** ================================================================
   *  PRECIO CON IVA
  ==================================================================== */
  public selectTax: string;
  precioIva(){

    let tax = this.impuestos.find( taxS =>  {

      if (taxS._id === this.selectTax || taxS.taxid === this.selectTax) {
        return taxS;
      }

    });

    let precio = 0;

    precio = this.pIva.nativeElement.value / ((tax.valor / 100)+1);

    this.porcentaje('precio', precio.toFixed(2));    

  }

  /** ================================================================
   *   ACTUALIZAR PRODUCTO
  ==================================================================== */
  public impuesto: any[] = [];
  actualizarProducto(){
        
    if (this.upProductForm.value.type !== 'Paquete' ) {
      this.upProductForm.value.kit = [];      
    }else{
      this.upProductForm.value.kit = this.kits;
    }
    
    this.upProductForm.value.price = this.precioN;
    this.upProductForm.value.gain = this.gananciaN;

    let impuestoN = '';
    let valorImp = 0;

    if (this.upProductForm.value.tax === true) {
      impuestoN = this.upProductForm.value.impuestoT;
      valorImp = this.upProductForm.value.valor;     
    }else{
      this.upProductForm.value.impuesto = [];  
      impuestoN = '';
      valorImp = 0;
    }

    this.impuesto.push({
      name: impuestoN,
      valor: valorImp
    });    
    
    this.upProductForm.value.impuesto = this.impuesto; 
    
    this.productService.actualizarProducto(this.upProductForm.value, this.upProductForm.value.pid)
        .subscribe( resp => {
      
            Swal.fire('Estupendo', `Se ha actualizado el producto, ${this.upProductForm.value.name} con exito!`, 'success');
            this.activatedRoute.params.subscribe( ({id}) => {
              
              this.cargarProducto(id);
              
            });

          }, (err) => {
            Swal.fire('Error', err.error.msg, 'error');
          });
          
        }

  /** ================================================================
   *   ACTUALIZAR IMAGEN
  ==================================================================== */
  public imgTemp: any = null;
  public subirImagen: File;
  cambiarImage(file: File){
    this.subirImagen = file;
    
    if (!file) { return this.imgTemp = null }

    const reader = new FileReader();
    const url64 = reader.readAsDataURL( file );

    reader.onloadend = () => {
      this.imgTemp = reader.result;
    }

  }
      
  /** ================================================================
   *  SUBIR IMAGEN fileImg
  ==================================================================== */
  @ViewChild('fileImg') fileImg: ElementRef;
  public imgProducto: string = 'no-image';
  subirImg(){
    
    this.fileUploadService.updateImage( this.subirImagen, 'products', this.productoID)
    .then( img => this.productoImg = img);
    
    this.fileImg.nativeElement.value = '';
    this.imgProducto = 'no-image';
    this.imgTemp = null;
    
  }

  /** ================================================================
   *  AJUSTAR INVENTARIO
  ==================================================================== */
  @ViewChild('cantidadE') cantidadE: ElementRef;
  @ViewChild('cantidadS') cantidadS: ElementRef;
  public ajustarInventario = {
    cantidad: 0,
    bought: 0,
    damaged: 0,
    type: ''
  };

  ajustar(tipo: string, cantidad: number){

    if (cantidad <= 0 || !cantidad) {
      return Swal.fire('Atención', 'Debes de asignar una canitidad', 'info');
    }

    if (tipo === 'entrada') { 
      
      this.ajustarInventario.cantidad = Number(cantidad);
      this.ajustarInventario.bought = Number(cantidad);
      this.ajustarInventario.type = 'Agrego';
      
    }else {
      
      this.ajustarInventario.type = 'Elimino';
      this.ajustarInventario.cantidad = Number(cantidad);
      this.ajustarInventario.damaged = Number(cantidad);
      
    }

    this.productService.ajustarInventario(this.productoID, this.ajustarInventario)
        .subscribe( (resp: {ok: boolean, product: Product}) => {

          this.cantidadE.nativeElement.value = '';
          this.cantidadS.nativeElement.value = '';

          this.producto.inventario = resp.product.inventario;

          Swal.fire('Estupendo', 'Se ha actualizado el inventario exitosamente!', 'success');                   

        }, (err) =>{ Swal.fire('Error', err.error.msg, 'error'); });
  }

  /** ================================================================
   *  CARGAR LOG DE PRODUCTOS
  ==================================================================== */
  public desde: number = 0;
  public limite: number = 0;
  public btnAtras: string = '';
  public btnAdelante: string = '';
  public logs: any[] = [];

  public total: number = 0;
  
  public resultado: number = 0;

  loadLogs(){

    this.logProdcutsService.loadOneProductLogs(new Date, new Date, this.producto.code, 'false', this.desde, this.limite)
        .subscribe( ({ products, total }) => {

          // COMPROBAR SI EXISTEN RESULTADOS
          if (products.length === 0) {
            this.logs = [];
            this.resultado = 0;
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
            return;                
          }
          // COMPROBAR SI EXISTEN RESULTADOS

          this.total = total;
          this.logs = products;
          this.resultado = 0;
          this.cargando = false;

          // BOTONOS DE ADELANTE Y ATRAS          
          if (this.desde === 0 && this.total > this.limite) {
            this.btnAtras = 'disabled';
            this.btnAdelante = '';
          }else if(this.desde === 0 && this.total < (this.limite + 1)){
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
          }else if( this.desde >= this.total){
            this.btnAtras = '';
            this.btnAdelante = 'disabled';
          }else{
            this.btnAtras = '';
            this.btnAdelante = '';
          }   
          // BOTONOS DE ADELANTE Y ATRAS
          
        })

  }

  /** ================================================================
   *   CAMBIAR PAGINA
  ==================================================================== */
  cambiarPagina (direccion:string){

    let valor:number = 10;
    if (direccion === 'next') {
      valor = this.limite;
    }else if(direccion === 'back'){
      valor = this.limite * -1;
    }

    this.desde += valor;

    if (this.desde < 0) {
      this.desde = 0;
    }else if( this.desde > this.total ){
      this.desde -= valor;
    }

    this.loadLogs();

  }

  /** ================================================================
   *   CAMBIAR LIMITE
  ==================================================================== */
  // @ViewChild('limit') limit: ElementRef;
  cambiarLimite(limite:number){
    
    this.limite = limite;
    // this.limit.nativeElement.value = this.limit;
    this.loadLogs();    
    
  }

  /** ================================================================
   *   BUSCAR POR
  ==================================================================== */
  public utilidad: number = 0;
  buscarPor(inicial:Date, final: Date){

    this.sinResultados = true;

    if(inicial === null && final === null){
      Swal.fire('Atención', 'No has seleccionado una fecha valida', 'info');
      return;
    }

    // SET HOURS      
    inicial = new Date(inicial);      
    const initial = new Date(inicial.getTime());

    final = new Date(final);
    const end = new Date(final.getTime());      
    // SET HOURS 

    this.logProdcutsService.loadOneProductLogs(initial, end, this.producto.code, 'true', 0, 1000)
    .subscribe( ({products}) => {
      
          this.vendidos = 0;
          this.comprados = 0;
          this.devueltos = 0;
          this.utilidad = 0;
          // COMPROBAR SI EXISTEN RESULTADOS
          if (products.length === 0) {
            this.sinResultados = false;
            this.logs = [];
            this.resultado = 0;
            return;                
          }
          // COMPROBAR SI EXISTEN RESULTADOS

          for (const product of products) {

            if( product.type === 'Agrego' ){
              this.comprados += product.qty;
            }else if( product.type === 'Salida' ){
              this.vendidos += product.qty;

              product.invoice.products.map( (item) => {

                if (item.product === this.producto.pid) {
                  this.utilidad += (item.price - this.producto.cost) * item.qty;
                }

              })
              

            }else if( product.type === 'Devolución' ){
              this.devueltos += product.qty;              
            }
            
          }

          this.logs = products; 
          this.resultado = products.length;
          
        });

  }

  /** ================================================================
   *   BORRAR Ó ACTIVAR PRODUCTO
  ==================================================================== */
  borrarProducto(_id: string){

    let msg = 'Eliminar';

    if (this.producto.status === false) {
      msg = 'Activar'
    }

    Swal.fire({
      title: 'Atencion',
      text: `Estas seguro de ${msg} este producto?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Si, ${msg}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {  
      
      if (result.isConfirmed) {

        this.productService.deleteProduct(_id)
        .subscribe((resp:{product, ok}) =>{

          if (resp.product.status) {
            Swal.fire('Estupendo', 'Se ha habilitado el Producto exitosamente!', 'success');
          }else{
            Swal.fire('Estupendo', 'Se ha eliminado el Producto exitosamente!', 'success');
          }
          
          this.producto.status = resp.product.status;
          
        }, (err) =>{
          Swal.fire('Error', err.error.msg, 'error');
        });

      }

    });

    
  }

  // FIN DE LA CLASE
}
      