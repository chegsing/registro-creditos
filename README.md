# Registro de Créditos Académicos — Angular 21

Aplicación Angular standalone (sin NgModules) que consume directamente la API
REST real del ejercicio en `https://localhost:7084/api`.

> **Nota sobre la versión:** el proyecto está configurado para Angular 21. Si al
> instalar tu entorno todavía no tiene publicados los paquetes `^21.0.0`, ajusta
> las versiones en `package.json` a la última estable disponible — el código no
> usa ninguna API exclusiva de una versión puntual, solo patrones ya estables
> (standalone components, signals, `@if`/`@for`, `inject()`, `input()`,
> formularios reactivos tipados), así que es compatible hacia atrás sin cambios.

## Arquitectura

Se usó una arquitectura por capas + *feature folders*, que es la más adecuada
para el tamaño de este ejercicio (evita el sobre-diseño de un monorepo con
librerías, pero separa claramente responsabilidades):

```
src/app/
  core/                         # Capa transversal, sin UI
    models/                     # Interfaces que reflejan 1:1 los DTOs de la API
      estudiante.model.ts
      materia.model.ts
      programa-academico.model.ts
    services/                   # Un servicio HTTP por controlador del backend
      estudiantes-api.service.ts
      catalogos-api.service.ts
    business/
      inscripcion-rules.ts      # Reglas de negocio como funciones puras (testeables)
  features/
    estudiantes/
      estudiantes-list/         # GET /Estudiantes
      estudiante-form/          # GET catálogos + POST /Estudiantes
      estudiante-companeros/    # GET /Estudiantes/:id + /:id/companeros
  app.component.ts              # Shell + navegación
  app.routes.ts                 # Rutas con lazy loading (loadComponent)
  app.config.ts                 # Bootstrap standalone: HttpClient + Router
```

**Por qué esta arquitectura:**
- `core/` no depende de Angular UI: los modelos son un espejo exacto de los
  JSON reales que compartiste, y las reglas de negocio son funciones puras
  (`validarSeleccionMaterias`, `calcularCreditos`) que no dependen de
  componentes ni de HTTP, así se pueden probar de forma aislada.
- `features/` agrupa cada pantalla junto a su lógica, sin un "god service" que
  mezcle estado de tres pantallas distintas.
- Standalone + `loadComponent` da code-splitting por ruta sin necesidad de
  `NgModule`s.
- Signals (`signal`, `computed`, `effect`) para el estado local en vez de
  variables sueltas: la UI se recalcula sola (créditos, validaciones,
  checkboxes deshabilitados) y todos los componentes usan
  `ChangeDetectionStrategy.OnPush`.
- `withComponentInputBinding()` conecta el parámetro `:id` de la ruta
  directamente al `input.required<string>()` del componente de compañeros,
  sin tocar `ActivatedRoute` a mano.

## Cómo ejecutar

```bash
npm install
npm start
```

La app corre en `http://localhost:4200` y llama directamente a tu backend en
`https://localhost:7084/api` (ver `src/environments/environment.ts`).

### Requisitos del lado del backend

1. **CORS**: el backend debe permitir el origen `http://localhost:4200`.
2. **Certificado de desarrollo**: como el backend usa HTTPS con certificado de
   desarrollo (`https://localhost:7084`), el navegador debe confiar en él.
   Con .NET: `dotnet dev-certs https --trust`. Si prefieres evitar el aviso de
   certificado durante pruebas, entra una vez a `https://localhost:7084` desde
   el navegador y acepta la excepción.

## Endpoints consumidos

| Acción | Método | Endpoint | Dónde se usa |
|---|---|---|---|
| Listar estudiantes | GET | `/api/Estudiantes` | `EstudiantesListComponent` |
| Detalle de estudiante | GET | `/api/Estudiantes/{id}` | `EstudianteCompanerosComponent` |
| Compañeros por materia | GET | `/api/Estudiantes/{id}/companeros` | `EstudianteCompanerosComponent` |
| Registrar estudiante | POST | `/api/Estudiantes` | `EstudianteFormComponent` |
| Catálogo de materias | GET | `/api/Catalogos/materias` | `EstudianteFormComponent` |
| Catálogo de programas | GET | `/api/Catalogos/programas-academicos` | `EstudianteFormComponent` |

> El backend compartido no expone `PUT`/`DELETE` de estudiantes, por eso la
> app solo implementa registro (crear) + consulta, que es exactamente la
> superficie de la API. Si el backend agrega edición/baja más adelante, basta
> con sumar los métodos correspondientes a `EstudiantesApiService` y un botón
> en `EstudiantesListComponent` — la arquitectura ya está preparada para eso.

## Trazabilidad de reglas del ejercicio

| # | Regla | Dónde se resuelve |
|---|---|---|
| 1 | Registro en línea del estudiante | `EstudianteFormComponent` → `POST /Estudiantes` |
| 2 | Programa de créditos | `academicProgramId` + `subjectIds` en el payload de registro |
| 3 | 10 materias | Catálogo real, `GET /Catalogos/materias` |
| 4 | 3 créditos por materia | Campo `credits` del catálogo, sumado en `calcularCreditos()` |
| 5 | Máximo 3 materias | `validarSeleccionMaterias()` + checkbox deshabilitado al llegar al tope |
| 6 | 5 profesores, 2 materias c/u | Campo `professor` del catálogo real |
| 7 | No repetir profesor | `validarSeleccionMaterias()` detecta profesor duplicado antes de habilitar el submit |
| 8 | Ver registros de otros estudiantes | `EstudiantesListComponent` lista a todos |
| 9 | Solo nombre de compañeros por materia | `GET /Estudiantes/:id/companeros`, renderizado tal cual en `EstudianteCompanerosComponent` |
