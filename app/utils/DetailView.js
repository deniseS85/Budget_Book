class DetailView {
    constructor(transactionModal) {
        this.transactionWindow = document.getElementById('detail-window');
        this.addIncomeBtn = document.getElementById('add-income');
        this.addExpensesBtn = document.getElementById('add-expenses');
        this.detailViewHeader = document.querySelector('.detail-view-header');
        this.detailHeadline = this.detailViewHeader.querySelector('h4');
        this.closeDetails = document.getElementById('close-details');
        this.transactionModal = transactionModal;
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.closeDetails.addEventListener('mouseover', this.handleMouseOver.bind(this));
        this.closeDetails.addEventListener('mouseout', this.handleMouseOut.bind(this));
        this.closeDetails.addEventListener('click', this.closeDetailView.bind(this));
        this.addIncomeBtn.addEventListener('click', () => this.transactionModal.openTransactionModal('income'));
        this.addExpensesBtn.addEventListener('click', () => this.transactionModal.openTransactionModal('expense'));
    }

    openDetailView(type) {
        this.addIncomeBtn.style.display = type === 'income' ? 'inline-block' : 'none';
        this.addExpensesBtn.style.display = type === 'expense' ? 'inline-block' : 'none';

        this.detailViewHeader.classList.remove('income-detail-header', 'expenses-detail-header');

        if (type === 'income') {
            this.detailViewHeader.classList.add('income-detail-header');
            this.closeDetails.style.setProperty('--hoverColor', '#00ffcc');
            this.detailHeadline.innerHTML = 'Übersicht Einnahmen';
        } else {
            this.detailViewHeader.classList.add('expenses-detail-header');
            this.closeDetails.style.setProperty('--hoverColor', '#fd0290');
            this.detailHeadline.innerHTML = 'Übersicht Ausgaben';
        }
        this.transactionWindow.classList.add('visible');
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
}

module.exports = DetailView;