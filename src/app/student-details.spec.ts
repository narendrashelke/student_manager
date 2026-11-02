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
    expect(component.isPassing).toBe(true);
    expect(component.rank).toBeGreaterThan(0);
  });

  it('should enter edit mode, cancel edit mode, and save edit changes', () => {
    component.startEdit();
    expect(component.isEditing).toBe(true);
    expect(component.editName).toBe('Ayush');

    component.cancelEdit();
    expect(component.isEditing).toBe(false);

    component.startEdit();
    component.editName = 'Ayush Verma';
    component.editMarks = 98;
    component.saveEdit();

    expect(component.isEditing).toBe(false);
    expect(component.student?.name).toBe('Ayush Verma');
    expect(component.student?.marks).toBe(98);
  });

  it('should navigate to /students on delete', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.deleteStudent();
    expect(navigateSpy).toHaveBeenCalledWith(['/students']);
    expect(studentService.getStudentById(1)).toBeUndefined();
  });
});
