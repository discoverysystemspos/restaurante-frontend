import { Component, OnInit } from '@angular/core';
import { Datos } from '../../models/empresa.model';
import { EmpresaService } from '../../services/empresa.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styles: [
  ]
})
export class DashboardComponent implements OnInit {

  constructor(  private empresaService: EmpresaService) { }

  ngOnInit(): void {

    this.cargarEmpresa();

  }

  /** ================================================================
   *   CARGAR DATOS DE LA EMPRESA
  ==================================================================== */
  public empresa: Datos;

  cargarEmpresa(){

    this.empresaService.getDatos()
        .subscribe( datos => {

          console.log(datos);          

        });

  }

  // FIN DE LA CLASE
}
