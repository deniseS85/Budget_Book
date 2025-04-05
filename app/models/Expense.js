const Transaction = require('./Transaction');

class Expense extends Transaction {
    constructor(date, category, amount, paymentMethod) {
        super(date, category, amount, paymentMethod);
        this.type = "expense";
    }
}

module.exports = Expense;
