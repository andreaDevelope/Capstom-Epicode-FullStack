import { iUserBase } from './i-user-base';
import { iFasciaOraria } from './i-fascia-oraria';
import { iMateria } from './i-materia';

export interface iMentor extends iUserBase {
  ruolo: 'mentor';
  materie: iMateria[];
  fasciaOrariaInizio: String;
  fasciaOrariaFine: String;
  compensoPerOra?: number;
  abbonamento: {
    attivo: boolean;
    scadenza: string;
  };
}
