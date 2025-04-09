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
                hoverColor: '#ff00aa',
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
                hoverColor: '#ff00aa'
            }
        };
        const selectedColors = colors[type];
        document.documentElement.style.setProperty('--transaction-color', selectedColors.color);
        document.documentElement.style.setProperty('--transaction-font-color', selectedColors.fontColor);
        document.documentElement.style.setProperty('--transaction-hover-color', selectedColors.hoverColor);
    }

    setPaymentMethodIcon(type) {       
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

    setButtonImage(buttonId, imageType, type) {
        const button = document.getElementById(buttonId);
        
        if (button) {
            const img = document.createElement('img');
            img.alt = `${imageType}Filter`;
    
            if (type === 'income') {
                img.src = `../../assets/img/${imageType}_income.png`;
            } else if (type === 'expense') {
                img.src = `../../assets/img/${imageType}_expense.png`;
            }
    
            button.innerHTML = '';
            button.appendChild(img);
        }
    }
    
    setFilterButtonsImg(type) {
        this.setButtonImage('apply-filter', 'filter', type);
        this.setButtonImage('clear-filter', 'reset', type);
    }

    getPaymentMethod() {
        return this.paymentMethod;
    }
}

module.exports = TransactionUIConfig;
