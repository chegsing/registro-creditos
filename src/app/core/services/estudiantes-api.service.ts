import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CrearEstudianteRequest, Estudiante, MateriaConCompaneros } from '../models/estudiante.model';

@Injectable({ providedIn: 'root' })
export class EstudiantesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/Estudiantes`;

  listar(): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<Estudiante> {
    return this.http.get<Estudiante>(`${this.baseUrl}/${id}`);
  }

  companeros(id: number): Observable<MateriaConCompaneros[]> {
    return this.http.get<MateriaConCompaneros[]>(`${this.baseUrl}/${id}/companeros`);
  }

  crear(payload: CrearEstudianteRequest): Observable<Estudiante> {
    return this.http.post<Estudiante>(this.baseUrl, payload);
  }
}
