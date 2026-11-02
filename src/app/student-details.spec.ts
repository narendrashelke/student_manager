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

  it('should navigate to /students on delete', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.deleteStudent();
    expect(navigateSpy).toHaveBeenCalledWith(['/students']);
    expect(studentService.getStudentById(1)).toBeUndefined();
  });
});
