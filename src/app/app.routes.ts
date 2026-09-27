import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'estudiantes', pathMatch: 'full' },
  {
    path: 'estudiantes',
    title: 'Estudiantes',
    loadComponent: () =>
      import('./features/estudiantes/estudiantes-list/estudiantes-list.component').then(
        (m) => m.EstudiantesListComponent
      ),
  },
  {
    path: 'estudiantes/nuevo',
    title: 'Nuevo registro',
    loadComponent: () =>
      import('./features/estudiantes/estudiante-form/estudiante-form.component').then(
        (m) => m.EstudianteFormComponent
      ),
  },
  {
    path: 'estudiantes/:id/companeros',
    title: 'Compañeros de clase',
    loadComponent: () =>
      import('./features/estudiantes/estudiante-companeros/estudiante-companeros.component').then(
        (m) => m.EstudianteCompanerosComponent
      ),
  },
  { path: '**', redirectTo: 'estudiantes' },
];
