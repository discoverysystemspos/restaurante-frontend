import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

// SERVICES
import { FileUploadService } from '../../services/file-upload.service';
import { UserService } from '../../services/user.service';

// MODELS
import { User } from '../../models/user.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styles: [
  ]
})
export class PerfilComponent implements OnInit {

  public usuario: User;

  constructor(  private fileUploadService:FileUploadService,
                private fb: FormBuilder,
                private userService: UserService) {
                  
                  // INFO USER
                  this.usuario = userService.user;

                  this.upUserForm.reset({
                    usuario: this.usuario.usuario,
                    name: this.usuario.name,
                    uid: this.usuario.uid
                  })

                }

  ngOnInit(): void {
  }
  

  /** ================================================================
   *   ACTUALIZAR USUARIO
  ==================================================================== */
  public formSubmitted: boolean = false;
  public upUserForm = this.fb.group({

    usuario: ['', [Validators.required, Validators.maxLength(3)]],
    name: ['', [Validators.required, Validators.maxLength(3)]],
    password: ['', [Validators.minLength(6)]],
    repassword: ['', [Validators.minLength(6)]]

  });

  actualizarUsuario(){

    if (this.upUserForm.value.password === '') {

      this.upUserForm.reset({
        usuario: this.upUserForm.value.usuario,
        name: this.upUserForm.value.name
      });
      
    }
    
    this.userService.updateUser(this.upUserForm.value, this.usuario.uid)
        .subscribe( (resp: {ok: boolean, user: User}) =>  {
          
          Swal.fire('Estupendo', 'Se ha actualizado tu perfil exitosamente', 'success');

        }, (err) =>{ Swal.fire('Error', err.error.msg, 'error') });


  }

  /** ================================================================
   *  VALIDAR CAMPOS
  ==================================================================== */
  campoValido(campo: string): boolean{

    if ( this.upUserForm.get(campo).invalid &&  this.formSubmitted) {  
      return true;      
    } else{            
      return false;
    }
  
  }


  /** ================================================================
   *   ACTUALIZAR IMAGEN
  ==================================================================== */
  public imgTemp: any = null;
  public subirImagen: File;
  cambiarImage(file: File){
    this.subirImagen = file;
    
    if (!file) { return this.imgTemp = null }

    const reader = new FileReader();
    const url64 = reader.readAsDataURL( file );

    reader.onloadend = () => {
      this.imgTemp = reader.result;
    }

  }
      
  /** ================================================================
   *  SUBIR IMAGEN fileImg
  ==================================================================== */
  @ViewChild('fileImg') fileImg: ElementRef;
  public imgProducto: string = 'no-image';
  subirImg(){
    
    this.fileUploadService.updateImage( this.subirImagen, 'user', this.usuario.uid)
    .then( img => this.usuario.img = img);
    
    this.fileImg.nativeElement.value = '';
    this.imgProducto = 'no-image';
    this.imgTemp = null;
    
  }

}
