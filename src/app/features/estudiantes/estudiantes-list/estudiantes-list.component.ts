import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Estudiante } from '../../../core/models/estudiante.model';
import { EstudiantesApiService } from '../../../core/services/estudiantes-api.service';

@Component({
  selector: 'app-estudiantes-list',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <section class="card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h2>Estudiantes registrados</h2>
          <a class="btn btn-primary" routerLink="/estudiantes/nuevo">+ Nuevo registro</a>
        </div>

        @if (error()) {
          <div class="alert alert-error">{{ error() }}</div>
        }

        @if (cargando()) {
          <p style="color: var(--color-muted);">Cargando estudiantes…</p>
        } @else {
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Programa académico</th>
                <th>Materias</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (e of estudiantes(); track e.id) {
                <tr>
                  <td>{{ e.firstName }} {{ e.lastName }}</td>
                  <td>{{ e.academicProgram }}</td>
                  <td>
                    @for (s of e.subjects; track s) {
                      <span class="chip">{{ s }}</span>
                    }
                  </td>
                  <td>
                    <a class="btn btn-secondary" style="padding:0.3rem 0.6rem;" [routerLink]="['/estudiantes', e.id, 'companeros']">
                      Ver compañeros
                    </a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" style="color: var(--color-muted);">Aún no hay estudiantes registrados.</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </section>
    </div>
  `,
})
export class EstudiantesListComponent implements OnInit {
  private readonly api = inject(EstudiantesApiService);

  readonly estudiantes = signal<Estudiante[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    this.api.listar().subscribe({
      next: (data) => {
        this.estudiantes.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo conectar con la API de Estudiantes.');
        this.cargando.set(false);
      },
    });
  }
}
