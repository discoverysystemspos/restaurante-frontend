import { Component, OnInit } from '@angular/core';
import { EmpresaService } from '../services/empresa.service';

import {UUID} from 'uuid-generator-ts';

import Swal from 'sweetalert2';
import { Datos } from '../models/empresa.model';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';
import { DepartmentService } from '../services/department.service';
import { Department } from '../models/department.model';
import { FormBuilder, Validators } from '@angular/forms';
import { Carrito, LoadCarrito } from '../interfaces/carrito.interface';
import { PedidosService } from '../services/pedidos.service';

interface _carrito{
  qty: number,
  product: Product
  price: number
}

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {

  constructor(  private empresaService: EmpresaService,
                private departmentService: DepartmentService,
                private fb: FormBuilder,
                private pedidosService: PedidosService,
                private productService: ProductService
  ) { }

  ngOnInit(): void {

    this.cargarDatos();
    this.loadDeparments();
    this.loadProducts();

  }

  /** ================================================================
   *   CARGAR DATOS DE LA EMPRESA
  ==================================================================== */
  public empresa: Datos;
  cargarDatos(){
    this.empresaService.getDatos()
      .subscribe( datos => {
        this.empresa = datos;  
      }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });
  }

  /** ================================================================
   *   CARGAR DEPARTAMENTOS
  ==================================================================== */
  public departamentos: Department[] = [];
  loadDeparments(){

    this.departmentService.loadDepartment()
        .subscribe( ({departments}) => {

          this.departamentos = departments;

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); })

  }

  /** ================================================================
   *   CARGAR PRODUCTOS
  ==================================================================== */
  public products: Product[] = [];
  public total: Number = 0;
  public queryP: any = {
    desde: 0,
    hasta: 50,
    status: true,
    visibility: true,
    $and : [{ inventario: { $gte: 0.0001 } }],
    low: false,
    sort: {}
  }

  loadProducts(){

    this.productService.searchQueryProducts(this.queryP)
        .subscribe( ({products, total}) => {

          this.products = products;
          this.total = total;          

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  /** ================================================================
   *   ADD CARRTIO
   * 
   * 
      first_name
      family_name
      cedula
   * 
      products
      amount
      cliente
      ciudad
      departamento
      direccion
      telefono
      comentario
      local
  ==================================================================== */
  public carrito: _carrito[] = [];
  addItem(product: Product){

    // VALIDAR ITEM
    const validarItem = this.carrito.findIndex( (resp) =>{      
      if (resp.product.pid === product.pid ) {
        return true;
      }else {
        return false;
      }
    });

    // AGREGAR PRODUCTO
    if (validarItem === -1) {
      this.carrito.push({
        product,
        qty: 1,
        price: product.price
      })
    }else{

      this.carrito.map( (item) => {
        if (item.product.code === product.code) {
          item.qty ++;
        }
      })
    }    

    // SUMAR TOTALES
    this.sumarTotales();

    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      icon: "success",
      title: "Producto agregado"
    })    

  }

  /** ================================================================
   *  BORRAR ITEM
  ==================================================================== */
  deleteItem(i: any){

    this.carrito.splice(i,1);
    this.sumarTotales();

  }

  /** ================================================================
   *   SUMAR TOTALES
  ==================================================================== */
  public amount: number = 0;
  sumarTotales(){

    this.amount = 0;
    for (const item of this.carrito) {

      if (item.product.tax) {
        this.amount += (((item.price * item.product.taxid.valor)/100 ) + item.price) * item.qty; 
      }else{
        this.amount += item.qty * item.price;
      }
      
    }
    
  }
  
  /** ================================================================
   *   CREAR PEDIDO
  ==================================================================== */
  public uuid!: any;
  public pedidoSubmitted: boolean = false;
  public pedidoForm = this.fb.group({
    first_name: ['', [Validators.required]],
    family_name: ['', [Validators.required]],
    cedula: ['', [Validators.required]],
    ciudad: ['', [Validators.required]],
    departamento: ['', [Validators.required]],
    direccion: ['', [Validators.required]],
    telefono: ['', [Validators.required]],
    comentario: '',
  })

  crear(){

    this.pedidoSubmitted = true;
    
    if (this.pedidoForm.invalid) {
      return;
    }

    this.uuid = new UUID();

    let products: any[] = [];
    for (const item of this.carrito) {

      products.push({
        product: item.product.pid,
        qty: item.qty,
        price: item.price
      })
      
    }

    let formData: any = {
      products,
      amount: this.amount,
      cliente: {
        first_name: this.pedidoForm.value.first_name,
        family_name: this.pedidoForm.value.family_name,
        cedula: this.pedidoForm.value.cedula
      },
      ciudad: this.pedidoForm.value.ciudad,
      departamento: this.pedidoForm.value.departamento,
      direccion: this.pedidoForm.value.direccion,
      telefono: this.pedidoForm.value.telefono,
      comentario: this.pedidoForm.value.comentario,
      local: true,
      referencia: this.uuid.getDashFreeUUID(),
      transaccion: this.uuid.getDashFreeUUID()
    }

    this.pedidosService.createPedidosLocal(formData)
        .subscribe( ({pedido}) => {
          
          this.pedidoSubmitted = false;
          this.pedidoForm.reset();
          this.carrito = [];
          this.amount = 0;
          Swal.fire('Estupendo', 'Se ha creado el pedido exitosamente!', 'success');

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })


  }


  validate(campo: string) :boolean{
    return (this.pedidoSubmitted && this.pedidoForm.get(campo).invalid)? true: false;
  }

}
