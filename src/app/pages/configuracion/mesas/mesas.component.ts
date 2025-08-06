import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

// MODELS
import { Mesa } from 'src/app/models/mesas.model';

// SERVICES
import { SearchService } from '../../../services/search.service';
import { MesasService } from '../../../services/mesas.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

import { environment } from '../../../../environments/environment';
import { PisosService } from 'src/app/services/pisos.service';
import { Piso } from 'src/app/models/pisos.model';
const base_url = environment.base_url;

@Component({
  selector: 'app-mesas',
  templateUrl: './mesas.component.html',
  styles: [
  ]
})
export class MesasComponent implements OnInit {

  public listaMesas: Mesa[] = [];
  public listaMesasTemp: Mesa[] = [];
  public totalMesas: number = 0;

  public resultado: number = 0;
  public desde: number = 0;
  public cargando: boolean = true;
  public sinResultados: boolean = true;

  public btnAtras: string = '';
  public btnAdelante: string = '';

  constructor(  private mesasService: MesasService,
                private searchService: SearchService,
                private fb: FormBuilder,
                private pisosService: PisosService,
                private userService: UserService ) { }

  ngOnInit(): void {

    // LOAD PISOS
    this.loadPisos();

    //  CARGAR MESEROS
    this.cargarMeseros();

    //  CARGAR MESAS
    this.cargarMesas();    

  }

  /** ================================================================
   *   BUSCAR MESA
  ==================================================================== */
  buscar(termino){
    
    this.sinResultados = true;
    if (termino.length === 0) {
      this.listaMesas = this.listaMesasTemp;
      this.resultado = 0;
      return;
    }else{

      this.sinResultados = true;
      this.searchService.search('mesa', termino)
          .subscribe(({total, resultados}) => {

            // COMPROBAR SI EXISTEN RESULTADOS
            if (resultados.length === 0) {
              this.sinResultados = false;
              this.listaMesas = [];
              this.resultado = 0;
              return;                
            }
            // COMPROBAR SI EXISTEN RESULTADOS

            this.totalMesas = total;
            this.listaMesas = resultados; 
            this.resultado = resultados.length; 

          });
          
    }

  }

  /** ================================================================
   *   CARGAR MESAS
  ==================================================================== */
  cargarMesas(){

    this.cargando = true;
    this.sinResultados = true;

    this.mesasService.loadMesas(this.desde)
        .subscribe(({ total, mesas }) => {

          // COMPROBAR SI EXISTEN RESULTADOS
          if (mesas.length === 0) {
            this.sinResultados = false;
            this.cargando = false;
            this.listaMesas = [];
            this.resultado = 0;
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
            return;                
          }
          // COMPROBAR SI EXISTEN RESULTADOS

          this.totalMesas = total;
          this.listaMesas = mesas;
          this.listaMesasTemp = mesas;
          this.resultado = 0;
          this.cargando = false;

          // BOTONOS DE ADELANTE Y ATRAS          
          if (this.desde === 0 && this.totalMesas > 10) {
            this.btnAtras = 'disabled';
            this.btnAdelante = '';
          }else if(this.desde === 0 && this.totalMesas < 11){
            this.btnAtras = 'disabled';
            this.btnAdelante = 'disabled';
          }else if(this.desde > this.listaMesas.length){
            this.btnAtras = '';
            this.btnAdelante = 'disabled';
          }else if((this.desde + 10) >= this.totalMesas){
            this.btnAtras = '';
            this.btnAdelante = 'disabled';
          }else{
            this.btnAtras = '';
            this.btnAdelante = '';
          }   
          // BOTONOS DE ADELANTE Y ATRAS  

        });
    
  }

  /** ================================================================
   *   CREAR MESA
  ==================================================================== */
  public formSubmitted:boolean = false;
  public newMesaForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.min(1)]],
    mesero: [0, [Validators.required, Validators.minLength(2)]],
    piso: null,
    img: ['ticket.svg']
  });

  crearMesa(){
    
    this.formSubmitted = true;
    
    if (this.newMesaForm.invalid) {
      return;
    }

    // COMPROBAR SI SELECCIONO UN MESERO
    if (this.newMesaForm.value.mesero === 0) {
      Swal.fire('Error', 'Debes de asignar un usuario para crear el item', 'error');
      return;
    }

    if (this.newMesaForm.value.piso === 'null') {
      this.newMesaForm.value.piso = null;
    }

    this.mesasService.createMesa(this.newMesaForm.value)
        .subscribe( (resp:{ok: boolean, caja: Mesa}) => {
          
          this.formSubmitted = false;
          this.cargarMesas();
          this.newMesaForm.reset();
          Swal.fire('Estupendo', 'Se ha creado la mesa exitosamente', 'success');
          
        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });
  }
  
  /** ================================================================
   *   VALIDAR CAMPOS
  ==================================================================== */
  campoValido(campo: string): boolean{

    if ( this.newMesaForm.get(campo).invalid &&  this.formSubmitted) {      
      return true;      
    } else{
      
      return false;
    }

  }

  /** ================================================================
   *   INFORMACION MESA
  ==================================================================== */
  public formSubmittedUp:boolean = false;
  public upMesaForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.min(1)]],
    mesero: ['', [Validators.required, Validators.minLength(1), Validators.min(1)]],
    id: ['', [Validators.required, Validators.minLength(3)]],
    img: [''],
    ruta: [''],
    piso: [''],
  });

  informacionMesa( mesa: Mesa ){

    this.upMesaForm.setValue({
      name: mesa.name,
      mesero: mesa.mesero._id,
      id: mesa.mid,
      ruta: `${base_url}/menu/${mesa.mid}`,
      img: mesa.img || 'ticket.svg',
      piso: mesa.piso?._id || 'null'
    });

  }

  /** ================================================================
   *   ACTUALIZAR MESA
  ==================================================================== */
  actualizarMesa(){

    this.formSubmittedUp = true;
    
    if (this.upMesaForm.invalid) {
      return;
    }

    if (this.upMesaForm.value.piso === 'null') {
      this.upMesaForm.value.piso = null;
    }

    this.mesasService.updateMesa(this.upMesaForm.value, this.upMesaForm.value.id)
        .subscribe((resp:{ok: boolean, mesa: Mesa}) => {          

          this.formSubmittedUp = false;
          this.cargarMesas();
          Swal.fire('Estupendo', 'Se ha actualizado la mesa exitosamente', 'success');

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

  }

  /** ================================================================
   *   VALIDAR CAMPOS
  ==================================================================== */
  campoValidoUpdate(campo: string): boolean{

    if ( this.upMesaForm.get(campo).invalid &&  this.formSubmittedUp) {      
      return true;      
    } else{
      
      return false;
    }

  }


  /** ================================================================
   *   CARGAR MESEROS
  ==================================================================== */
  public meseros: User[] = [];
  cargarMeseros(){

    this.userService.loadUsers()
    .subscribe( ({users}) => {
      
      this.meseros = users;          
      
    }, (err) => { Swal.fire('Error', 'No se pueden cargar los meseros', 'error') });
    
  }

  /** ================================================================
   *   CARGAR PISOS
  ==================================================================== */
  public pisos: Piso[] = [];
  public queryP: any = {
    desde: 0,
    hasta: 50,
    sort: {}
  }
  loadPisos(){

    this.pisosService.loadPisos(this.queryP)
        .subscribe( ({pisos}) => {

          this.pisos = pisos;

        }, (err) => {
          console.log(err.error);
          Swal.fire('Error', err.error.msg);
        })

  }

  /** ================================================================
   *   ACTIVAR O DESACTIVAR MESA
  ==================================================================== */
  changeStatus(mesa: Mesa){

    if (mesa.status) {
      mesa.status = false;
    }else{
      mesa.status = true;
    }
      
    Swal.fire({
      title: "Estas seguro?",
      text: `de ${ mesa.status? 'Activar': 'Desactivar'}, este ticket.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Si, ${ mesa.status? 'Activar': 'Desactivar'}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      
      this.mesasService.updateMesa({status: mesa.status}, mesa.mid)
          .subscribe( (resp) => {

            console.log(resp);
            

          }, (err) => {
            console.log(err);
            Swal.fire('Error', err.error.msg, 'error');            
          })

    });

    

  }



  // FIN DE LA CLASE 
}
