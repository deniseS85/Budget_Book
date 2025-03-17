const { validateForm, validateAmountInput } = require('../utils/formValidation');
const { openCalendar } = require('../utils/calender');

function openTransactionModal(type, modalHeader, saveButton) {
    transactionType = type;
    modalHeader.innerHTML = transactionType === 'income' ? 'Neue Einnahme' : 'Neue Ausgabe';
    toggleModal(true, transactionModal, clearForm); 
    saveButton.disabled = true;

    const today = new Date();
    document.getElementById('date').value = today.toISOString().split('T')[0];

    const dateInput = document.getElementById('date');
    dateInput.removeEventListener('click', openCalendar);
    dateInput.addEventListener('click', openCalendar);

    document.getElementById('date').addEventListener('input', validateForm);
    document.getElementById('description').addEventListener('input', validateForm);
    document.getElementById('amount').addEventListener('input', validateForm);
    document.getElementById('amount').addEventListener('keydown', validateAmountInput);
}

function toggleModal(isVisible, modalElement, clearFormCallback) {   
    modalElement.classList.toggle('visible', isVisible);
    modalElement.classList.toggle('hidden', !isVisible);

    if (!isVisible) clearFormCallback();
}

function clearForm() {
    document.getElementById('date').value = '';
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
}

module.exports = { openTransactionModal, toggleModal, clearForm };
