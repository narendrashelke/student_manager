import { Injectable } from '@angular/core';
import { Student, calculateGrade, isPassing, GradeLevel } from './student.model';

const STORAGE_KEY = 'campusly_students_records';

const DEFAULT_STUDENTS: Student[] = [
  { id: 1, name: 'Ayush', marks: 90 },
  { id: 2, name: 'John', marks: 85 },
  { id: 3, name: 'Alice', marks: 95 },
  { id: 4, name: 'Bob', marks: 80 },
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
            this.students = parsed;
            return;
          }
        }
      }
    } catch {
      // Local storage disabled or corrupted, fall back to defaults
    }
    this.students = [...DEFAULT_STUDENTS];
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

  getStudentById(id: number): Student | undefined {
    return this.students.find((student) => student.id === id);
  }

  addStudent(name: string, marks: number): Student {
    const nextId =
      this.students.reduce((maxId, student) => Math.max(maxId, student.id), 0) + 1;

    const newStudent: Student = {
      id: nextId,
      name: name.trim(),
      marks: Math.min(100, Math.max(0, Math.round(marks))),
    };

    this.students.push(newStudent);
    this.saveToStorage();
    return newStudent;
  }

  updateStudent(id: number, name: string, marks: number): boolean {
    const index = this.students.findIndex((student) => student.id === id);
    if (index === -1) {
      return false;
    }

    this.students[index] = {
      ...this.students[index],
      name: name.trim(),
      marks: Math.min(100, Math.max(0, Math.round(marks))),
    };

    this.saveToStorage();
    return true;
  }

  deleteStudent(id: number): boolean {
    const initialLength = this.students.length;
    this.students = this.students.filter((student) => student.id !== id);
    const deleted = this.students.length < initialLength;
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  getAverage(): number {
    if (this.students.length === 0) {
      return 0;
    }
    const totalMarks = this.students.reduce((sum, student) => sum + student.marks, 0);
    return totalMarks / this.students.length;
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
    this.students = [...DEFAULT_STUDENTS];
    this.saveToStorage();
  }

  exportToCsv(): string {
    const headers = ['ID', 'Name', 'Marks', 'Grade', 'Status'];
    const rows = this.students.map((student) => [
      student.id,
      `"${student.name.replace(/"/g, '""')}"`,
      student.marks,
      calculateGrade(student.marks),
      isPassing(student.marks) ? 'Passed' : 'Failed',
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }
}
