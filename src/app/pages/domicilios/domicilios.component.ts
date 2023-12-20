import { Component, OnInit } from '@angular/core';
import { Domicilio } from 'src/app/models/domicilios.model';
import { DomiciliosService } from 'src/app/services/domicilios.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-domicilios',
  templateUrl: './domicilios.component.html',
  styleUrls: ['./domicilios.component.css']
})
export class DomiciliosComponent implements OnInit {

  constructor(  private domiciliosService: DomiciliosService) { }

  ngOnInit(): void {
    this.loadDomicilios();
  }

  /** ================================================================
   *   IMPRIMIR
  ==================================================================== */
  public domicilios: Domicilio[] = [];
  public domiciliosTemp: Domicilio[] = [];
  public query = {
    desde: 0,
    hasta: 50
  }

  loadDomicilios(){

    this.domiciliosService.loadDomicilios(this.query)
        .subscribe( ({domicilios}) => {

          this.domicilios = domicilios;
          this.domiciliosTemp = domicilios;

          console.log(domicilios);
          

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

}
