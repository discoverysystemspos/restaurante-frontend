import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

// SERVICES
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class WaiterGuardPrivate implements CanActivate {

  constructor(  private userService: UserService,
    private router:Router){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    
      if (this.userService.role === 'WAITER' || this.userService.role === 'WAITERALL') {
        Swal.fire('Atención', 'No tienes los privilegios para acceder a este modulo', 'info');
        
        this.router.navigateByUrl('/dashboard');
  
        return false;
      }else {        
        return true;
      }

  }
  
}
