export interface iRecensione {
  id: number;
  mentorId: number;
  studenteId: number;
  stelle: number;
  commento?: string;
  dataRecensione: string;
}
