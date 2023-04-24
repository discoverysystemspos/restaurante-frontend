import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Client } from 'src/app/models/client.model';
import { Prestamo } from 'src/app/models/prestamos.model';
import { PrestamosService } from 'src/app/services/prestamos.service';
import { SearchService } from 'src/app/services/search.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-prestamos',
  templateUrl: './prestamos.component.html',
  styleUrls: ['./prestamos.component.css']
})
export class PrestamosComponent implements OnInit {

  public resultado: number = 0;
  public desde: number = 0;
  public hasta: number = 50;
  public cargando: boolean = true;
  public sinResultados: boolean = true;

  public btnAtras: string = '';
  public btnAdelante: string = '';

  constructor(  private fb: FormBuilder,
                private prestamosService: PrestamosService,
                private searhcService: SearchService) { }

  ngOnInit(): void {

    // CARGAR PRESTAMOS
    this.loadPrestamos();

  }

  /** ================================================================
   *   CARGAR PRESTAMOS
  ==================================================================== */
  public listaPrestamos: Prestamo[] = [];
  public listaPrestamosTemp: Prestamo[] = [];
  public totalPrestamos: number = 0;
  public total: number = 0;
  public totalAbonado: number = 0;
  public totalIntereses: number = 0;

  loadPrestamos(){

    this.cargando = true;
    this.sinResultados = true;

    this.prestamosService.loadPrestamos(this.desde, this.hasta)
        .subscribe( ({prestamos, total}) => {

          this.total = 0;
          this.totalAbonado = 0;
          this.totalIntereses = 0;

          // COMPROBAR SI EXISTEN RESULTADOS
          if (prestamos.length === 0) {
            this.sinResultados = false;
            this.cargando = false;
            this.listaPrestamos = [];
            this.resultado = 0;
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
            return;                
          }
          // COMPROBAR SI EXISTEN RESULTADOS

          this.totalPrestamos = total;
          this.listaPrestamos = prestamos;
          this.listaPrestamosTemp = prestamos;
          this.resultado = 0;
          this.cargando = false;
          this.sinResultados = true;

          for (const prestamo of prestamos) {
            this.total += prestamo.monto;

            prestamo.payments.map( pago => {
              if (pago.type === 'interes') {
                this.totalIntereses += pago.amount;
              }
              if (pago.type === 'abono') {
                this.totalAbonado += pago.amount;
              }
            })

          }


        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');
        });

  }

  /** ================================================================
   *   CREAR PRESTAMO
  ==================================================================== */  
  public formSubmited: boolean = false;
  public createForm = this.fb.group({
    client: '',
    diario: false,
    vence: 0,
    frecuencia: [7, [Validators.required, Validators.min(1)]],
    monto: [5000, [Validators.required, Validators.min(5000)]],
    porcentaje: [0, [Validators.required]],
  });

  create(){

    if (!this.clientS) {
      Swal.fire('Atención', 'debes de seleccionar un cliente', 'warning');
      return;
    }

    this.createForm.value.client = this.clientS.cid;
    this.formSubmited = true;

    if (this.createForm.invalid) {
      return;
    }

    if (this.createForm.value.frecuencia === 1) {
      this.createForm.value.diario = true;
    }

    // SETEAR HORA
    let hoy = new Date().getTime();
    this.createForm.value.vence = ((this.createForm.value.frecuencia * 86400000 ) + hoy) - ( (new Date(hoy).getHours() * 3600000) );

    this.prestamosService.createPrestamo(this.createForm.value)
        .subscribe( ({prestamo}) => {          

          this.listaPrestamos.push(prestamo);
          this.listaPrestamosTemp.push(prestamo);     
          this.createForm.reset();
          this.formSubmited = false;
          this.totalPrestamos ++;
          Swal.fire('Estupendo', 'Se ha creado un nuevo prestamo exitosamente', 'success');

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');
          
        });

  }


  /** ================================================================
   *   VALIDAR FORMULARIO
  ==================================================================== */
  validate(campo: string): boolean{

    if (this.createForm.get(campo).invalid && this.formSubmited) {      
      return true;
    }else{
      return false;
    }

  }

  /** ================================================================
   *   SEARCH CLIENT
  ==================================================================== */
  public listClients: any[] = [];
  public clientS: Client;
  buscarClient(termino: string){

    this.listClients = [];
    
    if (termino.length < 1) {
      this.listClients = [];
      return;      
    }
    
    this.searhcService.search('clients', termino)
    .subscribe( ({resultados}) => {      

        this.listClients = resultados;          

      }, (err) => {
        console.log(err);
        
      });

  }

  /** ================================================================
   *   SEARCH CLIENT ""
  ==================================================================== */
  public listClients2: any[] = [];
  public clientS2: Client;
  buscarClient2(termino: string){
    

    this.listClients = [];
    
    if (termino.length < 1) {
      this.listClients = [];
      return;      
    }
    
    this.searhcService.search('clients', termino)
    .subscribe( ({resultados}) => {      

        this.listClients2 = resultados;          

      }, (err) => {
        console.log(err);
        
      });

  }

  /** ================================================================
   *   SEARCH PRESTAMOS OF CLIENTS
  ==================================================================== */
  buscarPrestamoClient( client: string ){

    this.listClients = [];
    this.listaPrestamos = [];
    this.prestamosService.loadPrestamoClient(client)
        .subscribe( ({prestamos, total}) => {

          this.total = 0;
          this.totalAbonado = 0;
          this.totalIntereses = 0;

          // COMPROBAR SI EXISTEN RESULTADOS
          if (prestamos.length === 0) {
            this.sinResultados = false;
            this.cargando = false;
            this.listaPrestamos = [];
            this.resultado = 0;
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
            return;                
          }
          // COMPROBAR SI EXISTEN RESULTADOS

          this.totalPrestamos = prestamos.length;
          this.listaPrestamos = prestamos;
          this.resultado = 0;
          this.cargando = false;
          this.sinResultados = true;

          for (const prestamo of prestamos) {
            this.total += prestamo.monto;

            prestamo.payments.map( pago => {
              if (pago.type === 'interes') {
                this.totalIntereses += pago.amount;
              }
              if (pago.type === 'abono') {
                this.totalAbonado += pago.amount;
              }
            })

          }

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');
          
        })

  }

  /** ================================================================
   *   BUSCAR PRESTAMOS POR FECHAS
  ==================================================================== */
  buscarFechas(vence: any){

    if (vence.length === 0) {
      return;
    }

    this.prestamosService.loadPrestamosDates(new Date(vence).getTime())
        .subscribe( ({prestamos, total}) => {

          this.total = 0;
          this.totalAbonado = 0;
          this.totalIntereses = 0;

          // COMPROBAR SI EXISTEN RESULTADOS
          if (prestamos.length === 0) {
            this.sinResultados = false;
            this.cargando = false;
            this.listaPrestamos = [];
            this.resultado = 0;
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
            return;                
          }
          // COMPROBAR SI EXISTEN RESULTADOS

          this.totalPrestamos = prestamos.length;
          this.listaPrestamos = prestamos;
          this.resultado = 0;
          this.cargando = false;
          this.sinResultados = true;

          for (const prestamo of prestamos) {
            this.total += prestamo.monto;

            prestamo.payments.map( pago => {
              if (pago.type === 'interes') {
                this.totalIntereses += pago.amount;
              }
              if (pago.type === 'abono') {
                this.totalAbonado += pago.amount;
              }
            })

          }

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        });

  }


  // FIN DE LA CLASE
}
