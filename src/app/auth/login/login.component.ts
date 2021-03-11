import { Component } from '@angular/core';

import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

// SERVICES
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  
  // YEAR
  year = new Date().getFullYear();
 
  public loginForm = this.fb.group({
    usuario: [ localStorage.getItem('usuario') || '' , [Validators.required]],
    password: ['', [Validators.required]],
    remember: [false]
  });
  
  constructor(  private router: Router,
                private fb:FormBuilder,
                private userService:UserService ) { }
  
  /** ================================================================
   *  LOGIN
  ==================================================================== */
  login(){

    this.userService.login(this.loginForm.value)
                    .subscribe( resp => {

                      if ( this.loginForm.get('remember').value ) {
                        localStorage.setItem('usuario', this.loginForm.get('usuario').value);
                      }else {
                        localStorage.removeItem('usuario');
                      }

                      // INGRESAR
                      this.router.navigateByUrl('/');
                      
                    }, (err) => {                      
                      Swal.fire('Error', err.error.msg, 'error');
                    });
    
  }
  
}
