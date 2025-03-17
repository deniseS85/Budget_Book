const { ipcRenderer } = require('electron');
const { renderIncomeList, renderExpenseList } = require('../utils/renderHTML');

function addTransaction(transactionType, { date, description, amount }) {
    const channel = transactionType === 'income' ? 'add-income' : 'add-expense';
    return ipcRenderer.invoke(channel, { date, description, amount });
}

function insertTransaction(list, transaction, renderFunction) {
    let insertIndex = list.findIndex(item => new Date(item.date) < new Date(transaction.date));

    if (insertIndex === -1) {
        list.push(transaction);
    } else {
        list.splice(insertIndex, 0, transaction);
    }

    list = sortTransactionsByDate(list);

    renderFunction(list);
}

function sortTransactionsByDate(list) {
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
}

module.exports = {
    addTransaction,
    insertTransaction,
    sortTransactionsByDate,
    renderIncomeList,
    renderExpenseList
};
