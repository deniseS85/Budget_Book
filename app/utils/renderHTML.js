function renderList(type, list, append = false) {
    const tableBody = document.getElementById(`${type}-list`);
    if (!append) tableBody.innerHTML = '';

    list.sort((a, b) => new Date(b.date) - new Date(a.date));

    list.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = /*html*/`
            <td>${item.formatDate()}</td>
            <td>${item.category}</td>
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

module.exports = {
    renderIncomeList,
    renderExpenseList
};
