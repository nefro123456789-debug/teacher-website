// ==================== //
// Student Dashboard Manager
// ==================== //

class StudentDashboard {
    constructor() {
        this.marks = this.loadMarks();
        this.coursework = this.loadCoursework();
        this.currentStudent = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCourseworkList();
    }

    setupEventListeners() {
        // Student search form
        document.getElementById('student-search-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.searchStudentMarks();
        });
    }

    // Search student marks with password
    searchStudentMarks() {
        const studentName = document.getElementById('search-student-name').value.trim();
        const studentPassword = document.getElementById('search-student-password').value.trim();

        if (!studentName || !studentPassword) {
            this.showToast('Please enter both name and password');
            return;
        }

        // Find all marks for this student
        const studentMarks = this.marks.filter(m =>
            m.student.toLowerCase() === studentName.toLowerCase()
        );

        if (studentMarks.length === 0) {
            this.showToast('No records found for this student');
            document.getElementById('student-marks-result').classList.add('hidden');
            return;
        }

        // Verify password (check first record's password)
        const firstMark = studentMarks[0];
        if (firstMark.password !== studentPassword) {
            this.showToast('Incorrect password');
            document.getElementById('student-marks-result').classList.add('hidden');
            return;
        }

        // Display marks
        this.currentStudent = studentName;
        this.displayStudentMarks(studentMarks);
    }

    // Display student marks
    displayStudentMarks(marks) {
        const resultDiv = document.getElementById('student-marks-result');
        const studentNameEl = document.getElementById('result-student-name');
        const averageEl = document.getElementById('result-average');
        const marksTableEl = document.getElementById('marks-table');

        // Calculate average
        const average = marks.reduce((sum, m) => sum + m.mark, 0) / marks.length;
        const grade = this.getGrade(average);

        studentNameEl.textContent = this.currentStudent;
        averageEl.textContent = `Average: ${average.toFixed(1)}% (${grade})`;
        averageEl.className = `average-badge grade-${grade.toLowerCase()}`;

        // Create marks table
        marksTableEl.innerHTML = `
            <table class="marks-display-table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Mark</th>
                        <th>Grade</th>
                    </tr>
                </thead>
                <tbody>
                    ${marks.map(mark => `
                        <tr>
                            <td>${this.escapeHtml(mark.subject)}</td>
                            <td class="mark-cell">${mark.mark}</td>
                            <td><span class="grade-badge grade-${this.getGrade(mark.mark).toLowerCase()}">${this.getGrade(mark.mark)}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        resultDiv.classList.remove('hidden');
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        this.showToast('Marks loaded successfully');
    }

    // Update coursework list
    updateCourseworkList() {
        const courseworkList = document.getElementById('student-coursework-list');
        const emptyState = document.getElementById('empty-state-student-coursework');

        if (this.coursework.length === 0) {
            courseworkList.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        const sortedCoursework = [...this.coursework].sort((a, b) =>
            new Date(a.dueDate) - new Date(b.dueDate)
        );

        courseworkList.innerHTML = sortedCoursework.map(cw => {
            const dueDate = new Date(cw.dueDate);
            const today = new Date();
            const isOverdue = dueDate < today;
            const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

            return `
                <div class="coursework-item ${isOverdue ? 'overdue' : ''}">
                    <div class="coursework-header">
                        <h4>${this.escapeHtml(cw.title)}</h4>
                        <div class="badge-group">
                            <span class="teacher-badge">👨‍🏫 ${this.escapeHtml(cw.teacherName)}</span>
                            <span class="subject-badge">${this.escapeHtml(cw.subject)}</span>
                            <span class="mark-badge">📝 ${cw.mark} pts</span>
                        </div>
                    </div>
                    <p class="coursework-description">${this.escapeHtml(cw.description)}</p>
                    <div class="coursework-footer">
                        <span class="due-date ${isOverdue ? 'overdue-text' : ''}">
                            ${isOverdue ? '⚠️ Overdue' : daysUntilDue === 0 ? '🔥 Due Today' : daysUntilDue === 1 ? '⏰ Due Tomorrow' : `📅 Due: ${this.formatDate(cw.dueDate)}`}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Get grade
    getGrade(mark) {
        if (mark >= 90) return 'A';
        if (mark >= 80) return 'B';
        if (mark >= 70) return 'C';
        if (mark >= 60) return 'D';
        return 'F';
    }

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    // Show toast
    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');

        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        void toast.offsetWidth;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, 3000);
    }

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Storage methods
    loadMarks() {
        try {
            const data = localStorage.getItem('studentMarks');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    loadCoursework() {
        try {
            const data = localStorage.getItem('coursework');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }
}

// Initialize
let studentDashboard;
document.addEventListener('DOMContentLoaded', () => {
    studentDashboard = new StudentDashboard();
});
