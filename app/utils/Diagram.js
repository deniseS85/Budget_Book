const { Chart, LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend, BarController } = require('chart.js');
Chart.register(LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend, BarController);
const DetailView = require('../utils/DetailView');

const turquise = getComputedStyle(document.documentElement).getPropertyValue('--turquise').trim();
const purple = getComputedStyle(document.documentElement).getPropertyValue('--purple').trim();
const fontColor = getComputedStyle(document.documentElement).getPropertyValue('--fontColor').trim();

class Diagram {
    constructor(transactionModal) {
        this.chart = null;
        this.detailView = new DetailView(transactionModal);
        this.categories = { income: [], expense: [] }; 
        this.monthOffset = 0;
        this.nextButton = document.getElementById('nextMonth');
        this.prevButton = document.getElementById('prevMonth');
        this.nextButton.style.display = 'none';
        this.prevButton.style.display = 'flex';
    }

    createChart(canvasId, incomeList, expenseList) {
        const incomeData = this.prepareChartData(incomeList);
        const expenseData = this.prepareChartData(expenseList);
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        this.chart?.destroy();

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: incomeData.labels,
                datasets: [
                    {
                        label: 'Einnahmen',
                        data: incomeData.amounts,
                        backgroundColor: turquise,
                        hoverBackgroundColor: '#00ffcc'
                    },
                    {
                        label: 'Ausgaben',
                        data: expenseData.amounts,
                        backgroundColor: purple,
                        hoverBackgroundColor: '#ff00aa'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                onClick: (event, array) => this.handleBarClick(event, array, incomeList, expenseList),
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return (value / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
                            },
                            color: fontColor
                        },
                        grid: { display: false }
                    },
                    x: {
                        ticks: { color: fontColor },
                        grid: { display: false }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                const value = tooltipItem.raw;
                                return (value / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
                            }
                        }
                    },
                    legend: {
                        labels: {
                            color: fontColor,
                            font: { size: 16 }
                        }
                    },
                    datalabels: { display: false }
                }
            }
        });
    }

    getRollingMonths(offset = 0) {
        const currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth() + offset);
        currentDate.setMonth(currentDate.getMonth() + 1);
        const months = [];

        for (let i = 0; i < 13; i++) {
            currentDate.setMonth(currentDate.getMonth() - 1);
            const label = `${currentDate.toLocaleString('de-DE', { month: 'short' })}'${currentDate.getFullYear().toString().slice(-2)}`;
            months.unshift(label);
        }

        return months;
    }

    getEarliestDate(incomeList, expenseList) {
        const allTransactions = [...incomeList, ...expenseList];

        const earliestTransaction = allTransactions.reduce((earliest, transaction) => {
            const transactionDate = new Date(transaction.date);
            return transactionDate < earliest ? transactionDate : earliest;
        }, new Date());

        return earliestTransaction;
    }

    prevMonth(incomeList, expenseList) {
        this.monthOffset -= 1;
        const earliestDate = this.getEarliestDate(incomeList, expenseList);
        const months = this.getRollingMonths(this.monthOffset);
        const firstDisplayedMonth = months[0];
        const formattedEarliestDate = `${earliestDate.toLocaleString('de-DE', { month: 'short' })}'${earliestDate.getFullYear().toString().slice(-2)}`;
        this.prevButton.style.display = (firstDisplayedMonth === formattedEarliestDate) ? 'none' : 'flex';
        this.nextButton.style.display = (this.monthOffset === 0) ? 'none' : 'flex';
        this.updateChartData(incomeList, expenseList);
    }
    
    nextMonth(incomeList, expenseList) {
        if (this.monthOffset < 0) {
            this.monthOffset += 1;
            const earliestDate = this.getEarliestDate(incomeList, expenseList);
            const months = this.getRollingMonths(this.monthOffset);
            const firstDisplayedMonth = months[0];
            const formattedEarliestDate = `${earliestDate.toLocaleString('de-DE', { month: 'short' })}'${earliestDate.getFullYear().toString().slice(-2)}`;
            this.prevButton.style.display = (firstDisplayedMonth === formattedEarliestDate) ? 'none' : 'flex';
            this.nextButton.style.display = (this.monthOffset === 0) ? 'none' : 'flex';
            this.updateChartData(incomeList, expenseList);
        }
    }
    
    updateCategoriesData(categories) {
        this.categories = categories;
    }

    handleBarClick(event, array, incomeList, expenseList) {
        if (!array.length) return;
    
        const label = this.chart.data.labels[array[0].index];
        const dateRange = this.parseMonthYearLabel(label);
        if (!dateRange) return;
    
        const datasetIndex = array[0].datasetIndex;
        const typeLabel = this.chart.data.datasets[datasetIndex].label;
        const type = this.getTransactionTypeFromLabel(typeLabel);
        if (!type) return;
    
        const listToFilter = this.getFilteredListByType(type, incomeList, expenseList);
        this.filterTransactionsByMonthAndType(dateRange.start, dateRange.end, listToFilter);
    
        this.detailView.updateCategoriesData({
            income: this.categories.income,
            expense: this.categories.expense
        });
    
        this.detailView.openDetailView(type, true, dateRange);
    }
    

    parseMonthYearLabel(label) {
        const [month, year] = label.split("'");
        const germanToEnglishMonths = {
            "Jan": "Jan", "Feb": "Feb", "Mär": "Mar", "Apr": "Apr",
            "Mai": "May", "Jun": "Jun", "Jul": "Jul", "Aug": "Aug",
            "Sep": "Sep", "Okt": "Oct", "Nov": "Nov", "Dez": "Dec"
        };
    
        const englishMonth = germanToEnglishMonths[month];
        if (!englishMonth) {
            console.error('Unbekannter Monat:', month);
            return null;
        }
    
        const start = new Date(`${englishMonth} 1, 20${year}`);
        const end = new Date(start);
        end.setMonth(start.getMonth() + 1);
        end.setDate(0);
        return { start, end };
    }
    
    getTransactionTypeFromLabel(label) {
        const typeMap = {
            'Einnahmen': 'income',
            'Ausgaben': 'expense'
        };
        return typeMap[label] || null;
    }
    
    getFilteredListByType(type, incomeList, expenseList) {
        return type === 'income' ? incomeList : expenseList;
    }
    

    filterTransactionsByMonthAndType(startDate, endDate, dataList) {
        return dataList.filter(item => {
            const transactionDate = new Date(item.date);
            return transactionDate >= startDate && transactionDate <= endDate;
        });
    }

    prepareChartData(list) {
        const allMonths = this.getRollingMonths(this.monthOffset);

        const data = allMonths.reduce((acc, month) => {
            acc[month] = 0;
            return acc;
        }, {});

        list.forEach(({ amount, date }) => {
            const transactionDate = new Date(date);
            const monthYear = `${transactionDate.toLocaleString('de-DE', { month: 'short' })}'${transactionDate.getFullYear().toString().slice(-2)}`;
            if (data[monthYear] !== undefined) {
                data[monthYear] += amount;
            }
        });
    
        return {
            labels: Object.keys(data),
            amounts: Object.values(data)
        };
    }

    updateChartData(incomeList, expenseList) {
        const incomeData = this.prepareChartData(incomeList);
        const expenseData = this.prepareChartData(expenseList);
    
        if (!this.chart) return;
    
        this.chart.data.labels = incomeData.labels;
        this.chart.data.datasets[0].data = incomeData.amounts;
        this.chart.data.datasets[1].data = expenseData.amounts;
        this.chart.update();
    }
}

module.exports = Diagram;
