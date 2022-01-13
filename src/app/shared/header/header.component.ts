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

  getDatos(){

    this.empresaService.getDatos()
        .subscribe( resp => {

          this.empresa = resp;

        });   

  }

  logout(){
    this.userService.logout();
  }

  

  

}
