import { Component } from '@angular/core';

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
export class HeaderComponent  {

  public user: User;
  public empresa: Datos;

  constructor(  private userService: UserService,
                private empresaService: EmpresaService) { 
    
    this.user = userService.user;
    this.empresa = empresaService.myEmpresa;

  }

  logout(){
    this.userService.logout();
  }

  

}
