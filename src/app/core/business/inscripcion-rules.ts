import { Materia } from '../models/materia.model';

export const MAX_MATERIAS_POR_ESTUDIANTE = 3;

export interface ResultadoValidacionInscripcion {
  valido: boolean;
  errores: string[];
}

/**
 * Reglas del ejercicio aplicadas del lado del cliente, en espejo de lo que
 * el backend debe validar también:
 *  - Máximo 3 materias por estudiante.
 *  - Un estudiante no puede tener dos materias dictadas por el mismo profesor.
 * Los créditos por materia y la relación profesor-materia vienen del catálogo
 * real (GET /Catalogos/materias), no están hardcodeados.
 */
export function validarSeleccionMaterias(materias: Materia[]): ResultadoValidacionInscripcion {
  const errores: string[] = [];

  if (materias.length === 0) {
    errores.push('Selecciona al menos una materia.');
  }

  if (materias.length > MAX_MATERIAS_POR_ESTUDIANTE) {
    errores.push(`Solo puedes seleccionar ${MAX_MATERIAS_POR_ESTUDIANTE} materias como máximo.`);
  }

  const profesorPorNombreMateria = new Map<string, string>();
  for (const materia of materias) {
    const conflicto = profesorPorNombreMateria.get(materia.professor);
    if (conflicto) {
      errores.push(`"${materia.name}" y "${conflicto}" comparten profesor (${materia.professor}).`);
    } else {
      profesorPorNombreMateria.set(materia.professor, materia.name);
    }
  }

  return { valido: errores.length === 0, errores };
}

export function calcularCreditos(materias: Materia[]): number {
  return materias.reduce((total, m) => total + m.credits, 0);
}
