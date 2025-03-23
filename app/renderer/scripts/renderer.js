const { ipcRenderer } = require('electron');
const Income = require('../../models/Income');
const Expense = require('../../models/Expense'); 
const TransactionModal = require('../../utils/TransactionModal');
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


document.getElementById('income-box').addEventListener('click', () => openDetailView('income'));
document.getElementById('expenses-box').addEventListener('click', () => openDetailView('expense'));

function openDetailView(type) {
    const transactionWindow = document.getElementById('detail-window');
    const addIncomeBtn = document.getElementById('add-income');
    const addExpensesBtn = document.getElementById('add-expenses');
    const detailViewHeader = document.querySelector('.detail-view-header');
    const closeDetails = document.getElementById('close-details');
    

    addIncomeBtn.style.display = type === 'income' ? 'inline-block' : 'none';
    addExpensesBtn.style.display = type === 'expense' ? 'inline-block' : 'none';

    detailViewHeader.classList.remove('income-detail-header', 'expenses-detail-header');

    if (type === 'income') {
        detailViewHeader.classList.add('income-detail-header');
        closeDetails.style.setProperty('--hoverColor', '#00ffcc');
    } else {
        detailViewHeader.classList.add('expenses-detail-header');
        closeDetails.style.setProperty('--hoverColor', '#fd0290');
    }
    transactionWindow.classList.add('visible');
}

document.getElementById('close-details').addEventListener('mouseover', (event) => {
    const hoverColor = getComputedStyle(event.target).getPropertyValue('--hoverColor');
    event.target.style.color = hoverColor;
});

document.getElementById('close-details').addEventListener('mouseout', (event) => {
    event.target.style.color = '';
});


document.getElementById('close-details').addEventListener('click', () => {
    const detailWindow = document.getElementById('detail-window');
    document.getElementById('add-income').style.display = 'none';
    document.getElementById('add-expenses').style.display = 'none';
    detailWindow.classList.remove('visible');
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
