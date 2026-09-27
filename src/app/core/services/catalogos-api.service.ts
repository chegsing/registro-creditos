import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Materia } from '../models/materia.model';
import { ProgramaAcademico } from '../models/programa-academico.model';

@Injectable({ providedIn: 'root' })
export class CatalogosApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/Catalogos`;

  materias(): Observable<Materia[]> {
    return this.http.get<Materia[]>(`${this.baseUrl}/materias`);
  }

  programasAcademicos(): Observable<ProgramaAcademico[]> {
    return this.http.get<ProgramaAcademico[]>(`${this.baseUrl}/programas-academicos`);
  }
}
