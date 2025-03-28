const { validateForm, validateAmountInput } = require('../utils/formValidation');
const { Calendar } = require('./Calendar');
const { CategoryDropdown } = require('./CategoryDropdown');
const { addTransaction, insertTransaction } = require('./transactionHandler');
const { renderIncomeList, renderExpenseList, updateTransactionView } = require('../utils/renderHTML_MainView');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
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
        this.attachEventListeners();
    }

    attachEventListeners() {
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
        this.setTransactionColors(this.transactionType);
        this.toggleModal(true);
        this.saveButton.disabled = true;
        this.openDatePicker();
        this.openCategoryDropdown();
        this.checkValidation();
    }

    setTransactionColors(type) {
        const colors = {
            income: {
                color: 'var(--turquise)',
                fontColor: 'var(--itemColor)',
                hoverColor: '#00ffcc'
            },
            expense: {
                color: 'var(--purple)',
                fontColor: 'var(--fontColor)',
                hoverColor: '#fd0290'
            }
        };
    
        const selectedColors = colors[type];
    
        document.documentElement.style.setProperty('--transaction-color', selectedColors.color);
        document.documentElement.style.setProperty('--transaction-font-color', selectedColors.fontColor);
        document.documentElement.style.setProperty('--transaction-hover-color', selectedColors.hoverColor);
    }
    

    toggleModal(isVisible) {
        this.transactionModal.classList.toggle('visible', isVisible);
        this.transactionModal.classList.toggle('hidden', !isVisible);

        if (!isVisible) {
            this.clearForm();
            this.calendar?.closeCalendar(); 
            this.categoryDropdown?.closeDropdown();
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

    checkValidation() {  
        document.getElementById('dropdown').addEventListener('click', () => validateForm(this.saveButton));
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
        const { formattedDate, category, amount, isYearly } = this.getTransactionData();

        try {
            if (!this.transactionType) return console.error("Transaction type is missing!");

            const amountInCents = Math.round(amount * 100);
            const newTransactionData = await addTransaction(this.transactionType, { 
                date: formattedDate, 
                category, 
                amount: amountInCents
            });
            
            const newTransaction = this.transactionType === 'income'
                ? new Income(newTransactionData.date, newTransactionData.category, newTransactionData.amount)
                : new Expense(newTransactionData.date, newTransactionData.category, newTransactionData.amount);

            this.updateCategories(newTransactionData.category);
            this.addTransactionToList(this.transactionType, newTransactionData);
            updateTransactionView(isYearly);
            this.clearForm();
            this.toggleModal(false);
            this.categoryDropdown.setDropdownList();
            this.dispatchTransactionSavedEvent(newTransaction);
        } catch (error) {
            console.error('Error adding transaction:', error);
        } 
    }

    getTransactionData() {
        const date = document.getElementById('date').value.split('.');
        const formattedDate = `${date[2]}-${date[1]}-${date[0]}`;
        const category = document.getElementById('category').value;
        const amount = parseFloat(document.getElementById('amount').value.replace(',', '.'));
        const isYearly = document.getElementById('toggle').checked;
    
        return { formattedDate, category, amount, isYearly };
    }

    updateCategories(newCategory) {
        if (!this.categories.includes(newCategory)) {
            this.updateCategoriesData([...this.categories, newCategory]);
        }
    }

    addTransactionToList(type, transactionData) {
        if (type === 'income') {
            const newIncome = new Income(transactionData.date, transactionData.category, transactionData.amount);
            insertTransaction(incomeList, newIncome, renderIncomeList);
        } else if (type === 'expense') {
            const newExpense = new Expense(transactionData.date, transactionData.category, transactionData.amount);
            insertTransaction(expenseList, newExpense, renderExpenseList);
        }
    }


    dispatchTransactionSavedEvent(transaction) {
        const event = new CustomEvent('transactionSaved', {
            detail: transaction
        });
        document.dispatchEvent(event); 
    }
}

module.exports = TransactionModal;