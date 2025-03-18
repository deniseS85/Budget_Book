class CategoryDropdown {
    constructor(inputElement, dropdownElement) {
        this.inputElement = inputElement;
        this.dropdownElement = dropdownElement;
        this.isOpen = false;
        this.categories = ['Einnahmen', 'Ausgaben', 'Sonstiges', 'Gehalt', 'Trinkgeld']; // Beispielkategorien, die du anpassen kannst
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
        this.renderCategories();
    }

    closeDropdown() {
        this.dropdownElement.classList.remove('open');
        this.isOpen = false;
    }

    renderCategories() {
        this.dropdownElement.innerHTML = ''; // Leert das Dropdown
        this.categories.forEach(category => {
            const li = document.createElement('li');
            li.textContent = category;
            this.dropdownElement.appendChild(li);
        });
    }

    filterCategories() {
        const searchTerm = this.inputElement.value.toLowerCase();
        const filteredCategories = this.categories.filter(category => category.toLowerCase().includes(searchTerm));

        this.dropdownElement.innerHTML = ''; // Leert das Dropdown
        filteredCategories.forEach(category => {
            const li = document.createElement('li');
            li.textContent = category;
            this.dropdownElement.appendChild(li);
        });
    }

    selectCategory(event) {
        if (event.target.tagName === 'LI') {
            this.inputElement.value = event.target.textContent;
            this.closeDropdown(); 
        }
    }
}

module.exports = { CategoryDropdown };