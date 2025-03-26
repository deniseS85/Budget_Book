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
        
        const monthYear = (typeof item.date === 'string' && item.date) 
            ? item.date.slice(0, 7)
            : item.date?.toISOString().slice(0, 7);

        if (!monthYear) { continue; }

        categories[category] ??= 0;
        monthsCount[category] ??= new Set();

        categories[category] += amount;
        monthsCount[category].add(monthYear);
    }

    const result = Object.keys(categories).map(category => {
        const uniqueMonths = monthsCount[category].size;
        const monthlyAverage = categories[category] / uniqueMonths;
        const yearlyAverage = isYearly ? (uniqueMonths < 12 ? monthlyAverage * uniqueMonths : monthlyAverage * 12) : null;

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
