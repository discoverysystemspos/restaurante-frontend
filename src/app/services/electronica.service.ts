import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { delay, map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ElectronicaService {

  constructor() { }
}
