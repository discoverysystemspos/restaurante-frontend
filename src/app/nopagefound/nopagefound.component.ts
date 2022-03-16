import { Component, OnInit } from '@angular/core';
import { MesasService } from '../services/mesas.service';
import { Router } from '@angular/router';
import { Mesa } from '../models/mesas.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nopagefound',
  templateUrl: './nopagefound.component.html',
  styles: [
  ]
})
export class NopagefoundComponent implements OnInit {

  constructor(  private mesaService: MesasService,
                private router: Router) { }

  ngOnInit(): void {

    // CARGAR MESAS
    this.cargarMesas();

  }

  // Cargar Mesas
  public mesas: Mesa[] = [];
  cargarMesas(){
    this.mesaService.loadMesas()
        .subscribe( ({mesas}) => {

          this.mesas = mesas;         

        }, (err) => { Swal.fire('Error', 'Hemos tenido un error, intente de nuevo porfavor!', 'error'); });
  }

  // Seleccionar Mesa
  selectMesa(id: string){
    this.router.navigateByUrl(`menu/${id}`);
    return;
  }

}
