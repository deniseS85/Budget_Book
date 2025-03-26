function updateTransactionView(isYearly) {
    const incomeAverages = calculateAverage(incomeList, isYearly);
    const expenseAverages = calculateAverage(expenseList, isYearly);

    renderIncomeList(incomeAverages);
    renderExpenseList(expenseAverages);
}

function calculateAverage(list, isYearly) {
    let categories = {};
    let monthsCount = {};

    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const category = item.category;
        const amount = item.amount;

        categories[category] ??= 0;
        monthsCount[category] ??= 0;

        categories[category] += amount;
        monthsCount[category]++;
    }

    const result = Object.keys(categories).map(category => {
        let monthlyAverage = categories[category] / monthsCount[category];
        let yearlyAverage = monthlyAverage * 12;

        return {
            amount: isYearly ? yearlyAverage : monthlyAverage,
            category: category
        };
    });

    return result;
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
    renderIncomeList,
    renderExpenseList
};
