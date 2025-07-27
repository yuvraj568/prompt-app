// Prompt Application
class PromptApp {
    constructor() {
        // Initialize with sample data from provided JSON
        this.prompts = [
            {
                id: 1,
                text: "Create a responsive navigation bar with smooth animations using CSS and JavaScript.",
                tags: ["frontend", "css", "javascript", "responsive"]
            },
            {
                id: 2,
                text: "Write a Python function to analyze sentiment of text using natural language processing.",
                tags: ["python", "nlp", "sentiment-analysis", "machine-learning"]
            },
            {
                id: 3,
                text: "Design a clean and modern login form with form validation and error handling.",
                tags: ["ui-design", "forms", "validation", "frontend"]
            },
            {
                id: 4,
                text: "Explain the concept of closures in JavaScript with practical examples.",
                tags: ["javascript", "concepts", "closures", "tutorial"]
            },
            {
                id: 5,
                text: "Create a RESTful API endpoint for user authentication using Node.js and Express.",
                tags: ["backend", "nodejs", "express", "api", "authentication"]
            }
        ];
        
        this.filteredPrompts = [...this.prompts];
        this.currentFilter = null;
        this.searchQuery = '';
        this.editingPromptId = null;
        this.nextId = 6;
        this.promptToDelete = null;
        
        // Ensure DOM is ready before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        this.bindEvents();
        this.render();
    }
    
    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }
        
        // Add new prompt button
        const addNewBtn = document.getElementById('addNewBtn');
        if (addNewBtn) {
            addNewBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal();
            });
        }
        
        // Modal events
        this.bindModalEvents();
        
        // Confirmation dialog events
        this.bindConfirmationEvents();
        
        // All Prompts button
        const allPromptsBtn = document.getElementById('allPromptsBtn');
        if (allPromptsBtn) {
            allPromptsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAllPrompts();
            });
        }
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeConfirmDialog();
                this.closeAllMenus();
            }
        });
        
        // Close menus when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.card-menu')) {
                this.closeAllMenus();
            }
        });
    }
    
    bindModalEvents() {
        const modal = document.getElementById('modal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const promptForm = document.getElementById('promptForm');
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal();
            });
        }
        
        if (modal) {
            const modalOverlay = modal.querySelector('.modal-overlay');
            if (modalOverlay) {
                modalOverlay.addEventListener('click', () => this.closeModal());
            }
        }
        
        if (promptForm) {
            promptForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePrompt();
            });
        }
    }
    
    bindConfirmationEvents() {
        const confirmDialog = document.getElementById('confirmDialog');
        const confirmCancelBtn = document.getElementById('confirmCancelBtn');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        
        if (confirmCancelBtn) {
            confirmCancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeConfirmDialog();
            });
        }
        
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.confirmDelete();
            });
        }
        
        if (confirmDialog) {
            const confirmOverlay = confirmDialog.querySelector('.modal-overlay');
            if (confirmOverlay) {
                confirmOverlay.addEventListener('click', () => this.closeConfirmDialog());
            }
        }
    }
    
    showAllPrompts() {
        this.currentFilter = null;
        this.searchQuery = '';
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        this.applyFilters();
    }
    
    render() {
        this.renderPrompts();
        this.renderTags();
        this.updateAllPromptsButton();
    }
    
    updateAllPromptsButton() {
        const allPromptsBtn = document.getElementById('allPromptsBtn');
        if (!allPromptsBtn) return;
        
        const totalCount = this.prompts.length;
        allPromptsBtn.textContent = `All Prompts (${totalCount})`;
        
        // Update active state based on current filter
        if (this.currentFilter === null) {
            allPromptsBtn.classList.add('active');
        } else {
            allPromptsBtn.classList.remove('active');
        }
    }
    
    renderPrompts() {
        const container = document.getElementById('promptsContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (!container || !emptyState) return;
        
        if (this.filteredPrompts.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        const promptsHTML = this.filteredPrompts.map(prompt => `
            <div class="prompt-card" data-id="${prompt.id}">
                <div class="card-menu">
                    <button class="menu-btn" data-id="${prompt.id}" type="button">⋯</button>
                    <div class="menu-dropdown hidden" data-menu="${prompt.id}">
                        <button class="menu-option" data-action="edit" data-id="${prompt.id}" type="button">Edit</button>
                        <button class="menu-option" data-action="delete" data-id="${prompt.id}" type="button">Delete</button>
                    </div>
                </div>
                <div class="prompt-text">${this.escapeHtml(prompt.text)}</div>
                <div class="prompt-tags">
                    ${prompt.tags.map(tag => `<span class="prompt-tag">${this.escapeHtml(tag)}</span>`).join('')}
                </div>
            </div>
        `).join('');
        
        container.innerHTML = promptsHTML;
        
        // Important: Bind events after rendering
        setTimeout(() => {
            this.bindPromptCardEvents();
        }, 0);
    }
    
    bindPromptCardEvents() {
        const container = document.getElementById('promptsContainer');
        if (!container) return;
        
        // Add event listeners to prompt cards
        const promptCards = container.querySelectorAll('.prompt-card');
        promptCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger copy if clicking on menu or menu items
                if (e.target.closest('.card-menu')) {
                    return;
                }
                
                const promptId = parseInt(card.dataset.id, 10);
                this.copyToClipboard(promptId);
            });
        });
        
        // Add event listeners to menu buttons
        const menuBtns = container.querySelectorAll('.menu-btn');
        menuBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const promptId = btn.dataset.id;
                this.toggleMenu(promptId);
            });
        });
        
        // Add event listeners to menu options
        const menuOptions = container.querySelectorAll('.menu-option');
        menuOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const action = option.dataset.action;
                const promptId = parseInt(option.dataset.id, 10);
                
                if (action === 'edit') {
                    this.editPrompt(promptId);
                } else if (action === 'delete') {
                    this.deletePrompt(promptId);
                }
                
                this.closeAllMenus();
            });
        });
    }
    
    renderTags() {
        const tagsList = document.getElementById('tagsList');
        if (!tagsList) return;
        
        const allTags = {};
        
        // Count occurrences of each tag
        this.prompts.forEach(prompt => {
            prompt.tags.forEach(tag => {
                allTags[tag] = (allTags[tag] || 0) + 1;
            });
        });
        
        const sortedTags = Object.entries(allTags).sort(([a], [b]) => a.localeCompare(b));
        
        const tagsHTML = sortedTags.map(([tag, count]) => `
            <button class="tag-filter ${this.currentFilter === tag ? 'active' : ''}" data-tag="${tag}" type="button">
                <span>${this.escapeHtml(tag)}</span>
                <span class="tag-count">${count}</span>
            </button>
        `).join('');
        
        tagsList.innerHTML = tagsHTML;
        
        // Bind events after rendering
        setTimeout(() => {
            this.bindTagEvents();
        }, 0);
    }
    
    bindTagEvents() {
        const tagsList = document.getElementById('tagsList');
        if (!tagsList) return;
        
        const tagButtons = tagsList.querySelectorAll('.tag-filter');
        tagButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tag = btn.dataset.tag;
                this.currentFilter = this.currentFilter === tag ? null : tag;
                this.applyFilters();
            });
        });
    }
    
    applyFilters() {
        this.filteredPrompts = this.prompts.filter(prompt => {
            const matchesSearch = !this.searchQuery || 
                prompt.text.toLowerCase().includes(this.searchQuery) ||
                prompt.tags.some(tag => tag.toLowerCase().includes(this.searchQuery));
            
            const matchesFilter = !this.currentFilter || 
                prompt.tags.includes(this.currentFilter);
            
            return matchesSearch && matchesFilter;
        });
        
        this.render();
    }
    
    openModal(prompt = null) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const promptText = document.getElementById('promptText');
        const promptTags = document.getElementById('promptTags');
        
        if (!modal || !modalTitle || !promptText || !promptTags) return;
        
        if (prompt) {
            // Editing existing prompt
            this.editingPromptId = prompt.id;
            modalTitle.textContent = 'Edit Prompt';
            promptText.value = prompt.text;
            promptTags.value = prompt.tags.join(', ');
        } else {
            // Adding new prompt
            this.editingPromptId = null;
            modalTitle.textContent = 'Add New Prompt';
            promptText.value = '';
            promptTags.value = '';
        }
        
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        
        // Focus after a brief delay to ensure modal is visible
        setTimeout(() => {
            promptText.focus();
        }, 100);
    }
    
    closeModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
        this.editingPromptId = null;
    }
    
    savePrompt() {
        const promptTextEl = document.getElementById('promptText');
        const promptTagsEl = document.getElementById('promptTags');
        
        if (!promptTextEl || !promptTagsEl) return;
        
        const promptText = promptTextEl.value.trim();
        const promptTags = promptTagsEl.value.trim();
        
        if (!promptText) {
            alert('Please enter prompt text');
            return;
        }
        
        const tags = promptTags ? 
            promptTags.split(',').map(tag => tag.trim()).filter(tag => tag) : 
            [];
        
        if (this.editingPromptId) {
            // Update existing prompt
            const promptIndex = this.prompts.findIndex(p => p.id === this.editingPromptId);
            if (promptIndex !== -1) {
                this.prompts[promptIndex] = {
                    ...this.prompts[promptIndex],
                    text: promptText,
                    tags: tags
                };
            }
        } else {
            // Add new prompt
            const newPrompt = {
                id: this.nextId++,
                text: promptText,
                tags: tags
            };
            this.prompts.unshift(newPrompt);
        }
        
        this.applyFilters();
        this.closeModal();
    }
    
    editPrompt(promptId) {
        const prompt = this.prompts.find(p => p.id === promptId);
        if (prompt) {
            this.openModal(prompt);
        }
    }
    
    deletePrompt(promptId) {
        this.promptToDelete = promptId;
        const confirmDialog = document.getElementById('confirmDialog');
        if (confirmDialog) {
            confirmDialog.classList.remove('hidden');
            confirmDialog.style.display = 'flex';
        }
    }
    
    confirmDelete() {
        if (this.promptToDelete) {
            this.prompts = this.prompts.filter(p => p.id !== this.promptToDelete);
            this.applyFilters();
            this.promptToDelete = null;
        }
        this.closeConfirmDialog();
    }
    
    closeConfirmDialog() {
        const confirmDialog = document.getElementById('confirmDialog');
        if (confirmDialog) {
            confirmDialog.classList.add('hidden');
            confirmDialog.style.display = 'none';
        }
        this.promptToDelete = null;
    }
    
    async copyToClipboard(promptId) {
        const prompt = this.prompts.find(p => p.id === promptId);
        if (!prompt) return;
        
        try {
            // Try using the modern Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(prompt.text);
            } else {
                // Fallback for older browsers or non-secure contexts
                const textArea = document.createElement('textarea');
                textArea.value = prompt.text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-99999px';
                textArea.style.top = '-99999px';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.error('Fallback copy failed', err);
                }
                
                document.body.removeChild(textArea);
            }
            
            this.showCopyMessage();
        } catch (err) {
            console.error('Failed to copy text: ', err);
            // Show the copy message anyway to provide user feedback
            this.showCopyMessage();
        }
    }
    
    showCopyMessage() {
        const copyMessage = document.getElementById('copyMessage');
        if (copyMessage) {
            copyMessage.classList.remove('hidden');
            copyMessage.style.display = 'block';
            
            // Clear any existing timeout
            if (this.copyTimeout) {
                clearTimeout(this.copyTimeout);
            }
            
            this.copyTimeout = setTimeout(() => {
                copyMessage.classList.add('hidden');
                copyMessage.style.display = 'none';
            }, 2000);
        }
    }
    
    toggleMenu(promptId) {
        // Close all other menus first
        this.closeAllMenus();
        
        // Open the clicked menu
        const menu = document.querySelector(`[data-menu="${promptId}"]`);
        if (menu) {
            menu.classList.remove('hidden');
            menu.style.display = 'block';
        }
    }
    
    closeAllMenus() {
        const allMenus = document.querySelectorAll('.menu-dropdown');
        allMenus.forEach(menu => {
            menu.classList.add('hidden');
            menu.style.display = 'none';
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
let promptApp;

function initApp() {
    if (!promptApp) {
        promptApp = new PromptApp();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}