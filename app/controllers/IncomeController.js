const { ipcMain } = require('electron');
const DataService = require('../services/DataService');
const Income = require('../models/Income');

ipcMain.handle('add-income', (event, incomeData) => {
    const data = DataService.loadData();
    const newIncome = new Income(incomeData.date, incomeData.description, incomeData.amount);

    data.income.push(newIncome);
    DataService.saveData(data);
    return newIncome;
});
