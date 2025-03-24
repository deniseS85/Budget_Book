const { ipcRenderer } = require('electron');
const Income = require('../../models/Income');
const Expense = require('../../models/Expense'); 
const TransactionModal = require('../../utils/TransactionModal');
const  DetailView = require('../../utils/DetailView');
const { sortTransactionsByDate } = require('../../utils/transactionHandler');
const { updateTransactionView, setCurrentPeriod } = require('../../utils/renderHTML_MainView');

window.onload = () => { 
    ipcRenderer.send('load-data'); 
    setCurrentPeriod();
};

let incomeList = [];
let expenseList = [];

ipcRenderer.on('load-data-response', (event, data) => {
    incomeList = data.income.map(item => new Income(item.date, item.category, item.amount));
    expenseList = data.expenses.map(item => new Expense(item.date, item.category, item.amount));

    incomeList = sortTransactionsByDate(incomeList);
    expenseList = sortTransactionsByDate(expenseList);

    updateTransactionView(false);

    const incomeCategories = incomeList.map(item => item.category);
    const expensesCategories = expenseList.map(item => item.category);
    const allCategories = [...new Set([...incomeCategories, ...expensesCategories])];
    transactionModalInstance.updateCategoriesData(allCategories); 
});


document.getElementById('toggle').addEventListener('change', () => {
    updateTransactionView(document.getElementById('toggle').checked);
    setCurrentPeriod(); 
});

const transactionModalInstance = new TransactionModal(
    document.getElementById('transaction-modal'),
    document.getElementById('save-transaction'),
    document.getElementById('modal-header'),
    document.getElementById('close-modal')
);

const detailViewInstance = new DetailView(transactionModalInstance);

document.getElementById('income-box').addEventListener('click', () => detailViewInstance.openDetailView('income'));
document.getElementById('expenses-box').addEventListener('click', () => detailViewInstance.openDetailView('expense'));

