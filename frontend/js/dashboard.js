/**
 * =====================================================
 * Dashboard Page JavaScript
 * Handles charts and dashboard statistics
 * Uses localStorage + API fallback
 * =====================================================
 */

class DashboardManager {
    constructor() {
        this.weeklyChart = null;
        this.nutritionChart = null;
    }

    // Initialize dashboard
    async init() {
        this.showLoading();
        await this.loadDashboardData();
    }

    // Show loading state
    showLoading() {
        document.getElementById('loadingState')?.classList.remove('d-none');
        document.getElementById('dashboardContent')?.classList.add('d-none');
        document.getElementById('emptyState')?.classList.add('d-none');
        document.getElementById('loginPrompt')?.classList.add('d-none');
    }

    // Show login prompt
    showLoginPrompt() {
        document.getElementById('loadingState')?.classList.add('d-none');
        document.getElementById('dashboardContent')?.classList.add('d-none');
        document.getElementById('emptyState')?.classList.add('d-none');
        document.getElementById('loginPrompt')?.classList.remove('d-none');
    }

    // Show dashboard content
    showDashboard() {
        document.getElementById('loadingState')?.classList.add('d-none');
        document.getElementById('dashboardContent')?.classList.remove('d-none');
        document.getElementById('emptyState')?.classList.add('d-none');
        document.getElementById('loginPrompt')?.classList.add('d-none');
    }

    // Show empty state
    showEmpty() {
        document.getElementById('loadingState')?.classList.add('d-none');
        document.getElementById('dashboardContent')?.classList.add('d-none');
        document.getElementById('emptyState')?.classList.remove('d-none');
        document.getElementById('loginPrompt')?.classList.add('d-none');
    }

    // Load dashboard data — try API, then localStorage
    async loadDashboardData() {
        // Try API first
        try {
            const response = await API.get('/logs/dashboard');
            if (response.success && response.data) {
                const data = response.data;
                if (data.today.total_calories === 0 && data.week.total === 0) {
                    // API returned but no data — check localStorage
                    throw new Error('No API data');
                }
                this.showDashboard();
                this.updateStats(data);
                this.createWeeklyChart(data.week.daily);
                this.createNutritionChart(data.today);
                this.updateHealthStatus(data);
                this.updateRecentLogs(data.recent_logs);
                return;
            }
        } catch (e) {
            console.log('API not available, using localStorage');
        }

        // Fallback: compute stats from localStorage
        this.loadFromLocalStorage();
    }

    // Compute dashboard stats from localStorage foodHistory
    loadFromLocalStorage() {
        const logs = JSON.parse(localStorage.getItem('foodHistory') || '[]');

        if (logs.length === 0) {
            this.showEmpty();
            return;
        }

        this.showDashboard();

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        // Today's stats
        const todayLogs = logs.filter(l => {
            const d = new Date(l.date || l.created_at);
            return d.toISOString().split('T')[0] === todayStr;
        });

        const todayCalories = todayLogs.reduce((s, l) => s + (l.calories || 0), 0);
        const todayMeals = todayLogs.length;

        // Weekly stats (last 7 days)
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const weekLogs = logs.filter(l => {
            const d = new Date(l.date || l.created_at);
            return d >= weekAgo;
        });

        const weekTotal = weekLogs.reduce((s, l) => s + (l.calories || 0), 0);

        // Group by day for the chart
        const dailyMap = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            dailyMap[key] = { date: key, total_calories: 0, meal_count: 0 };
        }
        weekLogs.forEach(l => {
            const key = new Date(l.date || l.created_at).toISOString().split('T')[0];
            if (dailyMap[key]) {
                dailyMap[key].total_calories += l.calories || 0;
                dailyMap[key].meal_count += 1;
            }
        });
        const dailyData = Object.values(dailyMap);

        // Days with data
        const daysWithData = dailyData.filter(d => d.total_calories > 0).length;
        const avgDaily = daysWithData > 0 ? Math.round(weekTotal / daysWithData) : 0;

        // Build data object
        const data = {
            today: { total_calories: todayCalories, meal_count: todayMeals },
            week: {
                total: weekTotal,
                daily: dailyData,
                avg: avgDaily
            }
        };

        // Today's nutrition for pie chart
        const todayProtein = todayLogs.reduce((s, l) => s + (parseFloat(l.protein) || 0), 0);
        const todayFat = todayLogs.reduce((s, l) => s + (parseFloat(l.fat) || 0), 0);
        const todayCarbs = todayLogs.reduce((s, l) => s + (parseFloat(l.carbs) || 0), 0);

        this.updateStats(data);
        this.createWeeklyChart(dailyData);
        this.createNutritionChart({
            total_protein: todayProtein || 0,
            total_fat: todayFat || 0,
            total_carbs: todayCarbs || 0
        });
        this.updateHealthStatus(data);

        // Recent logs (last 3)
        const recentLogs = logs.slice(0, 3).map(l => ({
            food_name: l.food_name,
            food_name_th: l.food_name_th || '',
            calories: l.calories,
            image_data: l.image_data || '',
            image_path: l.image_path || '',
            created_at: l.date || l.created_at
        }));
        this.updateRecentLogs(recentLogs);
    }

    // Update statistics cards
    updateStats(data) {
        const todayCalories = document.getElementById('todayCalories');
        const mealsToday = document.getElementById('mealsToday');
        const weeklyCalories = document.getElementById('weeklyCalories');
        const avgDaily = document.getElementById('avgDaily');

        if (todayCalories) todayCalories.textContent = data.today.total_calories || 0;
        if (mealsToday) mealsToday.textContent = data.today.meal_count || 0;
        if (weeklyCalories) weeklyCalories.textContent = data.week.total || 0;
        if (avgDaily) avgDaily.textContent = Math.round(data.week.avg || 0);
    }

    // Create weekly calories chart
    createWeeklyChart(dailyData) {
        const ctx = document.getElementById('weeklyChart')?.getContext('2d');
        if (!ctx) return;

        if (this.weeklyChart) {
            this.weeklyChart.destroy();
        }

        const labels = dailyData.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        });

        const data = dailyData.map(d => d.total_calories);

        this.weeklyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Calories',
                    data: data,
                    backgroundColor: 'rgba(232, 93, 38, 0.8)',
                    borderColor: 'rgba(232, 93, 38, 1)',
                    borderWidth: 1,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // Create nutrition breakdown pie chart
    createNutritionChart(todayData) {
        const ctx = document.getElementById('nutritionChart')?.getContext('2d');
        if (!ctx) return;

        if (this.nutritionChart) {
            this.nutritionChart.destroy();
        }

        const protein = todayData.total_protein || 0;
        const fat = todayData.total_fat || 0;
        const carbs = todayData.total_carbs || 0;

        this.nutritionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Protein', 'Fat', 'Carbs'],
                datasets: [{
                    data: [protein, fat, carbs],
                    backgroundColor: [
                        'rgba(192, 57, 43, 0.8)',
                        'rgba(212, 168, 67, 0.8)',
                        'rgba(45, 80, 22, 0.8)'
                    ],
                    borderColor: [
                        'rgba(192, 57, 43, 1)',
                        'rgba(212, 168, 67, 1)',
                        'rgba(45, 80, 22, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    // Update health status
    updateHealthStatus(data) {
        const healthStatus = document.getElementById('healthStatus');
        if (!healthStatus) return;

        const todayCalories = data.today.total_calories || 0;

        let status, message, color;

        if (todayCalories === 0) {
            status = 'neutral';
            message = 'Start tracking your meals to see your health status';
            color = 'secondary';
        } else if (todayCalories < 1500) {
            status = 'low';
            message = 'Your calorie intake is below average today. Consider eating more nutritious food.';
            color = 'warning';
        } else if (todayCalories > 2500) {
            status = 'high';
            message = 'Your calorie intake is above average today. Consider some physical activity.';
            color = 'danger';
        } else {
            status = 'good';
            message = 'Great job! Your calorie intake is within a healthy range today.';
            color = 'success';
        }

        healthStatus.innerHTML = `
            <div class="alert alert-${color} mb-0" role="alert">
                <i class="bi bi-heart-pulse-fill me-2 fs-4"></i>
                <strong class="d-block mb-2">Health Status: ${status === 'good' ? 'Excellent' : status === 'neutral' ? 'Not Tracked' : status === 'low' ? 'Low Intake' : 'High Intake'}</strong>
                <p class="mb-0">${message}</p>
            </div>
        `;
    }

    // Update recent logs
    updateRecentLogs(logs) {
        const container = document.getElementById('recentLogs');
        if (!container) return;

        if (!logs || logs.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center text-muted py-4">
                    <i class="bi bi-inbox display-1"></i>
                    <p class="mt-2">No recent analyses. <a href="camera.html">Analyze your first food!</a></p>
                </div>
            `;
            return;
        }

        container.innerHTML = logs.map(log => {
            // Determine image source
            let imgSrc = 'https://via.placeholder.com/300x150/FFF8F0/E85D26?text=🍜';
            if (log.image_data && log.image_data.startsWith('data:')) {
                imgSrc = log.image_data;
            } else if (log.image_path && !log.image_path.includes('default.jpg')) {
                imgSrc = log.image_path.startsWith('/')
                    ? CONFIG.API_BASE_URL.replace('/api', '') + log.image_path
                    : log.image_path;
            }

            return `
            <div class="col-md-4">
                <div class="card h-100">
                    <img src="${imgSrc}" 
                         class="card-img-top" alt="${log.food_name}"
                         style="height: 150px; object-fit: cover;"
                         onerror="this.src='https://via.placeholder.com/300x150/FFF8F0/E85D26?text=🍜'">
                    <div class="card-body">
                        <h6 class="card-title fw-bold">${log.food_name}</h6>
                        <p class="text-muted small mb-1">${log.food_name_th || ''}</p>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <span class="badge bg-primary">${log.calories} kcal</span>
                            <small class="text-muted">${Utils.formatRelativeTime(log.created_at || log.date)}</small>
                        </div>
                    </div>
                </div>
            </div>
        `}).join('');
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    const dashboardManager = new DashboardManager();
    dashboardManager.init();
});
