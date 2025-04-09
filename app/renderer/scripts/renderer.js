const { ipcRenderer } = require('electron');
const Income = require('../../models/Income');
const Expense = require('../../models/Expense'); 
const Dashboard = require('../../utils/Dashboard');
const dashboard = new Dashboard();
const TransactionModal = require('../../utils/TransactionModal');
const DetailView = require('../../utils/DetailView');
const TransactionManager = require('../../utils/TransactionManager');
const transactionManager = new TransactionManager();

window.onload = () => { ipcRenderer.send('load-data'); };

let incomeList = [];
let expenseList = [];

ipcRenderer.on('load-data-response', (event, data) => {
    incomeList = data.income.map(item => new Income(item.date, item.category, item.amount, item.paymendMethod));
    expenseList = data.expenses.map(item => new Expense(item.date, item.category, item.amount, item.paymendMethod));

    incomeList = transactionManager.sortTransactionsByDate(incomeList);
    expenseList = transactionManager.sortTransactionsByDate(expenseList);

    dashboard.updateTransactionView(false);

   /*  const incomeCategories = incomeList.map(item => item.category);
    const expensesCategories = expenseList.map(item => item.category);
    const allCategories = [...new Set([...incomeCategories, ...expensesCategories])];
    transactionModalInstance.updateCategoriesData(allCategories); 
    detailViewInstance.updateCategoriesData(allCategories); */

    const incomeCategories = [...new Set(incomeList.map(item => item.category))];
    const expenseCategories = [...new Set(expenseList.map(item => item.category))];

    transactionModalInstance.updateCategoriesData({
        income: incomeCategories,
        expense: expenseCategories
    });

    detailViewInstance.updateCategoriesData({
        income: incomeCategories,
        expense: expenseCategories
    });

});

document.getElementById('toggle').addEventListener('change', () => {
    dashboard.updateTransactionView(document.getElementById('toggle').checked);
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
