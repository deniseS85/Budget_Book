const { ipcRenderer } = require('electron');
const Income = require('../../models/Income');
const Expense = require('../../models/Expense'); 

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

addIncomeButton.addEventListener('click', () => openTransactionModal('income'));
addExpensesButton.addEventListener('click', () => openTransactionModal('expense'));
closeModalButton.addEventListener('click', () => toggleModal(false));
transactionModal.addEventListener('click', (event) => event.target === transactionModal && toggleModal(false));

function openTransactionModal(type) {
    transactionType = type;

    if (transactionType === 'income') {
        modalHeader.innerHTML = 'Neue Einnahme';
    } else {
        modalHeader.innerHTML = 'Neue Ausgabe';
    }
    
    toggleModal(true);
}

function toggleModal(isVisible) {
    transactionModal.classList.toggle('visible', isVisible);
    transactionModal.classList.toggle('hidden', !isVisible);

    if (!isVisible) clearForm();
}

function clearForm() {
    document.getElementById('date').value = '';
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
}


saveButton.addEventListener('click', async () => {
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);

    if (date && description && !isNaN(amount)) {
        try {
            const newTransactionData = await addTransaction({ date, description, amount });

            if (transactionType === 'income') {
                const newIncome = new Income(newTransactionData.date, newTransactionData.description, newTransactionData.amount);
                insertTransaction(incomeList, newIncome);
                renderIncomeList(incomeList);
            } else if (transactionType === 'expense') {
                const newExpense = new Expense(newTransactionData.date, newTransactionData.description, newTransactionData.amount);
                insertTransaction(expenseList, newExpense);
                renderExpenseList(expenseList);
            }

            clearForm();
            toggleModal(false);
        } catch (error) {
            console.error('Error adding transaction:', error);
            alert('Fehler beim Hinzufügen der Transaktion.');
        }
    } else {
        alert("Bitte alle Felder ausfüllen.");
    }
});

function addTransaction({ date, description, amount }) {
    const channel = transactionType === 'income' ? 'add-income' : 'add-expense';
    return ipcRenderer.invoke(channel, { date, description, amount });
}

function insertTransaction(list, transaction) {
    let insertIndex = list.findIndex(item => new Date(item.date) < new Date(transaction.date));

    if (insertIndex === -1) {
        list.push(transaction);
    } else {
        list.splice(insertIndex, 0, transaction);
    }

   list = sortTransactionsByDate(list);

    renderList(transactionType === 'income' ? 'income' : 'expenses', list);
}

function sortTransactionsByDate(list) {
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderList(type, list, append = false) {
    const tableBody = document.getElementById(`${type}-list`);
    if (!append) tableBody.innerHTML = '';

    list.sort((a, b) => new Date(b.date) - new Date(a.date));

    list.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = /*html*/`
            <td>${item.formatDate()}</td>
            <td>${item.description}</td>
            <td>${item.formatAmount()}</td>`;
        tableBody.appendChild(row);
    });
}

function renderIncomeList(incomeList, append = false) {
    renderList('income', incomeList, append);
}

function renderExpenseList(expenseList, append = false) {
    renderList('expenses', expenseList, append);
}