import { FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import Swal from 'sweetalert2';

// MODELS
import { Kit } from '../../../models/kits.model';
import { Product } from '../../../models/product.model';

// SERVICES
import { DepartmentService } from '../../../services/department.service';
import { SearchService } from '../../../services/search.service';
import { ProductService } from '../../../services/product.service';
import { Department } from '../../../models/department.model';


@Component({
  selector: 'app-nuevo',
  templateUrl: './nuevo.component.html',
  styles: [
  ]
})
export class NuevoComponent implements OnInit {
  
  public producto: Product;
  public kits: Kit[] = [];

  // FORMULARIO
  public formSubmitted = false;
  public productoForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(2)]],
    name: ['', [Validators.required, Validators.minLength(3)]],
    type: ['' || '0', [Validators.required, Validators.minLength(3)]],
    cost: ['' || 0, [Validators.required]],
    gain: ['' || 20],
    price: ['' || 0, [Validators.required]],
    kit: [''],
    wholesale: ['' || 0],
    department: ['' || 0],
    stock: ['' || 0],
    min: ['' || 0],
    max: ['' || 0],
    expiration: [''],
    visibility: [true]
  });

  constructor( private fb: FormBuilder,
                private searchService: SearchService,
                private productService: ProductService,
                private departmentService: DepartmentService ) { }

  ngOnInit(): void {
    
    this.cargarDepartamentos();

  }
  
  
  /** ================================================================
   *   BUSCAR PRODUCTOS PARA EL PAQUETE O KIT
  ==================================================================== */
  public sinResultados = false;
  public cargando = false;
  public searchInput:string;
  public searchProduct: Product[] = [];

  buscar(termino: string){

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
                Swal.fire('Error', err.error.msg, 'error');
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
   
    this.productoForm.value.kit = this.kits;  

  }

  /** ================================================================
   *   ELIMINAR PRODUCTO AL PAQUETE O KIT
  ==================================================================== */
  eliminarProductoKit( item: any ){
    
    const i = this.kits.indexOf(item);

    if ( i !== -1 ) { this.kits.splice(i, 1); }

    this.productoForm.value.kit = this.kits;

  }

  /** ================================================================
   *   CREAR PRODUCTO
  ==================================================================== */
  crearProducto(){

    if (this.productoForm.value.type !== 'Paquete' ) {
      this.productoForm.value.kit = [];      
    }else{
      this.productoForm.value.kit = this.kits;
    }

    // CARGAMOS EL PRECIO
    this.productoForm.value.price = this.precioN;
    this.productoForm.value.gain = this.gananciaN;

    this.formSubmitted = true;

    if (this.productoForm.invalid) {
      return;
    }    

    this.productService.createProduct(this.productoForm.value)
          .subscribe( (resp: any) => {

            Swal.fire('Estupendo', 'Se ha guardado el producto exitosamente!', 'success');
            this.formSubmitted = false;

            this.productoForm.reset({
              code: '',
              name: '',
              type: '',
              cost: 0,
              gain: 20,
              price: 0,
              kit: '',
              wholesale: 0,
              department: 0,
              stock: 0,
              min: 0,
              max: 0,
              expiration: ''
            });

          }, (err) => {            
            Swal.fire('Error', err.error.msg, 'error');
          });

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
  public costoN:number = 0;
  public gananciaN:number = 20;
  public precioN:number = 0;
  
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
    this.productoForm.value.price = Math.round(this.precioN*100)/100;

  }

  /** ================================================================
   *  VALIDAR CAMPOS
  ==================================================================== */
  campoValido(campo: string): boolean{

    if ( this.productoForm.get(campo).invalid &&  this.formSubmitted) {  
      return true;      
    } else{            
      return false;
    }
  
  }


  // FIN DE LA CLASE  
}
