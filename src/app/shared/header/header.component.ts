import { Component, OnInit } from '@angular/core';

// MODELS
import { User } from '../../models/user.model';
import { Datos } from '../../models/empresa.model';

// SERVICES
import { UserService } from '../../services/user.service';
import { EmpresaService } from '../../services/empresa.service';

import { environment } from '../../../environments/environment';
import { Meta, Title } from '@angular/platform-browser';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: [
  ]
})
export class HeaderComponent implements OnInit  {

  public empresaT = environment.empresa; 

  public user: User;
  public empresa: Datos;

  constructor(  private userService: UserService,
                private empresaService: EmpresaService,
                private titleService: Title,
                private metaService: Meta) { 
    
    this.user = userService.user;   

  }

  ngOnInit(): void {

    this.getDatos();

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

  public vencido: boolean = false;

  getDatos(){

    this.empresaService.getDatos()
        .subscribe( resp => {

          this.empresa = resp;

          if (this.empresa.nube) {
            if (new Date(this.empresa.vence).getTime() < new Date().getTime()) {
              this.vencido = true;              
            }
          }
          

        });   

  }

  logout(){
    this.userService.logout();
  }

  

  

}
