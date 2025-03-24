const Transaction = require('../models/Transaction');

class DetailView {
    constructor(transactionModal) {
        this.transactionWindow = document.getElementById('detail-window');
        this.addIncomeBtn = document.getElementById('add-income');
        this.addExpensesBtn = document.getElementById('add-expenses');
        this.detailViewHeader = document.querySelector('.detail-view-header');
        this.detailHeadline = this.detailViewHeader.querySelector('h4');
        this.closeDetails = document.getElementById('close-details');
        this.detailsList = document.createElement('tbody');
        this.transactionModal = transactionModal;
        this.attachEventListeners();

        this.attachTransactionSavedListener(); 
    }

    attachEventListeners() {
        this.closeDetails.addEventListener('mouseover', this.handleMouseOver.bind(this));
        this.closeDetails.addEventListener('mouseout', this.handleMouseOut.bind(this));
        this.closeDetails.addEventListener('click', this.closeDetailView.bind(this));
        this.addIncomeBtn.addEventListener('click', () => this.transactionModal.openTransactionModal('income'));
        this.addExpensesBtn.addEventListener('click', () => this.transactionModal.openTransactionModal('expense'));
    }

    openDetailView(type) {
        const config = this.getConfig(type);
        this.addIncomeBtn.style.display = type === 'income' ? 'inline-block' : 'none';
        this.addExpensesBtn.style.display = type === 'expense' ? 'inline-block' : 'none';
        this.detailViewHeader.classList.remove('income-detail-header', 'expenses-detail-header');
        this.detailsList.innerHTML = ''; 
        this.detailViewHeader.classList.add(config.headerClass);
        this.closeDetails.style.setProperty('--hoverColor', config.hoverColor);
        this.detailHeadline.innerHTML = config.title;
        this.renderDetailView(this.createDetailsTable(config.list, type));
        this.transactionWindow.classList.add('visible');
    }

    getConfig(type) {
        const config = {
            income: {
                title: 'Übersicht Einnahmen',
                hoverColor: '#00ffcc',
                headerClass: 'income-detail-header',
                list: incomeList
            },
            expense: {
                title: 'Übersicht Ausgaben',
                hoverColor: '#fd0290',
                headerClass: 'expenses-detail-header',
                list: expenseList
            }
        };
        return config[type];
    }

    renderDetailView(detailsTable) {
        const detailView = document.querySelector('.detail-view');
        detailView.innerHTML = ''; 
        detailView.appendChild(detailsTable);
    }

    createDetailsTable(list, type) {
        const detailsTable = document.createElement('table');
        detailsTable.appendChild(this.detailsList); 
    
        const groupedByMonth = this.groupByMonth(list);
        Object.entries(groupedByMonth).forEach(([month, items]) => {
            this.detailsList.appendChild(this.createMonthHeader(month, type));
            items.forEach(item => this.detailsList.appendChild(this.createDetailRow(item)));
        });
    
        return detailsTable;
    }

    groupByMonth(transactionList) {
        const grouped = {};
        const options = { month: 'long' };

        transactionList.forEach(item => {
            const date = new Date(item.date);
            const month = date.toLocaleString('de-DE', options);

            if (!grouped[month]) { grouped[month] = []; }
            grouped[month].push(item);
        });

        return grouped;
    }

    createMonthHeader(month, type) {
        const monthHeader = document.createElement('tr');
        monthHeader.innerHTML = /*html*/`
            <td class='month-header ${type}' colspan='3'>
                <div class="month-header-wrapper">
                    <span class="month-header-name">${month}</span>
                </div>
            </td>`;
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
        const config = this.getConfig(transaction.type);
        this.detailsList.innerHTML = '';
        this.renderDetailView(this.createDetailsTable(config.list, transaction.type));
    }
    
}

module.exports = DetailView;