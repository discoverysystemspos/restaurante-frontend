import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';


import { PrestamosService } from 'src/app/services/prestamos.service';
import { BancosService } from 'src/app/services/bancos.service';

import { Prestamo } from 'src/app/models/prestamos.model';
import { Banco } from 'src/app/models/bancos.model';

@Component({
  selector: 'app-prestamo',
  templateUrl: './prestamo.component.html',
  styleUrls: ['./prestamo.component.css']
})
export class PrestamoComponent implements OnInit {

  constructor(  private activatedRoute: ActivatedRoute,
                private fb: FormBuilder,
                private prestamosService: PrestamosService,
                private bancosService: BancosService) { 

    activatedRoute.params.subscribe( ({id}) => {

      this.loadPrestamo(id);

    })

  }

  public hoy: number = new Date().getTime();

  ngOnInit(): void {

    // CARGAR BANCOS
    this.cargarBancos();

  }

  /** ================================================================
   *   CARGAR BANCOS
  ==================================================================== */
  public bancos: Banco[] = [];
  cargarBancos(){

    this.bancosService.loadBancos()
        .subscribe( ({bancos}) => {

          this.bancos = bancos.filter( banco => banco.status === true);          

        });

  }

  /** ================================================================
   *   CARGAR PRESTAMO
  ==================================================================== */
  public prestamo: Prestamo;
  public totalAbonado: number = 0;
  public totalInteres: number = 0;
  loadPrestamo(id: string){

    this.prestamosService.loadPrestamoID(id)
        .subscribe( ({prestamo}) => {

          this.prestamo = prestamo;
          this.prestamo.payments.map( pago => {

            if (pago.type === 'interes') {
              this.totalInteres += pago.amount;
            }

            if (pago.type === 'abono') {
              this.totalAbonado += pago.amount;
            }

          })

        }, (err) => {

          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');
          

        });

  }

  /** ================================================================
   *   AGREGAR PAGO
  ==================================================================== */
  public formSubmittedPago: boolean = false;
  public addPagoForm = this.fb.group({
    type: ['abono', [Validators.required]],
    metodo: ['efectivo', Validators.required],
    amount: [0, [Validators.required, Validators.min(1)]],
    description: '',
    fecha: '',
    vence: 0
  });

  addPago(){

    this.formSubmittedPago = true;

    if (this.addPagoForm.invalid) {
      this.formSubmittedPago = false;
      return;
    }

    // SETEAR HORA
    let vence = ((this.prestamo.frecuencia * 86400000 ) + this.prestamo.vence) - ( (new Date(((this.prestamo.frecuencia * 86400000 ) + this.prestamo.vence)).getHours() * 3600000) );
    this.prestamo.vence = vence;
    this.addPagoForm.value.fecha = new Date();

    this.prestamo.payments.push(this.addPagoForm.value);

    this.totalAbonado = 0;
    this.prestamo.payments.map( pago => {      
      if (pago.type === 'abono') {
        this.totalAbonado += pago.amount;
      }
    });

    if (this.totalAbonado === this.prestamo.monto) {
      this.prestamo.completo = true;
    }



    this.prestamosService.updatePrestamo({vence: this.prestamo.vence, payments: this.prestamo.payments, completo: this.prestamo.completo}, this.prestamo.presid)
        .subscribe( ({prestamo}) => {
          
          this.totalAbonado = 0;
          this.totalInteres = 0;

          this.formSubmittedPago = false;
          this.addPagoForm.reset();

          this.prestamo.completo = this.prestamo.completo;
          this.prestamo.payments = prestamo.payments;
          this.prestamo.payments.map( pago => {
            if (pago.type === 'interes') {
              this.totalInteres += pago.amount;
            }
            if (pago.type === 'abono') {
              this.totalAbonado += pago.amount;
            }
          });

          Swal.fire('Estupendo', 'Se ha agregado el pago exitosamente!', 'success');

        }, (err) => {
          console.log(err);
          this.formSubmittedPago = false;
          Swal.fire('Error', err.error.msg, 'error');
          
        });

  }

  /** ================================================================
   *   VALIDAR PAGO
  ==================================================================== */
  validatePay(campo: string): boolean{

    if (this.addPagoForm.get(campo).invalid && this.formSubmittedPago ) {      
      return true;
    }else{
      return false;
    }

  }

  /** ================================================================
   *   ELIMINAR PAGO
  ==================================================================== */
  deletePay(i: number){

    Swal.fire({
      title: 'Atencion',
      text: "Estas seguro de eliminar este pago?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {  
      
      if (result.isConfirmed) {
        
        this.prestamo.payments.splice(i,1);

        this.totalAbonado = 0;
        this.prestamo.payments.map( pago => {      
          if (pago.type === 'abono') {
            this.totalAbonado += pago.amount;
          }
        });

        if (this.totalAbonado === this.prestamo.monto) {
          this.prestamo.completo = true;
        }else{
          this.prestamo.completo = false;
        }
    
        this.prestamosService.updatePrestamo({ payments: this.prestamo.payments, completo: this.prestamo.completo }, this.prestamo.presid)
            .subscribe( ({prestamo}) => {

              this.totalAbonado = 0;
              this.totalInteres = 0;
              this.prestamo.completo = prestamo.completo;

              this.prestamo.payments = prestamo.payments;
              this.prestamo.payments.map( pago => {
                if (pago.type === 'interes') {
                  this.totalInteres += pago.amount;
                }
                if (pago.type === 'abono') {
                  this.totalAbonado += pago.amount;
                }
              });

          Swal.fire('Estupendo', 'Se ha eliminado el pago exitosamente!', 'success');

        }, (err) => {
          console.log(err);
          this.formSubmittedPago = false;
          Swal.fire('Error', err.error.msg, 'error');
          
        });

      }
    });
    
  }

  /** ================================================================
   *   ELIMINAR PRESTAMO
  ==================================================================== */
  deletePrestamo(prestamo: Prestamo){

    Swal.fire({
      title: 'Atencion',
      text: "Estas seguro de cambiar el estado de este prestamo?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {  
      
      if (result.isConfirmed) {
        
        if (prestamo.status) {
          this.prestamo.status = false;
        }else{
          this.prestamo.status = true;
        }
    
        this.prestamosService.updatePrestamo({ status: this.prestamo.status }, this.prestamo.presid)
            .subscribe( ({prestamo}) => {

              this.prestamo.status = prestamo.status;              

          Swal.fire('Estupendo', 'Se ha eliminado el prestamo exitosamente!', 'success');

        }, (err) => {
          console.log(err);
          this.formSubmittedPago = false;
          Swal.fire('Error', err.error.msg, 'error');
          
        });

      }
    });

  }

  // FIN DE LA CLASE
}
