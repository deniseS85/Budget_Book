const TransactionUIConfig = require('../utils/TransactionUIConfig');
const transactionUI = new TransactionUIConfig();
const { CategoryDropdown } = require('../utils/CategoryDropdown');

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
    }

    updateCategoriesData(categories) {
        this.categories = categories;
    }

    openCategoryDropdown(type) {
        const categoryFilterInput = document.getElementById('filter-category-input');
        const dropdownList = document.getElementById('filter-category-dropdown');
        const categories = this.categories[type] || [];
        this.categoryDropdown = new CategoryDropdown(categoryFilterInput, dropdownList, categories);
    }

    renderDetailView(detailsTable, type) {
        this.detailView.innerHTML = ''; 
        const filterContainer = this.createFilterBar(type);
        this.detailView.appendChild(filterContainer); 
        this.detailView.appendChild(detailsTable);
        this.detailView.scrollTop = 0;
    }

    /* ##########Buttons abhängig income oder expense ############# */
    createFilterBar(type) {
        const filterContainer = document.createElement('div');
        filterContainer.classList.add('detail-view-filter');
        filterContainer.innerHTML = /*html*/`
            <div class="filter-category-container">
                <input type="text" id="filter-category-input" placeholder="Alle Kategorien" autocomplete="off">
                <ul class="dropdown-list dropdown-${type}" id="filter-category-dropdown"></ul>
            </div>


           <!--  <input type="text" placeholder="Kategorie" id="filter-category"> -->
            <input type="number" placeholder="Alle Beträge" id="filter-min">
           <!--  <input type="number" placeholder="Max €" id="filter-max"> -->
            <input type="date" id="filter-from">
            <!-- <input type="date" id="filter-to"> -->
            <button id="apply-filter"></button>
            <button id="clear-filter"></button>
        `;
        return filterContainer;
    }
    /* ####################### */

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
        const config = transactionUI.getTransactionConfig(transaction.type);
        this.detailsList.innerHTML = '';
        this.renderDetailView(this.createDetailsTable(config.list, transaction.type));
    } 
}

module.exports = DetailView;