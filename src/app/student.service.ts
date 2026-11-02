import { Injectable } from '@angular/core';
import {
  Student,
  SubjectMarks,
  SubjectKey,
  SUBJECTS,
  calculateGrade,
  isPassing,
  calculateAverage,
  calculateGPA,
  createDefaultSubjects,
  GradeLevel,
} from './student.model';

const STORAGE_KEY = 'campusly_students_records_v2';
const API_URL = 'http://localhost:3000/students';

const DEFAULT_STUDENTS: Student[] = [
  {
    id: 1,
    name: 'Ayush',
    marks: 90,
    subjects: { math: 92, science: 88, english: 90, history: 86, computer: 94 },
  },
  {
    id: 2,
    name: 'John',
    marks: 85,
    subjects: { math: 80, science: 85, english: 88, history: 82, computer: 90 },
  },
  {
    id: 3,
    name: 'Alice',
    marks: 95,
    subjects: { math: 98, science: 96, english: 92, history: 94, computer: 95 },
  },
  {
    id: 4,
    name: 'Bob',
    marks: 80,
    subjects: { math: 78, science: 82, english: 75, history: 80, computer: 85 },
  },
];

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  students: Student[] = [];

  constructor() {
    this.loadFromStorage();
  }

  loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.students = parsed.map((item: any) => this.normalizeStudent(item));
          }
        }
      }
    } catch {
      // Storage read error, fall back to defaults
    }

    if (this.students.length === 0) {
      this.students = JSON.parse(JSON.stringify(DEFAULT_STUDENTS));
    }

    this.syncWithServer();
  }

  private async syncWithServer(): Promise<void> {
    try {
      if (
        typeof window !== 'undefined' &&
        typeof window.fetch === 'function' &&
        !navigator.userAgent.includes('jsdom')
      ) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        const response = await fetch(API_URL, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            this.students = data.map((item: any) => this.normalizeStudent(item));
            this.saveToStorage();
          }
        }
      }
    } catch {
      // json-server not running or aborted, keep existing local data
    }
  }

  saveToStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.students));
      }
    } catch {
      // Storage unavailable or quota exceeded
    }
  }

  private normalizeStudent(item: any): Student {
    const subjects: SubjectMarks = item.subjects
      ? {
          math: Number(item.subjects.math ?? 0),
          science: Number(item.subjects.science ?? 0),
          english: Number(item.subjects.english ?? 0),
          history: Number(item.subjects.history ?? 0),
          computer: Number(item.subjects.computer ?? 0),
        }
      : createDefaultSubjects(item.marks ?? 80);

    const calculatedAvg = calculateAverage(subjects);
    return {
      id: Number(item.id),
      name: String(item.name || '').trim(),
      marks: item.subjects ? calculatedAvg : Number(item.marks ?? calculatedAvg),
      subjects,
    };
  }

  getStudentById(id: number): Student | undefined {
    return this.students.find((student) => student.id === id);
  }

  addStudent(name: string, marksOrSubjects: number | SubjectMarks): Student {
    const nextId =
      this.students.reduce((maxId, student) => Math.max(maxId, student.id), 0) + 1;

    let subjects: SubjectMarks;
    let marks: number;

    if (typeof marksOrSubjects === 'number') {
      const safe = Math.min(100, Math.max(0, Math.round(marksOrSubjects)));
      subjects = createDefaultSubjects(safe);
      marks = safe;
    } else {
      subjects = {
        math: Math.min(100, Math.max(0, Math.round(marksOrSubjects.math))),
        science: Math.min(100, Math.max(0, Math.round(marksOrSubjects.science))),
        english: Math.min(100, Math.max(0, Math.round(marksOrSubjects.english))),
        history: Math.min(100, Math.max(0, Math.round(marksOrSubjects.history))),
        computer: Math.min(100, Math.max(0, Math.round(marksOrSubjects.computer))),
      };
      marks = calculateAverage(subjects);
    }

    const newStudent: Student = {
      id: nextId,
      name: name.trim(),
      marks,
      subjects,
    };

    this.students.push(newStudent);
    this.saveToStorage();

    if (
      typeof window !== 'undefined' &&
      typeof window.fetch === 'function' &&
      !navigator.userAgent.includes('jsdom')
    ) {
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      }).catch(() => {});
    }

    return newStudent;
  }

  updateStudent(
    id: number,
    name: string,
    marksOrSubjects: number | SubjectMarks,
  ): boolean {
    const index = this.students.findIndex((student) => student.id === id);
    if (index === -1) {
      return false;
    }

    let subjects: SubjectMarks;
    let marks: number;

    if (typeof marksOrSubjects === 'number') {
      const safe = Math.min(100, Math.max(0, Math.round(marksOrSubjects)));
      subjects = createDefaultSubjects(safe);
      marks = safe;
    } else {
      subjects = {
        math: Math.min(100, Math.max(0, Math.round(marksOrSubjects.math))),
        science: Math.min(100, Math.max(0, Math.round(marksOrSubjects.science))),
        english: Math.min(100, Math.max(0, Math.round(marksOrSubjects.english))),
        history: Math.min(100, Math.max(0, Math.round(marksOrSubjects.history))),
        computer: Math.min(100, Math.max(0, Math.round(marksOrSubjects.computer))),
      };
      marks = calculateAverage(subjects);
    }

    const updated: Student = {
      id,
      name: name.trim(),
      marks,
      subjects,
    };

    this.students[index] = updated;
    this.saveToStorage();

    if (
      typeof window !== 'undefined' &&
      typeof window.fetch === 'function' &&
      !navigator.userAgent.includes('jsdom')
    ) {
      fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(() => {});
    }

    return true;
  }

  deleteStudent(id: number): boolean {
    const initialLength = this.students.length;
    this.students = this.students.filter((student) => student.id !== id);
    const deleted = this.students.length < initialLength;
    if (deleted) {
      this.saveToStorage();

      if (
        typeof window !== 'undefined' &&
        typeof window.fetch === 'function' &&
        !navigator.userAgent.includes('jsdom')
      ) {
        fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
        }).catch(() => {});
      }
    }
    return deleted;
  }

  getAverage(): number {
    if (this.students.length === 0) {
      return 0;
    }
    const totalMarks = this.students.reduce((sum, student) => sum + student.marks, 0);
    return Math.round((totalMarks / this.students.length) * 10) / 10;
  }

  getClassGPA(): number {
    if (this.students.length === 0) {
      return 0.0;
    }
    const totalGpa = this.students.reduce(
      (sum, student) => sum + calculateGPA(student.marks),
      0,
    );
    return Math.round((totalGpa / this.students.length) * 10) / 10;
  }

  getSubjectAverages(): Record<SubjectKey, number> {
    const totals: Record<SubjectKey, number> = {
      math: 0,
      science: 0,
      english: 0,
      history: 0,
      computer: 0,
    };

    if (this.students.length === 0) {
      return totals;
    }

    for (const student of this.students) {
      for (const subj of SUBJECTS) {
        totals[subj.key] += student.subjects?.[subj.key] ?? student.marks;
      }
    }

    const averages: Record<SubjectKey, number> = {} as any;
    for (const subj of SUBJECTS) {
      averages[subj.key] = Math.round((totals[subj.key] / this.students.length) * 10) / 10;
    }

    return averages;
  }

  getHighestMarks(): number {
    if (this.students.length === 0) {
      return 0;
    }
    return Math.max(...this.students.map((student) => student.marks));
  }

  getLowestMarks(): number {
    if (this.students.length === 0) {
      return 0;
    }
    return Math.min(...this.students.map((student) => student.marks));
  }

  getPassingStudents(): Student[] {
    return this.students.filter((student) => isPassing(student.marks));
  }

  getPassingCount(): number {
    return this.getPassingStudents().length;
  }

  getPassRate(): number {
    if (this.students.length === 0) {
      return 0;
    }
    return Math.round((this.getPassingCount() / this.students.length) * 100);
  }

  getRecentStudents(count = 5): Student[] {
    return [...this.students]
      .sort((first, second) => second.id - first.id)
      .slice(0, count);
  }

  getTopStudents(count = 3): Student[] {
    return [...this.students]
      .sort((first, second) => second.marks - first.marks)
      .slice(0, count);
  }

  getRank(id: number): number {
    const sorted = [...this.students].sort((a, b) => b.marks - a.marks);
    const index = sorted.findIndex((student) => student.id === id);
    return index === -1 ? 0 : index + 1;
  }

  getGradeDistribution(): Record<GradeLevel, number> {
    const distribution: Record<GradeLevel, number> = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      F: 0,
    };

    for (const student of this.students) {
      const grade = calculateGrade(student.marks);
      distribution[grade] = (distribution[grade] || 0) + 1;
    }

    return distribution;
  }

  resetToDefault(): void {
    this.students = JSON.parse(JSON.stringify(DEFAULT_STUDENTS));
    this.saveToStorage();
  }

  exportToCsv(): string {
    const headers = [
      'ID',
      'Name',
      'Math',
      'Science',
      'English',
      'History',
      'Computer Science',
      'Total (500)',
      'Percentage (%)',
      'Grade',
      'GPA',
      'Status',
    ];

    const rows = this.students.map((student) => {
      const s = student.subjects || createDefaultSubjects(student.marks);
      const total = s.math + s.science + s.english + s.history + s.computer;
      const gpa = calculateGPA(student.marks);
      return [
        student.id,
        `"${student.name.replace(/"/g, '""')}"`,
        s.math,
        s.science,
        s.english,
        s.history,
        s.computer,
        total,
        student.marks,
        calculateGrade(student.marks),
        gpa.toFixed(1),
        isPassing(student.marks) ? 'Passed' : 'Failed',
      ];
    });

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }
}

