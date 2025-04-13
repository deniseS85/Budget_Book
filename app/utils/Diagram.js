const { Chart, LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend, BarController } = require('chart.js');
Chart.register(LinearScale, CategoryScale, BarElement, Title, Tooltip, Legend, BarController);

class Diagram {
    constructor() {
        this.chart = null;
    }

    createChart(canvasId, incomeList, expenseList) {
        const incomeData = this.prepareChartData(incomeList);
        const expenseData = this.prepareChartData(expenseList);
        const ctx = document.getElementById(canvasId).getContext('2d');
        const turquise = getComputedStyle(document.documentElement).getPropertyValue('--turquise').trim();
        const purple = getComputedStyle(document.documentElement).getPropertyValue('--purple').trim();
        const fontColor = getComputedStyle(document.documentElement).getPropertyValue('--fontColor').trim();
        
        this.chart ? this.chart.destroy() : null;

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
                onClick: (event, array) => this.handleBarClick(event, array, incomeList, expenseList),
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return (value / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
                            }
                        },
                        grid: {
                            display: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
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
                            font: {
                                size: 16
                            }
                        }
                    }
                }
            }
        });
    }

    handleBarClick(event, array, incomeList, expenseList) {
        if (array.length) {
            const monthYear = this.chart.data.labels[array[0].index];
            const [month, year] = monthYear.split("'");
            const selectedMonthStart = new Date(`${month} 1, 20${year}`);
            const selectedMonthEnd = new Date(selectedMonthStart);
            selectedMonthEnd.setMonth(selectedMonthStart.getMonth() + 1);
            selectedMonthEnd.setDate(0); 

            const datasetIndex = array[0].datasetIndex;
            const type = this.chart.data.datasets[datasetIndex].label;

            if (type === 'Einnahmen') {
                this.filterTransactionsByMonthAndType(selectedMonthStart, selectedMonthEnd, incomeList);
            } else if (type === 'Ausgaben') {
                this.filterTransactionsByMonthAndType(selectedMonthStart, selectedMonthEnd, expenseList);
            }
        }
    }

    filterTransactionsByMonthAndType(startDate, endDate, dataList) {
        const filteredTransactions = dataList.filter(item => {
            const transactionDate = new Date(item.date);
            return transactionDate >= startDate && transactionDate <= endDate;
        });
    
        console.log('Filtered Transactions:', filteredTransactions);
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
            const month = new Date(date).toLocaleString('de-DE', { month: 'short' });
            const year = new Date(date).getFullYear().toString().slice(-2);
            const monthYear = `${month}'${year}`;
            
            if (data[monthYear] !== undefined) {
                data[monthYear] += amount;
            }
        });

        const labels = Object.keys(data);
        const amounts = Object.values(data);

        return { labels, amounts };

    }
}

module.exports = Diagram;
