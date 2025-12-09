// ==================== //
// Teacher Dashboard Manager
// ==================== //

class TeacherDashboard {
    constructor() {
        this.marks = this.loadMarks();
        this.coursework = this.loadCoursework();
        this.teacherPassword = '4321';
        this.isUnlocked = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        // Teacher password form
        document.getElementById('teacher-password-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.verifyTeacherPassword();
        });

        // Add mark form
        document.getElementById('add-mark-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMark();
        });

        // Add coursework form
        document.getElementById('add-coursework-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCoursework();
        });

        // Clear all marks
        document.getElementById('clear-all-marks').addEventListener('click', () => {
            this.clearAllMarks();
        });
    }

    // Verify teacher password
    verifyTeacherPassword() {
        const passwordInput = document.getElementById('teacher-password-input');
        const enteredPassword = passwordInput.value;

        if (enteredPassword === this.teacherPassword) {
            this.unlockDashboard();
            passwordInput.value = '';
            this.showToast('✓ Welcome! Dashboard unlocked');
        } else {
            this.showToast('✗ Incorrect password. Try again.');
            passwordInput.value = '';
            passwordInput.focus();

            // Add shake animation
            const passwordSection = document.getElementById('teacher-password-section');
            passwordSection.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                passwordSection.style.animation = '';
            }, 500);
        }
    }

    // Unlock dashboard
    unlockDashboard() {
        this.isUnlocked = true;
        document.getElementById('teacher-password-section').classList.add('hidden');
        document.getElementById('teacher-dashboard-content').classList.remove('hidden');
    }

    // Add student mark
    addMark() {
        const studentName = document.getElementById('student-name').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const mark = parseInt(document.getElementById('mark').value);
        const studentPassword = '123'; // Default password for all students

        if (!studentName || !subject || isNaN(mark)) {
            this.showToast('Please fill all fields correctly');
            return;
        }

        if (mark < 0 || mark > 100) {
            this.showToast('Mark must be between 0 and 100');
            return;
        }

        // Check if record already exists
        const existingIndex = this.marks.findIndex(m =>
            m.student.toLowerCase() === studentName.toLowerCase() &&
            m.subject.toLowerCase() === subject.toLowerCase()
        );

        if (existingIndex !== -1) {
            // Update existing record
            this.marks[existingIndex].mark = mark;
            this.marks[existingIndex].password = studentPassword;
            this.showToast(`Updated ${studentName}'s ${subject} mark`);
        } else {
            // Add new record
            this.marks.push({
                id: Date.now(),
                student: studentName,
                password: studentPassword,
                subject: subject,
                mark: mark
            });
            this.showToast(`Added ${studentName}'s ${subject} mark`);
        }

        this.saveMarks();
        this.updateUI();
        document.getElementById('add-mark-form').reset();
    }

    // Add coursework
    addCoursework() {
        const teacherName = document.getElementById('teacher-name').value.trim();
        const title = document.getElementById('coursework-title').value.trim();
        const subject = document.getElementById('coursework-subject').value.trim();
        const description = document.getElementById('coursework-description').value.trim();
        const dueDate = document.getElementById('coursework-duedate').value;
        const mark = parseInt(document.getElementById('coursework-mark').value);

        if (!teacherName || !title || !subject || !description || !dueDate || isNaN(mark)) {
            this.showToast('Please fill all fields');
            return;
        }

        if (mark < 0) {
            this.showToast('Mark must be a positive number');
            return;
        }

        this.coursework.push({
            id: Date.now(),
            teacherName: teacherName,
            title: title,
            subject: subject,
            description: description,
            dueDate: dueDate,
            mark: mark
        });

        this.saveCoursework();
        this.updateUI();
        document.getElementById('add-coursework-form').reset();
        this.showToast('Assignment added successfully');
    }

    // Update UI
    updateUI() {
        this.updateRecordsList();
        this.updateCourseworkList();
    }

    // Update records list
    updateRecordsList() {
        const recordsList = document.getElementById('records-list');
        const emptyState = document.getElementById('empty-state-marks');
        const totalRecords = document.getElementById('total-records');

        totalRecords.textContent = this.marks.length;

        if (this.marks.length === 0) {
            recordsList.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        const sortedMarks = [...this.marks].sort((a, b) => {
            const nameCompare = a.student.localeCompare(b.student);
            if (nameCompare !== 0) return nameCompare;
            return a.subject.localeCompare(b.subject);
        });

        recordsList.innerHTML = sortedMarks.map(mark => `
            <div class="record-item" data-id="${mark.id}">
                <div class="record-info">
                    <div class="record-name">${this.escapeHtml(mark.student)}</div>
                    <div class="record-subject">${this.escapeHtml(mark.subject)}</div>
                </div>
                <div class="record-mark-container">
                    <div class="record-mark hidden" data-mark="${mark.mark}">
                        <span class="mark-value">${mark.mark}</span>
                    </div>
                    <button class="reveal-btn" onclick="teacherDashboard.toggleMark(${mark.id})" aria-label="Show/Hide mark">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                </div>
                <button class="delete-btn" onclick="teacherDashboard.deleteMark(${mark.id})" aria-label="Delete record">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    // Toggle mark visibility
    toggleMark(id) {
        const recordItem = document.querySelector(`[data-id="${id}"]`);
        if (!recordItem) return;

        const markElement = recordItem.querySelector('.record-mark');
        const revealBtn = recordItem.querySelector('.reveal-btn');

        if (markElement.classList.contains('hidden')) {
            markElement.classList.remove('hidden');
            revealBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
            `;
        } else {
            markElement.classList.add('hidden');
            revealBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            `;
        }
    }

    // Update coursework list
    updateCourseworkList() {
        const courseworkList = document.getElementById('coursework-list');
        const emptyState = document.getElementById('empty-state-coursework');

        if (this.coursework.length === 0) {
            courseworkList.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        const sortedCoursework = [...this.coursework].sort((a, b) =>
            new Date(a.dueDate) - new Date(b.dueDate)
        );

        courseworkList.innerHTML = sortedCoursework.map(cw => `
            <div class="coursework-item">
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
                    <span class="due-date">Due: ${this.formatDate(cw.dueDate)}</span>
                    <button class="delete-btn-small" onclick="teacherDashboard.deleteCoursework(${cw.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Delete mark
    deleteMark(id) {
        const index = this.marks.findIndex(m => m.id === id);
        if (index !== -1) {
            const deleted = this.marks[index];
            this.marks.splice(index, 1);
            this.saveMarks();
            this.updateUI();
            this.showToast(`Deleted ${deleted.student}'s ${deleted.subject} mark`);
        }
    }

    // Delete coursework
    deleteCoursework(id) {
        const index = this.coursework.findIndex(c => c.id === id);
        if (index !== -1) {
            this.coursework.splice(index, 1);
            this.saveCoursework();
            this.updateUI();
            this.showToast('Assignment deleted');
        }
    }

    // Clear all marks
    clearAllMarks() {
        if (this.marks.length === 0) {
            this.showToast('No records to clear');
            return;
        }

        if (confirm('Are you sure you want to delete all student marks? This cannot be undone.')) {
            this.marks = [];
            this.saveMarks();
            this.updateUI();
            this.showToast('All marks cleared');
        }
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
    saveMarks() {
        localStorage.setItem('studentMarks', JSON.stringify(this.marks));
    }

    loadMarks() {
        try {
            const data = localStorage.getItem('studentMarks');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    saveCoursework() {
        localStorage.setItem('coursework', JSON.stringify(this.coursework));
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
let teacherDashboard;
document.addEventListener('DOMContentLoaded', () => {
    teacherDashboard = new TeacherDashboard();
});
