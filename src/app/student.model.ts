export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}

export interface ParentContact {
  name?: string;
  phone?: string;
  relationship?: string;
}

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

export const AVAILABLE_AVATARS: string[] = [
  '👨‍🎓', '👩‍🎓', '🧑‍🎓', '👨‍💻', '👩‍💻', '🧑‍🔬', '👨‍🎨', '👩‍🏫', '🚀', '⭐', '🦁', '🦉'
];

export const AVAILABLE_CLASSES: string[] = ['10-A', '10-B', '11-A', '11-B', '12-A'];

export interface Student {
  id: number;
  name: string;
  marks: number; // overall percentage (0-100)
  subjects: SubjectMarks;

  // Rich Profile fields
  email?: string;
  phone?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  gender?: Gender;
  className?: string; // e.g. "10-A"
  parentContact?: ParentContact;
  avatarUrl?: string; // emoji icon or image URL

  // Attendance Module
  attendanceRecords?: AttendanceRecord[];
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

export function calculateAttendancePercentage(records: AttendanceRecord[] = []): number {
  if (!records || records.length === 0) {
    return 100.0;
  }

  let attended = 0;
  let countable = 0;

  for (const r of records) {
    if (r.status === 'present') {
      attended += 1;
      countable += 1;
    } else if (r.status === 'late') {
      attended += 0.5;
      countable += 1;
    } else if (r.status === 'absent') {
      countable += 1;
    }
    // 'excused' does not count against total countable sessions
  }

  if (countable === 0) {
    return 100.0;
  }

  return Math.round((attended / countable) * 1000) / 10;
}

export function isLowAttendance(records: AttendanceRecord[] = []): boolean {
  return calculateAttendancePercentage(records) < 75.0;
}
