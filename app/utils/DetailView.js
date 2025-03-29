class DetailView {
    constructor(transactionModal) {
        this.transactionWindow = document.getElementById('detail-window');
        this.addIncomeBtn = document.getElementById('add-income');
        this.addExpensesBtn = document.getElementById('add-expenses');
        this.detailViewHeader = document.querySelector('.detail-view-header');
        this.detailHeadline = this.detailViewHeader.querySelector('h4');
        this.closeDetails = document.getElementById('close-details');
        this.detailsList = document.createElement('div');
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
        this.detailsList.classList.add('detailsList');
        const groupedByMonth = this.groupByMonthYear(list);

        this.addSpacerTop();
        
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

    addSpacerTop() {
        if (!this.detailsList.querySelector('.spacer')) {
            const spacer = document.createElement('div');
            spacer.classList.add('spacer');
            this.detailsList.appendChild(spacer);
        }
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