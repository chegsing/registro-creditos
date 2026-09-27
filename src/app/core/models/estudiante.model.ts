/** Forma devuelta por GET /Estudiantes, GET /Estudiantes/:id */
export interface Estudiante {
  id: number;
  firstName: string;
  lastName: string;
  academicProgram: string;
  subjects: string[];
}

/** Payload de POST /Estudiantes */
export interface CrearEstudianteRequest {
  identificationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  academicProgramId: number;
  subjectIds: number[];
}

/** Forma de un compañero dentro de GET /Estudiantes/:id/companeros */
export interface Companero {
  firstName: string;
  lastName: string;
}

/** Un grupo (materia + compañeros) dentro de GET /Estudiantes/:id/companeros */
export interface MateriaConCompaneros {
  subject: string;
  classmates: Companero[];
}
