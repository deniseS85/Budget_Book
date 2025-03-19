function validateForm() {
    const date = document.getElementById('date').value;
    const category = document.getElementById('category').value;
    const amount = parseFloat(document.getElementById('amount').value);

    saveButton.disabled = !(date && category && !isNaN(amount));
}

// nur ein komma oder punkt, nur 2 nachkommastellen
function validateAmountInput(event) {
    const key = event.key;
    const allowedKeys = [
        'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '.', ',', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ];

    if (!allowedKeys.includes(key)) {
        event.preventDefault();
    }
}

module.exports = { validateForm, validateAmountInput };
