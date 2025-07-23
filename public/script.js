// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    // Configuration constants and application state
    const API_BASE_URL = '/api/expenses';
    const CURRENCY = 'EGP';
    let state = {
        allExpenses: [], // Stores all fetched expenses
        summary: { budget: 0, total: 0, byCategory: {} } // Stores monthly summary data
    };

    // Get references to key DOM elements
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const totalAmountEl = document.getElementById('total-amount');
    const addExpenseBtn = document.getElementById('add-expense-btn');
    const toastEl = document.getElementById('toast');
    const summaryMonthEl = document.getElementById('summary-month');
    const summaryYearEl = document.getElementById('summary-year');
    const donutFill = document.getElementById('donut-fill');
    const progressPercentageEl = document.getElementById('progress-percentage');
    const spentValueEl = document.getElementById('spent-value');
    const budgetValueDisplayEl = document.getElementById('budget-value-display');
    const budgetValueEl = document.getElementById('budget-value');
    const budgetInputForm = document.getElementById('budget-input-form');
    const budgetInput = document.getElementById('budget-input');
    const remainingValueEl = document.getElementById('remaining-value');
    const categoryChartEl = document.getElementById('category-chart');
    
    // Donut chart setup (circumference for stroke-dasharray)
    const circumference = 2 * Math.PI * 42; 
    donutFill.style.strokeDasharray = circumference;

    // Mapping categories to their respective Font Awesome icons
    const categoryIconMap = new Map([
        ['fas fa-utensils', ['food', 'grocer', 'restaurant', 'meal', 'طعام', 'أكل', 'مطعم']],
        ['fas fa-file-invoice-dollar', ['bill', 'utility', 'rent', 'فاتورة', 'كهرباء', 'ايجار']],
        ['fas fa-car', ['transport', 'taxi', 'uber', 'gas', 'fuel', 'مواصلات', 'بنزين']],
        ['fas fa-shopping-bag', ['shopping', 'clothes', 'mall', 'تسوق', 'ملابس']],
        ['fas fa-heartbeat', ['health', 'doctor', 'pharmacy', 'صحة', 'دكتور', 'صيدلية']],
        ['fas fa-film', ['entertainment', 'movie', 'cinema', 'game', 'ترفيه', 'سينما']],
        ['fas fa-plane', ['travel', 'flight', 'hotel', 'سفر', 'فندق']],
        ['fas fa-ellipsis-h', ['misc', 'other', 'متنوع', 'اخرى']]
    ]);
    // Function to get icon based on category keywords
    const getCategoryIcon = (category) => {
        const catLower = category.toLowerCase();
        for (const [icon, keywords] of categoryIconMap.entries()) {
            if (keywords.some(keyword => catLower.includes(keyword))) return icon;
        }
        return 'fas fa-dollar-sign'; // Default icon
    };

    // Displays a toast notification with a message and type (success/error)
    const showToast = (message, type = 'success') => {
        toastEl.textContent = message;
        toastEl.className = `toast show ${type}`;
        setTimeout(() => { toastEl.className = toastEl.className.replace('show', ''); }, 3000);
    };

    // Sets the loading state for a button (disables and shows spinner)
    const setLoadingState = (button, isLoading) => {
        const span = button.querySelector('span');
        button.disabled = isLoading;
        span.innerHTML = isLoading ? '<div class="spinner"></div>' : 'Add Expense';
    };

    // Renders the list of recent transactions (expenses)
    const renderTransactions = () => {
        expenseList.innerHTML = ''; // Clear existing list items
        const recentExpenses = state.allExpenses.slice(0, 15); // Show only recent 15
        recentExpenses.forEach(expense => {
            const item = document.createElement('li');
            item.setAttribute('data-id', expense._id);
            item.innerHTML = `
                <div class="expense-info">
                    <i class="${getCategoryIcon(expense.category)} category-icon"></i>
                    <div class="description-group">
                        <span class="description">${expense.description}</span>
                        <span class="category">${expense.category}</span>
                    </div>
                </div>
                <div class="amount-group">
                    <span class="expense-amount">${expense.amount.toFixed(2)} ${CURRENCY}</span>
                    <button class="delete-btn" aria-label="Delete expense"><i class="fas fa-trash"></i></button>
                </div>`;
            expenseList.appendChild(item);
        });
        // Update total all-time expenses display
        const totalSpent = state.allExpenses.reduce((acc, exp) => acc + exp.amount, 0);
        totalAmountEl.textContent = `${totalSpent.toFixed(2)} ${CURRENCY}`;
    };
    
    // Renders the monthly summary (donut chart, budget details, category breakdown)
    const renderSummary = () => {
        const { budget = 0, total: spent = 0, byCategory = {} } = state.summary;
        const remaining = budget - spent;
        const percentage = budget > 0 ? (spent / budget) * 100 : 0;
        
        // Update donut chart fill based on percentage spent
        const offset = circumference - (percentage / 100) * circumference;
        donutFill.style.strokeDashoffset = Math.max(0, offset);
        // Change donut color based on spending percentage
        donutFill.classList.remove('high', 'medium', 'low');
        if (percentage > 85) donutFill.classList.add('high');
        else if (percentage > 60) donutFill.classList.add('medium');
        else donutFill.classList.add('low');

        // Update text values for percentage, spent, budget, and remaining
        progressPercentageEl.textContent = `${Math.round(percentage)}%`;
        spentValueEl.textContent = `${spent.toFixed(2)}`;
        budgetValueEl.textContent = `${budget.toFixed(2)}`;
        remainingValueEl.textContent = `${remaining.toFixed(2)}`;
        remainingValueEl.classList.toggle('negative', remaining < 0); // Apply negative style if remaining is less than 0
        
        // Render category breakdown chart
        categoryChartEl.innerHTML = '';
        const sortedCategories = Object.entries(byCategory).sort(([,a],[,b]) => b - a); // Sort categories by amount
        const maxCategoryTotal = sortedCategories.length > 0 ? sortedCategories[0][1] : 0;
        
        if (sortedCategories.length === 0) {
            categoryChartEl.innerHTML = '<li>No expenses for this period.</li>';
        } else {
            sortedCategories.forEach(([cat, amount]) => {
                const barWidth = maxCategoryTotal > 0 ? (amount / maxCategoryTotal) * 100 : 0;
                const item = document.createElement('li');
                item.className = 'chart-item';
                item.innerHTML = `
                    <span class="chart-label">${cat}</span>
                    <div class="chart-bar-container"><div class="chart-bar" style="width: ${barWidth}%;"></div></div>
                    <span class="chart-amount">${amount.toFixed(2)}</span>`;
                categoryChartEl.appendChild(item);
            });
        }
    };

    // Fetches all expenses from the API
    const fetchAllExpenses = async () => {
        try {
            const res = await fetch(API_BASE_URL);
            if (!res.ok) throw new Error('Failed to fetch expenses.');
            state.allExpenses = (await res.json()).sort((a,b) => new Date(b.date) - new Date(a.date));
            renderTransactions();
        } catch (err) { console.error(err); showToast(err.message, 'error'); } // Log and show error toast
    };
    
    // Fetches the monthly expense summary from the API
    const fetchSummary = async () => {
        const year = summaryYearEl.value;
        const month = summaryMonthEl.value;
        try {
            const res = await fetch(`${API_BASE_URL}/report/${year}/${month}`);
            if (!res.ok) throw new Error('No data for this period.');
            state.summary = await res.json();
        } catch (err) { state.summary = { budget: 0, total: 0, byCategory: {} }; } // Reset summary on error
        renderSummary();
    };

    // Handles adding a new expense via form submission
    const addExpense = async (e) => {
        e.preventDefault(); // Prevent default form submission
        const newExpense = {
            description: document.getElementById('description').value.trim(),
            amount: +document.getElementById('amount').value,
            category: document.getElementById('category').value.trim()
        };
        // Validate input fields
        if (!newExpense.description || !newExpense.amount || !newExpense.category) {
            return showToast('Please fill all fields', 'error');
        }
        setLoadingState(addExpenseBtn, true); // Show loading spinner
        try {
            const res = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newExpense)
            });
            if (!res.ok) throw new Error('Failed to add expense.');
            expenseForm.reset(); // Clear form fields
            showToast('Expense added!', 'success');
            // Refresh both transactions and summary after adding
            await Promise.all([fetchAllExpenses(), fetchSummary()]);
        } catch (err) { showToast(err.message, 'error'); } 
        finally { setLoadingState(addExpenseBtn, false); } // Hide loading spinner
    };

    // Handles deleting an expense by its ID
    const deleteExpense = async (id) => {
        try {
            const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete expense.');
            showToast('Expense deleted.', 'success');
            // Refresh both transactions and summary after deleting
            await Promise.all([fetchAllExpenses(), fetchSummary()]);
        } catch (err) { showToast(err.message, 'error'); } // Show error toast
    };
    
    // Handles setting the budget amount
    const setBudget = async (newBudgetValue) => {
        const budget = parseFloat(newBudgetValue);
        if (isNaN(budget) || budget < 0) return; // Validate budget input
        try {
            await fetch(`${API_BASE_URL}/budget`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ budget }),
            });
            state.summary.budget = budget; // Update local state
            renderSummary(); // Re-render summary with new budget
            showToast('Budget updated!', 'success');
        } catch (error) { showToast('Failed to update budget.', 'error'); } // Show error toast
    };
    
    // Initialization function: sets up initial UI and event listeners
    const init = () => {
        // Set current month and year for summary controls
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        summaryYearEl.value = currentYear;
        // Populate month dropdown
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        summaryMonthEl.innerHTML = months.map((month, i) => `<option value="${i+1}">${month}</option>`).join('');
        summaryMonthEl.value = currentMonth;
        
        // Event listener for adding expenses
        expenseForm.addEventListener('submit', addExpense);

        // Event listener for deleting expenses (event delegation)
        expenseList.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn && confirm('Delete this expense?')) {
                deleteExpense(deleteBtn.closest('li').dataset.id);
            }
        });

        // Event listeners for changing month/year in summary
        [summaryMonthEl, summaryYearEl].forEach(el => el.addEventListener('change', fetchSummary));

        // Logic for editing budget value directly in the display
        let isEditingBudget = false;
        budgetValueEl.addEventListener('click', () => {
            if (isEditingBudget) return;
            isEditingBudget = true;
            budgetValueEl.style.display = 'none';
            budgetInputForm.style.display = 'inline-block';
            budgetInput.value = state.summary.budget > 0 ? state.summary.budget : '';
            budgetInput.focus();
            budgetInput.select();
        });

        // Function to finalize budget editing
        const finishBudgetEdit = () => {
            if (!isEditingBudget) return;
            setBudget(budgetInput.value);
            budgetInputForm.style.display = 'none';
            budgetValueEl.style.display = 'inline';
            isEditingBudget = false;
        };

        // Event listeners for budget input form
        budgetInputForm.addEventListener('submit', (e) => { e.preventDefault(); finishBudgetEdit(); });
        budgetInput.addEventListener('blur', finishBudgetEdit);

        // Initial data fetching when the page loads
        fetchAllExpenses();
        fetchSummary();
    };

    // Call the initialization function
    init();
});