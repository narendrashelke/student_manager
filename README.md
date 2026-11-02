# Campusly — Student Management System

A modern, responsive **Student Management System** built with **Angular (Standalone Components)**, TypeScript, and modern CSS.

🔗 **GitHub Repository:** [https://github.com/narendrashelke/student_manager](https://github.com/narendrashelke/student_manager)

---

## 🌟 Key Features

### 1. Complete CRUD Operations
- **Create:** Add new students with strict input validation (name and marks between 0–100).
- **Read:**
  - **Overview Dashboard:** Class metrics, honor roll, and recent student activity.
  - **Student Roster:** Search by name/ID, filter by status (All / Passed / Needs Support), and sortable columns (ID, Name, Marks).
  - **Student Profile:** Dedicated profile page (`/student/:id`) showing grade, class rank, and performance vs. class average.
- **Update:** Edit any student's name and marks directly from the roster table or profile view.
- **Delete:** Safe two-step inline confirmation (`Delete` → `Confirm?`) to prevent accidental deletion.

### 2. Multi-Subject Marks & GPA Calculation
- **5 Core Subjects Tracked:** Mathematics (📐), Science (🔬), English (📖), History (🏛️), and Computer Science (💻).
- **Automated GPA (4.0 scale):** Converts percentage to weighted Grade Point Average.
- **Subject-by-Subject Academic Profile:** Individual subject progress bars, strengths & weaknesses identification, and class subject averages.
- **Automated letter grade computation:**
  - **Grade A:** 90 – 100 (4.0 GPA)
  - **Grade B:** 80 – 89 (3.0 – 3.9 GPA)
  - **Grade C:** 70 – 79 (2.0 – 2.9 GPA)
  - **Grade D:** 60 – 69 (1.0 – 1.9 GPA)
  - **Grade E:** 40 – 59 (0.1 – 0.9 GPA)
  - **Grade F:** < 40 (0.0 GPA / Needs Academic Support)
- **Grade Distribution Breakdown:** Visual distribution summary of all letter grades in the class.
- **Class Benchmarks:** Dynamic computation of class average, class GPA benchmark, highest score, lowest score, and pass rate.

### 3. Data Persistence & Export
- **LocalStorage Persistence:** All additions, modifications, and deletions persist across page refreshes and browser restarts.
- **CSV Export:** One-click download of the complete student roster to CSV format.
- **Reset Demo Data:** Quick reset to default demo records whenever needed.

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
# Start local development server
npm start
```

Navigate to `http://localhost:4200/` in your browser.

---

## 🧪 Testing & Build

```bash
# Run unit tests with Vitest (30 passing tests across 5 test suites)
npm test

# Build optimized production bundle
npm run build
```

---

## 🛠 Tech Stack

- **Framework:** Angular (Standalone Architecture)
- **Language:** TypeScript
- **Testing:** Vitest
- **Tooling:** Angular CLI, Vite
- **Styling:** CSS3 (Modern variables, Flexbox & CSS Grid, responsive design)
