import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  calculateGrade,
  isPassing,
  calculateGPA,
  calculateTotalMarks,
  calculateAverage,
  calculateAttendancePercentage,
  isLowAttendance,
  Student,
  SubjectMarks,
  SUBJECTS,
  AVAILABLE_AVATARS,
  AVAILABLE_CLASSES,
  AttendanceRecord,
  Gender,
} from './student.model';
import { StudentService } from './student.service';

@Component({
  selector: 'app-student-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './student-details.html',
  styleUrl: './student-details.css',
})
export class StudentDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly studentService = inject(StudentService);

  readonly subjectsConfig = SUBJECTS;
  readonly avatarsList = AVAILABLE_AVATARS;
  readonly classesList = AVAILABLE_CLASSES;

  isEditing = false;
  confirmingDelete = false;

  // Edit fields
  editName = '';
  editClass = '10-A';
  editEmail = '';
  editPhone = '';
  editDob = '2008-01-01';
  editGender: Gender = 'Prefer not to say';
  editAvatar = '👨‍🎓';
  editParentName = '';
  editParentPhone = '';
  editParentRelation = 'Guardian';

  editMath: number | null = null;
  editScience: number | null = null;
  editEnglish: number | null = null;
  editHistory: number | null = null;
  editComputer: number | null = null;

  feedbackMessage: string | null = null;

  get student(): Student | undefined {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);
    if (!idParam || Number.isNaN(id)) {
      return undefined;
    }
    return this.studentService.getStudentById(id);
  }

  // Backward compatibility getter/setter for tests or legacy callers
  get editMarks(): number | null {
    if (this.editMath === null) return null;
    return Math.round(
      ((this.editMath +
        (this.editScience ?? 0) +
        (this.editEnglish ?? 0) +
        (this.editHistory ?? 0) +
        (this.editComputer ?? 0)) /
        5) *
        10,
    ) / 10;
  }

  set editMarks(val: number | null) {
    if (val !== null) {
      this.editMath = val;
      this.editScience = val;
      this.editEnglish = val;
      this.editHistory = val;
      this.editComputer = val;
    }
  }

  get grade(): string {
    return this.student ? calculateGrade(this.student.marks) : '';
  }

  get gpa(): number {
    return this.student ? calculateGPA(this.student.marks) : 0;
  }

  get totalMarks(): number {
    return this.student ? calculateTotalMarks(this.student.subjects) : 0;
  }

  get isPassing(): boolean {
    return this.student ? isPassing(this.student.marks) : false;
  }

  get rank(): number {
    return this.student ? this.studentService.getRank(this.student.id) : 0;
  }

  get attendanceRate(): number {
    return this.student ? calculateAttendancePercentage(this.student.attendanceRecords) : 100;
  }

  get isLowAtt(): boolean {
    return this.student ? isLowAttendance(this.student.attendanceRecords) : false;
  }

  get recentAttendance(): AttendanceRecord[] {
    if (!this.student?.attendanceRecords) return [];
    return [...this.student.attendanceRecords].slice(-5).reverse();
  }

  get diffFromAverage(): number {
    if (!this.student) return 0;
    const avg = this.studentService.getAverage();
    return Math.round((this.student.marks - avg) * 10) / 10;
  }

  get strongestSubject(): { label: string; marks: number } | null {
    if (!this.student) return null;
    const s = this.student.subjects;
    let highest = -1;
    let highestSubject = SUBJECTS[0];

    for (const subj of SUBJECTS) {
      const score = s[subj.key];
      if (score > highest) {
        highest = score;
        highestSubject = subj;
      }
    }
    return { label: highestSubject.label, marks: highest };
  }

  get weakestSubject(): { label: string; marks: number } | null {
    if (!this.student) return null;
    const s = this.student.subjects;
    let lowest = 101;
    let lowestSubject = SUBJECTS[0];

    for (const subj of SUBJECTS) {
      const score = s[subj.key];
      if (score < lowest) {
        lowest = score;
        lowestSubject = subj;
      }
    }
    return { label: lowestSubject.label, marks: lowest };
  }

  getSubjectScore(subjKey: keyof SubjectMarks): number {
    return this.student ? this.student.subjects[subjKey] : 0;
  }

  getSubjectGrade(subjKey: keyof SubjectMarks): string {
    return calculateGrade(this.getSubjectScore(subjKey));
  }

  isSubjectPassing(subjKey: keyof SubjectMarks): boolean {
    return isPassing(this.getSubjectScore(subjKey));
  }

  get prevStudentId(): number | null {
    if (!this.student) return null;
    const all = this.studentService.students;
    const currentIndex = all.findIndex((s) => s.id === this.student!.id);
    if (currentIndex > 0) {
      return all[currentIndex - 1].id;
    }
    return null;
  }

  get nextStudentId(): number | null {
    if (!this.student) return null;
    const all = this.studentService.students;
    const currentIndex = all.findIndex((s) => s.id === this.student!.id);
    if (currentIndex >= 0 && currentIndex < all.length - 1) {
      return all[currentIndex + 1].id;
    }
    return null;
  }

  startEdit(): void {
    if (!this.student) return;
    this.editName = this.student.name;
    this.editClass = this.student.className || '10-A';
    this.editEmail = this.student.email || '';
    this.editPhone = this.student.phone || '';
    this.editDob = this.student.dateOfBirth || '2008-01-01';
    this.editGender = this.student.gender || 'Prefer not to say';
    this.editAvatar = this.student.avatarUrl || '👨‍🎓';
    this.editParentName = this.student.parentContact?.name || '';
    this.editParentPhone = this.student.parentContact?.phone || '';
    this.editParentRelation = this.student.parentContact?.relationship || 'Guardian';

    const s = this.student.subjects;
    this.editMath = s.math;
    this.editScience = s.science;
    this.editEnglish = s.english;
    this.editHistory = s.history;
    this.editComputer = s.computer;
    this.isEditing = true;
    this.confirmingDelete = false;
    this.feedbackMessage = null;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editName = '';
  }

  saveEdit(): void {
    if (!this.student) return;

    const trimmedName = this.editName.trim();
    if (!trimmedName) {
      this.feedbackMessage = 'Please enter a valid student name.';
      return;
    }

    const m = this.editMath;
    const s = this.editScience;
    const e = this.editEnglish;
    const h = this.editHistory;
    const c = this.editComputer;

    const isValid = [m, s, e, h, c].every(
      (score) => score !== null && Number.isFinite(score) && score >= 0 && score <= 100,
    );

    if (!isValid) {
      this.feedbackMessage = 'All 5 subject marks must be numbers between 0 and 100.';
      return;
    }

    const updatedSubjects: SubjectMarks = {
      math: m!,
      science: s!,
      english: e!,
      history: h!,
      computer: c!,
    };

    const profileData: Partial<Student> = {
      className: this.editClass,
      email: this.editEmail.trim(),
      phone: this.editPhone.trim(),
      dateOfBirth: this.editDob,
      gender: this.editGender,
      avatarUrl: this.editAvatar,
      parentContact: {
        name: this.editParentName.trim(),
        phone: this.editParentPhone.trim(),
        relationship: this.editParentRelation,
      },
    };

    const success = this.studentService.updateStudent(
      this.student.id,
      trimmedName,
      updatedSubjects,
      profileData,
    );

    if (success) {
      this.isEditing = false;
      this.feedbackMessage = 'Student profile and subject marks updated successfully.';
      setTimeout(() => {
        this.feedbackMessage = null;
      }, 3500);
    }
  }

  requestDelete(): void {
    if (this.confirmingDelete) {
      this.deleteStudent();
    } else {
      this.confirmingDelete = true;
    }
  }

  deleteStudent(): void {
    if (!this.student) return;
    this.confirmingDelete = false;
    this.studentService.deleteStudent(this.student.id);
    this.router.navigate(['/students']);
  }
}
