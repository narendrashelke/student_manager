import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  calculateGrade,
  isPassing,
  calculateGPA,
  calculateAttendancePercentage,
  isLowAttendance,
  GradeLevel,
  SUBJECTS,
  SubjectKey,
  Student,
} from './student.model';
import { StudentService } from './student.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  readonly subjectsConfig = SUBJECTS;

  constructor(public readonly studentService: StudentService) {}

  get averageMarks(): number {
    return this.studentService.getAverage();
  }

  get classGPA(): number {
    return this.studentService.getClassGPA();
  }

  get attendanceRate(): number {
    return this.studentService.getClassAttendanceRate();
  }

  get lowAttendanceStudents(): Student[] {
    return this.studentService.getLowAttendanceStudents();
  }

  get passingStudents(): number {
    return this.studentService.getPassingCount();
  }

  get passRate(): number {
    return this.studentService.getPassRate();
  }

  get highestMarks(): number {
    return this.studentService.getHighestMarks();
  }

  get lowestMarks(): number {
    return this.studentService.getLowestMarks();
  }

  get recentStudents() {
    return this.studentService.getRecentStudents(5);
  }

  get topStudents() {
    return this.studentService.getTopStudents(3);
  }

  get gradeDistribution(): Record<GradeLevel, number> {
    return this.studentService.getGradeDistribution();
  }

  get subjectAverages(): Record<SubjectKey, number> {
    return this.studentService.getSubjectAverages();
  }

  getStudentGrade(marks: number): string {
    return calculateGrade(marks);
  }

  getStudentGPA(marks: number): number {
    return calculateGPA(marks);
  }

  getStudentAttendance(student: Student): number {
    return calculateAttendancePercentage(student.attendanceRecords);
  }

  hasLowAttendance(student: Student): boolean {
    return isLowAttendance(student.attendanceRecords);
  }

  isStudentPassing(marks: number): boolean {
    return isPassing(marks);
  }
}
