const { ipcMain } = require('electron');
const DataService = require('../services/DataService');
const Expense = require('../models/Expense');

ipcMain.handle('add-expense', (event, expenseData) => {
    const data = DataService.loadData();
    const newExpense = new Expense(expenseData.date, expenseData.category, expenseData.amount);

    data.expenses.push(newExpense);
    DataService.saveData(data);
    return newExpense;
});
