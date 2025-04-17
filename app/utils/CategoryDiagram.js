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

        const doughnutLabelsLine = {
            id: 'doughnutLabelsLine',
            afterDraw(chart) {
                const {ctx, chartArea: { width, height }} = chart; 
                
                chart.data.datasets.forEach((dataset, i) => {
                    const total = dataset.data.reduce((a, b) => a + b, 0);

                    chart.getDatasetMeta(i).data.forEach((datapoint, index) => {
                        const value = dataset.data[index];
                        const percent = (value / total) * 100;

                        if (percent >= 5) return; 
                        
                        const { x, y } = datapoint.tooltipPosition();
                        const halfwidth = width / 2;
                        const halfheight = height / 2;
                        const xLine = x >= halfwidth ? x + 10 : x - 10; 
                        const yLine = y >= halfheight ? y + 50 : y - 50; 
                        const extraLine = x >= halfwidth ? 30 : -30;

                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(xLine, yLine);
                        ctx.lineTo(xLine + extraLine, yLine);
                        ctx.strokeStyle = fontColor;
                        ctx.stroke();
                        ctx.font = '12px Arial';

                        const textXPosition = x >= halfwidth ? 'left' : 'right';
                        const plusFivePx = x >= halfwidth ? 5 : -5;
                        ctx.textAlign = textXPosition;
                        ctx.fillStyle = fontColor;
                        ctx.textBaseline = 'middle';
                        ctx.fillText(chart.data.labels[index], xLine + extraLine + plusFivePx, yLine - 8);
                        ctx.fillText(`${percent.toFixed(1)}%`, xLine + extraLine + plusFivePx, yLine + 8);
                    })
                })
            }
        }

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
                        formatter: (value, context) => {
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percent = (value / total) * 100;
            
                            if (percent < 5) return '';
            
                            const label = context.chart.data.labels[context.dataIndex];
                            return `${label}\n${percent.toFixed(1)}%`;
                        },
                        anchor: 'center',
                        align: 'center',
                        textAlign: 'center'
                    },
                    tooltip: { enabled: false },
                    legend: { display: false }
                },
                elements: {
                    arc: {
                        borderWidth: 0,
                        hoverOffset: 10
                    }
                },
                layout: { padding: 20 }
            },
            plugins: [doughnutLabelsLine]
        });
    }

    getCategoryData(list) {
        return list.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + item.amount;
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
    
    updateChartData(incomeList, expenseList) {
        this.renderChartData(this.incomeChart, incomeList);
        this.renderChartData(this.expenseChart, expenseList);
    }

    renderChartData(chart, list) {
        if (chart) {
            const data = this.getCategoryData(list);
            chart.data.labels = Object.keys(data);
            chart.data.datasets[0].backgroundColor = this.generateCategoryColors(Object.keys(data).length);
            chart.data.datasets[0].data = Object.values(data);
            chart.update();
        }
    }
}

module.exports = CategoryDiagram;
