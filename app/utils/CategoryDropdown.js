class CategoryDropdown {
    constructor(inputElement, dropdownElement, categories = [], isFilterBar = false) {
        this.inputElement = inputElement;
        this.dropdownElement = dropdownElement;
        this.isOpen = false;
        this.categories = Array.isArray(categories) ? categories : [];
        this.isFilterBar = isFilterBar;
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
        this.inputElement.classList.add('open-dropdown');
        this.isOpen = true;
    }

    closeDropdown() {
        this.dropdownElement.classList.remove('open');
        this.inputElement.classList.remove('open-dropdown');
        this.inputElement.classList.add('close-dropdown');

        setTimeout(() => {
            this.inputElement.classList.remove('close-dropdown');
        }, 300);
        this.isOpen = false;
    }

    renderCategories(categories) {
        this.dropdownElement.innerHTML = '';

        if (this.isFilterBar) {
            const allCategoriesItem = document.createElement('li');
            allCategoriesItem.textContent = 'Alle Kategorien';
            allCategoriesItem.setAttribute('data-category', 'all');
            this.dropdownElement.appendChild(allCategoriesItem);
        }

        if (categories.length === 0 && this.inputElement.value.trim().length === 0) {
            this.dropdownElement.innerHTML = '<li>Keine Kategorien verfügbar</li>';
            return;
        }

        categories.sort((a, b) => a.localeCompare(b));
        
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
            this.renderCategories([this.inputElement.value]);
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

        if (event.target.getAttribute('data-category') === 'all') {
            this.inputElement.value = 'Alle Kategorien';
        }
    }

    updateCategoriesData(categories) {
        if (JSON.stringify(this.categories) !== JSON.stringify(categories)) {
            this.categories = categories;
            this.renderCategories(categories); 
        }
    }

    setDropdownList() {
        if (!this.categories) return;
        this.renderCategories(this.categories);
    }
}

module.exports = { CategoryDropdown };
