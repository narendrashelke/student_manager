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

  it('should toggle multi-selection and select all / clear all', () => {
    expect(component.selectedStudentIds.size).toBe(0);
    expect(component.isAllSelected).toBe(false);

    // Toggle single student
    component.toggleSelectStudent(1);
    expect(component.selectedStudentIds.has(1)).toBe(true);
    expect(component.selectedStudentIds.size).toBe(1);

    // Toggle select all
    component.toggleSelectAll();
    expect(component.isAllSelected).toBe(true);
    expect(component.selectedStudentIds.size).toBe(component.filteredStudents.length);

    // Clear selection
    component.clearSelection();
    expect(component.selectedStudentIds.size).toBe(0);
  });

  it('should execute bulk actions (grace marks, assign class, and bulk delete)', () => {
    // Select students 1 and 2
    component.toggleSelectStudent(1);
    component.toggleSelectStudent(2);
    expect(component.selectedStudentIds.size).toBe(2);

    // Bulk grace marks
    component.bulkGraceMarks = 5;
    component.executeBulkGraceMarks();
    expect(component.alertMessage).toContain('grace marks');

    // Bulk assign class
    component.bulkTargetClass = '10-C';
    component.executeBulkAssignClass();
    expect(component.studentService.getStudentById(1)?.className).toBe('10-C');
    expect(component.studentService.getStudentById(2)?.className).toBe('10-C');

    // Bulk delete
    component.executeBulkDelete();
    expect(component.selectedStudentIds.size).toBe(0);
    expect(component.studentService.getStudentById(1)).toBeUndefined();
    expect(component.studentService.getStudentById(2)).toBeUndefined();
  });

  it('should switch between roster and attendance view tabs', () => {
    expect(component.activeTab).toBe('roster');
    component.activeTab = 'attendance';
    component.initAttendanceDraft();
    expect(component.activeTab).toBe('attendance');
    expect(Object.keys(component.attendanceDraft).length).toBeGreaterThan(0);

    // Set attendance draft for student 3
    component.setStudentAttendanceDraft(3, 'absent');
    expect(component.attendanceDraft[3]).toBe('absent');

    // Quick mark all present
    component.markAllDraftPresent();
    expect(component.attendanceDraft[3]).toBe('present');

    // Save attendance register
    component.saveAttendanceRegister();
    expect(component.alertMessage).toContain('saved successfully');
    const rec = component.studentService.getStudentById(3)?.attendanceRecords?.find((r) => r.date === component.attendanceDate);
    expect(rec?.status).toBe('present');
  });

  it('should manage CSV import modal and process file uploads', () => {
    expect(component.showImportModal).toBe(false);
    component.openImportModal();
    expect(component.showImportModal).toBe(true);

    const validCsv = `Name,Class,Gender,Email,Phone,ParentName,ParentPhone,Math,Science,English,History,Computer
"Modal Import Student","10-A","Female","modal@school.edu","555-010-0101","Parent M","555-010-0102",88,90,92,85,91`;

    component.importCsvText = validCsv;
    component.executeCsvImport();
    expect(component.importSuccessCount).toBe(1);
    expect(component.importErrors.length).toBe(0);

    // Verify modal can close
    component.closeImportModal();
    expect(component.showImportModal).toBe(false);
  });
});
