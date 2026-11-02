import { TestBed } from '@angular/core/testing';
import {
  calculateGrade,
  isPassing,
  calculateGPA,
  calculateTotalMarks,
  calculateAverage,
  calculateAttendancePercentage,
  isLowAttendance,
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

  it('should calculate attendance percentage and detect low attendance (<75%)', () => {
    // 3 present (3.0) + 1 late (0.5) + 1 excused (ignored) + 1 absent (0.0)
    // attended = 3.5, countable = 5 -> (3.5 / 5) * 100 = 70.0%
    const records = [
      { date: '2026-11-01', status: 'present' as const },
      { date: '2026-11-02', status: 'present' as const },
      { date: '2026-11-03', status: 'present' as const },
      { date: '2026-11-04', status: 'late' as const },
      { date: '2026-11-05', status: 'excused' as const },
      { date: '2026-11-06', status: 'absent' as const },
    ];
    expect(calculateAttendancePercentage(records)).toBe(70);
    expect(isLowAttendance(records)).toBe(true);

    // 4 present, 1 late -> attended = 4.5, countable = 5 -> 90% (not low)
    const goodRecords = [
      { date: '2026-11-01', status: 'present' as const },
      { date: '2026-11-02', status: 'present' as const },
      { date: '2026-11-03', status: 'present' as const },
      { date: '2026-11-04', status: 'present' as const },
      { date: '2026-11-05', status: 'late' as const },
    ];
    expect(calculateAttendancePercentage(goodRecords)).toBe(90);
    expect(isLowAttendance(goodRecords)).toBe(false);

    // Empty records default to 100% and not low attendance
    expect(calculateAttendancePercentage([])).toBe(100);
    expect(isLowAttendance([])).toBe(false);
  });

  it('should delete multiple students at once', () => {
    const initialCount = service.students.length;
    const deletedCount = service.deleteMultipleStudents([1, 2]);
    expect(deletedCount).toBe(2);
    expect(service.students.length).toBe(initialCount - 2);
    expect(service.getStudentById(1)).toBeUndefined();
    expect(service.getStudentById(2)).toBeUndefined();

    // Calling with non-existent IDs returns 0
    expect(service.deleteMultipleStudents([999, 1000])).toBe(0);
  });

  it('should apply grace marks to multiple students and cap at 100', () => {
    // Student 1 (Ayush): marks ~90
    // Student 4 (Bob): marks 80
    service.applyGraceMarks([1, 4], 5);

    const s4 = service.getStudentById(4);
    expect(s4?.marks).toBe(85); // 80 + 5
    expect(s4?.subjects.math).toBe(83); // 78 + 5

    // Add extra 50 marks -> should cap at 100
    service.applyGraceMarks([4], 50);
    const s4Capped = service.getStudentById(4);
    expect(s4Capped?.marks).toBe(100);
    expect(s4Capped?.subjects.math).toBe(100);
  });

  it('should assign a class/section to multiple students', () => {
    service.assignClassToMultiple([1, 2], '10-C');
    expect(service.getStudentById(1)?.className).toBe('10-C');
    expect(service.getStudentById(2)?.className).toBe('10-C');
  });

  it('should mark bulk attendance and record daily register status', () => {
    service.markBulkAttendance([1, 2, 3], '2026-11-05', 'late');

    const s1 = service.getStudentById(1);
    const s1Record = s1?.attendanceRecords?.find((r) => r.date === '2026-11-05');
    expect(s1Record?.status).toBe('late');

    // Updating existing date replaces it rather than duplicating
    service.markAttendance('2026-11-05', [{ studentId: 1, status: 'present' }]);
    const records = service.getStudentById(1)?.attendanceRecords?.filter((r) => r.date === '2026-11-05');
    expect(records?.length).toBe(1);
    expect(records?.[0].status).toBe('present');
  });

  it('should generate CSV template and import students correctly', () => {
    const template = service.generateCsvTemplate();
    expect(template).toContain('Name,Class,Email,Phone,Gender');
    expect(template).toContain('Math,Science,English,History,Computer');

    const validCsv = `Name,Class,Email,Phone,Gender,DateOfBirth,ParentName,ParentPhone,Math,Science,English,History,Computer
"Import Student A","10-A","import.a@school.edu","999-000-1111","Male","2008-04-12","Parent A","999-000-2222",85,90,75,80,95
"Import Student B","10-B","import.b@school.edu","999-000-3333","Female","2008-05-14","Parent B","999-000-4444",70,72,68,74,80`;

    const result = service.importStudentsFromCsv(validCsv);
    expect(result.successCount).toBe(2);
    expect(result.errors.length).toBe(0);

    const imported = service.students.find((s) => s.name === 'Import Student A');
    expect(imported).toBeDefined();
    expect(imported?.className).toBe('10-A');
    expect(imported?.email).toBe('import.a@school.edu');
    expect(imported?.subjects.math).toBe(85);
  });

  it('should report validation errors when importing invalid CSV rows', () => {
    const badCsv = `Name,Class,Gender,Email,Phone,ParentName,ParentPhone,Math,Science,English,History,Computer
"","10-A","Other","invalid-email","123","Parent","123",150,90,75,80,95`;

    const result = service.importStudentsFromCsv(badCsv);
    expect(result.successCount).toBe(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
