// ==================== //
// Data Storage
// ==================== //

class StudentMarksManager {
    constructor() {
        this.marks = this.loadFromStorage();
        this.password = '1234'; // Change this to set your own password
        this.isUnlocked = false;
        this.init();
    }

    // Initialize the application
    init() {
        this.setupEventListeners();
        this.updateUI();
        this.updateDataLists();
    }

    // Setup all event listeners
    setupEventListeners() {
        // Password form submission
        document.getElementById('password-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.verifyPassword();
        });

        // Lock button
        document.getElementById('lock-btn').addEventListener('click', () => {
            this.lockAddSection();
        });

        // Add form submission
        document.getElementById('add-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMark();
        });

        // Search form submission
        document.getElementById('search-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.searchMark();
        });

        // Update datalists when typing
        document.getElementById('search-student').addEventListener('input', () => {
            this.updateDataLists();
        });

        document.getElementById('search-subject').addEventListener('input', () => {
            this.updateDataLists();
        });
    }

    // Verify password and unlock add section
    verifyPassword() {
        const passwordInput = document.getElementById('password-input');
        const enteredPassword = passwordInput.value;

        if (enteredPassword === this.password) {
            this.unlockAddSection();
            passwordInput.value = '';
            this.showToast('✓ Unlocked! You can now add student marks');
        } else {
            this.showToast('✗ Incorrect password. Try again.');
            passwordInput.value = '';
            passwordInput.focus();

            // Add shake animation to password section
            const passwordSection = document.getElementById('password-section');
            passwordSection.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                passwordSection.style.animation = '';
            }, 500);
        }
    }

    // Unlock the add section
    unlockAddSection() {
        this.isUnlocked = true;
        document.getElementById('password-section').classList.add('hidden');
        document.getElementById('add-section').classList.remove('hidden');
    }

    // Lock the add section
    lockAddSection() {
        this.isUnlocked = false;
        document.getElementById('add-section').classList.add('hidden');
        document.getElementById('password-section').classList.remove('hidden');
        document.getElementById('add-form').reset();
        this.showToast('🔒 Add section locked');
    }

    // Add a new mark
    addMark() {
        const studentName = document.getElementById('student-name').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const mark = parseInt(document.getElementById('mark').value);

        if (!studentName || !subject || isNaN(mark)) {
            this.showToast('Please fill all fields correctly');
            return;
        }

        if (mark < 0 || mark > 100) {
            this.showToast('Mark must be between 0 and 100');
            return;
        }

        // Create unique key for student-subject combination
        const key = `${studentName.toLowerCase()}_${subject.toLowerCase()}`;

        // Check if record already exists
        const existingIndex = this.marks.findIndex(m =>
            m.student.toLowerCase() === studentName.toLowerCase() &&
            m.subject.toLowerCase() === subject.toLowerCase()
        );

        if (existingIndex !== -1) {
            // Update existing record
            this.marks[existingIndex].mark = mark;
            this.showToast(`Updated ${studentName}'s ${subject} mark to ${mark}`);
        } else {
            // Add new record
            this.marks.push({
                id: Date.now(),
                student: studentName,
                subject: subject,
                mark: mark
            });
            this.showToast(`Added ${studentName}'s ${subject} mark: ${mark}`);
        }

        this.saveToStorage();
        this.updateUI();
        this.updateDataLists();
        document.getElementById('add-form').reset();

        // Add animation to the newly added item
        setTimeout(() => {
            const items = document.querySelectorAll('.record-item');
            if (items.length > 0) {
                items[items.length - 1].style.animation = 'none';
                setTimeout(() => {
                    items[items.length - 1].style.animation = 'slideInRight 0.4s ease';
                }, 10);
            }
        }, 100);
    }

    // Search for a mark
    searchMark() {
        const studentName = document.getElementById('search-student').value.trim();
        const subject = document.getElementById('search-subject').value.trim();

        if (!studentName || !subject) {
            this.showToast('Please enter both student name and subject');
            return;
        }

        const result = this.marks.find(m =>
            m.student.toLowerCase() === studentName.toLowerCase() &&
            m.subject.toLowerCase() === subject.toLowerCase()
        );

        const resultDiv = document.getElementById('search-result');

        if (result) {
            document.getElementById('result-student').textContent = result.student;
            document.getElementById('result-subject').textContent = result.subject;
            document.getElementById('result-mark').textContent = result.mark;

            const gradeBadge = document.getElementById('result-grade');
            const grade = this.getGrade(result.mark);
            gradeBadge.textContent = grade;
            gradeBadge.className = `grade-badge grade-${grade.toLowerCase()}`;

            resultDiv.classList.remove('hidden');

            // Scroll to result
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            this.showToast(`No mark found for ${studentName} in ${subject}`);
            resultDiv.classList.add('hidden');
        }
    }



    // Update the UI
    updateUI() {
        this.updateStudentCount();
        this.updateDataLists();
    }

    // Update student count
    updateStudentCount() {
        const uniqueStudents = new Set(this.marks.map(m => m.student.toLowerCase()));
        document.getElementById('total-students').textContent = uniqueStudents.size;
    }

    // Update datalists for autocomplete
    updateDataLists() {
        const studentList = document.getElementById('student-list');
        const subjectList = document.getElementById('subject-list');

        // Get unique students and subjects
        const students = [...new Set(this.marks.map(m => m.student))];
        const subjects = [...new Set(this.marks.map(m => m.subject))];

        studentList.innerHTML = students.map(s => `<option value="${this.escapeHtml(s)}">`).join('');
        subjectList.innerHTML = subjects.map(s => `<option value="${this.escapeHtml(s)}">`).join('');
    }

    // Get grade based on mark
    getGrade(mark) {
        if (mark >= 90) return 'A';
        if (mark >= 80) return 'B';
        if (mark >= 70) return 'C';
        if (mark >= 60) return 'D';
        return 'F';
    }

    // Show toast notification
    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');

        toastMessage.textContent = message;
        toast.classList.remove('hidden');

        // Trigger reflow to restart animation
        void toast.offsetWidth;

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 300);
        }, 3000);
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Save to localStorage
    saveToStorage() {
        try {
            localStorage.setItem('studentMarks', JSON.stringify(this.marks));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            this.showToast('Error saving data');
        }
    }

    // Load from localStorage
    loadFromStorage() {
        try {
            const data = localStorage.getItem('studentMarks');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return [];
        }
    }
}

// ==================== //
// Initialize Application
// ==================== //

let manager;

document.addEventListener('DOMContentLoaded', () => {
    manager = new StudentMarksManager();

    // Add some sample data if storage is empty (for demo purposes)
    if (manager.marks.length === 0) {
        const sampleData = [
            { id: 1, student: 'Ahmed Ali', subject: 'Mathematics', mark: 95 },
            { id: 2, student: 'Ahmed Ali', subject: 'Physics', mark: 88 },
            { id: 3, student: 'Sara Mohamed', subject: 'Mathematics', mark: 92 },
            { id: 4, student: 'Sara Mohamed', subject: 'Chemistry', mark: 85 },
            { id: 5, student: 'Omar Hassan', subject: 'English', mark: 78 }
        ];

        manager.marks = sampleData;
        manager.saveToStorage();
        manager.updateUI();
        manager.updateDataLists();
    }
});

// ==================== //
// Service Worker (Optional - for PWA)
// ==================== //

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registered'))
        //     .catch(err => console.log('Service Worker registration failed'));
    });
}
