function updateTransactionView(isYearly) {
    const filteredIncome = filterByPeriod(incomeList, isYearly);
    const filteredExpenses = filterByPeriod(expenseList, isYearly);

    renderIncomeList(filteredIncome);
    renderExpenseList(filteredExpenses);
}

function setCurrentPeriod() {
    const isYearly = document.getElementById('toggle').checked;
    const now = new Date();
    const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    const incomePeriodElement = document.getElementById('income-current-period');
    const expensePeriodElement = document.getElementById('expenses-current-period');
    const periodText = isYearly ? now.getFullYear() : monthNames[now.getMonth()];

    incomePeriodElement.textContent = periodText;
    expensePeriodElement.textContent = periodText;
}

function filterByPeriod(list, isYearly) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return list.filter(item => {
        const itemDate = new Date(item.date);
        return isYearly
            ? itemDate.getFullYear() === currentYear
            : itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    });
}

function groupByCategory(list) {
    return list.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = {
                category: item.category,
                totalAmount: 0,
            };
        }

        acc[item.category].totalAmount += item.amount;

        return acc;
    }, {});
}

function renderList(type, list, append = false) {
    const tableBody = document.getElementById(`${type}-list`);
    if (!append) tableBody.innerHTML = '';

    const groupedData = Object.values(groupByCategory(list));

    groupedData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = /*html*/`
            <td>${item.category}</td>
            <td>${item.totalAmount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>`;
        tableBody.appendChild(row);
    });
}

function renderIncomeList(incomeList, append = false) {
    renderList('income', incomeList, append);
}

function renderExpenseList(expenseList, append = false) {
    renderList('expenses', expenseList, append);
}

module.exports = {
    updateTransactionView,
    setCurrentPeriod,
    renderIncomeList,
    renderExpenseList
};
