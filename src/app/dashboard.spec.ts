import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Dashboard } from './dashboard';
import { StudentService } from './student.service';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let service: StudentService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([])],
    }).compileComponents();

    service = TestBed.inject(StudentService);
    service.resetToDefault();
    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute dashboard metrics and class GPA accurately', () => {
    expect(component.averageMarks).toBe(87.5);
    expect(component.classGPA).toBeGreaterThan(3.0);
    expect(component.passingStudents).toBe(4);
    expect(component.passRate).toBe(100);
    expect(component.highestMarks).toBe(95);
    expect(component.lowestMarks).toBe(80);
    expect(component.subjectAverages.math).toBeDefined();
    expect(component.getStudentGPA(90)).toBe(4.0);
  });

  it('should return recent and top students', () => {
    const recent = component.recentStudents;
    expect(recent.length).toBeLessThanOrEqual(5);

    const top = component.topStudents;
    expect(top.length).toBeLessThanOrEqual(3);
    expect(top[0].marks).toBeGreaterThanOrEqual(top[1].marks);
  });

  it('should return grade distribution', () => {
    const dist = component.gradeDistribution;
    expect(dist).toBeDefined();
    expect(dist.A).toBeGreaterThanOrEqual(1);
  });

  it('should compute overall attendance rate and identify low attendance students', () => {
    expect(component.attendanceRate).toBeGreaterThan(0);
    expect(component.attendanceRate).toBeLessThanOrEqual(100);

    const lowAtt = component.lowAttendanceStudents;
    expect(Array.isArray(lowAtt)).toBe(true);
    // Student 4 Bob has 50% attendance in defaults (< 75%)
    expect(lowAtt.some((s) => s.name === 'Bob')).toBe(true);
  });
});
