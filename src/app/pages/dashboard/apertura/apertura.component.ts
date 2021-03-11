import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

// SERVICES
import { CajaService } from '../../../services/caja.service';
import { TurnoService } from '../../../services/turno.service';

// INTERFACES
import { _caja } from '../../../interfaces/load-caja.interface';

@Component({
  selector: 'app-apertura',
  templateUrl: './apertura.component.html',
  styles: [
  ]
})
export class AperturaComponent implements OnInit {

  public listaCaja: _caja[] = [];

  constructor(  private cajaService: CajaService,
                private turnoService: TurnoService) { }

  ngOnInit(): void {
    
    this.cargarCajas();

  }

  /** ================================================================
   *   CARGAR CAJAS
  ==================================================================== */
  cargarCajas(){    
    
    this.cajaService.loadCajas()
        .subscribe( ({ total, cajas }) => {
          
          this.listaCaja = cajas;          

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

  }

  /** ================================================================
   *   ABRIR CAJA
  ==================================================================== */
  public openBox:string;
  abrirCaja(caja: string){
    

    if (localStorage.getItem('turno') !== '' && localStorage.getItem('turno') !== null) {

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
          caja,
          initial
        };

        this.turnoService.createCaja(open)
            .subscribe( (resp:{ ok:boolean, turno:any}) => {

              this.cargarCajas();
              localStorage.setItem('turno', resp.turno.tid);
              
            });  
            
        return;
      }else{
        return;
      }                
      
    });


  }

}
