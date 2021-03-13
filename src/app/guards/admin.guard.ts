import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

// SERVICE
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(  private userService: UserService,
                private router:Router){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {

    if (this.userService.role === 'ADMIN') {
      return true;
    }else {

      Swal.fire('Atención', 'No tienes los privilegios para acceder a este modulo', 'info');
      
      this.router.navigateByUrl('/dashboard');

      return false;
    }


  }
  
}
