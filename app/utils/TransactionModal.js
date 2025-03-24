const { validateForm, validateAmountInput } = require('../utils/formValidation');
const { Calendar } = require('./Calendar');
const { CategoryDropdown } = require('./CategoryDropdown');
const { addTransaction, insertTransaction } = require('./transactionHandler');
const { renderIncomeList, renderExpenseList } = require('../utils/renderHTML_MainView');
class TransactionModal {
    constructor(transactionModal, saveButton, modalHeader, closeModalButton, categories = []) {
        this.transactionModal = transactionModal;
        this.saveButton = saveButton;
        this.modalHeader = modalHeader;
        this.closeModalButton = closeModalButton;
        this.transactionType = '';
        this.categories = categories; 
        this.calendar = null;
        this.categoryDropdown = null;
        this.init();
    }

    init() {
        this.closeModalButton.addEventListener('click', () => this.toggleModal(false));
        this.transactionModal.addEventListener('click', (event) => {
            if (event.target === this.transactionModal) {
                this.toggleModal(false);
            } else if (this.calendar?.isOpen && !event.target.closest('#date, #calendar')) {
                this.calendar.closeCalendar();
            } else if (this.categoryDropdown?.isOpen && !event.target.closest('#category, #dropdown')) {
                this.categoryDropdown.closeDropdown();
            }
        });
        this.saveButton.addEventListener('click', this.saveTransaction.bind(this));
    }

    openTransactionModal(type) {
        this.transactionType = type;
        this.modalHeader.innerHTML = this.transactionType === 'income' ? 'Neue Einnahme' : 'Neue Ausgabe';
        this.toggleModal(true);
        this.saveButton.disabled = true;
        this.openDatePicker();
        this.openCategoryDropdown();
        this.attachEventListeners();
    }

    toggleModal(isVisible) {
        this.transactionModal.classList.toggle('visible', isVisible);
        this.transactionModal.classList.toggle('hidden', !isVisible);

        if (!isVisible) {
            this.clearForm();
            this.calendar?.closeCalendar(); 
        }
    }    

    openDatePicker() {
        const today = new Date();
        const dateInput = document.getElementById('date');

        dateInput.value = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
    
        this.calendar = new Calendar(document.getElementById('calendar'), dateInput);
    
        if (!this.dateInputClickListener) {
            this.dateInputClickListener = () => this.calendar.toggleCalendar();
            dateInput.addEventListener('click', this.dateInputClickListener);
        }
    }

    updateCategoriesData(categories) {
        this.categories = categories;
    }

    openCategoryDropdown() {
        const categoryInput = document.getElementById('category');
        const dropdownList = document.getElementById('dropdown');
        this.categoryDropdown = new CategoryDropdown(categoryInput, dropdownList, this.categories);
    }

    attachEventListeners() {
        document.getElementById('date').addEventListener('input', () => validateForm(this.saveButton));
        document.getElementById('category').addEventListener('input', () => validateForm(this.saveButton));
        document.getElementById('amount').addEventListener('input', () => validateForm(this.saveButton));
        document.getElementById('amount').addEventListener('keydown', validateAmountInput);
    }
    

    clearForm() {
        document.getElementById('date').value = '';
        document.getElementById('category').value = '';
        document.getElementById('amount').value = '';
    }

    async saveTransaction() {
        const date = document.getElementById('date').value.split('.');
        const formattedDate = `${date[2]}-${date[1]}-${date[0]}`;
        const category = document.getElementById('category').value;
        const amount = parseFloat(document.getElementById('amount').value);
        
        try {
            const newTransactionData = await addTransaction(this.transactionType, { date: formattedDate, category, amount });
            if (!this.categories.includes(newTransactionData.category)) {
                this.updateCategoriesData([...this.categories, newTransactionData.category]);
            }

            if (this.transactionType === 'income') {
                const newIncome = new Income(newTransactionData.date, newTransactionData.category, newTransactionData.amount);
                insertTransaction(incomeList, newIncome, renderIncomeList);
            } else if (this.transactionType === 'expense') {
                const newExpense = new Expense(newTransactionData.date, newTransactionData.category, newTransactionData.amount);
                insertTransaction(expenseList, newExpense, renderExpenseList);
            }
            this.clearForm();
            this.toggleModal(false);
            this.categoryDropdown.setDropdownList();
        } catch (error) {
            console.error('Error adding transaction:', error);
        } 
    }
}

module.exports = TransactionModal;