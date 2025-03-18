class Calendar {
    constructor(calender, dateInput) {
        this.calender = calender;
        this.dateInput = dateInput;
        this.isOpen = false;
    }

    toggleCalendar() {
        this.isOpen ? this.closeCalendar() : this.openCalendar();
    }

    openCalendar() {
        this.calender.innerHTML = '';
        this.generateCalendar(new Date());
        this.calender.classList.remove('hidden');
        this.isOpen = true;
    }

    closeCalendar() {
        this.calender.classList.add('hidden');
        this.isOpen = false;
    }

    generateCalendar(date) {
        this.calender.innerHTML = '';

        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        
        this.calender.appendChild(this.createHeader(year, month));
        this.calender.appendChild(this.createDaysOfWeek());
        this.createDays(firstDay, lastDate, year, month);
    }

    createHeader(year, month) {
        const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
        const header = document.createElement('div');
        header.classList.add('calendar-header');
    
        const prevBtn = this.createNavButton('←', 'prev-btn', () => this.generateCalendar(new Date(year, month - 1, 1)));
        const nextBtn = this.createNavButton('→', 'next-btn', () => this.generateCalendar(new Date(year, month + 1, 1)));
    
        const monthText = document.createElement('span');
        monthText.textContent = `${monthNames[month]} ${year}`;
        monthText.classList.add('month-name');
    
        header.appendChild(prevBtn);
        header.appendChild(monthText);
        header.appendChild(nextBtn);
        
        return header;
    }

    createNavButton(symbol, className, callback) {
        const btn = document.createElement('span');
        btn.textContent = symbol;
        btn.classList.add(className);
        btn.addEventListener('click', (event) => {
            event.stopPropagation(); 
            callback(event); 
        });
        return btn;
    }
    
    createDaysOfWeek() {
        const daysOfWeekContainer = document.createDocumentFragment();
        ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.classList.add('dayOfWeek');
            dayElement.textContent = day;
            daysOfWeekContainer.appendChild(dayElement);
        });
        return daysOfWeekContainer;
    }

    createDays(firstDay, lastDate, year, month) {
        const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    
        Array.from({ length: startOffset }).forEach(() => {
            const emptyCell = document.createElement('div');
            emptyCell.style.visibility = 'hidden';
            this.calender.appendChild(emptyCell);
        });
    
        Array.from({ length: lastDate }).forEach((_, day) => {
            const dayElement = document.createElement('div');
            dayElement.classList.add('day');
            dayElement.textContent = day + 1;
            dayElement.addEventListener('click', () => {
                this.dateInput.value = `${String(day + 1).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}.${year}`;
                this.closeCalendar();
            });
            this.calender.appendChild(dayElement);
        });
    }
}

module.exports = { Calendar };
