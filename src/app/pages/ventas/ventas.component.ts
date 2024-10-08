import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

// MODELS
import { Mesa } from '../../models/mesas.model';

// SERVICES
import { MesasService } from '../../services/mesas.service';
import { UserService } from '../../services/user.service';
import { User } from 'src/app/models/user.model';
import { SearchService } from 'src/app/services/search.service';

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
                private userService:UserService,
                private searchService: SearchService) {

                  const reloadMesa = setInterval( () => {

                    let ruta = window.location.href;
                    let rutaArray = ruta.split('/');
                  
                    if (rutaArray.length > 5 ) {
                      clearInterval(reloadMesa);
                    }else if (rutaArray[4] === 'ventas'){                      
                      this.cargarMesas();          
                    }else{
                      clearInterval(reloadMesa);
                    }
            
                  }, 30000);

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
          
          this.totalMesas = total;
          this.listaMesas = mesas;
          this.listaMesasTemp = mesas;
          this.resultado = 0;
          this.cargando = false;

        });
    
  }

}
