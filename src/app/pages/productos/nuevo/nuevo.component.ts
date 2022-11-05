import { FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

// EXCEL
import * as XLSX from 'xlsx';

// MODELS
import { Kit } from '../../../models/kits.model';
import { Product } from '../../../models/product.model';
import { Impuesto } from '../../../models/impuesto.model';

// SERVICES
import { DepartmentService } from '../../../services/department.service';
import { SearchService } from '../../../services/search.service';
import { ProductService } from '../../../services/product.service';
import { Department } from '../../../models/department.model';
import { ImpuestosService } from '../../../services/impuestos.service';
import { Impuestos } from '../../../models/impuestos.model';


@Component({
  selector: 'app-nuevo',
  templateUrl: './nuevo.component.html',
  styles: [
  ]
})
export class NuevoComponent implements OnInit {
  
  public producto: Product;
  public kits: Kit[] = []; 

  constructor( private fb: FormBuilder,
                private searchService: SearchService,
                private productService: ProductService,
                private departmentService: DepartmentService,
                private router: Router,
                private impuestosService: ImpuestosService ) { }

  ngOnInit(): void {

    // CARGAR IMPUESTOS
    this.cargarImpuestos();
    
    // CARGAR DEPARTAMENTOS
    this.cargarDepartamentos();

  }

  /** ================================================================
   *   CARGAR IMPUESTOS
  ==================================================================== */
  public impuestos: Impuestos[] = [];
  cargarImpuestos(){

    this.impuestosService.loadImpuestos()
        .subscribe( ({ taxes }) =>  {
          this.impuestos = taxes;
        });

  }

  /** ================================================================
   *   IMPORTAR EXCEL
  ==================================================================== */
  arrayBuffer:any;
  file:File;
  public totalItems: number = 0;

  public products: any[] = [];

  incomingfile(event: any){
    this.file= event.target.files[0]; 
  }

  Upload() {

    if (!this.file) {
      Swal.fire('Atención', 'No has seleccionado ningun archivo de excel', 'info');
      return;
    }

    let fileReader = new FileReader();
      fileReader.onload = (e) => {

          this.arrayBuffer = fileReader.result;
          var data = new Uint8Array(this.arrayBuffer);
          var arr = new Array();

          for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
          
          var bstr = arr.join("");
          var workbook = XLSX.read(bstr, {type:"binary"});
          var first_sheet_name = workbook.SheetNames[0];
          var worksheet = workbook.Sheets[first_sheet_name];
          
          this.products = XLSX.utils.sheet_to_json(worksheet,{raw:true});

          this.products.forEach( async product => {

            this.totalItems += 1 ;

            // OBTENER GANANCIA
            let gain = 0;
            let porcent = 0;
            
            porcent = ( product.cost * 100 )/product.price;
            
            gain = (porcent - 100) * -1;
            gain = Math.round(gain*100)/100;
            
            product.gain = gain;
            // OBTENER GANANCIA

            // EXPIRATION
            if (product.expiration) {
              product.expiration = new Date(product.expiration);              
            }else{
              product.expiration = null;
            }

            // IMPUESTO
            product.tax = false;
            product.impuesto = [{
              name: '',
              valor: 0
            }]
            // IMPUESTO

            // GUARDAR PRODUCTOS

            if( this.totalItems === 200 || 
              this.totalItems === 500 || 
              this.totalItems === 800 ||
              this.totalItems === 1000 ||
              this.totalItems === 1500 ||
              this.totalItems === 2000 ||
              this.totalItems === 2500 ||
              this.totalItems === 3000 ||
              this.totalItems === 3500 ||
              this.totalItems === 4000 ||
              this.totalItems === 4500 ||
              this.totalItems === 5000 
            ){
            setTimeout( async() => {

                console.log(`Pausa de 30seg items ${this.totalItems}`);
                Swal.fire('Pausa', `Espera cargando archivos, total cargados ${this.totalItems}`, 'info');

                await this.productService.createProduct(product)
                .subscribe( resp => {

                  if( this.products.length === this.totalItems ){

                    Swal.fire('Estupendo', `Se han creado un total de ${this.totalItems} articulos nuevos`, 'success');
                    // this.router.navigateByUrl('/dashboard/productos');

                  }
                  

                },(err) => { Swal.fire('Error', err.error.msg, 'error'); });
              
              }, 30000);
          }else{

            await this.productService.createProduct(product)
                .subscribe( resp => {

                  if( this.products.length === this.totalItems ){

                    Swal.fire('Estupendo', `Se han creado un total de ${this.totalItems} articulos nuevos`, 'success');
                    // this.router.navigateByUrl('/dashboard/productos');

                  }
                  

                },(err) => { Swal.fire('Error', err.error.msg, 'error'); });

          }

            


            // FIN FOREACH
          });
          

      }
      
      fileReader.readAsArrayBuffer(this.file);
  };

  /** ================================================================
   *   DESCARGAR PLANTILLA DE EXCEL
  ==================================================================== */
  plantilla(){

    let products = [{
      code: '123456',
      name: 'Producto 1',
      type: 'Unidad',
      cost: 1000,
      price: 1500,
      wholesale: 1200,
      stock: 10
    }];

    /* generate a worksheet */
    var ws = XLSX.utils.json_to_sheet(products);

    /* add to workbook */
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productos");

    /* title */
    let title = 'productos.xls';

    /* write workbook and force a download */
    XLSX.writeFile(wb, title);


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
  public impuesto: Impuesto[] = [];
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
    visibility: [true],
    comanda: [false],
    tipo: [''],
    description: [''],
    tax: [false],
    taxid: '',
  });
  
  crearProducto(){

    this.impuesto = [];

    if (this.productoForm.value.type !== 'Paquete' ) {
      this.productoForm.value.kit = [];      
    }else{
      this.productoForm.value.kit = this.kits;
    }

    // CARGAMOS EL PRECIO
    this.productoForm.value.price = this.precioN;
    this.productoForm.value.gain = this.gananciaN;
    
    this.productoForm.value.impuesto = this.impuesto;
    

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
              expiration: '',
              tax: false,
              taxid: '',
              visibility: true,
              comanda: false,
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
        
    if(this.tax.nativeElement.checked){

      let tax = this.impuestos.find( taxS =>  {

        if (taxS._id === this.selectTax || taxS.taxid === this.selectTax) {
          return taxS;
        }

      });
      
      

      this.pIva.nativeElement.value = Math.round( this.productoForm.value.price * ((tax.valor / 100) +1 ));
    }
    
  }

  /** ================================================================
   *  SELECCIONAR IMPUESTO
  ==================================================================== */
  selectImpuesto( impuesto: Impuesto ){}
  
  /** ================================================================
   *  PRECIO CON IVA
   ==================================================================== */
  public selectTax: string;

  @ViewChild('pIva') pIva: ElementRef;
  @ViewChild('tax') tax: ElementRef;
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
