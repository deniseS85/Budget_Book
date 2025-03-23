class CategoryDropdown {
    constructor(inputElement, dropdownElement, categories = []) {
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
    }

    closeDropdown() {
        this.dropdownElement.classList.remove('open');
        this.isOpen = false;
    }

    renderCategories(categories) {
        this.dropdownElement.innerHTML = '';

        if (categories.length === 0 && this.inputElement.value.trim().length === 0) {
            this.dropdownElement.innerHTML = '<li>Keine Kategorien verfügbar</li>';
            return;
        }
        
        categories.forEach(category => {
            const li = document.createElement('li');
            li.textContent = category;
            this.dropdownElement.appendChild(li);
        });
    }

    filterCategories() {
        const searchTerm = this.inputElement.value.toLowerCase();
        const filteredCategories = this.categories.filter(category => category.toLowerCase().includes(searchTerm));

        if (searchTerm.length === 0) {
            this.renderCategories(this.categories);
            return;
        }
    
        if (filteredCategories.length === 0) {
            this.renderCategories([]);
            return;
        }

        this.renderCategories(filteredCategories); 
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
        this.renderCategories(categories); 
    }

    setDropdownList() {
        if (!this.categories) return;
        this.renderCategories(this.categories);
    }
}

module.exports = { CategoryDropdown };
