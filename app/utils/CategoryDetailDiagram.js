const { Chart, LinearScale, CategoryScale, PointElement, LineElement, Title, Tooltip, Legend, LineController } = require('chart.js');

Chart.register(LinearScale, CategoryScale, PointElement, LineElement, Title, Tooltip, Legend, LineController);

class CategoryDetailDiagram {
    constructor() {
        this.categoryChart = null;
        this.backButton = document.getElementById('backButton');
        this.chartCanvas = document.getElementById('category-chart');
        this.backButton.addEventListener('click', () => this.resetCenterContent());
        const styles = getComputedStyle(document.documentElement);
        this.fontColor = styles.getPropertyValue('--fontColor').trim();
        this.lilaColor = styles.getPropertyValue('--lila').trim();
    }

    showDetail(categories, backgroundColor) {
        const categoryData = this.getCategoryDataFromCategories(categories);
        document.querySelector('.diagram-container').style.display = 'none';
        document.querySelector('.category-diagram-container').style.display = 'none';
        document.getElementById('category-detail-diagram').style.display = 'flex';

        const uniqueCategories = [...new Set(categoryData.map(item => item.category))];

        if (uniqueCategories.length === 1 && backgroundColor) {
            this.backButton.style.color = backgroundColor;
        } else {
            this.backButton.style.color = this.lilaColor;
        }
        this.createCategoryChart(categoryData, backgroundColor);
    }

    createCategoryChart(categoryData, backgroundColor = null) {
        const data = this.prepareChartData(categoryData, backgroundColor);

        this.categoryChart?.destroy();

        this.categoryChart = new Chart(this.chartCanvas, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: data.datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        suggestedMin: this.getSuggestedMin(data.datasets),
                        ticks: {
                            callback: value => (value / 100).toLocaleString('de-DE', {
                                style: 'currency',
                                currency: 'EUR'
                            }),
                            color: this.fontColor
                        },
                        grid: { display: false }
                    },
                    x: {
                        ticks: { color: this.fontColor },
                        grid: { display: false }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                const value = tooltipItem.raw;
                                return (value / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
                            }
                        }
                    },
                    legend: {
                        labels: {
                            color: this.fontColor,
                            font: { size: 16 }
                        }
                    },
                    datalabels: { display: false }
                }
            }
        });
    }

    getSuggestedMin(datasets) {
        const allValues = datasets.flatMap(ds => ds.data);
        const min = Math.min(...allValues);
        return min > 0 ? min * 0.9 : min * 1.1; 
    }

    prepareChartData(list, backgroundColor = null) {
        if (!list || list.length === 0) {
            return { labels: [], datasets: [] };
        }

        let earliestDate = new Date(Math.min(...list.map(transaction => new Date(transaction.date))));
        let latestDate = new Date(Math.max(...list.map(transaction => new Date(transaction.date))));

        const allMonths = [];
        let current = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
        const formatMonth = (date) => `${date.toLocaleString('de-DE', { month: 'short' })}'${date.getFullYear().toString().slice(-2)}`;

        while (current <= latestDate) {
            allMonths.push(formatMonth(current));
            current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
        }

        const categories = [...new Set(list.map(item => item.category))];

        const colorPalette = [
            '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40', '#8dd17e'
        ];

        const datasets = categories.map((category, index) => {
            const data = Array(allMonths.length).fill(0);

            list.forEach(transaction => {
                if (transaction.category === category) {
                    const txDate = new Date(transaction.date);
                    const monthLabel = formatMonth(txDate);
                    const i = allMonths.indexOf(monthLabel);
                    if (i !== -1) {
                        data[i] += transaction.amount;
                    }
                }
            });

            const color = categories.length === 1 && backgroundColor
                ? backgroundColor
                : colorPalette[index % colorPalette.length];

            return {
                label: category,
                data,
                borderColor: color,
                backgroundColor: color + '55',
                fill: false,
                tension: 0,
                pointRadius: 3,
                pointHoverRadius: 5,
                borderWidth: 1
            };
        });

        return {
            labels: allMonths,
            datasets
        };
    }

    resetCenterContent() {
        document.querySelector('.diagram-container').style.display = 'flex';
        document.querySelector('.category-diagram-container').style.display = 'flex';
        document.getElementById('category-detail-diagram').style.display = 'none';
    }

    getCategoryDataFromCategories(categories) {
        const allTransactions = [...incomeList, ...expenseList];
        return allTransactions.filter(transaction => categories.includes(transaction.category));
    }

    updateChartData(categories, backgroundColor) {
        const categoryData = this.getCategoryDataFromCategories(categories);
        this.createCategoryChart(categoryData, backgroundColor);
    }
}

module.exports = CategoryDetailDiagram;
