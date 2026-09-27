/** Forma devuelta por GET /Catalogos/materias */
export interface Materia {
  id: number;
  code: string;
  name: string;
  credits: number;
  professor: string;
}
