class TransactionUIConfig {
    constructor() {
        this.paymentMethod = null;
    }

    getTransactionConfig(type) {
        const config = {
            income: {
                title: 'Übersicht Einnahmen',
                hoverColor: '#00ffcc',
                headerClass: 'income-detail-header',
                list: incomeList
            },
            expense: {
                title: 'Übersicht Ausgaben',
                hoverColor: '#fd0290',
                headerClass: 'expenses-detail-header',
                list: expenseList
            }
        };
        return config[type];
    }

    setTransactionColors(type) {
        const colors = {
            income: {
                color: 'var(--turquise)',
                fontColor: 'var(--itemColor)',
                hoverColor: '#00ffcc'
            },
            expense: {
                color: 'var(--purple)',
                fontColor: 'var(--fontColor)',
                hoverColor: '#fd0290'
            }
        };
        const selectedColors = colors[type];
        document.documentElement.style.setProperty('--transaction-color', selectedColors.color);
        document.documentElement.style.setProperty('--transaction-font-color', selectedColors.fontColor);
        document.documentElement.style.setProperty('--transaction-hover-color', selectedColors.hoverColor);
    }

    setTransactionIcons(type) {       
        const images = document.querySelectorAll('.payment-method');
        images.forEach(img => {
            img.classList.remove('selected', 'income', 'expense');
            img.classList.add(type);
            img.addEventListener('click', () => {
                images.forEach(i => i.classList.remove('selected'));
                img.classList.add('selected');
                this.paymentMethod = img.dataset.method;
            });
        });
    }

    getPaymentMethod() {
        return this.paymentMethod;
    }
}

module.exports = TransactionUIConfig;
