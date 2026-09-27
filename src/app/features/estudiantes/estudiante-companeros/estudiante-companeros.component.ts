import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Estudiante, MateriaConCompaneros } from '../../../core/models/estudiante.model';
import { EstudiantesApiService } from '../../../core/services/estudiantes-api.service';

@Component({
  selector: 'app-estudiante-companeros',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <a routerLink="/estudiantes" style="color: var(--color-primary); text-decoration:none; font-size:0.85rem;">
        ← Volver al listado
      </a>

      @if (error()) {
        <div class="alert alert-error" style="margin-top:1rem;">{{ error() }}</div>
      }

      @if (estudiante(); as est) {
        <section class="card" style="margin-top:1rem;">
          <h2>{{ est.firstName }} {{ est.lastName }}</h2>
          <p style="color: var(--color-muted); margin:0;">{{ est.academicProgram }}</p>
        </section>
      }

      <section class="card" style="margin-top:1rem;">
        <h2>Compañeros por materia</h2>
        <p style="color: var(--color-muted); font-size: 0.85rem;">
          Por cada materia se muestra únicamente el nombre de quienes la comparten.
        </p>

        @for (grupo of companeros(); track grupo.subject) {
          <div class="card" style="margin-bottom: 0.75rem;">
            <h3 style="font-size:1rem;">{{ grupo.subject }}</h3>
            @for (c of grupo.classmates; track c.firstName + c.lastName) {
              <span class="badge badge-neutral" style="margin-right:0.4rem;">{{ c.firstName }} {{ c.lastName }}</span>
            } @empty {
              <span style="color: var(--color-muted); font-size: 0.85rem;">Sin compañeros todavía.</span>
            }
          </div>
        } @empty {
          @if (!cargando()) {
            <p style="color: var(--color-muted);">Este estudiante no tiene materias inscritas.</p>
          }
        }
      </section>
    </div>
  `,
})
export class EstudianteCompanerosComponent {
  private readonly api = inject(EstudiantesApiService);

  /** Enlazado automáticamente desde el parámetro :id de la ruta. */
  readonly id = input.required<string>();
  private readonly idNumerico = computed(() => Number(this.id()));

  readonly estudiante = signal<Estudiante | null>(null);
  readonly companeros = signal<MateriaConCompaneros[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  constructor() {
    effect(() => {
      const id = this.idNumerico();
      if (!id) return;

      this.cargando.set(true);
      this.error.set('');

      this.api.obtenerPorId(id).subscribe({
        next: (est) => this.estudiante.set(est),
        error: () => this.error.set('No se pudo cargar la información del estudiante.'),
      });

      this.api.companeros(id).subscribe({
        next: (data) => {
          this.companeros.set(data);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar la lista de compañeros.');
          this.cargando.set(false);
        },
      });
    });
  }
}
