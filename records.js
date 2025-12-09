// ==================== //
// Records Page Manager
// ==================== //

class RecordsPageManager {
    constructor() {
        this.marks = this.loadFromStorage();
        this.init();
    }

    // Initialize the page
    init() {
        this.setupEventListeners();
        this.updateUI();
    }

    // Setup event listeners
    setupEventListeners() {
        // Clear all button
        document.getElementById('clear-all').addEventListener('click', () => {
            this.clearAll();
        });
    }

    // Update the UI
    updateUI() {
        this.updateRecordCount();
        this.updateRecordsList();
    }

    // Update record count
    updateRecordCount() {
        document.getElementById('total-records').textContent = this.marks.length;
    }

    // Update records list
    updateRecordsList() {
        const recordsList = document.getElementById('records-list');
        const emptyState = document.getElementById('empty-state');

        if (this.marks.length === 0) {
            recordsList.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        // Sort marks by student name, then by subject
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
                    <button class="reveal-btn" onclick="recordsManager.toggleMark(${mark.id})" aria-label="Show/Hide mark">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                </div>
                <button class="delete-btn" onclick="recordsManager.deleteMark(${mark.id})" aria-label="Delete record">
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
            // Show mark
            markElement.classList.remove('hidden');
            revealBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
            `;
            revealBtn.setAttribute('aria-label', 'Hide mark');
        } else {
            // Hide mark
            markElement.classList.add('hidden');
            revealBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            `;
            revealBtn.setAttribute('aria-label', 'Show mark');
        }
    }

    // Delete a specific mark
    deleteMark(id) {
        const index = this.marks.findIndex(m => m.id === id);
        if (index !== -1) {
            const deleted = this.marks[index];
            this.marks.splice(index, 1);
            this.saveToStorage();
            this.updateUI();
            this.showToast(`Deleted ${deleted.student}'s ${deleted.subject} mark`);
        }
    }

    // Clear all marks
    clearAll() {
        if (this.marks.length === 0) {
            this.showToast('No records to clear');
            return;
        }

        if (confirm('Are you sure you want to delete all records? This cannot be undone.')) {
            this.marks = [];
            this.saveToStorage();
            this.updateUI();
            this.showToast('All records cleared');
        }
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
// Initialize Page
// ==================== //

let recordsManager;

document.addEventListener('DOMContentLoaded', () => {
    recordsManager = new RecordsPageManager();
});
