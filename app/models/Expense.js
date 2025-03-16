const Transaction = require('./Transaction');

class Expense extends Transaction {
    
    constructor(date, description, amount) {
        super(date, description, amount);
        this.type = "expense";
    }
}

module.exports = Expense;
