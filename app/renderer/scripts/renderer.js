const { ipcRenderer } = require('electron');
const Income = require('../../models/Income');
const Expense = require('../../models/Expense'); 
const Dashboard = require('../../utils/Dashboard');
const dashboard = new Dashboard();
const TransactionModal = require('../../utils/TransactionModal');
const DetailView = require('../../utils/DetailView');
const TransactionManager = require('../../utils/TransactionManager');
const transactionManager = new TransactionManager();
const Diagram = require('../../utils/Diagram');
const CategoryDiagram = require('../../utils/CategoryDiagram');

window.onload = () => { ipcRenderer.send('load-data'); };

let incomeList = [];
let expenseList = [];

const transactionModal = new TransactionModal(
    document.getElementById('transaction-modal'),
    document.getElementById('save-transaction'),
    document.getElementById('modal-header'),
    document.getElementById('close-modal')
);

const diagram = new Diagram(transactionModal);
const categoryDiagram = new CategoryDiagram(transactionModal);
const detailView = new DetailView(transactionModal);

transactionModal.setDiagramInstance(diagram); 
transactionModal.setCategoryDiagramInstanse(categoryDiagram);

document.getElementById('income-box').addEventListener('click', () => detailView.openDetailView('income'));
document.getElementById('expenses-box').addEventListener('click', () => detailView.openDetailView('expense'));

document.getElementById('toggle').addEventListener('change', () => { dashboard.updateTransactionView(document.getElementById('toggle').checked); });

document.getElementById('prevMonth').addEventListener('click', () => { diagram.prevMonth(incomeList, expenseList); });
document.getElementById('nextMonth').addEventListener('click', () => { diagram.nextMonth(incomeList, expenseList); });

ipcRenderer.on('load-data-response', (event, data) => {
    incomeList = data.income.map(item => new Income(item.date, item.category, item.amount, item.paymentMethod));
    expenseList = data.expenses.map(item => new Expense(item.date, item.category, item.amount, item.paymentMethod));

    incomeList = transactionManager.sortTransactionsByDate(incomeList);
    expenseList = transactionManager.sortTransactionsByDate(expenseList);
    dashboard.updateTransactionView(false);

    const incomeCategories = [...new Set(incomeList.map(item => item.category))];
    const expenseCategories = [...new Set(expenseList.map(item => item.category))];

    transactionModal.updateCategoriesData({ income: incomeCategories, expense: expenseCategories });
    detailView.updateCategoriesData({ income: incomeCategories, expense: expenseCategories });
    diagram.updateCategoriesData({ income: incomeCategories, expense: expenseCategories });
    diagram.createChart('diagram', incomeList, expenseList);
    categoryDiagram.updateCategoriesData({ income: incomeCategories, expense: expenseCategories });
    categoryDiagram.createChart('category-diagram-income', 'category-diagram-expense', incomeList, expenseList); 
});