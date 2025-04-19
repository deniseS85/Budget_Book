class Dashboard {      
    updateTransactionView(isYearly) {
        const incomeAverages = this.calculateAverage(incomeList, isYearly);
        const expenseAverages = this.calculateAverage(expenseList, isYearly);

        this.renderIncomeList(incomeAverages);
        this.renderExpenseList(expenseAverages);
        this.updateTotalAmounts(isYearly);

        /* ################################################# */
                    /* TEST */
        /* ################################################# */
        this.logTransactionTable(incomeList, expenseList);
    }

    calculateAverage(list, isYearly) {
        let data = this.processData(list);

        return Object.entries(data).map(([category, entry]) => {
            return this.averagesForCategory(category, entry, isYearly);
        });
    }

    processData(list) {
        const data = {};

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
        return data;
    }

    averagesForCategory(category, entry, isYearly) {
        const totalMonths = entry.months.size;
        const totalYears = entry.years.size;
        const isYearlyPayment = entry.count === entry.years.size;
        let monthlyAverage;
        let yearlyAverage;

        monthlyAverage = entry.total / Math.max(totalMonths, 12);  

        if (isYearlyPayment) {
            yearlyAverage = entry.total / totalYears;
            monthlyAverage = yearlyAverage / 12;
        } else {
            yearlyAverage = totalYears > 1 && totalMonths < 12
                ? (monthlyAverage * 12) / totalYears
                : monthlyAverage * 12;
        }    
        return {
            amount: isYearly ? yearlyAverage : monthlyAverage,
            category
        };  
    }

    groupByCategory(list) {
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

    updateTotalAmounts(isYearly) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const income = this.getCurrentDateAmount(isYearly, currentMonth, currentYear, incomeList, true);
        const expense = this.getCurrentDateAmount(isYearly, currentMonth, currentYear, expenseList, true);
        const formattedIncome = this.getCurrentDateAmount(isYearly, currentMonth, currentYear, incomeList);
        const formattedExpense = this.getCurrentDateAmount(isYearly, currentMonth, currentYear, expenseList);
        const difference = income - expense;
        const isNegative = difference < 0;
        const formattedDifference = (difference / 100).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
        const timeLabel = isYearly 
            ? currentYear 
            : new Date(currentYear, currentMonth - 1).toLocaleString('de-DE', { month: 'long' });
        const differenceClass = isNegative ? 'negative' : '';
        
        this.updateTextContent('totalIncomeText', `Einnahmen ${timeLabel}`, formattedIncome);
        this.updateTextContent('totalExpenseText', `Ausgaben ${timeLabel}`, formattedExpense);
        this.updateTextContent('differenceText', `Saldo ${timeLabel}`, formattedDifference, differenceClass);
    }

    getCurrentDateAmount(isYearly, currentMonth, currentYear, list, isNumeric = false) {
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

    updateTextContent(elementId, label, amount, additionalClass = '') {
        const element = document.getElementById(elementId);
        element.textContent = label;

        const amountElement = document.getElementById(elementId.replace('Text', ''));
        amountElement.textContent = amount;

        additionalClass
            ? amountElement.classList.add(additionalClass)
            : amountElement.classList.remove('negative');
    }

    renderList(type, list, append = false) {
        const tableBody = document.getElementById(`${type}-list`);
        if (!append) tableBody.innerHTML = '';

        const groupedData = Object.values(this.groupByCategory(list)).sort((a, b) => a.category.localeCompare(b.category));

        groupedData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = /*html*/`
                <td>${item.category}</td>
                <td>${(item.totalAmount / 100).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</td>`;
            tableBody.appendChild(row);
        });
    }

    renderIncomeList(incomeList, append = false) {
        this.renderList('income', incomeList, append);
    }

    renderExpenseList(expenseList, append = false) {
        this.renderList('expenses', expenseList, append);
    }

/* ################################################# */
                /* TEST */
/* ################################################# */
    logTransactionTable() {
        const incomeAverages = this.calculateAverage(incomeList, false);
        const expenseAverages = this.calculateAverage(expenseList, false);
        const incomeYearly = this.calculateAverage(incomeList, true);
        const expenseYearly = this.calculateAverage(expenseList, true);

        const allEntries = [...incomeList, ...expenseList];

        const groupedByCategory = allEntries.reduce((acc, entry) => {
            if (!acc[entry.category]) acc[entry.category] = [];
            acc[entry.category].push(entry);
            return acc;
        }, {});

        const detectSinglePaymentsByYear = (entries) => {
            const years = {};
            entries.forEach(entry => {
                const year = new Date(entry.date).getFullYear();
                years[year] = (years[year] || 0) + 1;
            });
            return Object.values(years).every(count => count === 1);
        };

        const data = [...incomeAverages, ...expenseAverages].map(({ category, amount }) => {
            const yearlyAmount = incomeYearly.concat(expenseYearly).find(entry => entry.category === category)?.amount || 0;

            const entries = groupedByCategory[category] || [];
            
            const monthsSet = new Set(entries.map(entry => {
                const d = new Date(entry.date);
                return `${d.getFullYear()}-${d.getMonth() + 1}`;
            }));

            const isOncePerYear = detectSinglePaymentsByYear(entries);

            const paymentType = isOncePerYear
                ? "Einmalzahlung"
                : (monthsSet.size === entries.length ? "Regelmäßig" : "Unregelmäßig");

            const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);

            return {
                Kategorie: category,
                "Ø Monat": (amount / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }),
                "Ø Jahr": (yearlyAmount / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }),
                "Summe Einträge": (totalAmount / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }),
                "Anzahl Einträge": entries.length,
                "Anzahl Monate": monthsSet.size,
                "Typ": paymentType
            };
        });
    
        console.table(data);
    }
}

module.exports = Dashboard;