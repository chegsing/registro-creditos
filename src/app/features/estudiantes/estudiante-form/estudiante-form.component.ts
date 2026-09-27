import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Materia } from '../../../core/models/materia.model';
import { ProgramaAcademico } from '../../../core/models/programa-academico.model';
import { CatalogosApiService } from '../../../core/services/catalogos-api.service';
import { EstudiantesApiService } from '../../../core/services/estudiantes-api.service';
import {
  MAX_MATERIAS_POR_ESTUDIANTE,
  calcularCreditos,
  validarSeleccionMaterias,
} from '../../../core/business/inscripcion-rules';

@Component({
  selector: 'app-estudiante-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container grid-2">
      <section class="card">
        <h2>Registro de estudiante</h2>
        <p style="color: var(--color-muted); font-size: 0.85rem;">
          Cada materia equivale a los créditos definidos por el catálogo. Puedes
          seleccionar hasta {{ maxMaterias }} materias y no puedes repetir profesor.
        </p>

        @if (error()) {
          <div class="alert alert-error">{{ error() }}</div>
        }
        @if (mensajeOk()) {
          <div class="alert alert-success">{{ mensajeOk() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="registrar()">
          <div class="field">
            <label>Número de identificación</label>
            <input class="input" formControlName="identificationNumber" />
          </div>
          <div class="field">
            <label>Nombres</label>
            <input class="input" formControlName="firstName" />
          </div>
          <div class="field">
            <label>Apellidos</label>
            <input class="input" formControlName="lastName" />
          </div>
          <div class="field">
            <label>Correo electrónico</label>
            <input class="input" type="email" formControlName="email" />
          </div>
          <div class="field">
            <label>Teléfono</label>
            <input class="input" formControlName="phone" />
          </div>
          <div class="field">
            <label>Programa académico</label>
            <select class="input" formControlName="academicProgramId">
              <option [ngValue]="null">Selecciona un programa...</option>
              @for (p of programas(); track p.id) {
                <option [ngValue]="p.id">{{ p.name }}</option>
              }
            </select>
          </div>

          <div style="display:flex; gap:1rem; align-items:center; margin: 1rem 0;">
            <span class="badge badge-neutral">{{ creditosSeleccionados() }} créditos</span>
            <span class="badge badge-neutral">{{ seleccionadas().length }} / {{ maxMaterias }} materias</span>
          </div>

          @for (err of erroresNegocio(); track err) {
            <div class="alert alert-error">{{ err }}</div>
          }

          <button
            class="btn btn-primary"
            type="submit"
            [disabled]="form.invalid || !seleccionValida() || enviando()"
          >
            Registrar estudiante
          </button>
          <a class="btn btn-secondary" routerLink="/estudiantes" style="margin-left:0.5rem;">Cancelar</a>
        </form>
      </section>

      <section class="card">
        <h2>Materias disponibles</h2>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Materia</th>
              <th>Profesor</th>
              <th>Créditos</th>
            </tr>
          </thead>
          <tbody>
            @for (m of materias(); track m.id) {
              <tr>
                <td>
                  <input
                    type="checkbox"
                    [checked]="estaSeleccionada(m)"
                    (change)="toggleMateria(m)"
                    [disabled]="!estaSeleccionada(m) && seleccionadas().length >= maxMaterias"
                  />
                </td>
                <td>{{ m.name }}</td>
                <td>{{ m.professor }}</td>
                <td>{{ m.credits }}</td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    </div>
  `,
})
export class EstudianteFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly catalogos = inject(CatalogosApiService);
  private readonly estudiantesApi = inject(EstudiantesApiService);
  private readonly router = inject(Router);

  readonly maxMaterias = MAX_MATERIAS_POR_ESTUDIANTE;

  readonly programas = signal<ProgramaAcademico[]>([]);
  readonly materias = signal<Materia[]>([]);
  readonly seleccionadas = signal<Materia[]>([]);

  readonly enviando = signal(false);
  readonly error = signal('');
  readonly mensajeOk = signal('');

  readonly creditosSeleccionados = computed(() => calcularCreditos(this.seleccionadas()));
  readonly resultadoValidacion = computed(() => validarSeleccionMaterias(this.seleccionadas()));
  readonly erroresNegocio = computed(() => this.resultadoValidacion().errores);
  readonly seleccionValida = computed(() => this.resultadoValidacion().valido);

  readonly form = this.fb.nonNullable.group({
    identificationNumber: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    academicProgramId: this.fb.control<number | null>(null, Validators.required),
  });

  ngOnInit(): void {
    forkJoin({
      programas: this.catalogos.programasAcademicos(),
      materias: this.catalogos.materias(),
    }).subscribe({
      next: ({ programas, materias }) => {
        this.programas.set(programas);
        this.materias.set(materias);
      },
      error: () => this.error.set('No se pudieron cargar los catálogos de programas o materias.'),
    });
  }

  estaSeleccionada(m: Materia): boolean {
    return this.seleccionadas().some((s) => s.id === m.id);
  }

  toggleMateria(m: Materia): void {
    this.mensajeOk.set('');
    this.seleccionadas.update((actuales) =>
      this.estaSeleccionada(m) ? actuales.filter((s) => s.id !== m.id) : [...actuales, m]
    );
  }

  registrar(): void {
    this.error.set('');
    this.mensajeOk.set('');

    if (this.form.invalid || !this.seleccionValida()) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    this.enviando.set(true);

    this.estudiantesApi
      .crear({
        identificationNumber: valores.identificationNumber,
        firstName: valores.firstName,
        lastName: valores.lastName,
        email: valores.email,
        phone: valores.phone,
        academicProgramId: valores.academicProgramId!,
        subjectIds: this.seleccionadas().map((m) => m.id),
      })
      .subscribe({
        next: (estudiante) => {
          this.enviando.set(false);
          this.router.navigate(['/estudiantes', estudiante.id, 'companeros']);
        },
        error: () => {
          this.enviando.set(false);
          this.error.set('No se pudo registrar el estudiante. Verifica los datos e inténtalo de nuevo.');
        },
      });
  }
}
