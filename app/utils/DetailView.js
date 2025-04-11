const TransactionUIConfig = require('../utils/TransactionUIConfig');
const transactionUI = new TransactionUIConfig();
const { CategoryDropdown } = require('../utils/CategoryDropdown');
const { Calendar } = require('../utils/Calendar');
const FormValidator = require('../utils/FormValidator');

class DetailView {
    constructor(transactionModal) {
        this.transactionWindow = document.getElementById('detail-window');
        this.addIncomeBtn = document.getElementById('add-income');
        this.addExpensesBtn = document.getElementById('add-expenses');
        this.detailViewHeader = document.querySelector('.detail-view-header');
        this.detailHeadline = this.detailViewHeader.querySelector('h4');
        this.detailView = document.querySelector('.detail-view'); 
        this.closeDetails = document.getElementById('close-details');
        this.detailsList = document.createElement('div');
        this.transactionModal = transactionModal;
        this.transactionType = '';
        this.categories = { income: [], expense: [] }; 
        this.categoryDropdown = null;
        this.calendar = null;
        this.filterState = {}; 
        this.attachEventListeners();
        this.attachTransactionSavedListener(); 
    }

    attachEventListeners() {
        this.closeDetails.addEventListener('mouseover', this.handleMouseOver.bind(this));
        this.closeDetails.addEventListener('mouseout', this.handleMouseOut.bind(this));
        this.closeDetails.addEventListener('click', this.closeDetailView.bind(this));
        this.addIncomeBtn.addEventListener('click', () => this.transactionModal.openTransactionModal('income'));
        this.addExpensesBtn.addEventListener('click', () => this.transactionModal.openTransactionModal('expense'));
        this.transactionWindow.addEventListener('click', (event) => {
            if (this.categoryDropdown?.isOpen && !event.target.closest('#filter-category-input, #filter-category-dropdown')) {
                this.categoryDropdown.closeDropdown();
            } else if (this.calendar?.isOpen && !event.target.closest('#filter-date, #filter-calendar')) {
                this.calendar.closeCalendar();
            }
        });
    }

    openDetailView(type) {
        this.transactionType = type;
        const config = transactionUI.getTransactionConfig(this.transactionType);
        this.updateDetailViewHeader(config);
        this.updateDetailViewBody(config);
        this.transactionWindow.classList.add('visible');
    }

    updateDetailViewHeader(config) {
        transactionUI.setTransactionColors(this.transactionType);
        this.detailView.classList.remove('detail-income', 'detail-expense');
        this.detailView.classList.add(`detail-${this.transactionType}`);
        this.setButtonForType();
        this.detailViewHeader.classList.remove('income-detail-header', 'expenses-detail-header');
        this.detailViewHeader.classList.add(config.headerClass);
        this.detailHeadline.innerHTML = config.title;
        this.closeDetails.style.setProperty('--hoverColor', config.hoverColor);
    }

    setButtonForType() {
        this.addIncomeBtn.style.display = this.transactionType  === 'income' ? 'inline-block' : 'none';
        this.addExpensesBtn.style.display = this.transactionType  === 'expense' ? 'inline-block' : 'none';
    }

    updateDetailViewBody(config) {
        this.detailsList.innerHTML = ''; 
        this.renderDetailView(this.createDetailsTable(config.list, this.transactionType), this.transactionType)
        transactionUI.setFilterButtonsImg(this.transactionType);
        this.openCategoryDropdown(this.transactionType);
        this.openDatePicker();
        this.setFilterValues();
        this.resetFilterInputs();
        this.addApplyFilterListener(config);
    }

    setFilterValues() {
        document.getElementById('filter-category-input').value = this.filterState.category || 'Alle Kategorien';
        document.getElementById('filter-amount-from').value = this.filterState.amountFrom || '';
        document.getElementById('filter-amount-to').value = this.filterState.amountTo || '';
        if (this.filterState.date) {
            const start = this.filterState.date.start.toLocaleDateString('de-DE');
            const end = this.filterState.date.end.toLocaleDateString('de-DE');
            document.getElementById('filter-date').value = `${start} – ${end}`;
        } else {
            document.getElementById('filter-date').value = 'Alle Daten';
        }
    }
    
    resetFilterInputs() {
        const clearFilterBtn = document.getElementById('clear-filter');
        if (clearFilterBtn) {
            clearFilterBtn.addEventListener('click', this.resetFilters.bind(this));
        }
    }

    resetFilters() {
        document.getElementById('filter-category-input').value = '';
        document.getElementById('filter-amount-from').value = '';
        document.getElementById('filter-amount-to').value = '';
        document.getElementById('filter-date').value = 'Alle Daten';
        this.filterState = {};
        const config = transactionUI.getTransactionConfig(this.transactionType);
        this.updateDetailViewBody(config);
    }

    addApplyFilterListener(config) {
        const applyFilterBtn = document.getElementById('apply-filter');
        if (applyFilterBtn) {
            applyFilterBtn.addEventListener('click',  this.applyFilters.bind(this, config)); 
        }
    }

    applyFilters(config) {
        this.saveFilterState();

        const categoryFilter = this.filterState.category;
        const amountFrom = this.filterState.amountFrom;
        const amountTo = this.filterState.amountTo;
        const dateFilter = this.filterState.date;
        const startDate = dateFilter ? dateFilter.start : null;
        const endDate = dateFilter ? dateFilter.end : null;
        this.filterState.date = dateFilter; 
        
        config.originalList ||= [...config.list];
        config.list = [...config.originalList];

        const filteredList = this.filterList(config.list, categoryFilter, amountFrom, amountTo, startDate, endDate);
        config.list = filteredList;
    
        this.updateDetailViewBody(config);
    }

    saveFilterState() {
        const dateRange = document.getElementById('filter-date').value || 'Alle Daten';
        let startDate = null;
        let endDate = null;

        if (dateRange !== 'Alle Daten' && dateRange.includes('–')) {
            const dateParts = dateRange.split('–').map(date => date.trim());
            startDate = new Date(dateParts[0].split('.').reverse().join('-'));
            endDate = new Date(dateParts[1].split('.').reverse().join('-'));
        }

        this.filterState = {
            category: document.getElementById('filter-category-input').value || 'Alle Kategorien',
            amountFrom: document.getElementById('filter-amount-from').value || '',
            amountTo: document.getElementById('filter-amount-to').value || '',
            date: startDate && endDate ? { start: startDate, end: endDate } : null,
        };
    }
    
    filterList(list, categoryFilter, amountFrom, amountTo, startDate, endDate) {
        const amountFromParsed = amountFrom !== "" ? parseFloat(amountFrom) * 100 : null;
        const amountToParsed = amountTo !== "" ? parseFloat(amountTo) * 100 : null;

    
        return list.filter(item => {
            const categoryMatch = categoryFilter && categoryFilter !== 'Alle Kategorien' ? item.category === categoryFilter : true;
            const amountMatch = (amountFromParsed === null || item.amount >= amountFromParsed) && (amountToParsed === null || item.amount <= amountToParsed);
            const itemDate = new Date(item.date);
            const dateMatch = 
                (startDate === null || itemDate >= startDate) && 
                (endDate === null || itemDate <= endDate);
    
            return categoryMatch && amountMatch && dateMatch;
        });
    }

    updateCategoriesData(categories) {
        this.categories = categories;
    }

    openCategoryDropdown(type) {
        const categoryFilterInput = document.getElementById('filter-category-input');
        categoryFilterInput.value = 'Alle Kategorien';
        const dropdownList = document.getElementById('filter-category-dropdown');
        const categories = this.categories[type] || [];
        this.categoryDropdown = new CategoryDropdown(categoryFilterInput, dropdownList, categories, true);
    }

    openDatePicker() {
        const dateInput = document.getElementById('filter-date');
        dateInput.value = 'Alle Daten';
    
        this.calendar = new Calendar(document.getElementById('filter-calendar'), dateInput, true, this.transactionType);
    
        if (this.dateInputClickListener) {
            dateInput.removeEventListener('click', this.dateInputClickListener);
        }
        this.dateInputClickListener = () => this.calendar.toggleCalendar();
        dateInput.addEventListener('click', this.dateInputClickListener);
    }

    renderDetailView(detailsTable, type) {
        this.detailView.innerHTML = ''; 
        const filterContainer = this.createFilterBar(type);
        this.detailView.appendChild(filterContainer); 
        this.detailView.appendChild(detailsTable);
        this.detailView.scrollTop = 0;
    }
    

    createFilterBar(type) {
        const filterContainer = document.createElement('div');
        filterContainer.classList.add('detail-view-filter');

        const filterHTML = /*html*/`
            <div class="filter-category-container">
                <input type="text" id="filter-category-input" autocomplete="off">
                <ul class="dropdown-list dropdown-${type}" id="filter-category-dropdown"></ul>
            </div>

            <div class="filter-amount-container">
                <input type="text" id="filter-amount-from" placeholder="Betrag von" autocomplete="off">
                <span>&ndash;</span>
                <input type="text" id="filter-amount-to" placeholder="Betrag bis" autocomplete="off">
            </div>
            
            <div class="filter-calendar-container">
                <input type="text" id="filter-date">
                <div id="filter-calendar" class="calendar"></div>
            </div>
           
            <div class="filter-btn-container">
                <button id="apply-filter"></button>
                <button id="clear-filter"></button>
            </div>`;

        filterContainer.innerHTML = filterHTML;
        this.validateAmountInput();
        return filterContainer;
    }

    validateAmountInput() {
        setTimeout(() => {
            const formValidator = new FormValidator();
            const amountInputs = [
                document.getElementById('filter-amount-from'),
                document.getElementById('filter-amount-to')
            ];
    
            amountInputs.forEach(input => {
                input.addEventListener('keydown', (event) => formValidator.validateAmountInput(event));
            });
        }, 0); 
    }

    createDetailsTable(list, type) {
        this.detailsList.classList.add('detailsList');
    
        const groupedByMonth = this.groupByMonthYear(list);
        
        Object.entries(groupedByMonth).forEach(([key, items]) => {
            const [year, month] = key.split(' ');
            const detailsTable = document.createElement('table');

            const thead = document.createElement('thead');
            thead.appendChild(this.createMonthHeader(month, year, type));
            detailsTable.appendChild(thead);
    
            const tbody = document.createElement('tbody');
            items.forEach(item => tbody.appendChild(this.createDetailRow(item)));
            
            detailsTable.appendChild(tbody);
            this.detailsList.appendChild(detailsTable);
        });

        return this.detailsList;
    }
        
    groupByMonthYear(transactionList) {
        const grouped = {};
        const options = { month: 'long' };

        transactionList.forEach(item => {
            const date = new Date(item.date);
            const year = date.getFullYear();
            const month = date.toLocaleString('de-DE', options);
            const key = `${year} ${month}`;

            if (!grouped[key]) { grouped[key] = []; }
            grouped[key].push(item);
        });
        return grouped;
    }

    createMonthHeader(month, year, type) {
        const monthHeader = document.createElement('tr');
        monthHeader.innerHTML = /*html*/`
            <th class='month-header ${type}' colspan='3'> 
                <div class="month-header-wrapper">
                    <span class='month-header-name ${type}' colspan='3'>${month} ${year}</span>
                </div>
            </th>`;
        return monthHeader;
    }
    
    createDetailRow(item) {
        const row = document.createElement('tr');
        row.innerHTML = /*html*/`
            <td>${item.formatDate()}</td>
            <td>${item.category}</td>
            <td>${item.formatAmount()}</td>`;
        return row;
    }

    closeDetailView() {
        this.transactionWindow.classList.remove('visible');
        this.addIncomeBtn.style.display = 'none';
        this.addExpensesBtn.style.display = 'none';
        this.categoryDropdown?.closeDropdown();
        this.calendar?.closeCalendar();
        this.filterState = {};
    }

    handleMouseOver(event) {
        const hoverColor = getComputedStyle(event.target).getPropertyValue('--hoverColor');
        event.target.style.color = hoverColor;
    }

    handleMouseOut(event) {
        event.target.style.color = '';
    }

    attachTransactionSavedListener() {
        document.addEventListener('transactionSaved', (event) => {
            const transaction = event.detail;
            this.updateTransactionTable(transaction);
        });
    }

    updateTransactionTable(transaction) {
        this.transactionType = transaction.type;
        const config = transactionUI.getTransactionConfig(transaction.type);
        this.updateDetailViewBody(config);
    } 
}

module.exports = DetailView;