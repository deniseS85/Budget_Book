function updateTransactionView(isYearly) {
    const incomeAverages = calculateAverage(incomeList, isYearly);
    const expenseAverages = calculateAverage(expenseList, isYearly);

    renderIncomeList(incomeAverages);
    renderExpenseList(expenseAverages);
}

function calculateAverage(list, isYearly) {
    let categories = {};
    let monthsCount = {};
    let firstDate = {};
    let lastDate = {};
    let entryCount = {};
    let yearsCount = {};

    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const category = item.category;
        const amount = item.amount;
        
        const dateObj = new Date(item.date);
        const year = dateObj.getFullYear();
        const monthYear = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;

        if (!monthYear) { continue; }

        categories[category] ??= 0;
        monthsCount[category] ??= new Set();
        firstDate[category] ??= dateObj;
        lastDate[category] ??= dateObj;
        entryCount[category] ??= 0;
        yearsCount[category] ??= new Set();

        categories[category] += amount;
        monthsCount[category].add(monthYear);
        yearsCount[category].add(year);
        entryCount[category]++;

        if (dateObj < firstDate[category]) firstDate[category] = dateObj;
        if (dateObj > lastDate[category]) lastDate[category] = dateObj;
    }

    const result = Object.keys(categories).map(category => {
        const start = firstDate[category];
        const end = lastDate[category];

        let totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
        const totalYears = yearsCount[category].size;

        const isYearlyPayment = entryCount[category] === totalYears;

        if (totalMonths < 12) {
            totalMonths = 12;
        }
     
        const monthlyAverage = isYearlyPayment
            ? categories[category] / 12 
            : categories[category] / totalMonths;

        const yearlyAverage = isYearly ? monthlyAverage * 12 : null;

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
            <td>${(item.totalAmount / 100).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>`;
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
