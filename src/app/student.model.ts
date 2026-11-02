export interface Student {
  id: number;
  name: string;
  marks: number;
}

export type GradeLevel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export function calculateGrade(marks: number): GradeLevel {
  if (marks >= 90) return 'A';
  if (marks >= 80) return 'B';
  if (marks >= 70) return 'C';
  if (marks >= 60) return 'D';
  if (marks >= 40) return 'E';
  return 'F';
}

export function isPassing(marks: number): boolean {
  return marks >= 40;
}
