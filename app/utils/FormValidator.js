class FormValidator {
    constructor(saveButton) {
        this.saveButton = saveButton;
    }

    validateForm() {
        const category = document.getElementById('category').value;
        const amount = parseFloat(document.getElementById('amount').value.replace(',', '.'));
        const selectedMethod = document.querySelector('.payment-method.selected');
        this.saveButton.disabled = !(category && !isNaN(amount) && selectedMethod);
    }

    validateAmountInput(event) {
        const key = event.key;
        const inputValue = event.target.value;
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', ','];

        if (!allowedKeys.includes(key)) {
            event.preventDefault();
            return;
        }

        if ((key === ',' || key === '.') && (inputValue.includes(',') || inputValue.includes('.'))) {
            event.preventDefault();
            return;
        }

        const decimalPart = inputValue.split(',')[1] || inputValue.split('.')[1];

        if (decimalPart && decimalPart.length >= 2) {
            const isControlKey = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key);
            if (!isControlKey) {
                event.preventDefault();
            }
        }
    }

    checkValidation() {
        document.getElementById('dropdown').addEventListener('click', () => this.validateForm());
        document.getElementById('category').addEventListener('input', () => this.validateForm());
        document.getElementById('amount').addEventListener('input', () => this.validateForm());
        document.getElementById('amount').addEventListener('keydown', (event) => this.validateAmountInput(event));
        document.querySelectorAll('.payment-method').forEach(img => {
            img.addEventListener('click', () => this.validateForm());
        });
    }
}

module.exports = FormValidator;

   
    



