import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Students } from './students';

describe('Students', () => {
  let component: Students;
  let fixture: ComponentFixture<Students>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Students],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Students);
    component = fixture.componentInstance;
    component.studentService.resetToDefault();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show a selected student and clear the selection when deleted', () => {
    const student = component.studentService.students[0];
    component.selectStudent(student);
    expect(component.selectedStudent).toEqual(student);

    component.deleteStudent(student.id);
    expect(component.selectedStudent).toBeNull();
    expect(component.studentService.students).not.toContain(student);
  });

  it('should filter students by search term', () => {
    component.searchText = 'Alice';
    expect(component.filteredStudents.length).toBe(1);
    expect(component.filteredStudents[0].name).toBe('Alice');

    component.searchText = '999';
    expect(component.filteredStudents.length).toBe(0);
  });

  it('should filter students by status', () => {
    component.studentService.addStudent('Failing Student', 25);

    component.statusFilter = 'pass';
    expect(component.filteredStudents.every((s) => s.marks >= 40)).toBe(true);

    component.statusFilter = 'fail';
    expect(component.filteredStudents.length).toBe(1);
    expect(component.filteredStudents[0].name).toBe('Failing Student');
  });

  it('should sort students by name and marks', () => {
    component.sortBy = 'name';
    component.sortDirection = 'asc';
    const firstStudent = component.filteredStudents[0];
    expect(firstStudent.name).toBe('Alice');

    component.toggleSort('name');
    expect(component.sortDirection).toBe('desc');
    expect(component.filteredStudents[0].name).toBe('John');

    component.toggleSort('marks');
    expect(component.sortBy).toBe('marks');
    expect(component.sortDirection).toBe('asc');
    expect(component.filteredStudents[0].marks).toBe(80);
  });

  it('should add a new student through form submission', () => {
    component.name = 'Test Student';
    component.marks = 88;
    component.submitForm();

    const created = component.studentService.students.find((s) => s.name === 'Test Student');
    expect(created).toBeTruthy();
    expect(created?.marks).toBe(88);
    expect(component.name).toBe('');
    expect(component.marks).toBeNull();
  });

  it('should not add a student with invalid data', () => {
    const initialCount = component.studentService.students.length;
    component.name = '   ';
    component.marks = 150;
    component.submitForm();
    expect(component.studentService.students.length).toBe(initialCount);
  });

  it('should edit an existing student and save changes', () => {
    const target = component.studentService.students[0];
    component.startEdit(target);
    expect(component.isEditing).toBe(true);
    expect(component.name).toBe(target.name);
    expect(component.marks).toBe(target.marks);

    component.name = 'Updated Name';
    component.marks = 99;
    component.submitForm();

    expect(component.isEditing).toBe(false);
    const updated = component.studentService.getStudentById(target.id);
    expect(updated?.name).toBe('Updated Name');
    expect(updated?.marks).toBe(99);
  });
});
