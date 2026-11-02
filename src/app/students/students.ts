import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  Student,
  SubjectMarks,
  SUBJECTS,
  AVAILABLE_AVATARS,
  AVAILABLE_CLASSES,
  AttendanceStatus,
  calculateGrade,
  isPassing,
  calculateGPA,
  calculateAttendancePercentage,
  isLowAttendance,
  Gender,
} from '../student.model';
import { StudentService } from '../student.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class Students {
  readonly subjectsList = SUBJECTS;
  readonly avatarsList = AVAILABLE_AVATARS;
  readonly classesList = AVAILABLE_CLASSES;

  activeTab: 'roster' | 'attendance' = 'roster';

  // --- Form fields ---
  name = '';
  className = '10-A';
  email = '';
  phone = '';
  dateOfBirth = '2008-01-01';
  gender: Gender = 'Prefer not to say';
  avatarUrl = '👨‍🎓';
  parentName = '';
  parentPhone = '';
  parentRelation = 'Guardian';

  math: number | null = 85;
  science: number | null = 85;
  english: number | null = 85;
  history: number | null = 85;
  computer: number | null = 85;

  // --- Filters & Sorting ---
  searchText = '';
  statusFilter: 'all' | 'pass' | 'fail' = 'all';
  classFilter = 'all';
  sortBy: 'id' | 'name' | 'marks' | 'attendance' = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  selectedStudent: Student | null = null;
  editingStudentId: number | null = null;
  confirmingDeleteId: number | null = null;

  // --- Bulk Selection ---
  selectedStudentIds = new Set<number>();
  bulkGraceMarks = 5;
  bulkTargetClass = '10-A';

  // --- Attendance Register ---
  attendanceDate = new Date().toISOString().substring(0, 10);
  attendanceDraft: Record<number, AttendanceStatus> = {};

  // --- CSV Import ---
  showImportModal = false;
  importCsvText = '';
  importErrors: string[] = [];
  importSuccessCount = 0;

  // --- Alerts ---
  alertMessage: string | null = null;
  alertType: 'success' | 'info' | 'warning' = 'success';

  constructor(public studentService: StudentService) {
    this.initAttendanceDraft();
  }

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
        student.id.toString().includes(search) ||
        (student.email && student.email.toLowerCase().includes(search)) ||
        (student.className && student.className.toLowerCase().includes(search));

      if (!matchesSearch) {
        return false;
      }

      if (this.classFilter !== 'all' && student.className !== this.classFilter) {
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
      } else if (this.sortBy === 'attendance') {
        comparison =
          calculateAttendancePercentage(a.attendanceRecords) -
          calculateAttendancePercentage(b.attendanceRecords);
      } else {
        comparison = a.id - b.id;
      }
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    return list;
  }

  get isAllSelected(): boolean {
    const visible = this.filteredStudents;
    return visible.length > 0 && visible.every((s) => this.selectedStudentIds.has(s.id));
  }

  toggleSelectAll(): void {
    const visible = this.filteredStudents;
    if (this.isAllSelected) {
      for (const s of visible) {
        this.selectedStudentIds.delete(s.id);
      }
    } else {
      for (const s of visible) {
        this.selectedStudentIds.add(s.id);
      }
    }
  }

  toggleSelectStudent(id: number): void {
    if (this.selectedStudentIds.has(id)) {
      this.selectedStudentIds.delete(id);
    } else {
      this.selectedStudentIds.add(id);
    }
  }

  clearSelection(): void {
    this.selectedStudentIds.clear();
  }

  // --- Bulk Actions ---
  executeBulkDelete(): void {
    const count = this.selectedStudentIds.size;
    if (count === 0) return;

    const confirmed =
      typeof window !== 'undefined' && typeof window.confirm === 'function' && !navigator.userAgent.includes('jsdom')
        ? window.confirm(`Permanently delete all ${count} selected students?`)
        : true;

    if (confirmed) {
      this.studentService.deleteMultipleStudents(Array.from(this.selectedStudentIds));
      this.selectedStudentIds.clear();
      this.selectedStudent = null;
      this.showAlert(`Deleted ${count} students.`, 'info');
    }
  }

  executeBulkGraceMarks(): void {
    const ids = Array.from(this.selectedStudentIds);
    if (ids.length === 0) return;
    this.studentService.applyGraceMarks(ids, this.bulkGraceMarks);
    this.showAlert(`Awarded +${this.bulkGraceMarks} grace marks to ${ids.length} students.`, 'success');
  }

  executeBulkAssignClass(): void {
    const ids = Array.from(this.selectedStudentIds);
    if (ids.length === 0) return;
    this.studentService.assignClassToMultiple(ids, this.bulkTargetClass);
    this.showAlert(`Assigned ${ids.length} students to Class ${this.bulkTargetClass}.`, 'success');
  }

  executeBulkMarkAttendance(status: AttendanceStatus): void {
    const ids = Array.from(this.selectedStudentIds);
    if (ids.length === 0) return;
    this.studentService.markBulkAttendance(ids, this.attendanceDate, status);
    this.initAttendanceDraft();
    this.showAlert(`Marked ${ids.length} students as ${status} on ${this.attendanceDate}.`, 'success');
  }

  // --- Attendance Register Management ---
  initAttendanceDraft(): void {
    this.attendanceDraft = {};
    for (const s of this.studentService.students) {
      const existing = s.attendanceRecords?.find((r) => r.date === this.attendanceDate);
      this.attendanceDraft[s.id] = existing ? existing.status : 'present';
    }
  }

  onAttendanceDateChange(): void {
    this.initAttendanceDraft();
  }

  setStudentAttendanceDraft(studentId: number, status: AttendanceStatus): void {
    this.attendanceDraft[studentId] = status;
  }

  markAllDraftPresent(): void {
    for (const s of this.studentService.students) {
      this.attendanceDraft[s.id] = 'present';
    }
  }

  saveAttendanceRegister(): void {
    const records = Object.entries(this.attendanceDraft).map(([idStr, status]) => ({
      studentId: Number(idStr),
      status,
    }));
    this.studentService.markAttendance(this.attendanceDate, records);
    this.showAlert(`Attendance register for ${this.attendanceDate} saved successfully.`, 'success');
  }

  getStudentAttendanceRate(student: Student): number {
    return calculateAttendancePercentage(student.attendanceRecords);
  }

  hasLowAttendance(student: Student): boolean {
    return isLowAttendance(student.attendanceRecords);
  }

  // --- Sort & Form Submission ---
  toggleSort(field: 'id' | 'name' | 'marks' | 'attendance'): void {
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

    const profileData: Partial<Student> = {
      className: this.className,
      email: this.email.trim() || `${studentName.toLowerCase().replace(/\s+/g, '.')}@campusly.edu`,
      phone: this.phone.trim(),
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      avatarUrl: this.avatarUrl,
      parentContact: {
        name: this.parentName.trim(),
        phone: this.parentPhone.trim(),
        relationship: this.parentRelation,
      },
    };

    if (this.editingStudentId !== null) {
      const updated = this.studentService.updateStudent(
        this.editingStudentId,
        studentName,
        subjectMarks,
        profileData,
      );
      if (updated) {
        if (this.selectedStudent?.id === this.editingStudentId) {
          this.selectedStudent =
            this.studentService.getStudentById(this.editingStudentId) || null;
        }
        this.showAlert(
          `Student #${this.editingStudentId} (${studentName}) profile updated.`,
          'success',
        );
      }
      this.cancelEdit();
    } else {
      const created = this.studentService.addStudent(studentName, subjectMarks, profileData);
      this.showAlert(
        `Enrolled student "${created.name}" in Class ${created.className}.`,
        'success',
      );
      this.resetForm();
    }
  }

  startEdit(student: Student): void {
    this.editingStudentId = student.id;
    this.name = student.name;
    this.className = student.className || '10-A';
    this.email = student.email || '';
    this.phone = student.phone || '';
    this.dateOfBirth = student.dateOfBirth || '2008-01-01';
    this.gender = student.gender || 'Prefer not to say';
    this.avatarUrl = student.avatarUrl || '👨‍🎓';
    this.parentName = student.parentContact?.name || '';
    this.parentPhone = student.parentContact?.phone || '';
    this.parentRelation = student.parentContact?.relationship || 'Guardian';

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
    this.className = '10-A';
    this.email = '';
    this.phone = '';
    this.dateOfBirth = '2008-01-01';
    this.gender = 'Prefer not to say';
    this.avatarUrl = '👨‍🎓';
    this.parentName = '';
    this.parentPhone = '';
    this.parentRelation = 'Guardian';

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
    this.selectedStudentIds.delete(id);
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
    this.selectedStudentIds.clear();
    this.cancelEdit();
    this.confirmingDeleteId = null;
    this.initAttendanceDraft();
    this.showAlert('Reset records to default demo data.', 'info');
  }

  // --- CSV Import / Export ---
  openImportModal(): void {
    this.showImportModal = true;
    this.importCsvText = '';
    this.importErrors = [];
    this.importSuccessCount = 0;
  }

  closeImportModal(): void {
    this.showImportModal = false;
  }

  downloadCsvTemplate(): void {
    const template = this.studentService.generateCsvTemplate();
    if (typeof window !== 'undefined') {
      const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'campusly_student_import_template.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  onCsvFileChange(event: any): void {
    const file = event.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.importCsvText = e.target.result || '';
    };
    reader.readAsText(file);
  }

  executeCsvImport(): void {
    if (!this.importCsvText.trim()) {
      this.importErrors = ['Please upload a CSV file or paste CSV content.'];
      return;
    }
    const result = this.studentService.importStudentsFromCsv(this.importCsvText);
    this.importErrors = result.errors;
    this.importSuccessCount = result.successCount;

    if (result.successCount > 0) {
      this.showAlert(`Successfully imported ${result.successCount} students!`, 'success');
      this.initAttendanceDraft();
      if (result.errors.length === 0) {
        this.closeImportModal();
      }
    }
  }

  exportCsv(): void {
    const csvContent = this.studentService.exportToCsv();
    if (typeof window !== 'undefined') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'campusly_student_roster.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      this.showAlert('Complete student roster & attendance exported to CSV.', 'success');
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
