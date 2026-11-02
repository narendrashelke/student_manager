export interface SubjectMarks {
  math: number;
  science: number;
  english: number;
  history: number;
  computer: number;
}

export type SubjectKey = keyof SubjectMarks;

export interface SubjectConfig {
  key: SubjectKey;
  label: string;
  icon: string;
  maxMarks: number;
}

export const SUBJECTS: SubjectConfig[] = [
  { key: 'math', label: 'Mathematics', icon: '📐', maxMarks: 100 },
  { key: 'science', label: 'Science', icon: '🔬', maxMarks: 100 },
  { key: 'english', label: 'English', icon: '📖', maxMarks: 100 },
  { key: 'history', label: 'History', icon: '🏛️', maxMarks: 100 },
  { key: 'computer', label: 'Computer Science', icon: '💻', maxMarks: 100 },
];

export interface Student {
  id: number;
  name: string;
  marks: number; // overall percentage (0-100)
  subjects: SubjectMarks;
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

export function calculateTotalMarks(subjects: SubjectMarks): number {
  return (
    subjects.math +
    subjects.science +
    subjects.english +
    subjects.history +
    subjects.computer
  );
}

export function calculateAverage(subjects: SubjectMarks): number {
  return Math.round((calculateTotalMarks(subjects) / 5) * 10) / 10;
}

export function calculateGPA(percentage: number): number {
  if (percentage >= 90) return 4.0;
  if (percentage >= 80) return Math.round((3.0 + (percentage - 80) * 0.1) * 10) / 10;
  if (percentage >= 70) return Math.round((2.0 + (percentage - 70) * 0.1) * 10) / 10;
  if (percentage >= 60) return Math.round((1.0 + (percentage - 60) * 0.1) * 10) / 10;
  if (percentage >= 40) return Math.round(((percentage - 40) / 20) * 10) / 10;
  return 0.0;
}

export function createDefaultSubjects(baseScore = 80): SubjectMarks {
  const safeBase = Math.min(100, Math.max(0, Math.round(baseScore)));
  return {
    math: safeBase,
    science: safeBase,
    english: safeBase,
    history: safeBase,
    computer: safeBase,
  };
}
