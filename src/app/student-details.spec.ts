import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { StudentDetails } from './student-details';
import { StudentService } from './student.service';

describe('StudentDetails', () => {
  let component: StudentDetails;
  let fixture: ComponentFixture<StudentDetails>;
  let studentService: StudentService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentDetails],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? '1' : null),
              },
            },
          },
        },
      ],
    }).compileComponents();

    studentService = TestBed.inject(StudentService);
    studentService.resetToDefault();
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(StudentDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create and load student details from route', () => {
    expect(component).toBeTruthy();
    expect(component.student).toBeDefined();
    expect(component.student?.name).toBe('Ayush');
    expect(component.grade).toBe('A');
    expect(component.gpa).toBe(4.0);
    expect(component.totalMarks).toBe(450);
    expect(component.isPassing).toBe(true);
    expect(component.rank).toBeGreaterThan(0);
    expect(component.strongestSubject?.label).toBe('Computer Science');
    expect(component.weakestSubject?.label).toBe('History');
  });

  it('should enter edit mode, cancel edit mode, and save edit changes', () => {
    component.startEdit();
    expect(component.isEditing).toBe(true);
    expect(component.editName).toBe('Ayush');
    expect(component.editMath).toBe(92);

    component.cancelEdit();
    expect(component.isEditing).toBe(false);

    component.startEdit();
    component.editName = 'Ayush Verma';
    component.editMath = 98;
    component.editScience = 98;
    component.editEnglish = 98;
    component.editHistory = 98;
    component.editComputer = 98;
    component.saveEdit();

    expect(component.isEditing).toBe(false);
    expect(component.student?.name).toBe('Ayush Verma');
    expect(component.student?.marks).toBe(98);
    expect(component.totalMarks).toBe(490);
  });

  it('should display rich profile fields and attendance summary', () => {
    expect(component.student?.email).toBe('ayush.sharma@campusly.edu');
    expect(component.student?.phone).toBe('+91 98765 43210');
    expect(component.student?.className).toBe('10-A');
    expect(component.student?.parentContact?.name).toBe('Rakesh Sharma');
    expect(component.attendanceRate).toBeGreaterThan(0);
    expect(component.recentAttendance.length).toBeGreaterThan(0);
  });

  it('should allow editing and saving rich profile details', () => {
    component.startEdit();
    component.editEmail = 'new.ayush@school.edu';
    component.editPhone = '+91 90000 00000';
    component.editClass = '10-B';
    component.editParentName = 'Sunita Kumar';
    component.editParentRelation = 'Mother';
    component.saveEdit();

    expect(component.student?.email).toBe('new.ayush@school.edu');
    expect(component.student?.phone).toBe('+91 90000 00000');
    expect(component.student?.className).toBe('10-B');
    expect(component.student?.parentContact?.name).toBe('Sunita Kumar');
    expect(component.student?.parentContact?.relationship).toBe('Mother');
  });

  it('should navigate to /students on delete', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.deleteStudent();
    expect(navigateSpy).toHaveBeenCalledWith(['/students']);
    expect(studentService.getStudentById(1)).toBeUndefined();
  });
});
