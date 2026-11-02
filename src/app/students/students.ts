import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  Student,
  SubjectMarks,
  SUBJECTS,
  calculateGrade,
  isPassing,
  calculateGPA,
  calculateAverage,
} from '../student.model';
import { StudentService } from '../student.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [DecimalPipe, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class Students {
  readonly subjectsList = SUBJECTS;

  name = '';
  math: number | null = 85;
  science: number | null = 85;
  english: number | null = 85;
  history: number | null = 85;
  computer: number | null = 85;

  searchText = '';
  statusFilter: 'all' | 'pass' | 'fail' = 'all';
  sortBy: 'id' | 'name' | 'marks' = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  selectedStudent: Student | null = null;
  editingStudentId: number | null = null;
  confirmingDeleteId: number | null = null;

  alertMessage: string | null = null;
  alertType: 'success' | 'info' | 'warning' = 'success';

  constructor(public studentService: StudentService) {}

  get isEditing(): boolean {
    return this.editingStudentId !== null;
  }

  // Backward compatibility getter/setter for tests or legacy callers
  get marks(): number | null {
    if (
      this.math === null &&
      this.science === null &&
      this.english === null &&
      this.history === null &&
      this.computer === null
    ) {
      return null;
    }
    return this.computedPercentage;
  }

  set marks(val: number | null) {
    if (val !== null && Number.isFinite(val)) {
      const safe = Math.min(100, Math.max(0, val));
      this.math = safe;
      this.science = safe;
      this.english = safe;
      this.history = safe;
      this.computer = safe;
    } else {
      this.math = null;
      this.science = null;
      this.english = null;
      this.history = null;
      this.computer = null;
    }
  }

  get computedTotal(): number {
    const m = this.math ?? 0;
    const s = this.science ?? 0;
    const e = this.english ?? 0;
    const h = this.history ?? 0;
    const c = this.computer ?? 0;
    return m + s + e + h + c;
  }

  get computedPercentage(): number {
    return Math.round((this.computedTotal / 5) * 10) / 10;
  }

  get computedGrade(): string {
    return calculateGrade(this.computedPercentage);
  }

  get computedGPA(): number {
    return calculateGPA(this.computedPercentage);
  }

  get filteredStudents(): Student[] {
    const search = this.searchText.trim().toLowerCase();

    let list = this.studentService.students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(search) ||
        student.id.toString().includes(search);

      if (!matchesSearch) {
        return false;
      }

      if (this.statusFilter === 'pass') {
        return isPassing(student.marks);
      }
      if (this.statusFilter === 'fail') {
        return !isPassing(student.marks);
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      let comparison = 0;
      if (this.sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (this.sortBy === 'marks') {
        comparison = a.marks - b.marks;
      } else {
        comparison = a.id - b.id;
      }
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    return list;
  }

  toggleSort(field: 'id' | 'name' | 'marks'): void {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc';
    }
  }

  submitForm(): void {
    const studentName = this.name.trim();

    if (!studentName) {
      this.showAlert('Please enter a student name.', 'warning');
      return;
    }

    const m = this.math;
    const s = this.science;
    const e = this.english;
    const h = this.history;
    const c = this.computer;

    const areSubjectsValid = [m, s, e, h, c].every(
      (score) => score !== null && Number.isFinite(score) && score >= 0 && score <= 100,
    );

    if (!areSubjectsValid) {
      this.showAlert('All 5 subject marks must be numbers between 0 and 100.', 'warning');
      return;
    }

    const subjectMarks: SubjectMarks = {
      math: m!,
      science: s!,
      english: e!,
      history: h!,
      computer: c!,
    };

    if (this.editingStudentId !== null) {
      const updated = this.studentService.updateStudent(
        this.editingStudentId,
        studentName,
        subjectMarks,
      );
      if (updated) {
        if (this.selectedStudent?.id === this.editingStudentId) {
          this.selectedStudent =
            this.studentService.getStudentById(this.editingStudentId) || null;
        }
        this.showAlert(
          `Student #${this.editingStudentId} updated successfully.`,
          'success',
        );
      }
      this.cancelEdit();
    } else {
      const created = this.studentService.addStudent(studentName, subjectMarks);
      this.showAlert(
        `Student "${created.name}" enrolled successfully with GPA ${calculateGPA(created.marks).toFixed(1)}.`,
        'success',
      );
      this.resetForm();
    }
  }

  startEdit(student: Student): void {
    this.editingStudentId = student.id;
    this.name = student.name;
    const s = student.subjects;
    this.math = s.math;
    this.science = s.science;
    this.english = s.english;
    this.history = s.history;
    this.computer = s.computer;
    this.confirmingDeleteId = null;

    if (
      typeof window !== 'undefined' &&
      typeof window.scrollTo === 'function' &&
      !navigator.userAgent.includes('jsdom')
    ) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  }

  cancelEdit(): void {
    this.editingStudentId = null;
    this.resetForm();
  }

  resetForm(): void {
    this.name = '';
    this.math = null;
    this.science = null;
    this.english = null;
    this.history = null;
    this.computer = null;
  }

  requestDelete(id: number): void {
    if (this.confirmingDeleteId === id) {
      this.deleteStudent(id);
    } else {
      this.confirmingDeleteId = id;
    }
  }

  deleteStudent(id: number): void {
    this.confirmingDeleteId = null;
    this.studentService.deleteStudent(id);
    if (this.selectedStudent?.id === id) {
      this.selectedStudent = null;
    }
    if (this.editingStudentId === id) {
      this.cancelEdit();
    }
    this.showAlert(`Student #${id} was deleted.`, 'info');
  }

  selectStudent(student: Student): void {
    this.selectedStudent = this.selectedStudent?.id === student.id ? null : student;
  }

  getStudentGrade(marks: number): string {
    return calculateGrade(marks);
  }

  getStudentGPA(marks: number): number {
    return calculateGPA(marks);
  }

  isStudentPassing(marks: number): boolean {
    return isPassing(marks);
  }

  resetDemoData(): void {
    this.studentService.resetToDefault();
    this.selectedStudent = null;
    this.cancelEdit();
    this.confirmingDeleteId = null;
    this.showAlert('Reset records to default demo data.', 'info');
  }

  exportCsv(): void {
    const csvContent = this.studentService.exportToCsv();
    if (typeof window !== 'undefined') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'campusly_student_grades.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      this.showAlert('Student records & grades exported to CSV.', 'success');
    }
  }

  showAlert(message: string, type: 'success' | 'info' | 'warning'): void {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      if (this.alertMessage === message) {
        this.alertMessage = null;
      }
    }, 4000);
  }
}
