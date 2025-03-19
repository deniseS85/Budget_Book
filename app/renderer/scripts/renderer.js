const { ipcRenderer } = require('electron');
const Income = require('../../models/Income');
const Expense = require('../../models/Expense'); 
const TransactionModal = require('../../utils/TransactionModal');
const { sortTransactionsByDate, renderIncomeList, renderExpenseList } = require('../../utils/transactionHandler');

window.onload = () => { ipcRenderer.send('load-data'); };

let incomeList = [];
let expenseList = [];

ipcRenderer.on('load-data-response', (event, data) => {
    incomeList = data.income.map(item => new Income(item.date, item.category, item.amount));
    expenseList = data.expenses.map(item => new Expense(item.date, item.category, item.amount));

    incomeList = sortTransactionsByDate(incomeList);
    expenseList = sortTransactionsByDate(expenseList);

    renderIncomeList(incomeList);
    renderExpenseList(expenseList);

    const incomeCategories = incomeList.map(item => item.category);
    const expensesCategories = expenseList.map(item => item.category);
    const allCategories = [...new Set([...incomeCategories, ...expensesCategories])];
    transactionModalInstance.updateCategoriesData(allCategories); 
});

const transactionModal = document.getElementById('transaction-modal');
const saveButton = document.getElementById('save-transaction');
const modalHeader = document.getElementById('modal-header');
const addIncomeButton = document.getElementById('add-income');
const addExpensesButton = document.getElementById('add-expenses');
const closeModalButton = document.getElementById('close-modal');

const transactionModalInstance = new TransactionModal(
    transactionModal,
    saveButton,
    modalHeader,
    addIncomeButton,
    addExpensesButton,
    closeModalButton,
);

addIncomeButton.addEventListener('click', () => transactionModalInstance.openTransactionModal('income'));
addExpensesButton.addEventListener('click', () => transactionModalInstance.openTransactionModal('expense'));
closeModalButton.addEventListener('click', () => transactionModalInstance.toggleModal(false));
