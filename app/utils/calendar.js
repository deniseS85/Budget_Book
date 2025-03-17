class Calendar {
    constructor(container, dateInput) {
        this.container = container;
        this.dateInput = dateInput;
        this.isOpen = false;
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.container.innerHTML = '';
        this.generateCalendar(new Date());
        this.container.classList.remove('hidden');
        this.isOpen = true;
    }

    close() {
        this.container.classList.add('hidden');
        this.isOpen = false;
    }

    generateCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        const daysOfWeek = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

        daysOfWeek.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.classList.add('dayOfWeek');
            dayElement.textContent = day;
            this.container.appendChild(dayElement);
        });

        Array.from({ length: (firstDay === 0 ? 6 : firstDay - 1) }).forEach(() => {
            const emptyCell = document.createElement('div');
            emptyCell.style.visibility = 'hidden';
            this.container.appendChild(emptyCell);
        });
    
        Array.from({ length: lastDate }).forEach((_, day) => {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            dayElement.textContent = day + 1;
            dayElement.addEventListener('click', () => {
                this.dateInput.value = `${String(day + 1).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}.${year}`;
                this.close();
            });
            this.container.appendChild(dayElement);
        });
    }
}

module.exports = { Calendar };
