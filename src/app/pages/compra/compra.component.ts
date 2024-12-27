import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { _payments } from 'src/app/interfaces/carrito.interface';
import { Banco } from 'src/app/models/bancos.model';
import { Compra } from 'src/app/models/compras.model';
import { User } from 'src/app/models/user.model';
import { BancosService } from 'src/app/services/bancos.service';
import { ComprasService } from 'src/app/services/compras.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-compra',
  templateUrl: './compra.component.html',
  styleUrls: ['./compra.component.css']
})
export class CompraComponent implements OnInit {

  public user: User;

  constructor(  private activatedRoute: ActivatedRoute,
                private usersService: UserService,
                private bancosService: BancosService,
                private comprasService: ComprasService
  ) { 

    activatedRoute.params.subscribe( ({id}) => {
      
      this.cargarFactura(id);
      this.user = usersService.user;
      
    });

  }

  ngOnInit(): void {

    this.loadBancos();
  }

  /** ================================================================
     *   BANCOS
    ==================================================================== */
    public bancos: Banco[] = [];
    loadBancos(){
  
      this.bancosService.loadBancos()
          .subscribe( ({bancos}) => {
            this.bancos = bancos;
          }, (err) => {
            console.log(err);
            Swal.fire('Error', err.error.msg, 'error');          
          })
  
    }

  /** ================================================================
   *   CARGAR FACTURA DE COMPRA
  ==================================================================== */
  public factura: Compra;
  public totalPagos: number = 0;
  cargarFactura(id: string){

    this.comprasService.loadCompraID(id)
        .subscribe( ({compra}) => {
          
          this.factura = compra;
          for (const paid of compra.payments) {
            this.totalPagos += paid.amount;
          }
          

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');
          
        })

  }

  /** ================================================================
     *   AGREGAR PAGO
    ==================================================================== */
    public base: number = 0;
    public total: number = 0;
    public payments: _payments[] = []    
    @ViewChild ('nDescripcion') nDescripcion: ElementRef;  
    @ViewChild ('nMonto') nMonto: ElementRef;
    addPay(type: string, amount: any, description: string){
  
      amount = Number(amount);
  
      if (amount <= 0) {
        Swal.fire('Atención', 'El monto no puede ser menor a cero', 'warning');
        return;
      }
  
      if ((amount + this.totalPagos) > this.factura.amount) {
        Swal.fire('Atención', `El monto supera al total de la factura, la diferencia es $${this.factura.amount - this.totalPagos}`, 'warning');
        return;
      }
  
      this.factura.payments.push({
        type,
        amount,
        description
      });
      
      this.nDescripcion.nativeElement.value = '';    
      this.nMonto.nativeElement.value = '';  
      this.sumarPagos();
    }
  
    /** ================================================================
     *   ELIMINAR PAGO
    ==================================================================== */
    delPaid(i: any){
      this.factura.payments.splice(i, 1);
      this.sumarPagos();
    }
  
    /** ================================================================
     *   SUMAR PAGOS
    ==================================================================== */
    sumarPagos(){
      this.totalPagos = 0;
      for (const paid of this.factura.payments) {
        this.totalPagos += paid.amount;
      }

      if (this.totalPagos >= this.factura.amount) {
        this.factura.credito = false;
      }

      this.comprasService.updateCompra({payments: this.factura.payments, credito: this.factura.credito}, this.factura.comid!)
          .subscribe( ({compra}) => {

            this.factura.payments = compra.payments;
            Swal.fire('Estupendo', 'Se ha agregado la factura exitosamente!', 'success');

          })
  
    }

  /** ================================================================
   *   DEVOLVER FACTURA DE COMPRA
  ==================================================================== */
  devolucion(id: string){

    Swal.fire({
      title: "Estas seguro?",
      text: "De devolver esta factura!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, devolver",
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        
        this.comprasService.returnCompra(id)
            .subscribe( ({msg}) => {

              Swal.fire('Estupendo', 'Se ha devuelto la factura de compra exitosamente', 'success');
              this.factura.status = false;

            }, (err) => {
              console.log(err);
              Swal.fire('Error', err.error.msg, 'error');              
            })

      }
    });

  }

}
