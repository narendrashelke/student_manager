import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { calculateGrade, isPassing, GradeLevel } from './student.model';
import { StudentService } from './student.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  constructor(public readonly studentService: StudentService) {}

  get averageMarks(): number {
    return this.studentService.getAverage();
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

  getStudentGrade(marks: number): string {
    return calculateGrade(marks);
  }

  isStudentPassing(marks: number): boolean {
    return isPassing(marks);
  }
}
