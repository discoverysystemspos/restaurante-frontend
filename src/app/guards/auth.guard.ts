import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';

import { tap } from 'rxjs/operators';

// SERVICES
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(  private userService:UserService,
                private router:Router){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {

      // RETURN
      return this.userService.validateToken()
        .pipe(
          tap( isauthenticated => {
            if (!isauthenticated) {
              this.router.navigateByUrl('/login');
            }
          })
        );
  }
  
}
