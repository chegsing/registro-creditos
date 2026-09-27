import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="nav">
      <span class="brand">🎓 Registro de Créditos</span>
      <a routerLink="/estudiantes" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
        Estudiantes
      </a>
      <a routerLink="/estudiantes/nuevo" routerLinkActive="active">Nuevo registro</a>
    </nav>
    <router-outlet />
  `,
})
export class AppComponent {}
