import { Component, OnInit } from '@angular/core';

// MODELS
import { User } from '../../models/user.model';
import { Datos } from '../../models/empresa.model';

// SERVICES
import { UserService } from '../../services/user.service';
import { EmpresaService } from '../../services/empresa.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: [
  ]
})
export class HeaderComponent implements OnInit  {

  public user: User;
  public empresa: Datos;

  constructor(  private userService: UserService,
                private empresaService: EmpresaService) { 
    
    this.user = userService.user;   

  }

  ngOnInit(): void {

    this.getDatos();
    
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
