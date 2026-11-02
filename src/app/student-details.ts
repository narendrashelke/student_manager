import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { calculateGrade, isPassing, Student } from './student.model';
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

  isEditing = false;
  confirmingDelete = false;
  editName = '';
  editMarks: number | null = null;
  feedbackMessage: string | null = null;

  get student(): Student | undefined {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);
    if (!idParam || Number.isNaN(id)) {
      return undefined;
    }
    return this.studentService.getStudentById(id);
  }

  get grade(): string {
    return this.student ? calculateGrade(this.student.marks) : '';
  }

  get isPassing(): boolean {
    return this.student ? isPassing(this.student.marks) : false;
  }

  get rank(): number {
    return this.student ? this.studentService.getRank(this.student.id) : 0;
  }

  get diffFromAverage(): number {
    if (!this.student) return 0;
    const avg = this.studentService.getAverage();
    return Math.round((this.student.marks - avg) * 10) / 10;
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
    this.editMarks = this.student.marks;
    this.isEditing = true;
    this.confirmingDelete = false;
    this.feedbackMessage = null;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editName = '';
    this.editMarks = null;
  }

  saveEdit(): void {
    if (!this.student) return;

    const trimmedName = this.editName.trim();
    if (
      !trimmedName ||
      this.editMarks === null ||
      !Number.isFinite(this.editMarks) ||
      this.editMarks < 0 ||
      this.editMarks > 100
    ) {
      this.feedbackMessage = 'Please enter a valid name and marks between 0 and 100.';
      return;
    }

    const success = this.studentService.updateStudent(
      this.student.id,
      trimmedName,
      this.editMarks,
    );

    if (success) {
      this.isEditing = false;
      this.feedbackMessage = 'Student details updated successfully.';
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
