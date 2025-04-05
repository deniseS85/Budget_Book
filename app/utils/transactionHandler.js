const { ipcRenderer } = require('electron');

function addTransaction(transactionType, { date, category, amount, paymentMethod }) {
    const channels = {
        income: 'add-income',
        expense: 'add-expense'
    };

    const channel = channels[transactionType];
    
    if (!channel) {
        throw new Error(`Invalid transaction type: ${transactionType}`);
    }

    return ipcRenderer.invoke(channel, { date, category, amount, paymentMethod });
}

function insertTransaction(list, transaction, renderFunction) {
    let insertIndex = list.findIndex(item => new Date(item.date) < new Date(transaction.date));

    if (insertIndex === -1) {
        list.push(transaction);
    } else {
        list.splice(insertIndex, 0, transaction);
    }

    renderFunction(sortTransactionsByDate(list));
}

function sortTransactionsByDate(list) {
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
}

module.exports = {
    addTransaction,
    insertTransaction,
    sortTransactionsByDate
};
