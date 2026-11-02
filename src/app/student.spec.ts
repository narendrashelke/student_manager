import { TestBed } from '@angular/core/testing';
import { calculateGrade, isPassing } from './student.model';
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
    const s2 = service.addStudent('Morgan', 91);

    expect(s1.id).toBe(5);
    expect(s2.id).toBe(6);
    expect(service.getStudentById(5)?.name).toBe('Taylor');
  });

  it('should update an existing student', () => {
    const success = service.updateStudent(1, 'Ayush Kumar', 96);
    expect(success).toBe(true);
    const updated = service.getStudentById(1);
    expect(updated?.name).toBe('Ayush Kumar');
    expect(updated?.marks).toBe(96);
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

  it('should export records to CSV format', () => {
    const csv = service.exportToCsv();
    expect(csv).toContain('ID,Name,Marks,Grade,Status');
    expect(csv).toContain('"Ayush"');
    expect(csv).toContain('Passed');
  });

  it('should evaluate calculateGrade and isPassing correctly', () => {
    expect(calculateGrade(95)).toBe('A');
    expect(calculateGrade(85)).toBe('B');
    expect(calculateGrade(75)).toBe('C');
    expect(calculateGrade(65)).toBe('D');
    expect(calculateGrade(45)).toBe('E');
    expect(calculateGrade(30)).toBe('F');

    expect(isPassing(40)).toBe(true);
    expect(isPassing(39)).toBe(false);
  });
});
