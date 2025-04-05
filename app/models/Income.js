const Transaction = require('./Transaction');

class Income extends Transaction {
    constructor(date, category, amount, paymentMethod) {
        super(date, category, amount, paymentMethod);
        this.type = "income";
    }
}

module.exports = Income;
