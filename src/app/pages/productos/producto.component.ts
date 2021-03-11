import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

// SERVICES
import { ProductService } from '../../services/product.service';
import { SearchService } from '../../services/search.service';
import { DepartmentService } from '../../services/department.service';
import { FileUploadService } from '../../services/file-upload.service';

// MODELS
import { Product } from '../../models/product.model';
import { Kit } from 'src/app/models/kits.model';
import { Department } from '../../models/department.model';


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
    type: ['' || 0],
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
    visibility: [true]
  });

  constructor(  private productService: ProductService,
                private fb:FormBuilder,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private searchService: SearchService,
                private departmentService: DepartmentService,
                private fileUploadService: FileUploadService ) { }

  ngOnInit(): void {

    this.cargarDepartamentos();
    
    this.activatedRoute.params.subscribe( ({id}) => {

      this.productoID = id; 
      
      this.cargarProducto(id);
      
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

  cargarProducto(id: string){
    
    this.productService.cargarProductoId(id)
        .subscribe( product => {          

          this.producto = product;
          this.productoImg = product.img;          
          
          const { code, name, type, cost, gain, expiration, visibility, price, returned, sold,  wholesale, department:{ _id } , pid } = product;
          
          const stock = product.stock || 0;
          const min = product.min || 0;
          const max = product.max || 0;

          this.costoN = cost || 0;
          this.gananciaN = gain || 20;
          this.precioN = price || 0;
          
          this.upProductForm.value.price = this.precioN;

          this.kits = product.kit;

          let expiracion;

          if (expiration !==  null || expiration ) {
            
            expiracion = expiration.toString().slice(0,10);          
          }
          
          this.upProductForm.reset({code, name, type, cost, price, visibility, wholesale, gain, department: _id, min, max, expiration: expiracion, pid});

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

    this.upProductForm.value.price = this.precioN;
    

  }

  /** ================================================================
   *   ACTUALIZAR PRODUCTO
  ==================================================================== */
  actualizarProducto(){
    
    if (this.upProductForm.value.type !== 'Paquete' ) {
      this.upProductForm.value.kit = [];      
    }else{
      this.upProductForm.value.kit = this.kits;
    }
    
    this.upProductForm.value.price = this.precioN;

    console.log('cantidad ', this.upProductForm.value.stock);
    
    
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
    .then( img => this.producto.img = img);
    
    this.fileImg.nativeElement.value = '';
    this.imgProducto = 'no-image';
    this.imgTemp = null;
    
  }

  /** ================================================================
   *  AJUSTAR INVENTARIO
  ==================================================================== */
  @ViewChild('cantidadE') cantidadE: ElementRef;
  @ViewChild('cantidadS') cantidadS: ElementRef;
  ajustar(tipo: string, cantidad: number){

    if (cantidad <= 0 || !cantidad) {
      return Swal.fire('Atención', 'Debes de asignar una canitidad', 'info');
    }

    if (tipo === 'entrada') { 
      
      if (this.producto.bought) {        
        this.producto.bought += Number(cantidad);        
      }else {
        this.producto.bought = Number(cantidad);
      }

    }else {

      if (this.producto.damaged) {        
        this.producto.damaged += Number(cantidad);        
      }else{        
        this.producto.damaged = Number(cantidad);
      }

    }

    this.productService.actualizarProducto(this.producto, this.producto.pid)
        .subscribe( resp => {

          Swal.fire('Estupendo', `Se ha actualizado el inventario del producto, ${this.producto.name} exitosamente!`, 'success')

          this.cargarProducto(this.producto.pid);

          this.cantidadE.nativeElement.value = '';
          this.cantidadS.nativeElement.value = '';

        }, (err) =>{ Swal.fire('Error', err.error.msg, 'error'); });
  }


  // FIN DE LA CLASE
}
      