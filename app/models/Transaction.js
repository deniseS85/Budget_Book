class Transaction {
    constructor(date, category, amount) {
        this.date = new Date(date);
        this.category = category;
        this.amount = parseFloat(amount);
    }

    formatDate() {
        return `${String(this.date.getDate()).padStart(2, '0')}.${String(this.date.getMonth() + 1).padStart(2, '0')}.${this.date.getFullYear()}`;
    }

    formatAmount() {
        return `${this.amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
    }
}

module.exports = Transaction;