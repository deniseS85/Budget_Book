const TransactionUIConfig = require('../utils/TransactionUIConfig');

class Calendar {
    constructor(calender, dateInput, isFilterBar, transactionType) {
        this.calender = calender;
        this.dateInput = dateInput;
        this.isOpen = false;
        this.isFilterBar = isFilterBar;
        this.transactionType = transactionType; 
        this.transactionConfig = new TransactionUIConfig();
        this.rangeStart = null;
        this.rangeEnd = null;
        this.hoveredDate = null;
        this.transactionConfig.setTransactionColors(this.transactionType);
    }

    toggleCalendar() {
        this.isOpen ? this.closeCalendar() : this.openCalendar();
    }

    openCalendar() {
        this.calender.innerHTML = '';
        this.generateCalendar(new Date());
        this.calender.classList.add('open');
        this.isOpen = true;
    }

    closeCalendar() {
        this.calender.classList.remove('open');
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
        const today = new Date();
        const startOffset = firstDay === 0 ? 6 : firstDay - 1;

        this.addEmptyCells(startOffset);
        this.addDays(lastDate, year, month, today);
    }

    addEmptyCells(startOffset) {
        Array.from({ length: startOffset }).forEach(() => {
            const emptyCell = document.createElement('div');
            emptyCell.style.visibility = 'hidden';
            this.calender.appendChild(emptyCell);
        });
    }

    addDays(lastDate, year, month, today) {
        Array.from({ length: lastDate }).forEach((_, i) => {
            const day = i + 1;
            const dayDate = new Date(year, month, day);
            const dayElement = this.createDayElement(day, dayDate, today, year, month);

            this.calender.appendChild(dayElement);
        });
    }

    createDayElement(day, dayDate, today, year, month) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.textContent = day;

        if (!this.isFilterBar) {
            this.addDayClickListener(dayElement, day, month, year);
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayElement.classList.add('today');
            }
        } else {
            this.addRangeListeners(dayElement, dayDate);
        }

        dayElement.dataset.date = dayDate.toISOString();
        return dayElement;
    }

    addDayClickListener(dayElement, day, month, year) {
        dayElement.addEventListener('click', () => {
            this.dateInput.value = `${String(day).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}.${year}`;
            this.closeCalendar();
        });
    }

    addRangeListeners(dayElement, dayDate) {
        dayElement.addEventListener('click', () => this.handleRangeClick(dayDate));
        dayElement.addEventListener('mouseenter', () => {
            if (this.rangeStart && !this.rangeEnd) {
                this.hoveredDate = dayDate;
                this.highlightRange();
            }
        });
    }

    handleRangeClick(date) {
        if (!this.rangeStart || this.rangeEnd) {
            this.rangeStart = date;
            this.rangeEnd = null;
            this.hoveredDate = null;
        } else {
            this.rangeEnd = date;
            if (this.rangeEnd < this.rangeStart) {
                [this.rangeStart, this.rangeEnd] = [this.rangeEnd, this.rangeStart];
            }
            this.dateInput.value = `${this.formatDate(this.rangeStart)} – ${this.formatDate(this.rangeEnd)}`;
            this.closeCalendar();
        }

        this.highlightRange();
    }

    highlightRange() {
        const allDays = this.calender.querySelectorAll('.day');
        allDays.forEach(dayEl => dayEl.classList.remove('range-highlight', 'range-start', 'range-end'));
    
        const start = this.rangeStart;
        const end = this.rangeEnd || this.hoveredDate;
    
        if (!start || !end) return;
    
        const [min, max] = start <= end ? [start, end] : [end, start];

        allDays.forEach(dayEl => {
            const date = new Date(dayEl.dataset.date);
            if (date >= min && date <= max) {
                dayEl.classList.add('range-highlight');
                if (date.getTime() === min.getTime()) dayEl.classList.add('range-start');
                if (date.getTime() === max.getTime()) dayEl.classList.add('range-end');
            }
        });
    }

    formatDate(date) {
        return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    }
}

module.exports = { Calendar };
