const { Calendar } = require('../utils/Calendar');
const { CategoryDropdown } = require('../utils/CategoryDropdown');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const TransactionUIConfig = require('../utils/TransactionUIConfig');
const transactionUI = new TransactionUIConfig();
const TransactionManager = require('../utils/TransactionManager');
const transactionManager = new TransactionManager();
const Dashboard = require('../utils/Dashboard');
const dashboard = new Dashboard();
const FormValidator = require('../utils/FormValidator');

class TransactionModal {
    constructor(transactionModal, saveButton, modalHeader, closeModalButton) {
        this.transactionModal = transactionModal;
        this.saveButton = saveButton;
        this.modalHeader = modalHeader;
        this.closeModalButton = closeModalButton;
        this.transactionType = '';
        this.categories = { income: [], expense: [] }; 
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
        transactionUI.setTransactionColors(this.transactionType);
        transactionUI.setPaymentMethodIcon(this.transactionType);
        this.toggleModal(true);
        this.saveButton.disabled = true;
        this.openDatePicker();
        this.openCategoryDropdown(this.transactionType);
        const formValidator = new FormValidator(this.saveButton);
        formValidator.checkValidation();
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
    
    setDiagramInstance(diagram) {
        this.diagram = diagram;
    }

    openDatePicker() {
        const today = new Date();
        const dateInput = document.getElementById('date');

        dateInput.value = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
    
        this.calendar = new Calendar(document.getElementById('calendar'), dateInput, false, this.transactionType);
    
        if (!this.dateInputClickListener) {
            this.dateInputClickListener = () => this.calendar.toggleCalendar();
            dateInput.addEventListener('click', this.dateInputClickListener);
        }
    }

    updateCategoriesData(categories) {
        this.categories = categories;
    }

    openCategoryDropdown(type) {
        const categoryInput = document.getElementById('category');
        const dropdownList = document.getElementById('dropdown');
        const categories = this.categories[type] || [];
        this.categoryDropdown = new CategoryDropdown(categoryInput, dropdownList, categories);
    }
    
    clearForm() {
        document.getElementById('date').value = '';
        document.getElementById('category').value = '';
        document.getElementById('amount').value = '';
        document.querySelectorAll('.payment-method').forEach(img => img.classList.remove('selected'));
        this.paymentMethod = null; 
    }

    async saveTransaction() {
        const { formattedDate, category, amount, isYearly } = this.getTransactionData();

        try {
            if (!this.transactionType) return console.error("Transaction type is missing!");

            const amountInCents = Math.round(amount * 100);
            const paymentMethod = transactionUI.getPaymentMethod(); 

            const newTransactionData = await transactionManager.addTransaction(this.transactionType, { 
                date: formattedDate, 
                category, 
                amount: amountInCents,
                paymentMethod: paymentMethod
            });
            
            const newTransaction = this.transactionType === 'income'
                ? new Income(newTransactionData.date, newTransactionData.category, newTransactionData.amount, newTransactionData.paymentMethod)
                : new Expense(newTransactionData.date, newTransactionData.category, newTransactionData.amount, newTransactionData.paymentMethod);

            this.updateCategories(newTransactionData.category);
            this.addTransactionToList(this.transactionType, newTransactionData);
            dashboard.updateTransactionView(isYearly);
            this.diagram?.updateChartData(incomeList, expenseList);
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
        if (!this.categories[this.transactionType].includes(newCategory)) {
            this.categories[this.transactionType].push(newCategory);
            this.updateCategoriesData(this.categories);
        }
    }

    addTransactionToList(type, transactionData) {
        if (type === 'income') {
            const newIncome = new Income(transactionData.date, transactionData.category, transactionData.amount, transactionData.paymentMethod);
            transactionManager.insertTransaction(incomeList, newIncome, (list) => dashboard.renderIncomeList(list));

        } else if (type === 'expense') {
            const newExpense = new Expense(transactionData.date, transactionData.category, transactionData.amount, transactionData.paymentMethod);
            transactionManager.insertTransaction(expenseList, newExpense, (list) => dashboard.renderIncomeList(list));
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