function updateTransactionView(isYearly) {
    const incomeAverages = calculateAverage(incomeList, isYearly);
    const expenseAverages = calculateAverage(expenseList, isYearly);

    renderIncomeList(incomeAverages);
    renderExpenseList(expenseAverages);
    updateTotalAmounts(isYearly);
}

function calculateAverage(list, isYearly) {
    let data = {};

    for (const { category, amount, date } of list) {
        const dateObj = new Date(date);
        const year = dateObj.getFullYear();
        const monthYear = `${year}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;

        if (!monthYear) continue;

        data[category] ||= { total: 0, months: new Set(), years: new Set(), count: 0, first: dateObj, last: dateObj };

        let entry = data[category];
        entry.total += amount;
        entry.months.add(monthYear);
        entry.years.add(year);
        entry.count++;
        entry.first = entry.first < dateObj ? entry.first : dateObj;
        entry.last = entry.last > dateObj ? entry.last : dateObj;
    }

    return Object.entries(data).map(([category, entry]) => {
        const totalMonths = Math.max(12, (entry.last.getFullYear() - entry.first.getFullYear()) * 12 + (entry.last.getMonth() - entry.first.getMonth()) + 1);
        const isYearlyPayment = entry.count === entry.years.size;
        const monthlyAverage = isYearlyPayment ? entry.total / 12 : entry.total / totalMonths;

        return {
            amount: isYearly ? monthlyAverage * 12 : monthlyAverage,
            category
        };
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

function updateTotalAmounts(isYearly) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const income = getCurrentDateAmount(isYearly, currentMonth, currentYear, incomeList, true);
    const expense = getCurrentDateAmount(isYearly, currentMonth, currentYear, expenseList, true);

    const formattedIncome = getCurrentDateAmount(isYearly, currentMonth, currentYear, incomeList);
    const formattedExpense = getCurrentDateAmount(isYearly, currentMonth, currentYear, expenseList);
    
    const difference = income - expense;
    const isNegative = difference < 0;
   
    const formattedDifference = (difference / 100).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

    const timeLabel = isYearly 
        ? currentYear 
        : new Date(currentYear, currentMonth - 1).toLocaleString('de-DE', { month: 'long' });

    const differenceClass = isNegative ? 'negative' : '';
    
    updateTextContent('totalIncomeText', `Einnahmen ${timeLabel}`, formattedIncome);
    updateTextContent('totalExpenseText', `Ausgaben ${timeLabel}`, formattedExpense);
    updateTextContent('differenceText', `Saldo ${timeLabel}`, formattedDifference, differenceClass);
}

function getCurrentDateAmount(isYearly, currentMonth, currentYear, list, isNumeric = false) {
    const filtered = list.filter(({ date }) => {
        const entryDate = new Date(date);
        return isYearly ? entryDate.getFullYear() === currentYear : 
                          entryDate.getFullYear() === currentYear && entryDate.getMonth() + 1 === currentMonth;
    });

    const totalAmount = filtered.reduce((sum, item) => sum + item.amount, 0);

    return isNumeric 
        ? totalAmount 
        : (totalAmount / 100).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function updateTextContent(elementId, label, amount, additionalClass = '') {
    const element = document.getElementById(elementId);
    element.textContent = label;

    const amountElement = document.getElementById(elementId.replace('Text', ''));
    amountElement.textContent = amount;

    additionalClass
        ? amountElement.classList.add(additionalClass)
        : amountElement.classList.remove('negative');
}

function renderList(type, list, append = false) {
    const tableBody = document.getElementById(`${type}-list`);
    if (!append) tableBody.innerHTML = '';

    const groupedData = Object.values(groupByCategory(list)).sort((a, b) => a.category.localeCompare(b.category));


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
