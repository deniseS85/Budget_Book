const Transaction = require('./Transaction');

class Income extends Transaction {
    constructor(date, category, amount) {
        super(date, category, amount);
        this.type = "income";
    }
}

module.exports = Income;
