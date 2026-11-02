# Campusly — Student Management System

A modern, responsive **Student Management System** built with **Angular (Standalone Components)**, TypeScript, and modern CSS.

🔗 **GitHub Repository:** [https://github.com/narendrashelke/student_manager](https://github.com/narendrashelke/student_manager)

---

## 🌟 Key Features

### 1. Complete CRUD Operations & Multi-Subject Academics
- **Create:** Add new students with rich profile details and individual marks across 5 subjects.
- **Read:**
  - **Overview Dashboard:** Class metrics, attendance rate, honors watchlist, and low-attendance warnings.
  - **Student Roster:** Multi-criteria search, class filter, pass/fail status filters, and sorting by name, marks, ID, or attendance.
  - **Student Profile:** Dedicated profile page (`/student/:id`) showing grade, class rank, guardian contacts, attendance rate, and subject-by-subject strengths & weaknesses.
- **Update:** Edit any student's name, marks, subjects, contact details, and parent/guardian info directly from the roster or profile view.
- **Delete:** Safe two-step inline confirmation (`Delete` → `Confirm?`) to prevent accidental deletion.
- **5 Core Subjects Tracked:** Mathematics (📐), Science (🔬), English (📖), History (🏛️), and Computer Science (💻).
- **Automated GPA & Grade Distribution:** Real-time 4.0 GPA conversion, letter grades (A–F), and class distribution stats.

### 2. 📋 Administration & Rich Student Profiles
- **Comprehensive Demographic & Contact Records:**
  - Email address and phone number with validation.
  - Date of Birth and Gender selection.
  - Section / Class assignment (`10-A`, `10-B`, `10-C`, `11-A`, `11-B`, `12-A`).
  - Parent / Guardian contact (Full Name, Phone number, and Relationship).
  - Avatar / Profile Photo selection from a variety of student avatars.

### 3. 📅 Attendance Tracking Module
- **Daily Attendance Register:**
  - View and record daily attendance per class or across the entire school.
  - Statuses: **Present**, **Absent**, **Late**, and **Excused**.
  - One-click "Mark All Present" shortcut for rapid morning attendance.
  - Date picker to view or record historical attendance sessions.
- **Automated Warning Alerts:**
  - Real-time monthly attendance percentage calculation.
  - Automatic low-attendance warning banner on student profiles and dashboard for students falling below **75%**.

### 4. 📂 Bulk CSV / Excel Import & Template
- **Class Roster CSV Import:**
  - Import whole class rosters at once via CSV upload or pasted text.
  - Downloadable CSV template (`campusly_student_import_template.csv`) with pre-configured headers and example data.
  - Automatic data validation, error checking, and detailed feedback per row.
- **Comprehensive CSV Export:**
  - Export the full student roster with demographic details, academic scores, and attendance rates to CSV.

### 5. ☑️ Multi-Selection Bulk Actions
- Checkbox multi-selection (Select All, Deselect All, individual student selection).
- **Batch Grace Marks:** Award configurable grace marks (+1 to +10 pts) across all subjects for selected students in one click.
- **Batch Class Transfer:** Move selected students to another class section instantly.
- **Batch Attendance:** Mark selected students as Present, Absent, or Late for the selected date.
- **Batch Deletion:** Permanently remove multiple selected students in one operation.

### 6. 💾 Live Mock REST API & Persistence
- **JSON Server:** Live mock REST backend running on `http://localhost:3000/students` synchronized with `db.json`.
- **LocalStorage Fallback:** Full offline support and persistence when running without the mock server.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/narendrashelke/student_manager.git

# Navigate into the project folder
cd student_manager

# Install dependencies
npm install
```

### Running Locally

```bash
# 1. (Optional) Run the mock REST API backend on port 3000
npm run server

# 2. In another terminal, start the Angular development server
npm start
```

Navigate to `http://localhost:4200/` in your browser.
The API server runs on `http://localhost:3000/students` watching `db.json`.

---

## 🧪 Testing & Build

```bash
# Run unit tests with Vitest (44 passing tests across 5 test suites)
npm test

# Build optimized production bundle
npm run build
```

---

## 🛠 Tech Stack

- **Framework:** Angular 19+ (Standalone Architecture)
- **Language:** TypeScript
- **Testing:** Vitest
- **Tooling:** Angular CLI, Vite, json-server
- **Styling:** CSS3 (Custom design system, CSS Grid & Flexbox, responsive layout)
