import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { itemCompra } from 'src/app/models/compras.model';
import { Product } from 'src/app/models/product.model';
import { Proveedor } from 'src/app/models/proveedor.model';
import { User } from 'src/app/models/user.model';
import { ComprasService } from 'src/app/services/compras.service';
import { ProveedoresService } from 'src/app/services/proveedores.service';
import { SearchService } from 'src/app/services/search.service';
import { TurnoService } from 'src/app/services/turno.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-compras',
  templateUrl: './compras.component.html',
  styles: [
  ]
})
export class ComprasComponent implements OnInit {

  public user: User;

  constructor(  private searchService: SearchService,
                private comprasService: ComprasService,
                private userService: UserService,
                private turnoService: TurnoService,
  ) { 
    this.user = userService.user;
  }

  ngOnInit(): void {
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
                
              });  
              
          return;
        }else{
          return;
        }                
        
    });


  }

  /** ================================================================
   *   PROVEEDOR
  ==================================================================== */
  public listProveedores: Proveedor[] = [];
  public proveedor: Proveedor;
  searchProveedor(termino: string){

    if (termino.length === 0) {
      return;
    }

    this.searchService.search('proveedores', termino)
        .subscribe( (resp) => {

          this.listProveedores = resp.resultados;

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  /** ================================================================
   *   SELECT PROVEEDOR
  ==================================================================== */
  @ViewChild('searchP') searchP:ElementRef;
  selectProveedor(proveedor: Proveedor){
    this.proveedor = proveedor;

    this.searchP.nativeElement.value = '';
    this.listProveedores = [];

  }

  
  /** ================================================================
   *   BUSCAR PRODUCTO
  ==================================================================== */
  public listProducts: any[] = [];
  searchProduct(termino: string){

    if (termino.length === 0) {
      return;
    }

    this.searchService.search('products', termino)
        .subscribe( (resp) => {

          this.listProducts = resp.resultados;
          

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  /** ================================================================
   *   SELECT PRODUCT
  ==================================================================== */
  @ViewChild('search') search: ElementRef;  
  @ViewChild('psCode') psCode: ElementRef;  
  @ViewChild('psName') psName: ElementRef;
  @ViewChild('psCost') psCost: ElementRef;
  @ViewChild('psPrice') psPrice: ElementRef;
  @ViewChild('psWholesale') psWholesale: ElementRef;
  @ViewChild('psQty') psQty: ElementRef;

  public productS: Product;

  selectProduct(product: Product){

    this.psCode.nativeElement.value = product.code;
    this.psName.nativeElement.value = product.name;
    this.psCost.nativeElement.value = product.cost;
    this.psPrice.nativeElement.value = product.price;
    this.psWholesale.nativeElement.value = product.wholesale;
    this.psQty.nativeElement.focus();
    
    this.listProducts = [];
    this.productS = product;
    
    this.search.nativeElement.value = '';
  }

  /** ================================================================
   *   AGREGAR PRODUCT
  ==================================================================== */
  agregarProducto(qty: any){

    qty = Number(qty);

    if(qty <= 0 ){
      Swal.fire('Atención', 'debes de agregar una cantidad valida', 'warning');
      return;
    }

    if(Number(this.psCost.nativeElement.value) <= 0 ){
      Swal.fire('Atención', 'debes de agregar un precio de costo valido', 'warning');
      return;
    }

    if(Number(this.psCost.nativeElement.value) <= 0 ){
      Swal.fire('Atención', 'debes de agregar un precio de venta valido', 'warning');
      return;
    }

    if (Number(this.psWholesale.nativeElement.value) > 0) {
      this.items.push({
        product: this.productS,
        qty,
        cost: this.psCost.nativeElement.value,
        price: this.psPrice.nativeElement.value,
        wholesale: this.psWholesale.nativeElement.value
      })
      
    }else{
      this.items.push({
        product: this.productS,
        qty,
        cost: this.psCost.nativeElement.value,
        price: this.psPrice.nativeElement.value,
      })
    }

    this.total += Number(this.psCost.nativeElement.value) * qty;

    this.psCode.nativeElement.value = '';
    this.psName.nativeElement.value = '';
    this.psCost.nativeElement.value = '';
    this.psPrice.nativeElement.value = '';
    this.psWholesale.nativeElement.value = '';
    this.psQty.nativeElement.value = '';

    delete this.productS;
    this.search.nativeElement.focus();    

  }



  /** ================================================================
   *   DELETE PRODUCT
  ==================================================================== */
  deleteProduct(i: any){

    this.items.splice(i,1);

    this.total = 0;
    for (const it of this.items) {
      this.total += it.qty * it.cost;
    }

  }

  /** ================================================================
   *   ITEMS
  ==================================================================== */
  public items: itemCompra[] = [];

  /** ================================================================
   *   SUMAR TOTALES
  ==================================================================== */
  public base: number = 0;
  public total: number = 0;
  
  /** ================================================================
   *   CREAR FACTURA DE COMPRA
  ==================================================================== */
  createInvoice(){

    if (!this.proveedor) {
      Swal.fire('Atención', 'Debes de agregar un proveedor', 'warning');
      return;
    }

    let products = [];

    for (const it of this.items) {
      
      if (it.wholesale) {
        
        products.push({
          product: it.product.pid,
          qty: it.qty,
          cost: it.cost,
          price: it.price,
          wholesale: it.wholesale
        })
      }else{
        products.push({
          product: it.product.pid,
          qty: it.qty,
          cost: it.cost,
          price: it.price
        })
      }

    }

    let data: any = {
      proveedor: this.proveedor.provid,
      products,
      amount: this.total,
      base: this.total
    }    

    this.comprasService.createCompra(data)
        .subscribe( ({compra}) => {

          Swal.fire('Estupendo', 'se ha creado la factura de compra exitosamente', 'success');

          delete this.proveedor;
          this.items = [];
          this.total = 0;

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

}
