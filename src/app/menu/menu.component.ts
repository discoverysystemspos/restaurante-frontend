import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import Swal from 'sweetalert2';

// SERVICES
import { MesasService } from '../services/mesas.service';
import { ProductService } from '../services/product.service';
import { SearchService } from '../services/search.service';
import { ClientService } from '../services/client.service';
import { DepartmentService } from '../services/department.service';
import { EmpresaService } from '../services/empresa.service';

// INTERFACES
import { Carrito, LoadCarrito, _notas } from '../interfaces/carrito.interface';

// MODELS
import { Mesa, _comanda, _ingredientes } from '../models/mesas.model';
import { Department } from '../models/department.model';
import { Product } from '../models/product.model';
import { Datos } from '../models/empresa.model';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor(  private mesaService: MesasService,
                private searchService: SearchService,
                private productService: ProductService,
                private departmentService: DepartmentService,
                private clientService: ClientService,
                private empresaService: EmpresaService,
                private activatedRoute: ActivatedRoute,
                private router: Router
                ) { }

  ngOnInit(): void {

    // CARGAR MESA
    this.activatedRoute.params.subscribe( ({id}) => {

      this.mesaID = id;
      
      this.cargarMesa(id);
      
    });

  };

  /** ================================================================
   *  CARGAR DATOS DE LA MESA
  ==================================================================== */
  public mesaID: string;
  public carrito: LoadCarrito[] = [];
  public comanda: LoadCarrito[] = [];
  public comandaTemp: LoadCarrito[] = [];
  public mesa: Mesa;
  public empresa: Datos;
  public total: number = 0;
  public comandas: _comanda[] = [];
  public ingredientes: _ingredientes[] = [];
  public productUp: Carrito[] = [];
  public notas: _notas[] = [];

  cargarMesa(id:string){
    
    this.mesaService.loadMesaId(id)
        .subscribe( (mesa:any) => {

          this.mesaID = mesa.mid;
          this.carrito = mesa.carrito;
          this.mesa = mesa;
          
          if( !mesa.menu ){
            this.mesa.menu = false;
          }
          
          this.comandas = mesa.comanda;

          for (let i = 0; i < mesa.carrito.length; i++) {

            this.productUp.push({
              product: mesa.carrito[i].product._id,
              qty: mesa.carrito[i].qty,
              price: mesa.carrito[i].price,
              mayor: mesa.carrito[i].mayor,
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

          // CARGAR PRODUCTOS
          this.cargarProductos();
          // CARGAR DEPARTAMENTOS
          this.cargarDepartamentos();
          

        }, (err) => { 
          Swal.fire('Error', 'La pagina que estas buscando no existe, ponte en contacto con alguien de la empresa', 'error');
          this.router.navigateByUrl('/404');
          return;
        });

  }

  /** ================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   * =============================================================================================
   *   CARGAR PRODUCTOS
  ==================================================================== */
  // @ViewChild('searchProduct') searchProduct: ElementRef;
  public listaProductos: Product[] = [];
  public listaProductosTemp: Product[] = [];
  public totalProductos: number = 0;

  public resultado: number = 0;
  public desde: number = 0;
  public cargando: boolean = true;
  public sinResultados: boolean = true;
  public btnAtras: string = '';
  public btnAdelante: string = '';

  public endPoint: string = `?desde=${this.desde}&status=true`;
  cargarProductos(){

    this.productService.cargarProductos(this.endPoint)
        .subscribe( ({total, products}) => {

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

        });

  };
  


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
          this.resultado = 0;
          this.cargando = false;

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); }
        )
  }

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
          
            
        });

  }

  /** ============================================================================================
  * =============================================================================================
  * =============================================================================================
  * =============================================================================================
  * =============================================================================================
  * =============================================================================================
  *  CARRITO - CARRITO - CARRITO - CARRITO
  ==================================================================== */
  /** ================================================================
   *  AGREGAR PRODUCTO POR BOTON
  ==================================================================== */
  btnAddProducto( product: any, qty: number, precio: number ){
    
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

  /** ================================================================
   *  AGREGAR PRODUCTO POR BOTON
  ==================================================================== */

  carritoTemp( product: any, qty: number, precio: number, nota: string = '' ){ 

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
        iva: ivaP,
        mayor: false
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

    this.mesaService.updateMesa(this.mesa, this.mesaID)
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

          this.sumarTotales();          

          // this.cargarMesa(this.mesaID);
          

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });
    

  }

  /** ================================================================
   *  ELIMINAR PRODUCTO DEL CARRITO CARRITO
  ==================================================================== */
  eliminarProductoCarrito( i: number, product ){

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

        this.mesa.carrito =  this.productUp;
        this.mesa.comanda = this.comandas;
        
        this.mesaService.updateMesa(this.mesa, this.mesaID)
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

      if (this.empresa?.responsable) {
        this.total = this.total + this.iva;
      }

    }

  }

  /** =============================================================================================
  * PEDIDOS - PEDIDOS - PEDIDOS - PEDIDOS  
  =========================================================================================== */
  confirmarPedido(confirmacion: boolean){
    
    if (confirmacion) {
      confirmacion = false;
      Swal.fire( 'Atención!', 'Ya el pedido esta confirmado', 'info');
      return;
    }else{
      confirmacion = true;
    }
    
    this.mesaService.updatePedidoMesa('sadsafs', confirmacion)
        .subscribe( (resp:{ ok: boolean, mesa: Mesa }) => {

          this.mesa = resp.mesa
          
          Swal.fire('Estupendo', 'Se ha confirmado el pedido exitosamente', 'success');

        }, (err) => { Swal.fire('Ha ocurrido un error, intente nuevamente!', err.error.msg, 'error'); });
    

  }

  
  



  // FIN DE LA CLASE
}
