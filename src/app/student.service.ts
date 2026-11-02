import { Injectable } from '@angular/core';
import {
  Student,
  SubjectMarks,
  SubjectKey,
  SUBJECTS,
  AttendanceRecord,
  AttendanceStatus,
  calculateGrade,
  isPassing,
  calculateAverage,
  calculateGPA,
  createDefaultSubjects,
  calculateAttendancePercentage,
  isLowAttendance,
  GradeLevel,
} from './student.model';

const STORAGE_KEY = 'campusly_students_records_v3';
const API_URL = 'http://localhost:3000/students';

const SAMPLE_ATTENDANCE_AYUSH: AttendanceRecord[] = [
  { date: '2026-10-20', status: 'present' },
  { date: '2026-10-21', status: 'present' },
  { date: '2026-10-22', status: 'present' },
  { date: '2026-10-23', status: 'late' },
  { date: '2026-10-24', status: 'present' },
  { date: '2026-10-27', status: 'present' },
  { date: '2026-10-28', status: 'present' },
  { date: '2026-10-29', status: 'excused' },
  { date: '2026-10-30', status: 'present' },
  { date: '2026-10-31', status: 'present' },
];

const SAMPLE_ATTENDANCE_JOHN: AttendanceRecord[] = [
  { date: '2026-10-20', status: 'present' },
  { date: '2026-10-21', status: 'absent' },
  { date: '2026-10-22', status: 'present' },
  { date: '2026-10-23', status: 'present' },
  { date: '2026-10-24', status: 'late' },
  { date: '2026-10-27', status: 'present' },
  { date: '2026-10-28', status: 'present' },
  { date: '2026-10-29', status: 'present' },
  { date: '2026-10-30', status: 'absent' },
  { date: '2026-10-31', status: 'present' },
];

const SAMPLE_ATTENDANCE_ALICE: AttendanceRecord[] = [
  { date: '2026-10-20', status: 'present' },
  { date: '2026-10-21', status: 'present' },
  { date: '2026-10-22', status: 'present' },
  { date: '2026-10-23', status: 'present' },
  { date: '2026-10-24', status: 'present' },
  { date: '2026-10-27', status: 'present' },
  { date: '2026-10-28', status: 'present' },
  { date: '2026-10-29', status: 'present' },
  { date: '2026-10-30', status: 'present' },
  { date: '2026-10-31', status: 'present' },
];

const SAMPLE_ATTENDANCE_BOB: AttendanceRecord[] = [
  { date: '2026-10-20', status: 'absent' },
  { date: '2026-10-21', status: 'absent' },
  { date: '2026-10-22', status: 'present' },
  { date: '2026-10-23', status: 'absent' },
  { date: '2026-10-24', status: 'late' },
  { date: '2026-10-27', status: 'present' },
  { date: '2026-10-28', status: 'absent' },
  { date: '2026-10-29', status: 'present' },
  { date: '2026-10-30', status: 'present' },
  { date: '2026-10-31', status: 'late' },
];

const DEFAULT_STUDENTS: Student[] = [
  {
    id: 1,
    name: 'Ayush',
    marks: 90,
    className: '10-A',
    email: 'ayush.sharma@campusly.edu',
    phone: '+91 98765 43210',
    dateOfBirth: '2008-05-14',
    gender: 'Male',
    avatarUrl: '👨‍🎓',
    parentContact: {
      name: 'Rakesh Sharma',
      phone: '+91 98765 43211',
      relationship: 'Father',
    },
    subjects: { math: 92, science: 88, english: 90, history: 86, computer: 94 },
    attendanceRecords: SAMPLE_ATTENDANCE_AYUSH,
  },
  {
    id: 2,
    name: 'John',
    marks: 85,
    className: '10-B',
    email: 'john.doe@campusly.edu',
    phone: '+1 555-0192',
    dateOfBirth: '2008-08-22',
    gender: 'Male',
    avatarUrl: '🧑‍🎓',
    parentContact: {
      name: 'Sarah Doe',
      phone: '+1 555-0193',
      relationship: 'Mother',
    },
    subjects: { math: 80, science: 85, english: 88, history: 82, computer: 90 },
    attendanceRecords: SAMPLE_ATTENDANCE_JOHN,
  },
  {
    id: 3,
    name: 'Alice',
    marks: 95,
    className: '10-A',
    email: 'alice.smith@campusly.edu',
    phone: '+1 555-0144',
    dateOfBirth: '2008-03-10',
    gender: 'Female',
    avatarUrl: '👩‍🎓',
    parentContact: {
      name: 'David Smith',
      phone: '+1 555-0145',
      relationship: 'Father',
    },
    subjects: { math: 98, science: 96, english: 92, history: 94, computer: 95 },
    attendanceRecords: SAMPLE_ATTENDANCE_ALICE,
  },
  {
    id: 4,
    name: 'Bob',
    marks: 80,
    className: '10-B',
    email: 'bob.miller@campusly.edu',
    phone: '+1 555-0188',
    dateOfBirth: '2008-11-05',
    gender: 'Male',
    avatarUrl: '🦁',
    parentContact: {
      name: 'Karen Miller',
      phone: '+1 555-0189',
      relationship: 'Mother',
    },
    subjects: { math: 78, science: 82, english: 75, history: 80, computer: 85 },
    attendanceRecords: SAMPLE_ATTENDANCE_BOB,
  },
];

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  students: Student[] = [];

  constructor() {
    this.loadFromStorage();
  }

  loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.students = parsed.map((item: any) => this.normalizeStudent(item));
          }
        }
      }
    } catch {
      // Storage read error, fall back to defaults
    }

    if (this.students.length === 0) {
      this.students = JSON.parse(JSON.stringify(DEFAULT_STUDENTS));
    }

    this.syncWithServer();
  }

  private async syncWithServer(): Promise<void> {
    try {
      if (
        typeof window !== 'undefined' &&
        typeof window.fetch === 'function' &&
        !navigator.userAgent.includes('jsdom')
      ) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);

        const response = await fetch(API_URL, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            this.students = data.map((item: any) => this.normalizeStudent(item));
            this.saveToStorage();
          }
        }
      }
    } catch {
      // json-server not running or aborted, keep existing local data
    }
  }

  saveToStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.students));
      }
    } catch {
      // Storage unavailable or quota exceeded
    }
  }

  private normalizeStudent(item: any): Student {
    const subjects: SubjectMarks = item.subjects
      ? {
          math: Number(item.subjects.math ?? 0),
          science: Number(item.subjects.science ?? 0),
          english: Number(item.subjects.english ?? 0),
          history: Number(item.subjects.history ?? 0),
          computer: Number(item.subjects.computer ?? 0),
        }
      : createDefaultSubjects(item.marks ?? 80);

    const calculatedAvg = calculateAverage(subjects);

    return {
      id: Number(item.id),
      name: String(item.name || '').trim(),
      marks: item.subjects ? calculatedAvg : Number(item.marks ?? calculatedAvg),
      subjects,
      className: item.className || '10-A',
      email: item.email || `${String(item.name || 'student').toLowerCase().replace(/\s+/g, '.')}@campusly.edu`,
      phone: item.phone || '',
      dateOfBirth: item.dateOfBirth || '2008-01-01',
      gender: item.gender || 'Prefer not to say',
      avatarUrl: item.avatarUrl || '🧑‍🎓',
      parentContact: item.parentContact || { name: '', phone: '', relationship: 'Guardian' },
      attendanceRecords: Array.isArray(item.attendanceRecords) ? item.attendanceRecords : [],
    };
  }

  getStudentById(id: number): Student | undefined {
    return this.students.find((student) => student.id === id);
  }

  addStudent(
    name: string,
    marksOrSubjects: number | SubjectMarks,
    profileData?: Partial<Student>,
  ): Student {
    const nextId =
      this.students.reduce((maxId, student) => Math.max(maxId, student.id), 0) + 1;

    let subjects: SubjectMarks;
    let marks: number;

    if (typeof marksOrSubjects === 'number') {
      const safe = Math.min(100, Math.max(0, Math.round(marksOrSubjects)));
      subjects = createDefaultSubjects(safe);
      marks = safe;
    } else {
      subjects = {
        math: Math.min(100, Math.max(0, Math.round(marksOrSubjects.math))),
        science: Math.min(100, Math.max(0, Math.round(marksOrSubjects.science))),
        english: Math.min(100, Math.max(0, Math.round(marksOrSubjects.english))),
        history: Math.min(100, Math.max(0, Math.round(marksOrSubjects.history))),
        computer: Math.min(100, Math.max(0, Math.round(marksOrSubjects.computer))),
      };
      marks = calculateAverage(subjects);
    }

    const newStudent: Student = {
      id: nextId,
      name: name.trim(),
      marks,
      subjects,
      className: profileData?.className || '10-A',
      email: profileData?.email || `${name.trim().toLowerCase().replace(/\s+/g, '.')}@campusly.edu`,
      phone: profileData?.phone || '',
      dateOfBirth: profileData?.dateOfBirth || '2008-01-01',
      gender: profileData?.gender || 'Prefer not to say',
      avatarUrl: profileData?.avatarUrl || '🧑‍🎓',
      parentContact: profileData?.parentContact || { name: '', phone: '', relationship: 'Guardian' },
      attendanceRecords: profileData?.attendanceRecords || [],
    };

    this.students.push(newStudent);
    this.saveToStorage();

    if (
      typeof window !== 'undefined' &&
      typeof window.fetch === 'function' &&
      !navigator.userAgent.includes('jsdom')
    ) {
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      }).catch(() => {});
    }

    return newStudent;
  }

  updateStudent(
    id: number,
    name: string,
    marksOrSubjects: number | SubjectMarks,
    profileData?: Partial<Student>,
  ): boolean {
    const index = this.students.findIndex((student) => student.id === id);
    if (index === -1) {
      return false;
    }

    let subjects: SubjectMarks;
    let marks: number;

    if (typeof marksOrSubjects === 'number') {
      const safe = Math.min(100, Math.max(0, Math.round(marksOrSubjects)));
      subjects = createDefaultSubjects(safe);
      marks = safe;
    } else {
      subjects = {
        math: Math.min(100, Math.max(0, Math.round(marksOrSubjects.math))),
        science: Math.min(100, Math.max(0, Math.round(marksOrSubjects.science))),
        english: Math.min(100, Math.max(0, Math.round(marksOrSubjects.english))),
        history: Math.min(100, Math.max(0, Math.round(marksOrSubjects.history))),
        computer: Math.min(100, Math.max(0, Math.round(marksOrSubjects.computer))),
      };
      marks = calculateAverage(subjects);
    }

    const current = this.students[index];
    const updated: Student = {
      ...current,
      id,
      name: name.trim(),
      marks,
      subjects,
      className: profileData?.className ?? current.className ?? '10-A',
      email: profileData?.email ?? current.email,
      phone: profileData?.phone ?? current.phone,
      dateOfBirth: profileData?.dateOfBirth ?? current.dateOfBirth,
      gender: profileData?.gender ?? current.gender,
      avatarUrl: profileData?.avatarUrl ?? current.avatarUrl,
      parentContact: profileData?.parentContact ?? current.parentContact,
      attendanceRecords: profileData?.attendanceRecords ?? current.attendanceRecords ?? [],
    };

    this.students[index] = updated;
    this.saveToStorage();

    if (
      typeof window !== 'undefined' &&
      typeof window.fetch === 'function' &&
      !navigator.userAgent.includes('jsdom')
    ) {
      fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(() => {});
    }

    return true;
  }

  deleteStudent(id: number): boolean {
    const initialLength = this.students.length;
    this.students = this.students.filter((student) => student.id !== id);
    const deleted = this.students.length < initialLength;
    if (deleted) {
      this.saveToStorage();

      if (
        typeof window !== 'undefined' &&
        typeof window.fetch === 'function' &&
        !navigator.userAgent.includes('jsdom')
      ) {
        fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
        }).catch(() => {});
      }
    }
    return deleted;
  }

  // --- Multi-Selection Bulk Actions ---
  deleteMultipleStudents(ids: number[]): number {
    const idSet = new Set(ids);
    const initialCount = this.students.length;
    this.students = this.students.filter((student) => !idSet.has(student.id));
    const deletedCount = initialCount - this.students.length;

    if (deletedCount > 0) {
      this.saveToStorage();
      for (const id of ids) {
        if (
          typeof window !== 'undefined' &&
          typeof window.fetch === 'function' &&
          !navigator.userAgent.includes('jsdom')
        ) {
          fetch(`${API_URL}/${id}`, { method: 'DELETE' }).catch(() => {});
        }
      }
    }
    return deletedCount;
  }

  applyGraceMarks(ids: number[], graceMarks = 5, subjectKey?: SubjectKey): void {
    const idSet = new Set(ids);

    for (const student of this.students) {
      if (idSet.has(student.id)) {
        if (subjectKey) {
          student.subjects[subjectKey] = Math.min(100, student.subjects[subjectKey] + graceMarks);
        } else {
          for (const s of SUBJECTS) {
            student.subjects[s.key] = Math.min(100, student.subjects[s.key] + graceMarks);
          }
        }
        student.marks = calculateAverage(student.subjects);
      }
    }
    this.saveToStorage();
  }

  assignClassToMultiple(ids: number[], className: string): void {
    const idSet = new Set(ids);
    for (const student of this.students) {
      if (idSet.has(student.id)) {
        student.className = className;
      }
    }
    this.saveToStorage();
  }

  markBulkAttendance(ids: number[], date: string, status: AttendanceStatus): void {
    const idSet = new Set(ids);
    for (const student of this.students) {
      if (idSet.has(student.id)) {
        if (!student.attendanceRecords) {
          student.attendanceRecords = [];
        }
        const existingIdx = student.attendanceRecords.findIndex((r) => r.date === date);
        if (existingIdx !== -1) {
          student.attendanceRecords[existingIdx].status = status;
        } else {
          student.attendanceRecords.push({ date, status });
        }
      }
    }
    this.saveToStorage();
  }

  // --- Attendance Module Helpers ---
  markAttendance(date: string, records: { studentId: number; status: AttendanceStatus }[]): void {
    for (const rec of records) {
      const student = this.getStudentById(rec.studentId);
      if (student) {
        if (!student.attendanceRecords) {
          student.attendanceRecords = [];
        }
        const idx = student.attendanceRecords.findIndex((r) => r.date === date);
        if (idx !== -1) {
          student.attendanceRecords[idx].status = rec.status;
        } else {
          student.attendanceRecords.push({ date, status: rec.status });
        }
      }
    }
    this.saveToStorage();
  }

  getStudentAttendance(id: number): number {
    const student = this.getStudentById(id);
    return student ? calculateAttendancePercentage(student.attendanceRecords) : 100;
  }

  getClassAttendanceRate(): number {
    if (this.students.length === 0) return 100;
    const total = this.students.reduce(
      (sum, s) => sum + calculateAttendancePercentage(s.attendanceRecords),
      0,
    );
    return Math.round((total / this.students.length) * 10) / 10;
  }

  getLowAttendanceStudents(): Student[] {
    return this.students.filter((s) => isLowAttendance(s.attendanceRecords));
  }

  // --- Academic Calculations ---
  getAverage(): number {
    if (this.students.length === 0) {
      return 0;
    }
    const totalMarks = this.students.reduce((sum, student) => sum + student.marks, 0);
    return Math.round((totalMarks / this.students.length) * 10) / 10;
  }

  getClassGPA(): number {
    if (this.students.length === 0) {
      return 0.0;
    }
    const totalGpa = this.students.reduce(
      (sum, student) => sum + calculateGPA(student.marks),
      0,
    );
    return Math.round((totalGpa / this.students.length) * 10) / 10;
  }

  getSubjectAverages(): Record<SubjectKey, number> {
    const totals: Record<SubjectKey, number> = {
      math: 0,
      science: 0,
      english: 0,
      history: 0,
      computer: 0,
    };

    if (this.students.length === 0) {
      return totals;
    }

    for (const student of this.students) {
      for (const subj of SUBJECTS) {
        totals[subj.key] += student.subjects?.[subj.key] ?? student.marks;
      }
    }

    const averages: Record<SubjectKey, number> = {} as any;
    for (const subj of SUBJECTS) {
      averages[subj.key] = Math.round((totals[subj.key] / this.students.length) * 10) / 10;
    }

    return averages;
  }

  getHighestMarks(): number {
    if (this.students.length === 0) {
      return 0;
    }
    return Math.max(...this.students.map((student) => student.marks));
  }

  getLowestMarks(): number {
    if (this.students.length === 0) {
      return 0;
    }
    return Math.min(...this.students.map((student) => student.marks));
  }

  getPassingStudents(): Student[] {
    return this.students.filter((student) => isPassing(student.marks));
  }

  getPassingCount(): number {
    return this.getPassingStudents().length;
  }

  getPassRate(): number {
    if (this.students.length === 0) {
      return 0;
    }
    return Math.round((this.getPassingCount() / this.students.length) * 100);
  }

  getRecentStudents(count = 5): Student[] {
    return [...this.students]
      .sort((first, second) => second.id - first.id)
      .slice(0, count);
  }

  getTopStudents(count = 3): Student[] {
    return [...this.students]
      .sort((first, second) => second.marks - first.marks)
      .slice(0, count);
  }

  getRank(id: number): number {
    const sorted = [...this.students].sort((a, b) => b.marks - a.marks);
    const index = sorted.findIndex((student) => student.id === id);
    return index === -1 ? 0 : index + 1;
  }

  getGradeDistribution(): Record<GradeLevel, number> {
    const distribution: Record<GradeLevel, number> = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
      F: 0,
    };

    for (const student of this.students) {
      const grade = calculateGrade(student.marks);
      distribution[grade] = (distribution[grade] || 0) + 1;
    }

    return distribution;
  }

  resetToDefault(): void {
    this.students = JSON.parse(JSON.stringify(DEFAULT_STUDENTS));
    this.saveToStorage();
  }

  // --- CSV Import & Export ---
  generateCsvTemplate(): string {
    const headers = [
      'Name',
      'Class',
      'Email',
      'Phone',
      'Gender',
      'DateOfBirth',
      'ParentName',
      'ParentPhone',
      'Math',
      'Science',
      'English',
      'History',
      'Computer',
    ];
    const sampleRow = [
      'Rahul Kumar',
      '10-A',
      'rahul.kumar@campusly.edu',
      '+91 98765 11111',
      'Male',
      '2008-04-12',
      'Suresh Kumar',
      '+91 98765 22222',
      '88',
      '92',
      '85',
      '79',
      '95',
    ];
    return [headers.join(','), sampleRow.join(',')].join('\n');
  }

  importStudentsFromCsv(csvText: string): { successCount: number; errors: string[] } {
    const lines = csvText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const errors: string[] = [];
    if (lines.length < 2) {
      return { successCount: 0, errors: ['CSV file is empty or missing data rows.'] };
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const nameIdx = headers.indexOf('name');
    if (nameIdx === -1) {
      return { successCount: 0, errors: ['CSV missing required "Name" column.'] };
    }

    const classIdx = headers.indexOf('class');
    const emailIdx = headers.indexOf('email');
    const phoneIdx = headers.indexOf('phone');
    const genderIdx = headers.indexOf('gender');
    const dobIdx = headers.indexOf('dateofbirth');
    const parentNameIdx = headers.indexOf('parentname');
    const parentPhoneIdx = headers.indexOf('parentphone');
    const mathIdx = headers.indexOf('math');
    const sciIdx = headers.indexOf('science');
    const engIdx = headers.indexOf('english');
    const histIdx = headers.indexOf('history');
    const compIdx = headers.indexOf('computer');

    let count = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Basic CSV token parser
      const values = line.split(',').map((v) => v.replace(/^"|"$/g, '').trim());

      const name = values[nameIdx];
      if (!name) {
        errors.push(`Row ${i + 1}: Name cannot be empty.`);
        continue;
      }

      const parseScore = (idx: number, def = 80) => {
        if (idx === -1 || !values[idx]) return def;
        const n = Number(values[idx]);
        return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : def;
      };

      const subjects: SubjectMarks = {
        math: parseScore(mathIdx),
        science: parseScore(sciIdx),
        english: parseScore(engIdx),
        history: parseScore(histIdx),
        computer: parseScore(compIdx),
      };

      const profileData: Partial<Student> = {
        className: classIdx !== -1 && values[classIdx] ? values[classIdx] : '10-A',
        email: emailIdx !== -1 && values[emailIdx] ? values[emailIdx] : `${name.toLowerCase().replace(/\s+/g, '.')}@campusly.edu`,
        phone: phoneIdx !== -1 ? values[phoneIdx] : '',
        gender: (genderIdx !== -1 && values[genderIdx] ? values[genderIdx] : 'Prefer not to say') as any,
        dateOfBirth: dobIdx !== -1 && values[dobIdx] ? values[dobIdx] : '2008-01-01',
        parentContact: {
          name: parentNameIdx !== -1 ? values[parentNameIdx] : '',
          phone: parentPhoneIdx !== -1 ? values[parentPhoneIdx] : '',
          relationship: 'Guardian',
        },
        avatarUrl: '🧑‍🎓',
        attendanceRecords: [],
      };

      this.addStudent(name, subjects, profileData);
      count++;
    }

    return { successCount: count, errors };
  }

  exportToCsv(): string {
    const headers = [
      'ID',
      'Name',
      'Class',
      'Email',
      'Phone',
      'Gender',
      'Date of Birth',
      'Parent Name',
      'Parent Phone',
      'Attendance Rate (%)',
      'Math',
      'Science',
      'English',
      'History',
      'Computer Science',
      'Total (500)',
      'Percentage (%)',
      'Grade',
      'GPA',
      'Status',
    ];

    const rows = this.students.map((student) => {
      const s = student.subjects || createDefaultSubjects(student.marks);
      const total = s.math + s.science + s.english + s.history + s.computer;
      const gpa = calculateGPA(student.marks);
      const att = calculateAttendancePercentage(student.attendanceRecords);

      return [
        student.id,
        `"${student.name.replace(/"/g, '""')}"`,
        `"${student.className || '10-A'}"`,
        `"${student.email || ''}"`,
        `"${student.phone || ''}"`,
        `"${student.gender || ''}"`,
        `"${student.dateOfBirth || ''}"`,
        `"${student.parentContact?.name || ''}"`,
        `"${student.parentContact?.phone || ''}"`,
        att.toFixed(1),
        s.math,
        s.science,
        s.english,
        s.history,
        s.computer,
        total,
        student.marks,
        calculateGrade(student.marks),
        gpa.toFixed(1),
        isPassing(student.marks) ? 'Passed' : 'Failed',
      ];
    });

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }
}
