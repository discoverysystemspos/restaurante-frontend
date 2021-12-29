import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import Swal from 'sweetalert2';

// MODELS
import { User } from '../../../models/user.model';

// SERVICES
import { UserService } from '../../../services/user.service';
import { SearchService } from '../../../services/search.service';

// INTERFACES
import { _privilegios } from '../../../interfaces/load-users.interface';

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
  public privilegio : _privilegios[] = [];
  public newUserForm = this.fb.group({
    usuario: ['', [Validators.required, Validators.minLength(4)]],
    name: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['STAFF'],
    cierre: [true],
    privilegios: []
  });

  crearUsuario(){

    this.formSubmitted = true;
    
    if (this.newUserForm.invalid) {
      return;
    }else{

      this.privilegio = [];

      this.privilegio.push({
        cierre: this.newUserForm.value.cierre
      });

      this.newUserForm.value.privilegios = this.privilegio;

      this.userService.createUser(this.newUserForm.value)
          .subscribe( (resp:{ok: boolean, user: User}) => {            

            this.formSubmitted = false;
            this.cargarUsuarios();
            this.newUserForm.reset({
              role: ['STAFF']
            });
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
   *   INFORMACION DEL USUARIO
  ==================================================================== */
  public formSubmittedUp:boolean = false;  
  public updateUserForm = this.fb.group({
    usuario: ['', [Validators.required, Validators.minLength(4)]],
    name: ['', [Validators.required, Validators.minLength(3)]],
    id: [''],
    password: ['', [Validators.minLength(6)]],
    repassword: ['', [Validators.minLength(6)]],
    role: ['STAFF'],
    cierre: [true],
    privilegios: []
  });

  public updateUserForm2 = this.fb.group({
    usuario: ['', [Validators.required, Validators.minLength(4)]],
    name: ['', [Validators.required, Validators.minLength(3)]],
    id: [''],
    role: ['STAFF'],
    cierre: [true],
    privilegios: []
  });

  informacionUsuario(user: User){
    
    
    if( user.privilegios.length === 0  ){      
      user.privilegios[0].cierre = true;
    }   

    this.updateUserForm.setValue({
      usuario: user.usuario,
      name: user.name,
      password: [''],
      repassword: [''],
      id: user.uid,
      role: user.role,
      cierre: user.privilegios[0].cierre,
      privilegios: []
    });

  }
  /** ================================================================
   *   ACTUALIZAR USUARIOS
  ==================================================================== */
  public privilegioUp : _privilegios[] = [];
  actualizarUsuario(){

    this.formSubmittedUp = true;
    
        
    
    if (this.updateUserForm.value.password.length === 1) {

      this.privilegioUp = [];

      this.privilegioUp.push({
        cierre: this.updateUserForm2.value.cierre
      });
            
      this.updateUserForm2.setValue({
        usuario: this.updateUserForm.value.usuario,
        name: this.updateUserForm.value.name,
        id: this.updateUserForm.value.id,
        role: this.updateUserForm.value.role,
        privilegios: this.privilegioUp
      });

      this.userService.updateUser(this.updateUserForm2.value, this.updateUserForm2.value.id)
        .subscribe((resp:{ok: boolean, user: User}) => {          

          this.formSubmittedUp = false;
          this.cargarUsuarios();
          this.updateUserForm.reset();
          Swal.fire('Estupendo', 'Se ha actualizado el Usuario exitosamente!', 'success');

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); 
      });

      
    }else{

      if (this.updateUserForm.invalid) {
        return;
      }

      if(this.updateUserForm.value.password !== this.updateUserForm.value.repassword){
        Swal.fire('Atención', 'Las contraseñas no son iguales', 'warning');
        return;  
      }

      this.userService.updateUser(this.updateUserForm.value, this.updateUserForm.value.id)
        .subscribe((resp:{ok: boolean, user: User}) => {          

          this.formSubmittedUp = false;
          this.cargarUsuarios();
          this.updateUserForm.reset();
          Swal.fire('Estupendo', 'Se ha actualizado el Usuario exitosamente!', 'success');

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); 
      });

    }

    

    


  }

  /** ================================================================
   *   VALIDAR CAMPOS
  ==================================================================== */
  campoValidoUpdate(campo: string): boolean{

    if ( this.updateUserForm.get(campo).invalid &&  this.formSubmittedUp) {      
      return true;      
    } else{      
      return false;
    }

  }

  /** ================================================================
   *   ACTUALIZAR STATUS USUARIOS
  ==================================================================== */
  statusUpdate(id: string){

    if (id === this.userService.user.uid) {
      Swal.fire('Atención', `No puedes cambiar tu estado`, 'info');
      return;
    }
    
    this.userService.statusUser(id)
        .subscribe( (user) => {

          let information: string;
          if (user.status) {
            information = 'Activado';            
          }else{
            information = 'Desactivado';
          }          
          
          this.cargarUsuarios();
          Swal.fire('Estupendo', `El departamento ${user.name}, ha sido ${information}`, 'success');

        }, (err) => { Swal.fire('Error', err.error.msg, 'error'); });

  }
      

  // FIN DE LA CLASE
}
