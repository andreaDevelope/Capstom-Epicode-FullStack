export interface iUserBase {
  id: number;
  email: string;
  password: string;
  username: string;
  nome: String;
  cognome: String;
  ruolo: 'student' | 'mentor';
  avatar: any;
  whatsapp: String;
  emailVerificata: boolean;
  primoLogin: boolean;
}
