class CategoryDropdown {
<<<<<<< HEAD
    constructor(inputElement, dropdownElement,  categories = []) {
=======
    constructor(inputElement, dropdownElement, categories = []) {
>>>>>>> show today in calender, add fonts
        this.inputElement = inputElement;
        this.dropdownElement = dropdownElement;
        this.isOpen = false;
        this.categories = categories;
        this.setDropdownList();
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.inputElement.addEventListener('click', () => this.toggleDropdown());
        this.inputElement.addEventListener('input', () => this.filterCategories());
        this.dropdownElement.addEventListener('click', (event) => this.selectCategory(event));
    }

    toggleDropdown() {
        this.isOpen ? this.closeDropdown() : this.openDropdown();
    }

    openDropdown() {
        this.dropdownElement.classList.add('open');
        this.isOpen = true;
<<<<<<< HEAD
        this.renderCategories();
=======
>>>>>>> show today in calender, add fonts
    }

    closeDropdown() {
        this.dropdownElement.classList.remove('open');
        this.isOpen = false;
    }

<<<<<<< HEAD
    renderCategories() {
        this.dropdownElement.innerHTML = '';

        if (this.categories.length === 0) {
=======
    renderCategories(categories) {
        this.dropdownElement.innerHTML = ''; // Vorherige Kategorien löschen

        if (categories.length === 0) {
>>>>>>> show today in calender, add fonts
            this.dropdownElement.innerHTML = '<li>Keine Kategorien verfügbar</li>';
            return;
        }
        
<<<<<<< HEAD
        this.categories.forEach(category => {
=======
        categories.forEach(category => {
>>>>>>> show today in calender, add fonts
            const li = document.createElement('li');
            li.textContent = category;
            this.dropdownElement.appendChild(li);
        });
    }

    filterCategories() {
        const searchTerm = this.inputElement.value.toLowerCase();
        const filteredCategories = this.categories.filter(category => category.toLowerCase().includes(searchTerm));

<<<<<<< HEAD
        this.dropdownElement.innerHTML = '';

        if (searchTerm.length === 0) {
            this.renderCategories();
=======
        if (searchTerm.length === 0) {
            this.renderCategories(this.categories); // Alle Kategorien anzeigen, wenn das Eingabefeld leer ist
>>>>>>> show today in calender, add fonts
            this.openDropdown();
            return;
        }
    
        if (filteredCategories.length === 0) {
<<<<<<< HEAD
=======
            this.renderCategories([]); // Zeigt eine Nachricht, dass keine Kategorien gefunden wurden
>>>>>>> show today in calender, add fonts
            this.closeDropdown();
            return;
        }

<<<<<<< HEAD
        filteredCategories.forEach(category => {
            const li = document.createElement('li');
            li.textContent = category;
            this.dropdownElement.appendChild(li);
        });

=======
        this.renderCategories(filteredCategories); // Zeigt nur die gefilterten Kategorien an
>>>>>>> show today in calender, add fonts
        this.openDropdown();
    }

    selectCategory(event) {
        if (event.target.tagName === 'LI') {
            this.inputElement.value = event.target.textContent;
            this.closeDropdown(); 
        }
    }

    updateCategoriesData(categories) {
        this.categories = categories; 
<<<<<<< HEAD
        this.setDropdownList();
=======
        this.renderCategories(categories); // Gibt die neuen Kategorien im Dropdown aus
>>>>>>> show today in calender, add fonts
    }

    setDropdownList() {
        if (!this.categories) return;
<<<<<<< HEAD
    
        this.renderCategories();
    }
}

module.exports = { CategoryDropdown };
=======
        this.renderCategories(this.categories); // Zeigt alle Kategorien beim ersten Laden an
    }
}

module.exports = { CategoryDropdown };
>>>>>>> show today in calender, add fonts
