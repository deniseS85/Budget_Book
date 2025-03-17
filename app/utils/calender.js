function openCalendar() {
    const calendar = document.getElementById('calendar');
    const dateInput = document.getElementById('date');

    if (!calendar.classList.contains('hidden')) {
        calendar.classList.add('hidden');
        return;
    }
    calendar.innerHTML = '';
    generateCalendar(calendar, new Date());
    calendar.classList.remove('hidden');

    document.addEventListener('click', (event) => {
        if (!calendar.contains(event.target) && event.target !== dateInput) {
            calendar.classList.add('hidden');
        }
    }, { once: true });
}

function generateCalendar(container, date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const daysOfWeek = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

    daysOfWeek.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.style.fontWeight = 'bold';
        dayElement.textContent = day;
        container.appendChild(dayElement);
    });

    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
        const emptyCell = document.createElement('div');
        emptyCell.style.visibility = 'hidden';
        container.appendChild(emptyCell);
    }

    for (let day = 1; day <= lastDate; day++) {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        dayElement.addEventListener('click', () => {
            document.getElementById('date').value = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            container.classList.add('hidden');
        });
        container.appendChild(dayElement);
    }
}

module.exports = { openCalendar };
