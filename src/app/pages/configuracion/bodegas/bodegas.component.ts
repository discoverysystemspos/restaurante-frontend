import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Bodega } from 'src/app/models/bodegas.model';
import { BodegasService } from 'src/app/services/bodegas.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bodegas',
  templateUrl: './bodegas.component.html',
  styleUrls: ['./bodegas.component.css']
})
export class BodegasComponent implements OnInit {

  constructor(  private bodegasService: BodegasService,
                private fb: FormBuilder) { }

  ngOnInit(): void {

    // LOAD BODEGAS
    this.loadBodegas();

  }

  /** ================================================================
   *   CARGAR BODEGAS
  ==================================================================== */
  public cargando: boolean = true;
  public totalBodegas: number = 0;
  public bodegas: Bodega[] = [];
  public query: any = {
    desde: 0,
    hasta: 50
  }

  loadBodegas(){

    this.bodegasService.loadBodegas(this.query)
        .subscribe( ({bodegas, total}) => {

          this.bodegas = bodegas;
          this.totalBodegas = total;
          this.cargando = false;

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  /** ================================================================
   *   NUEVA BODEGA
  ==================================================================== */
  public newBodegaSubmitted: boolean = false;
  public newBodegaForm = this.fb.group({
    name: ['', [Validators.required]],
    endpoint: ['', [Validators.required]]
  })
  
  create(){

    this.newBodegaSubmitted = true;

    if (this.newBodegaForm.invalid) {
      return;
    }

    this.bodegasService.createBodega(this.newBodegaForm.value)
        .subscribe( ({bodega}) => {

          bodega.bid = bodega._id;

          this.bodegas.push(bodega);
          this.newBodegaForm.reset();
          this.newBodegaSubmitted = false;
          this.totalBodegas ++;
          Swal.fire('Estupendo', 'Se ha creado la bodega exitosamente', 'success');

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  /** ================================================================
    *   VALIDAR CAMPO
  ==================================================================== */
  campoValido(campo: string): boolean{
    if (this.newBodegaSubmitted && this.newBodegaForm.get(campo).invalid) {
      return true;
    }else{
      return false;
    }
  }
}

