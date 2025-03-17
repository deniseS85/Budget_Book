const { ipcRenderer } = require('electron');
const Income = require('../../models/Income');
const Expense = require('../../models/Expense'); 
const { openTransactionModal, toggleModal, clearForm } = require('../../utils/newTransactionModal');
const { addTransaction, insertTransaction, sortTransactionsByDate, renderIncomeList, renderExpenseList } = require('../../utils/transactionHandler');

window.onload = () => { ipcRenderer.send('load-data'); };

let incomeList = [];
let expenseList = [];

ipcRenderer.on('load-data-response', (event, data) => {
    incomeList = data.income.map(item => new Income(item.date, item.description, item.amount));
    expenseList = data.expenses.map(item => new Expense(item.date, item.description, item.amount));

    incomeList = sortTransactionsByDate(incomeList);
    expenseList = sortTransactionsByDate(expenseList);

    renderIncomeList(incomeList);
    renderExpenseList(expenseList);
});

const transactionModal = document.getElementById('transaction-modal');
const modalHeader = document.getElementById('modal-header');
const addIncomeButton = document.getElementById('add-income');
const addExpensesButton = document.getElementById('add-expenses');
const closeModalButton = document.getElementById('close-modal');
const saveButton = document.getElementById('save-transaction');

let transactionType = '';

addIncomeButton.addEventListener('click', () => openTransactionModal('income', modalHeader, saveButton));
addExpensesButton.addEventListener('click', () => openTransactionModal('expense', modalHeader, saveButton));
closeModalButton.addEventListener('click', () => toggleModal(false, transactionModal, clearForm));
transactionModal.addEventListener('click', (event) => event.target === transactionModal && toggleModal(false, transactionModal, clearForm));

saveButton.addEventListener('click', async () => {
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    
    try {
        const newTransactionData = await addTransaction(transactionType, { date, description, amount });

        if (transactionType === 'income') {
            const newIncome = new Income(newTransactionData.date, newTransactionData.description, newTransactionData.amount);
            insertTransaction(incomeList, newIncome, renderIncomeList);
           /*  renderIncomeList(incomeList); */
        } else if (transactionType === 'expense') {
            const newExpense = new Expense(newTransactionData.date, newTransactionData.description, newTransactionData.amount);
            insertTransaction(expenseList, newExpense, renderExpenseList);
            /* renderExpenseList(expenseList); */
        }

        clearForm();
        toggleModal(false, transactionModal, clearForm);
    } catch (error) {
        console.error('Error adding transaction:', error);
    }
    
});


