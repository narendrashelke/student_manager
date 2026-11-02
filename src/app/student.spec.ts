import { TestBed } from '@angular/core/testing';
import {
  calculateGrade,
  isPassing,
  calculateGPA,
  calculateTotalMarks,
  calculateAverage,
} from './student.model';
import { StudentService } from './student.service';

describe('StudentService', () => {
  let service: StudentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentService);
    service.resetToDefault();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.students.length).toBeGreaterThan(0);
  });

  it('should generate a unique next student ID on add', () => {
    const s1 = service.addStudent('Taylor', 88);
    const s2 = service.addStudent('Morgan', {
      math: 90,
      science: 92,
      english: 91,
      history: 89,
      computer: 93,
    });

    expect(s1.id).toBe(5);
    expect(s2.id).toBe(6);
    expect(service.getStudentById(5)?.name).toBe('Taylor');
    expect(service.getStudentById(6)?.marks).toBe(91);
  });

  it('should update an existing student with subjects', () => {
    const success = service.updateStudent(1, 'Ayush Kumar', {
      math: 95,
      science: 95,
      english: 95,
      history: 95,
      computer: 95,
    });
    expect(success).toBe(true);
    const updated = service.getStudentById(1);
    expect(updated?.name).toBe('Ayush Kumar');
    expect(updated?.marks).toBe(95);
    expect(updated?.subjects.math).toBe(95);
  });

  it('should return false when updating non-existent student', () => {
    const success = service.updateStudent(9999, 'Ghost', 50);
    expect(success).toBe(false);
  });

  it('should delete student correctly', () => {
    const deleted = service.deleteStudent(2);
    expect(deleted).toBe(true);
    expect(service.getStudentById(2)).toBeUndefined();
    expect(service.deleteStudent(9999)).toBe(false);
  });

  it('should compute class average accurately and return 0 when class is empty', () => {
    // 90 + 85 + 95 + 80 = 350 / 4 = 87.5
    expect(service.getAverage()).toBe(87.5);

    service.students = [];
    expect(service.getAverage()).toBe(0);
  });

  it('should compute class GPA and subject averages', () => {
    const gpa = service.getClassGPA();
    expect(gpa).toBeGreaterThan(3.0);
    expect(gpa).toBeLessThanOrEqual(4.0);

    const subAverages = service.getSubjectAverages();
    expect(subAverages.math).toBeDefined();
    expect(subAverages.science).toBeDefined();
    expect(subAverages.english).toBeDefined();
    expect(subAverages.history).toBeDefined();
    expect(subAverages.computer).toBeDefined();
  });

  it('should compute highest and lowest marks', () => {
    expect(service.getHighestMarks()).toBe(95);
    expect(service.getLowestMarks()).toBe(80);

    service.students = [];
    expect(service.getHighestMarks()).toBe(0);
    expect(service.getLowestMarks()).toBe(0);
  });

  it('should compute passing count and pass rate', () => {
    expect(service.getPassingCount()).toBe(4);
    expect(service.getPassRate()).toBe(100);

    service.addStudent('Failing Student', 35);
    expect(service.getPassingCount()).toBe(4);
    expect(service.getPassRate()).toBe(80);
  });

  it('should calculate student class rank correctly', () => {
    // Alice has 95 (highest => rank 1)
    expect(service.getRank(3)).toBe(1);
    // Ayush has 90 => rank 2
    expect(service.getRank(1)).toBe(2);
    // Non-existent ID returns 0
    expect(service.getRank(999)).toBe(0);
  });

  it('should compute grade distribution', () => {
    const dist = service.getGradeDistribution();
    // 90: A, 85: B, 95: A, 80: B
    expect(dist.A).toBe(2);
    expect(dist.B).toBe(2);
    expect(dist.F).toBe(0);
  });

  it('should export records to CSV format with multi-subject columns', () => {
    const csv = service.exportToCsv();
    expect(csv).toContain('Math,Science,English,History,Computer Science');
    expect(csv).toContain('Total (500),Percentage (%),Grade,GPA,Status');
    expect(csv).toContain('"Ayush"');
    expect(csv).toContain('Passed');
  });

  it('should evaluate calculateGrade, calculateGPA, and helper functions correctly', () => {
    expect(calculateGrade(95)).toBe('A');
    expect(calculateGrade(85)).toBe('B');
    expect(calculateGrade(75)).toBe('C');
    expect(calculateGrade(65)).toBe('D');
    expect(calculateGrade(45)).toBe('E');
    expect(calculateGrade(30)).toBe('F');

    expect(isPassing(40)).toBe(true);
    expect(isPassing(39)).toBe(false);

    expect(calculateGPA(95)).toBe(4.0);
    expect(calculateGPA(85)).toBe(3.5);
    expect(calculateGPA(75)).toBe(2.5);
    expect(calculateGPA(30)).toBe(0.0);

    const subjects = { math: 90, science: 80, english: 70, history: 60, computer: 100 };
    expect(calculateTotalMarks(subjects)).toBe(400);
    expect(calculateAverage(subjects)).toBe(80);
  });
});
