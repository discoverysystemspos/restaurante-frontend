import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators'

// MODEL
import { Department } from '../models/department.model';

// INTERFACES
import { LoadDepartment } from '../interfaces/load-department.interface';

import { environment } from '../../environments/environment';
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})

export class DepartmentService {

  public department: Department;

  constructor(private http: HttpClient) { }

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
   *  LOAD DEPARTMENT
  ==================================================================== */
  loadDepartment(){

    return this.http.get<LoadDepartment>(`${base_url}/departments`, this.headers)
        .pipe(
          map( resp =>{
            return resp;
          })
        );
        
  }

  /** ================================================================
   *  CREATE DEPARTMENT
  ==================================================================== */
  createDepartment(formData: any){
    
    return this.http.post(`${base_url}/departments`, formData, this.headers);

  }

  /** ================================================================
   *  UPDATE DEPARTMENT
  ==================================================================== */
  updateDepartment(formData: any, id:string){
    
    return this.http.put(`${base_url}/departments/${id}`, formData, this.headers);

  }

  /** ================================================================
   *  UPDATE STATUS DEPARTMENT
  ==================================================================== */
  statusUpdateDepartment(id: string){
    
    return this.http.delete(`${base_url}/departments/${id}`, this.headers)
                .pipe(
                  map( (resp: {ok: boolean, department: Department}) => { 
                    return resp.department 
                  })
                );

  }



  // FIN DE LA CLASE
}
