import { iMateria } from './i-materia';
import { iUserBase } from './i-user-base';

export interface iStudent extends iUserBase {
  ruolo: 'student';
  materie?: iMateria[];
}
