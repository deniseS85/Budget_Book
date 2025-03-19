class CategoryDropdown {
    constructor(inputElement, dropdownElement,  categories = []) {
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
        this.renderCategories();
    }

    closeDropdown() {
        this.dropdownElement.classList.remove('open');
        this.isOpen = false;
    }

    renderCategories() {
        this.dropdownElement.innerHTML = '';

        if (this.categories.length === 0) {
            this.dropdownElement.innerHTML = '<li>Keine Kategorien verfügbar</li>';
            return;
        }
        
        this.categories.forEach(category => {
            const li = document.createElement('li');
            li.textContent = category;
            this.dropdownElement.appendChild(li);
        });
    }

    filterCategories() {
        const searchTerm = this.inputElement.value.toLowerCase();
        const filteredCategories = this.categories.filter(category => category.toLowerCase().includes(searchTerm));

        this.dropdownElement.innerHTML = '';

        if (searchTerm.length === 0) {
            this.renderCategories();
            this.openDropdown();
            return;
        }
    
        if (filteredCategories.length === 0) {
            this.closeDropdown();
            return;
        }

        filteredCategories.forEach(category => {
            const li = document.createElement('li');
            li.textContent = category;
            this.dropdownElement.appendChild(li);
        });

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
        this.setDropdownList();
    }

    setDropdownList() {
        if (!this.categories) return;
    
        this.renderCategories();
    }
}

module.exports = { CategoryDropdown };