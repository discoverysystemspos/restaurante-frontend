import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

// MODELS
import { Mesa } from '../../models/mesas.model';

// SERVICES
import { MesasService } from '../../services/mesas.service';
import { UserService } from '../../services/user.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styles: [
  ]
})
export class VentasComponent implements OnInit {

  public listaMesas: Mesa[] = [];
  public listaMesasTemp: Mesa[] = [];
  public totalMesas: number = 0;

  public resultado: number = 0;
  public desde: number = 0;
  public cargando: boolean = true;
  public sinResultados: boolean = true;

  public btnAtras: string = '';
  public btnAdelante: string = '';
  
  public role : string = '';
  public user: string;

  constructor(  private router: Router,
                private mesasService: MesasService,
                private userService:UserService) { 

                setInterval( () => { 
                  
                  this.cargarMesas(); 
                }, 5000);

              }

  ngOnInit(): void {

    this.role = this.userService.role;

    this.user = this.userService.user.uid;
    

    if (localStorage.getItem('turno') === '' && localStorage.getItem('turno') === null) {

      Swal.fire('No autorizado', 'Debes de abrir caja para iniciar', 'info');
      this.router.navigateByUrl('/');
      return;

    }

    // CARGAR MESAS
    this.cargarMesas();

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

}
