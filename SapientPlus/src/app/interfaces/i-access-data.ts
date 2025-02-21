import { iMentor } from './i-mentor';
import { iStudent } from './i-student';
import { iUserBase } from './i-user-base';

export interface iAccessData {
  token: string;
  user: any;
  primoLogin: boolean;
}
