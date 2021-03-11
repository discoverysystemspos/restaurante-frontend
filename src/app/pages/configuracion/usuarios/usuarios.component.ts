import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import Swal from 'sweetalert2';

// MODELS
import { User } from '../../../models/user.model';

// SERVICES
import { UserService } from '../../../services/user.service';
import { SearchService } from '../../../services/search.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  public usuarios: User[] = [];
  public usuariosTemp: User[] = [];
  public totalUsers: number = 0;

  public resultado: number = 0;
  public desde: number = 0;
  public cargando: boolean = true;
  public sinResultados: boolean = true;

  constructor(  private userService: UserService,
                private fb: FormBuilder,
                private searchService: SearchService) { }

  ngOnInit(): void {

    this.cargarUsuarios();

  }

  /** ================================================================
   *   BUSCAR USUARIOS
  ==================================================================== */
  buscar(termino: string){}

  /** ================================================================
   *   CARGAR USUARIOS
  ==================================================================== */
  cargarUsuarios(){
    
    this.userService.loadUsers()
    .subscribe( ({ total, users }) => {
      
      this.totalUsers = total;
      this.usuarios = users;
          this.usuariosTemp = users;
          this.resultado = 0;
          this.cargando = false;          
          
        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

  }

  /** ================================================================
   *   CREAR USUARIOS
  ==================================================================== */
  public formSubmitted:boolean = false;
  public newUserForm = this.fb.group({
    usuario: ['', [Validators.required, Validators.minLength(4)]],
    name: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  crearUsuario(){

    this.formSubmitted = true;
    
    if (this.newUserForm.invalid) {
      return;
    }else{

      this.userService.createUser(this.newUserForm.value)
          .subscribe( (resp:{ok: boolean, user: User}) => {

            console.log(resp);
            

            this.formSubmitted = false;
            this.cargarUsuarios();
            this.newUserForm.reset();
            Swal.fire('Estupendo', 'Se ha creado un usuario nuevo', 'success');

          }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

    }

  }

  /** ================================================================
   *   VALIDAR CAMPOS
  ==================================================================== */
  campoValido(campo: string): boolean{

    if ( this.newUserForm.get(campo).invalid &&  this.formSubmitted) {      
      return true;      
    } else{      
      return false;
    }

  }    

  /** ================================================================
   *   ACTUALIZAR USUARIOS
  ==================================================================== */
  informacionDepartamento(){}

  /** ================================================================
   *   ACTUALIZAR STATUS USUARIOS
  ==================================================================== */
  statusUpdate(id: string){
    
  }
      

  // FIN DE LA CLASE
}
