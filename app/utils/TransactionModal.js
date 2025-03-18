const { validateForm, validateAmountInput } = require('./formValidation');
const { Calendar } = require('./calendar');
const { addTransaction, insertTransaction, renderIncomeList, renderExpenseList } = require('./transactionHandler');


class TransactionModal {
    constructor(transactionModal, saveButton, modalHeader, addIncomeButton, addExpensesButton, closeModalButton) {
        this.transactionModal = transactionModal;
        this.saveButton = saveButton;
        this.modalHeader = modalHeader;
        this.addIncomeButton = addIncomeButton;
        this.addExpensesButton = addExpensesButton;
        this.closeModalButton = closeModalButton;
        this.transactionType = '';
        this.calendar = null;
        this.init();
    }

    init() {
        this.addIncomeButton.addEventListener('click', () => this.openTransactionModal('income'));
        this.addExpensesButton.addEventListener('click', () => this.openTransactionModal('expense'));
        this.closeModalButton.addEventListener('click', () => this.toggleModal(false));
        this.transactionModal.addEventListener('click', (event) => event.target === this.transactionModal && this.toggleModal(false));
        this.transactionModal.addEventListener('click', (event) => this.calendar.isOpen && !event.target.closest('#date, #calendar') ? this.calendar.close() : null );
        this.saveButton.addEventListener('click', this.saveTransaction.bind(this));
    }

    openTransactionModal(type) {
        this.transactionType = type;
        this.modalHeader.innerHTML = this.transactionType === 'income' ? 'Neue Einnahme' : 'Neue Ausgabe';
        this.toggleModal(true);
        this.saveButton.disabled = true;
        this.initializeDatePicker();
        this.attachEventListeners();
    }

    toggleModal(isVisible) {
        this.transactionModal.classList.toggle('visible', isVisible);
        this.transactionModal.classList.toggle('hidden', !isVisible);

        if (!isVisible) {
            this.clearForm();
            this.calendar?.close(); 
        }
    }    

    initializeDatePicker() {
        const today = new Date();
        const dateInput = document.getElementById('date');

        dateInput.value = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
    
        this.calendar = new Calendar(document.getElementById('calendar'), dateInput);
    
        if (!this.dateInputClickListener) {
            this.dateInputClickListener = () => this.calendar.toggle();
            dateInput.addEventListener('click', this.dateInputClickListener);
        }

    }

    attachEventListeners() {
        document.getElementById('date').addEventListener('input', validateForm);
        document.getElementById('description').addEventListener('input', validateForm);
        document.getElementById('amount').addEventListener('input', validateForm);
        document.getElementById('amount').addEventListener('keydown', validateAmountInput);
    }

    clearForm() {
        document.getElementById('date').value = '';
        document.getElementById('description').value = '';
        document.getElementById('amount').value = '';
    }

    async saveTransaction() {
        const date = document.getElementById('date').value.split('.');
        const formattedDate = `${date[2]}-${date[1]}-${date[0]}`;
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        
        try {
            const newTransactionData = await addTransaction(this.transactionType, { date: formattedDate, description, amount });

            if (this.transactionType === 'income') {
                const newIncome = new Income(newTransactionData.date, newTransactionData.description, newTransactionData.amount);
                insertTransaction(incomeList, newIncome, renderIncomeList);
            } else if (this.transactionType === 'expense') {
                const newExpense = new Expense(newTransactionData.date, newTransactionData.description, newTransactionData.amount);
                insertTransaction(expenseList, newExpense, renderExpenseList);
            }
            this.clearForm();
            this.toggleModal(false);
        } catch (error) {
            console.error('Error adding transaction:', error);
        } 
    }
}

module.exports = TransactionModal;