export type PersonalRecordType = '1RM' | 'Volume' | 'Weight at Reps' | 'Total Reps';

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  type: PersonalRecordType;
  value: number;
  date: Date;
  reps: number;
}
