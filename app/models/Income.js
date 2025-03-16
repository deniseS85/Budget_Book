const Transaction = require('./Transaction');

class Income extends Transaction {
    
    constructor(date, description, amount) {
        super(date, description, amount);
        this.type = "income";
    }
}

module.exports = Income;
