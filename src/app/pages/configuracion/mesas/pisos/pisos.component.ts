import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Piso } from 'src/app/models/pisos.model';
import { PisosService } from 'src/app/services/pisos.service';
import { SearchService } from 'src/app/services/search.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pisos',
  templateUrl: './pisos.component.html',
  styleUrls: ['./pisos.component.css']
})
export class PisosComponent implements OnInit {

  constructor(  private pisosService: PisosService,
                private fb: FormBuilder,
                private searchService: SearchService
  ) { }

  ngOnInit(): void {

    this.loadPisos();
  }

  /** ======================================================================
   * LOAD PISOS
  ====================================================================== */
  public pisos: Piso[] = [];
  public total: number = 0;
  public query: any = {
    desde: 0,
    hasta: 50,
    sort: {}
  }

  loadPisos(){

    this.pisosService.loadPisos(this.query)
        .subscribe( ({pisos, total}) => {

          this.pisos = pisos;
          this.total = total;

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  /** ======================================================================
   * CREAR PISOS
  ====================================================================== */
  public formSubmited: boolean = false;
  public newForm = this.fb.group({
    name: ['', Validators.required]
  })

  create(){

    this.formSubmited = true;

    if (this.newForm.invalid) {
      return
    }

    this.pisosService.createPiso(this.newForm.value)
        .subscribe( ({piso}) => {

          this.pisos.push(piso);
          this.formSubmited = false;
          this.newForm.reset();
          Swal.fire('Estupendo', 'se ha creado correctamente', 'success');

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  /** ======================================================================
   * VALIDAR FORMULARIO
  ====================================================================== */
  validate(campo: string): boolean{

    if (this.formSubmited && this.newForm.get(campo).invalid) {
      return true;
    }else{
      return false;
    }

  }

  /** ======================================================================
   * CREAR PISOS
  ====================================================================== */
  public formSubmitedUpdate: boolean = false;
  public updateForm = this.fb.group({
    name: ['', Validators.required]
  })

  update(){

    this.formSubmitedUpdate = true;

    if (this.updateForm.invalid) {
      return
    }

    this.pisosService.updatePiso(this.updateForm.value, this.pisoSelected.piid)
        .subscribe( ({piso}) => {

          this.pisos.map( (p) => {
            if (p.piid === piso.piid) {
              p.name = piso.name
            }
          })
          this.formSubmitedUpdate = false;
          Swal.fire('Estupendo', 'se ha actualizado correctamente', 'success');

        }, (err) => {
          console.log(err);
          Swal.fire('Error', err.error.msg, 'error');          
        })

  }

  /** ======================================================================
   * VALIDAR FORMULARIO
  ====================================================================== */
  validateUpdate(campo: string): boolean{

    if (this.formSubmitedUpdate && this.updateForm.get(campo).invalid) {
      return true;
    }else{
      return false;
    }

  }

  

  /** ======================================================================
   * PISO SELECTD
  ====================================================================== */
  public pisoSelected: Piso;
  selectPisto(piso: Piso){

    this.pisoSelected = piso;
    this.updateForm.setValue({
      name: piso.name
    })

  }

  quitarPiso(){
    delete this.pisoSelected;
  }

  /** ======================================================================
   * ELIMINAR PISO
  ====================================================================== */
  // deletePiso(piid: string, i: any){
    
  //   Swal.fire({
  //     title: "Estas seguro?",
  //     text: "De eliminar este piso!",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#3085d6",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: "Si, eliminar!",
  //     cancelButtonText: 'Cancelar'
  //   }).then((result) => {
  //     if (result.isConfirmed) {
        
  //       this.pisosService.deletePiso(piid)
  //       .subscribe( ({msg}) => {
          
  //         this.pisos.splice(i, 1);
  //         Swal.fire('Estupendo', msg, 'success');
          
  //       }, (err) => {
  //         console.log(err);
  //         Swal.fire('Error', err.error.msg, 'error');          
  //       })
        
  //     }
  //   });
    
    
    
  // }

  /** ======================================================================
   * BUSCAR MESA
  ====================================================================== */
  // public listMesa: any[] = []
  // buscarMesa(termino: string){

  //   if (termino.length === 0) {
  //     this.listMesa = [];
  //     return;
  //   }

  //   this.searchService.search('mesa', termino)
  //       .subscribe( ({resultados}) => {

  //         this.listMesa = resultados          

  //       }, (err) => {
  //         console.log(err);
  //         Swal.fire('Error', err.error.msg);
          
  //       })

  // }
  
}
