const Transaction = require('./Transaction');

class Expense extends Transaction {
    constructor(date, category, amount) {
        super(date, category, amount);
        this.type = "expense";
    }
}

module.exports = Expense;
