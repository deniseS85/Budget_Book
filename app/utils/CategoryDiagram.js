const { Chart, PieController, ArcElement, Title, Tooltip } = require('chart.js');
Chart.register(PieController, ArcElement, Title, Tooltip);
const ChartDataLabels = require('chartjs-plugin-datalabels');
Chart.register(ChartDataLabels);

const fontColor = getComputedStyle(document.documentElement).getPropertyValue('--fontColor').trim();

class CategoryDiagram {
    constructor() {
        this.incomeChart = null;
        this.expenseChart = null;

        this.incomePalette = [
            '#57b2be', '#4a90e2', '#6ec1e4', '#007acc', '#2d9cdb',
            '#00b8d9', '#009688', '#1abc9c', '#3faffa', '#5dade2',
            '#2980b9', '#48c9b0', '#3498db', '#00a8cc', '#4dd0e1',
            '#00acc1', '#26c6da', '#00838f', '#006064', '#80deea'
        ];

        this.expensePalette = [
            '#d00f7c', '#e74c3c', '#c0392b', '#f06292', '#ab47bc',
            '#9c27b0', '#e91e63', '#880e4f', '#ad1457', '#d81b60',
            '#b71c1c', '#f44336', '#ec407a', '#c2185b', '#8e24aa',
            '#ba68c8', '#aa00ff', '#ce93d8', '#d500f9', '#e040fb'
        ];
    }

    createChart(incomeCanvasId, expenseCanvasId, incomeList, expenseList) {
        const incomeCtx = document.getElementById(incomeCanvasId).getContext('2d');
        const expenseCtx = document.getElementById(expenseCanvasId).getContext('2d');

        this.incomeChart?.destroy();
        this.expenseChart?.destroy();

        this.incomeChart = this.createPieChart(incomeCtx, incomeList, 'Einnahmen', 'income');
        this.expenseChart = this.createPieChart(expenseCtx, expenseList, 'Ausgaben', 'expense');
    }

    createPieChart(ctx, list, label, chartType) {
        const data = this.getCategoryData(list);
        const labels = Object.keys(data).sort();
        const values = labels.map(label => data[label]); 
        const colors = this.generateCategoryColors(labels.length, chartType);

        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label,
                    data: values,
                    backgroundColor: colors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    datalabels: {
                        color: fontColor,
                        font: { size: 12 },
                        formatter: (value, context) => this.formatLabel(value, context),
                        anchor: 'center',
                        align: 'center',
                        textAlign: 'center',
                        rotation: (context) => this.getCategoryRotation(context)
                    },
                    tooltip: { enabled: false },
                    legend: { display: false }
                },
                elements: {
                    arc: {
                        borderWidth: 0,
                        hoverOffset: 15
                    }
                },
                layout: { padding: 20 }
            }
        });
    }

    getCategoryData(list) {
        const categoryMap = {
            'Hausrat': 'Versicherung',
            'Allianz': 'Versicherung',
            'Apple': 'Sonstiges',
            'Steuern': 'Sonstiges',
            'Kreditkartengebühr': 'Sonstiges',
            'Strom': 'Nebenkosten',
            'Wasser': 'Nebenkosten',
            'Katzenbedarf': 'Katzen'
        };

        return list.reduce((acc, item) => {
            const mappedCategory = categoryMap[item.category] || item.category;
            acc[mappedCategory] = (acc[mappedCategory] || 0) + item.amount;
            return acc;
        }, {});
    }

    generateCategoryColors(count, chartType) {
        const basePalette = chartType === 'income' ? this.incomePalette : this.expensePalette;
        const colors = [];

        for (let i = 0; i < count; i++) {
            if (i < basePalette.length) {
                colors.push(basePalette[i]);
            } else {
                const hueRange = chartType === 'income' ? [180, 210] : [330, 360];
                const hue = Math.floor(Math.random() * (hueRange[1] - hueRange[0]) + hueRange[0]);
                const saturation = Math.floor(Math.random() * 20 + 70);
                const lightness = Math.floor(Math.random() * 20 + 50);
                colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
            }
        }
        return colors;
    }

    getCategoryRotation(context) {
        const category = context.chart.data.labels[context.dataIndex];
        switch (category) {
            case 'Nebenkosten':
                return -25;
            case 'Sonstiges':
                return -10;
            default:
                return 0;
        }
    }

    formatLabel(value, context) {
        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        const percent = (value / total) * 100;
        const label = context.chart.data.labels[context.dataIndex];
    
        return label === 'Katzen' 
            ? `${label} ${percent.toFixed(1).replace('.', ',')}%` 
            : `${label}\n${percent.toFixed(1).replace('.', ',')}%`;
    }

    updateCategoriesData(categories) {
        this.categories = categories;
    }
    
    updateChartData(incomeList, expenseList) {
        this.renderChartData(this.incomeChart, incomeList);
        this.renderChartData(this.expenseChart, expenseList);
    }

    renderChartData(chart, list) {
        if (!this.chart) return;

        const data = this.getCategoryData(list);
        chart.data.labels = Object.keys(data);
        chart.data.datasets[0].backgroundColor = this.generateCategoryColors(Object.keys(data).length);
        chart.data.datasets[0].data = Object.values(data);
        chart.update();
    }
}

module.exports = CategoryDiagram;
