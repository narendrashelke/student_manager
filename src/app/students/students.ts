import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Student, calculateGrade, isPassing } from '../student.model';
import { StudentService } from '../student.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [DecimalPipe, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class Students {
  name = '';
  marks: number | null = null;
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
    const studentMarks = this.marks;

    if (
      !studentName ||
      studentMarks === null ||
      !Number.isFinite(studentMarks) ||
      studentMarks < 0 ||
      studentMarks > 100
    ) {
      this.showAlert('Please provide a valid name and marks between 0 and 100.', 'warning');
      return;
    }

    if (this.editingStudentId !== null) {
      const updated = this.studentService.updateStudent(
        this.editingStudentId,
        studentName,
        studentMarks,
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
      const created = this.studentService.addStudent(studentName, studentMarks);
      this.showAlert(
        `Student "${created.name}" added successfully with ID #${created.id}.`,
        'success',
      );
      this.name = '';
      this.marks = null;
    }
  }

  startEdit(student: Student): void {
    this.editingStudentId = student.id;
    this.name = student.name;
    this.marks = student.marks;
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
    this.name = '';
    this.marks = null;
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
      link.setAttribute('download', 'campusly_students.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      this.showAlert('Student records exported to CSV.', 'success');
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
