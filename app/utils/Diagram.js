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
                        backgroundColor: turquise
                    },
                    {
                        label: 'Ausgaben',
                        data: expenseData.amounts,
                        backgroundColor: purple
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
        const allMonths = [
            "Jan'24", "Feb'24", "Mär'24", "Apr'24", "Mai'24", "Jun'24",
            "Jul'24", "Aug'24", "Sep'24", "Okt'24", "Nov'24", "Dez'24",
            "Jan'25", "Feb'25", "Mär'25", "Apr'25"
        ];

        const data = allMonths.reduce((acc, month) => {
            acc[month] = 0;
            return acc;
        }, {});

        list.forEach(({ category, amount, date }) => {
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
