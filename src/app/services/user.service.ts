import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


import { catchError, map, tap } from 'rxjs/operators'
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';

// SERVICES
import { TurnoService } from './turno.service';

// INTERFACE
import { LoginForm } from '../interfaces/login-form.interface';
import { LoadUsers } from '../interfaces/load-users.interface';
import { LoadTurno } from '../interfaces/load-turno.interface';

// ENVIRONMENT
import { environment } from '../../environments/environment';

// MODELS
import { User } from '../models/user.model';
import Swal from 'sweetalert2';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public user: User;

  constructor( private http: HttpClient,
                private router: Router,
                private turnoService: TurnoService ) { }

  /** ================================================================
   *   GET TOKEN
  ==================================================================== */
  get token():string {
    return localStorage.getItem('token') || '';
  }

  /** ================================================================
   *   GET HEADERS
  ==================================================================== */
  get headers() {
    return {
      headers: {
        'x-token': this.token
      }
    }
  }

  /** ================================================================
   *   GET ROLES
  ==================================================================== */
  get role(): 'ADMIN' | 'STAFF' | 'CASHIER' | 'WAITER' {
    return this.user.role;
  }

  /** ================================================================
   *   LOGOUT
  ==================================================================== */
  logout(){
    
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');

  }

  /** ================================================================
   *   VALIDATE TOKEN OR RENEW TOKEN
  ==================================================================== */
  validateToken():Observable<boolean>{
    const token = localStorage.getItem('token') || '';
    
    return this.http.get(`${base_url}/login/renew`, {
      headers: {
        'x-token': token
      }
    }).pipe(
      tap( (resp: any) => {
        
        const { usuario, name, role, img, uid } = resp.usuario;

        this.user = new User( usuario, name, '', role, img, uid );        

        localStorage.setItem('token', resp.token);
      }),
      map( resp => true ),
      catchError( error => of(false) )
    );

  }

  /** ================================================================
   *   CREATE USER
  ==================================================================== */
  createUser( formData: any ){
      
    return this.http.post(`${base_url}/users`, formData, this.headers);

  }

  /** ================================================================
   *   UPDATE USER
  ==================================================================== */
  updateUser(formData: any, id: string){

    return this.http.put(`${base_url}/users/${id}`, formData, this.headers);

  }

  /** ================================================================
   *   LOAD USERS
  ==================================================================== */
  loadUsers(){
    return this.http.get<LoadUsers>(`${base_url}/users`, this.headers)
                .pipe(
                  map( resp => {
                      return resp;
                    })
                )
  }

  /** ================================================================
   *  LOGIN
  ==================================================================== */
  login( formData: LoginForm ){
    
    return this.http.post(`${base_url}/login`, formData)
                      .pipe(
                        tap( (resp: any) => {

                          localStorage.setItem('token', resp.token);

                        }),
                        map( resp => {

                          const turno = localStorage.getItem('turno') || '';

                          if (turno !== '' || turno !== null) {

                            this.turnoService.getTurnoId(turno)
                                .subscribe( (resp) => {
                                  
                                })       
                                    
                          }
                          
                        }),
                        catchError( error => of(false) )
                      );
  }

}
