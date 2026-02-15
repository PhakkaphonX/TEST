/**
 * =====================================================
 * History Page JavaScript
 * Handles food log history display and management
 * Uses localStorage for data persistence
 * =====================================================
 */

class HistoryManager {
    constructor() {
        this.logs = [];
        this.filteredLogs = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.deleteTargetId = null;
    }

    // Initialize history page
    async init() {
        this.showLoading();
        this.bindEvents();
        await this.loadHistory();
    }

    // Show loading state
    showLoading() {
        document.getElementById('loadingState')?.classList.remove('d-none');
        document.getElementById('historyContent')?.classList.add('d-none');
        document.getElementById('emptyState')?.classList.add('d-none');
        document.getElementById('loginPrompt')?.classList.add('d-none');
    }

    // Show login prompt
    showLoginPrompt() {
        document.getElementById('loadingState')?.classList.add('d-none');
        document.getElementById('historyContent')?.classList.add('d-none');
        document.getElementById('emptyState')?.classList.add('d-none');
        document.getElementById('loginPrompt')?.classList.remove('d-none');
    }

    // Show history content
    showHistory() {
        document.getElementById('loadingState')?.classList.add('d-none');
        document.getElementById('historyContent')?.classList.remove('d-none');
        document.getElementById('emptyState')?.classList.add('d-none');
        document.getElementById('loginPrompt')?.classList.add('d-none');
    }

    // Show empty state
    showEmpty() {
        document.getElementById('loadingState')?.classList.add('d-none');
        document.getElementById('historyContent')?.classList.add('d-none');
        document.getElementById('emptyState')?.classList.remove('d-none');
        document.getElementById('loginPrompt')?.classList.add('d-none');
    }

    // Bind event listeners
    bindEvents() {
        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.applyFilters();
            }, 300));
        }

        // Date filters
        document.getElementById('fromDate')?.addEventListener('change', () => this.applyFilters());
        document.getElementById('toDate')?.addEventListener('change', () => this.applyFilters());

        // Clear filters
        document.getElementById('clearFilters')?.addEventListener('click', () => {
            document.getElementById('searchInput').value = '';
            document.getElementById('fromDate').value = '';
            document.getElementById('toDate').value = '';
            this.applyFilters();
        });

        // Export button
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportData());

        // Delete confirmation
        document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
            if (this.deleteTargetId) {
                this.confirmDelete(this.deleteTargetId);
            }
        });
    }

    // Load history — try API first, fallback to localStorage
    async loadHistory() {
        // Try loading from backend API first
        try {
            const response = await API.get('/logs?limit=100&offset=0');
            if (response.success && response.data && response.data.logs && response.data.logs.length > 0) {
                this.logs = response.data.logs.map(log => ({
                    ...log,
                    date: log.created_at || log.date
                }));
                this.filteredLogs = [...this.logs];
                this.showHistory();
                this.renderTable();
                this.renderPagination(this.logs.length);
                return;
            }
        } catch (e) {
            console.log('API not available, using localStorage');
        }

        // Fallback: load from localStorage
        this.loadFromLocalStorage();
    }

    // Load data from localStorage
    loadFromLocalStorage() {
        try {
            const stored = JSON.parse(localStorage.getItem('foodHistory') || '[]');
            this.logs = stored.map(item => ({
                id: item.id || Date.now(),
                food_name: item.food_name,
                food_name_th: item.food_name_th || '',
                calories: item.calories,
                protein: item.protein,
                fat: item.fat,
                carbs: item.carbs,
                sugar: item.sugar || 0,
                confidence: item.confidence || 0,
                image_data: item.image_data || '',
                image_path: item.image_path || '',
                date: item.date || item.created_at || new Date().toISOString(),
                created_at: item.date || item.created_at || new Date().toISOString()
            }));

            this.filteredLogs = [...this.logs];

            if (this.logs.length === 0) {
                this.showEmpty();
            } else {
                this.showHistory();
                this.renderTable();
                this.renderPagination(this.logs.length);
            }
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            this.showEmpty();
        }
    }

    // Apply filters
    applyFilters() {
        const searchTerm = document.getElementById('searchInput')?.value?.toLowerCase() || '';
        const fromDate = document.getElementById('fromDate')?.value;
        const toDate = document.getElementById('toDate')?.value;

        this.filteredLogs = this.logs.filter(log => {
            // Search filter
            const matchesSearch = !searchTerm ||
                log.food_name?.toLowerCase().includes(searchTerm) ||
                log.food_name_th?.toLowerCase().includes(searchTerm);

            // Date filter
            let matchesDate = true;
            const logDate = new Date(log.date || log.created_at);

            if (fromDate) {
                const from = new Date(fromDate);
                from.setHours(0, 0, 0, 0);
                if (logDate < from) matchesDate = false;
            }

            if (toDate) {
                const to = new Date(toDate);
                to.setHours(23, 59, 59, 999);
                if (logDate > to) matchesDate = false;
            }

            return matchesSearch && matchesDate;
        });

        this.currentPage = 1;
        this.renderTable();
        this.renderPagination(this.filteredLogs.length);
    }

    // Get image source for a log entry
    getImageSrc(log) {
        // Priority: image_data (base64 from localStorage) > image_path (from API) > placeholder
        if (log.image_data && log.image_data.startsWith('data:')) {
            return log.image_data;
        }
        if (log.image_path && !log.image_path.includes('default.jpg')) {
            // If it's a relative URL from the API, prepend the API base URL
            if (log.image_path.startsWith('/')) {
                return CONFIG.API_BASE_URL.replace('/api', '') + log.image_path;
            }
            return log.image_path;
        }
        return 'https://via.placeholder.com/60x60/FFF8F0/E85D26?text=🍜';
    }

    // Render history table
    renderTable() {
        const tbody = document.getElementById('historyTableBody');
        if (!tbody) return;

        if (this.filteredLogs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center py-4 text-muted">
                        <i class="bi bi-search fs-4 d-block mb-2"></i>
                        No results found
                    </td>
                </tr>
            `;
            return;
        }

        // Paginate
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const paginatedLogs = this.filteredLogs.slice(start, end);

        tbody.innerHTML = paginatedLogs.map(log => `
            <tr>
                <td>
                    <img src="${this.getImageSrc(log)}" 
                         alt="${log.food_name}"
                         style="width:60px;height:60px;object-fit:cover;border-radius:10px;"
                         onerror="this.src='https://via.placeholder.com/60x60/FFF8F0/E85D26?text=🍜'">
                </td>
                <td>
                    <div class="fw-medium">${log.food_name}</div>
                    <small class="text-muted">${log.food_name_th || ''}</small>
                </td>
                <td><span class="fw-bold text-primary">${log.calories}</span></td>
                <td>${log.protein}g</td>
                <td>${log.fat}g</td>
                <td>${log.carbs}g</td>
                <td>${log.sugar || 0}g</td>
                <td>${Utils.formatDate(log.date || log.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="historyManager.showDeleteModal(${log.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Update showing info
        const showingFrom = document.getElementById('showingFrom');
        const showingTo = document.getElementById('showingTo');
        const totalItems = document.getElementById('totalItems');

        if (showingFrom) showingFrom.textContent = start + 1;
        if (showingTo) showingTo.textContent = Math.min(end, this.filteredLogs.length);
        if (totalItems) totalItems.textContent = this.filteredLogs.length;
    }

    // Render pagination
    renderPagination(totalItems) {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(totalItems / this.itemsPerPage);

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = '';

        // Previous button
        html += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="historyManager.goToPage(${this.currentPage - 1}); return false;">
                    <i class="bi bi-chevron-left"></i>
                </a>
            </li>
        `;

        // Page numbers
        const maxButtons = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if (endPage - startPage < maxButtons - 1) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="historyManager.goToPage(${i}); return false;">${i}</a>
                </li>
            `;
        }

        // Next button
        html += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="historyManager.goToPage(${this.currentPage + 1}); return false;">
                    <i class="bi bi-chevron-right"></i>
                </a>
            </li>
        `;

        pagination.innerHTML = html;
    }

    // Go to page
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredLogs.length / this.itemsPerPage);
        if (page < 1 || page > totalPages) return;

        this.currentPage = page;
        this.renderTable();
        this.renderPagination(this.filteredLogs.length);
    }

    // Show delete modal
    showDeleteModal(id) {
        this.deleteTargetId = id;
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();
    }

    // Confirm delete — try API, then localStorage
    async confirmDelete(id) {
        try {
            // Try API delete first
            let apiSuccess = false;
            try {
                const response = await API.delete(`/logs/${id}`);
                if (response.success) {
                    apiSuccess = true;
                }
            } catch (e) {
                // API not available, will delete from localStorage
            }

            // Always delete from localStorage too
            const stored = JSON.parse(localStorage.getItem('foodHistory') || '[]');
            const updated = stored.filter(item => item.id !== id);
            localStorage.setItem('foodHistory', JSON.stringify(updated));

            // Remove from in-memory arrays
            this.logs = this.logs.filter(log => log.id !== id);
            this.applyFilters();

            if (this.logs.length === 0) {
                this.showEmpty();
            }

            Utils.showToast('ลบรายการสำเร็จ', 'success');
        } catch (error) {
            console.error('Delete error:', error);
            Utils.showToast('เกิดข้อผิดพลาดในการลบ', 'danger');
        } finally {
            this.deleteTargetId = null;
            bootstrap.Modal.getInstance(document.getElementById('deleteModal'))?.hide();
        }
    }

    // Export data to CSV
    exportData() {
        if (this.filteredLogs.length === 0) {
            Utils.showToast('No data to export', 'warning');
            return;
        }

        const headers = ['Date', 'Food Name', 'Food Name (Thai)', 'Calories', 'Protein (g)', 'Fat (g)', 'Carbs (g)', 'Sugar (g)'];
        const rows = this.filteredLogs.map(log => [
            new Date(log.date || log.created_at).toLocaleString(),
            log.food_name,
            log.food_name_th || '',
            log.calories,
            log.protein,
            log.fat,
            log.carbs,
            log.sugar || 0
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `thai-food-history-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        Utils.showToast('Export สำเร็จ', 'success');
    }
}

// Make instance globally available for pagination
let historyManager;

document.addEventListener('DOMContentLoaded', () => {
    historyManager = new HistoryManager();
    historyManager.init();
});
