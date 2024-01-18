import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

// MODELS
import { Product } from '../../models/product.model';
import { Department } from 'src/app/models/department.model';
import { User } from '../../models/user.model';
import { Impuestos } from 'src/app/models/impuestos.model';

// SERVICES
import { ProductService } from '../../services/product.service';
import { SearchService } from '../../services/search.service';
import { DepartmentService } from '../../services/department.service';
import { UserService } from '../../services/user.service';
import { ImpuestosService } from 'src/app/services/impuestos.service';

// EXCEL
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styles: [
  ]
})

export class ProductosComponent implements OnInit {

  public totalProductos: number = 0;
  public inventario: number = 0;
  public productos: Product[] = [];
  public productosTemp: Product[] = [];

  public listaDepartamentos: Department[] = [];
  
  public resultado: number = 0;
  public desde: number = 0;
  public cargando: boolean = true;
  public sinResultados: boolean = true;

  public btnAtras: string = '';
  public btnAdelante: string = '';

  public user: User;

  constructor(  private productService: ProductService,
                private searchService: SearchService,
                private fb:FormBuilder,
                private departmentService: DepartmentService,
                private userService: UserService,
                private impuestosService: ImpuestosService) { }

  ngOnInit(): void {

    this.user = this.userService.user;
    
    this.cargarProductos('none', false);

    this.cargarCosto();

    this.cargarDepartamentos();

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

          

        });

  }

  /** ================================================================
   *   IMPORTAR EXCEL
  ==================================================================== */
  arrayBuffer:any;
  file:File;
  incomingfile(event: any){
    this.file= event.target.files[0]; 
  }

  Upload() {

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
          console.log(XLSX.utils.sheet_to_json(worksheet,{raw:true}));
      }
      
      fileReader.readAsArrayBuffer(this.file);
  };

  /** ================================================================
   *   EXPORTAR EXCEL
  ==================================================================== */
  exportar(){

    this.productService.productExcel()
        .subscribe( ({products}) => {

          /* generate a worksheet */
          var ws = XLSX.utils.json_to_sheet(products);
      
          /* add to workbook */
          var wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Productos");
      
          /* title */
          let title = 'inventario.xls';
      
          /* write workbook and force a download */
          XLSX.writeFile(wb, title);

        });


  }

  /** ================================================================
   *   CARGAR DEPARTAMENTOS
  ==================================================================== */
  cargarDepartamentos(){

    this.departmentService.loadDepartment()
        .subscribe( ({departments, total}) => {
          
          this.listaDepartamentos = departments;      
          
        });

  }

  /** ================================================================
   *   CARGAR PRODUCTOS
  ==================================================================== */
  public endPoint: string = `?desde=${this.desde}&status=false`;
  cargarProductos(tipo: string = '', valor: boolean = false, departamento: string = 'none'){

    this.costoB = 0;
    this.precioB = 0;
    this.inventarioB = 0;
    
    if (tipo === 'agotados' && valor === true) {
      this.endPoint = `?desde=${this.desde}&tipo=${tipo}&valor=${valor}&departamento=${departamento}&status=false`;      
    }else if(tipo === 'vencidos' && valor === true){
      this.endPoint = `?desde=${this.desde}&tipo=${tipo}&valor=${valor}&departamento=${departamento}&status=false`; 
    }else{
      this.endPoint = `?desde=${this.desde}&tipo=none&departamento=${departamento}&status=false`;      
    }
    
    this.cargando = true;
    this.sinResultados = true;
    this.productService.cargarProductos(this.endPoint)
        .subscribe(({total, products}) => {
            
          // COMPROBAR SI EXISTEN RESULTADOS
          if (products.length === 0) {
            this.sinResultados = false;
            this.cargando = false;
            this.productos = [];
            this.resultado = 0;
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
            return;                
          }
          // COMPROBAR SI EXISTEN RESULTADOS
        
          this.totalProductos = total;
          this.productos = products;
          this.productosTemp = products;
          this.resultado = 0;
          this.cargando = false;
          
          if (departamento === 'none') {      
            this.costoB = 0;
            this.precioB = 0;
            this.inventarioB = 0;
          }else{

            for (let i = 0; i < this.productos.length; i++) {

              if (this.productos[i].type !== 'Paquete') {
  
                  const stockF = ((this.productos[i].stock + this.productos[i].returned + this.productos[i].bought) - (this.productos[i].sold + this.productos[i].damaged));
  
                  this.inventarioB += stockF;
                  this.costoB += (stockF * this.productos[i].cost);
                  this.precioB += (stockF * this.productos[i].price);
              }
  
            }            

          }

          // BOTONOS DE ADELANTE Y ATRAS          
          if (this.desde === 0 && this.totalProductos > 10) {
            this.btnAtras = 'disabled';
            this.btnAdelante = '';
          }else if(this.desde === 0 && this.totalProductos < 11){
            this.btnAtras = 'disabled';
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
   *   CARGAR COST PRODUCTOS
  ==================================================================== */
  public totalCost: number;
  public totalPrice: number;
  cargarCosto(){

    this.productService.cargarProductoCost()
    .subscribe(({costo, precio, inventario}) => {

      this.totalCost = costo;
      this.totalPrice = precio;
      this.inventario = inventario

    });

  }

  /** ================================================================
   *   CAMBIAR PAGINA
  ==================================================================== */
  cambiarPagina (valor: number){
    this.desde += valor;

    if (this.desde < 0) {
      this.desde = 0;
    }else if( this.desde > this.totalProductos ){
      this.desde -= valor;
    }

    this.cargarProductos('none', false);

  }
    
  /** ================================================================
   *   BUSCAR
  ==================================================================== */
  public costoB: number = 0;
  public precioB: number = 0;
  public inventarioB: number = 0;

  buscar( termino:string ){

    this.costoB = 0;
    this.precioB = 0;
    this.inventarioB = 0;

    this.sinResultados = true;

    if (termino.length === 0) {

      this.productos = this.productosTemp;
      this.resultado = 0;
      this.costoB = 0;
      this.precioB = 0;
      this.inventarioB = 0;
      return;

    }else{

      this.sinResultados = true;

      this.searchService.search('products', termino)
            .subscribe(({total, resultados}) => {
              
              // COMPROBAR SI EXISTEN RESULTADOS
              if (resultados.length === 0) {
                this.sinResultados = false;
                this.productos = [];
                this.resultado = 0;
                return;                
              }
              // COMPROBAR SI EXISTEN RESULTADOS

              this.totalProductos = total;
              this.productos = resultados; 
              this.resultado = resultados.length;
            });
    }    

  }

  /** ================================================================
   *   BUSCAR POR PRODUCTOS AGOTADOS O VENCIDOS
  ==================================================================== */
  buscarLowOut(){
    this.sinResultados = true;

  }

  /** ================================================================
   *   BORRAR Producto
  ==================================================================== */
  borrarProducto(_id: string){

    Swal.fire({
      title: 'Atencion',
      text: "Estas seguro de eliminar este producto?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar',
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
          

          this.cargarProductos('none', false);
        }, (err) =>{
          Swal.fire('Error', err.error.msg, 'error');
        });

      }

    });

    
  }

  /** ================================================================
   *   REPARAR INVENTARIO
  ==================================================================== */
  repararInventario(){

    Swal.fire({
      title: 'Atencion',
      text: "Estas seguro de que necesitas reparar el inventario?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, reparar ahora',
      cancelButtonText: 'Cancelar'
    }).then((result) => {  
      
      if (result.isConfirmed) {

        this.productService.repararInventario()
            .subscribe( ( resp:{products:number}) => {
              
              Swal.fire('Estupendo', `Se han corregido ${resp.products} productos`, 'success');
              this.cargarProductos('none', false);
              
            },(err) => { Swal.fire('Error', err.error.msg,'error') });

      }

    });

  }

  /** ================================================================
   *   AGREGAR INVENTARIO
  ==================================================================== */
  public btnAddInv: boolean = false;
  public product: Product;

  @ViewChild('cantidad') cantidadE: ElementRef;

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
      
    }

    this.productService.ajustarInventario(this.product.pid, this.ajustarInventario)
        .subscribe( (resp: {ok: boolean, product: Product}) => {

          this.cantidadE.nativeElement.value = '';

          this.product = resp.product;


          Swal.fire('Estupendo', 'Se ha actualizado el inventario exitosamente!', 'success');                   

        }, (err) =>{ Swal.fire('Error', err.error.msg, 'error'); });
  }

  /** ================================================================
   *   AGREGAR IVA A TODOS LOS PRODUCTOS
  ==================================================================== */
  public ivaFormSubmitted: boolean = false;
  public ivaForm = this.fb.group({
    taxid: ['', [Validators.required]],
    tax: ['', [Validators.required]]
  });

  ivaAll(){

    this.ivaFormSubmitted = true;

    if (this.ivaForm.invalid) {
      return;
    }

    if (this.ivaForm.value.taxid === '') {
      Swal.fire('Error', 'Debe de seleccionar el tipo de impuesto', 'info');
      return;
    }

    this.productService.ivaAllProducts(this.ivaForm.value)
        .subscribe( (resp: { ok: boolean, total: any }) => {

          this.ivaFormSubmitted = true;
          Swal.fire('Estupendo', `hemos actualizado ${resp.total} productos`, 'success');
                    
        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');
        });

  }

  /** ================================================================
   *   ACTUALIZAR CON EXCEL TODOS
  ==================================================================== */
   public arrayExceltUpdate:any;
   public excelUpdate:File;
   public totalItems: number = 0; 
   public products: any[] = [];
 
   selectFileExcel(event: any){
     this.excelUpdate= event.target.files[0]; 
   }

   UploadExcel() {

    if (!this.excelUpdate) {
      Swal.fire('Atención', 'No has seleccionado ningun archivo de excel', 'info');
      return;
    }

    let fileReader = new FileReader();
      fileReader.onload = (e) => {

          this.arrayExceltUpdate = fileReader.result;
          var data = new Uint8Array(this.arrayExceltUpdate);
          var arr = new Array();

          for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
          
          var bstr = arr.join("");
          var workbook = XLSX.read(bstr, {type:"binary"});
          var first_sheet_name = workbook.SheetNames[0];
          var worksheet = workbook.Sheets[first_sheet_name];
          
          this.products = XLSX.utils.sheet_to_json(worksheet,{raw:true});

          this.products.forEach( product => {

            this.totalItems ++;

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

            // GUARDAR PRODUCTOS

            this.productService.actualizarProductoExcel(product)
                .subscribe( resp => {

                  if( this.products.length === this.totalItems ){

                    Swal.fire('Estupendo', `Se han creado un total de ${this.totalItems} articulos nuevos`, 'success');

                  }

                  
                  

                },(err) => { 
                  console.log(err);                  
                  Swal.fire('Error', err.error.msg, 'error'); 
                });


            // FIN FOREACH
          });
        
          window.location.reload();

      }
      
      fileReader.readAsArrayBuffer(this.excelUpdate);
  };

  /** ================================================================
   *   DESCARGAR PLANTILLA DE EXCEL
  ==================================================================== */
  plantilla(){

    let products = [{
      code: '123456',
      cost: 1000,
      price: 1500,
      wholesale: 1200,
      agregar: 10
    }];

    /* generate a worksheet */
    var ws = XLSX.utils.json_to_sheet(products);

    /* add to workbook */
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "actualizar");

    /* title */
    let title = 'actualizarProductos.xls';

    /* write workbook and force a download */
    XLSX.writeFile(wb, title);


  }

  // FIN DE LA CLASE
}
