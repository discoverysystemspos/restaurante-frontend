import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

// SERVICES
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
  // YEAR
  year = new Date().getFullYear();
  public empresaT = environment.empresa; 
 
  public loginForm = this.fb.group({
    usuario: [ localStorage.getItem('usuario') || '' , [Validators.required]],
    password: ['', [Validators.required]],
    remember: [false]
  });
  
  constructor(  private router: Router,
                private fb:FormBuilder,
                private userService:UserService,
                private titleService: Title,
                private metaService: Meta ) { }

  ngOnInit(): void {
    // Configuración SEO
    this.titleService.setTitle(this.empresaT.name);

    // OpenGraph / Facebook
    this.metaService.updateTag({ 
      property: 'og:title', 
      content: this.empresaT.name 
    });
    
    this.metaService.updateTag({ 
      property: 'og:url', 
      content: window.location.href 
    });
  }
  
  /** ================================================================
   *  LOGIN
  ==================================================================== */
  login(){

    this.userService.login(this.loginForm.value)
                    .subscribe( ({ok, token}) => {  
                                            
                      localStorage.setItem('token', token);

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
