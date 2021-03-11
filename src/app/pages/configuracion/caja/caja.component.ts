import { Component, OnInit } from '@angular/core';

import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

// SERVICES
import { CajaService } from '../../../services/caja.service';
import { SearchService } from '../../../services/search.service';

// INTERFACES
import { LoadCaja, _cajero, _caja } from '../../../interfaces/load-caja.interface';

// MODELS
import { Caja } from '../../../models/caja.model';

@Component({
  selector: 'app-caja',
  templateUrl: './caja.component.html',
  styleUrls: ['./caja.component.css']
})
export class CajaComponent implements OnInit {

  public listaCaja: _caja[] = [];
  public listaCajaTemp: _caja[] = [];
  public totalCajas: number = 0;

  public resultado: number = 0;
  public desde: number = 0;
  public cargando: boolean = true;
  public sinResultados: boolean = true;

  constructor(  private cajaService: CajaService,
                private fb: FormBuilder,
                private searchService: SearchService) { }

  ngOnInit(): void {
    
    this.cargarCajas();

  }
  
  /** ================================================================
   *   BUSCAR CAJA
  ==================================================================== */
  buscar(termino){
    
    this.sinResultados = true;
    if (termino.length === 0) {
      this.listaCaja = this.listaCajaTemp;
      this.resultado = 0;
      return;
    }else{

      this.sinResultados = true;
      this.searchService.search('caja', termino)
          .subscribe(({total, resultados}) => {

            // COMPROBAR SI EXISTEN RESULTADOS
            if (resultados.length === 0) {
              this.sinResultados = false;
              this.listaCaja = [];
              this.resultado = 0;
              return;                
            }
            // COMPROBAR SI EXISTEN RESULTADOS

            this.totalCajas = total;
            this.listaCaja = resultados; 
            this.resultado = resultados.length; 

          });
          
    }

  }

  /** ================================================================
   *   CREAR CAJA
  ==================================================================== */
  public formSubmitted:boolean = false;
  public newCajaForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.minLength(5)]]
  });

  crearCaja(){
    
    this.formSubmitted = true;
    
    if (this.newCajaForm.invalid) {
      return;
    }
    
    this.cajaService.createCaja(this.newCajaForm.value)
        .subscribe( (resp:{ok: boolean, caja: Caja}) => {
          
          this.formSubmitted = false;
          this.cargarCajas();
          this.newCajaForm.reset();
          Swal.fire('Estupendo', 'Se ha creado la caja exitosamente', 'success');
          
        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });
  }
  
  /** ================================================================
   *   VALIDAR CAMPOS
  ==================================================================== */
  campoValido(campo: string): boolean{

    if ( this.newCajaForm.get(campo).invalid &&  this.formSubmitted) {      
      return true;      
    } else{
      
      return false;
    }

  }

  /** ================================================================
   *   CARGAR CAJAS
  ==================================================================== */
  cargarCajas(){
    
    this.cajaService.loadCajas()
        .subscribe( ({ total, cajas }) => {

          this.totalCajas = total;
          this.listaCaja = cajas;
          this.listaCajaTemp = cajas;
          this.resultado = 0;
          this.cargando = false;
          
        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

  }  
  
  /** ================================================================
   *   OBTENER INFORMACIÓN DE LA CAJA PARA ACTUALIZAR
  ==================================================================== */
  public formSubmittedUp:boolean = false;
  public upCajaForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(3)]],
    id: ['', [Validators.required, Validators.minLength(3)]]
  });


  informacionCaja(caja: _caja){

    this.upCajaForm.setValue({
      name: caja.name,
      description: caja.description,
      id: caja.caid
    });

  }

  /** ================================================================
   *  ACTUALIZAR CAJA
  ==================================================================== */
  actualizarCaja(){
    
    this.formSubmittedUp = true;
    
    if (this.upCajaForm.invalid) {
      return;
    }

    this.cajaService.updateCaja(this.upCajaForm.value, this.upCajaForm.value.id)
        .subscribe((resp:{ok: boolean, caja: Caja}) => {

          this.formSubmittedUp = false;
          this.cargarCajas();
          this.upCajaForm.reset();
          Swal.fire('Estupendo', 'Se ha actualizado la caja exitosamente', 'success');

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

  }

  /** ================================================================
   *   VALIDAR CAMPOS
  ==================================================================== */
  campoValidoUpdate(campo: string): boolean{

    if ( this.upCajaForm.get(campo).invalid &&  this.formSubmittedUp) {      
      return true;      
    } else{
      
      return false;
    }

  }

  /** ================================================================
   *   ACTUALIZAR STATUS DE LA CAJA
  ==================================================================== */
  statusUpdate(id:string){
    
    this.cajaService.statusUpdateCaja(id)
        .subscribe( (caja) => {
          
          let information: string;
          if (caja.status) {
            information = 'Activada';            
          }else{
            information = 'Desactivada';
          }

          this.cargarCajas();
          Swal.fire('Estupendo', `La caja ${caja.name}, ha sido ${information}`, 'success');

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });
        
  }

  // FIN DE LA CLASE 
}
