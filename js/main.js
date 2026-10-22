// Main Portfolio Controller
class PortfolioController {
    constructor() {
        this.themes = {
            chatgpt: ChatGPTTheme,
            modelcard: ModelCardTheme,
            vscode: VSCodeTheme,
            terminal: TerminalTheme,
            // neural: NeuralTheme,
            notebook: NotebookTheme,
            paper: PaperTheme,
            // api: APIDocsTheme,
            book: BookTheme,
            // prompt: PromptTheme,
            apple: AppleTheme,
            scifi: SciFiTheme,
            // gitdiff: GitDiffTheme,
            // json: JsonTheme,
            // training: TrainingTheme
        };
        
        this.currentTheme = null;
        this.themeNames = {
            chatgpt: "ChatGPT Interface",
            modelcard: "Model Card Resume",
            vscode: "VSCode Workspace",
            terminal: "Terminal",
            neural: "Neural Network Viz",
            notebook: "Interactive Notebook",
            paper: "Research Paper",
            api: "API Documentation",
            book: "Markdown Book",
            prompt: "Prompt Studio",
            apple: "Apple Persona Card",
            scifi: "Sci-Fi Console",
            gitdiff: "Git Diff Resume",
            json: "JSON Resume",
            training: "Training Dashboard"
        };
        
        this.menuExpanded = false;
        this.init();
    }
    
    init() {
        console.log('🎨 Portfolio Controller Initializing...');
        console.log('📦 Available themes:', Object.keys(this.themes));
        console.log('📄 Portfolio content:', typeof portfolioContent !== 'undefined' ? '✅ Loaded' : '❌ Missing');
        
        // Setup theme toggle
        this.setupThemeToggle();
        
        // DISABLED: URL routing (doesn't work on static hosting like Hostinger)
        // Always load a random theme on page load
        this.loadRandomTheme();
        
        // DISABLED: Browser history handling (only works with server)
        // Keeping the code commented for future reference if you add a server
        /*
        // Check if URL has a theme path (only if running on server)
        let themeFromUrl = null;
        if (window.location.protocol !== 'file:') {
            const path = window.location.pathname;
            const themeName = path.substring(1); // Remove leading slash
            
            if (themeName && this.themes[themeName]) {
                themeFromUrl = themeName;
            }
        }
        
        if (themeFromUrl) {
            // Load theme from URL
            this.loadTheme(themeFromUrl);
        } else {
            // Load random theme on refresh
            this.loadRandomTheme();
        }
        
        // Handle browser back/forward (only if running on server)
        if (window.location.protocol !== 'file:') {
            window.addEventListener('popstate', (event) => {
                if (event.state && event.state.theme && this.themes[event.state.theme]) {
                    this.currentTheme = null; // Reset to allow reload
                    this.loadTheme(event.state.theme);
                }
            });
        }
        */
    }
    
    setupThemeToggle() {
        const floatingBtn = document.getElementById('themeFloatingBtn');
        const optionsDeck = document.getElementById('themeOptionsDeck');
        const themeOptions = document.querySelectorAll('.theme-option-inline');
        const container = document.getElementById('themeSelectorContainer');
        let isExpanded = false;
        
        // Toggle on floating button click
        if (floatingBtn) {
            floatingBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                isExpanded = !isExpanded;
                
                if (isExpanded) {
                    this.expandDeck();
                } else {
                    this.collapseDeck();
                }
            });
        }
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (isExpanded && !container.contains(e.target)) {
                isExpanded = false;
                this.collapseDeck();
            }
        });
        
        // Theme selection
        themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const themeName = e.currentTarget.dataset.theme;
                this.loadTheme(themeName);
                
                // Close the selector
                isExpanded = false;
                this.collapseDeck();
            });
        });
    }
    
    expandDeck() {
        const optionsDeck = document.getElementById('themeOptionsDeck');
        const floatingBtn = document.getElementById('themeFloatingBtn');
        
        optionsDeck.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
        optionsDeck.classList.add('opacity-100', 'pointer-events-auto', 'scale-100');
        
        if (floatingBtn) {
            floatingBtn.style.display = 'none';
        }
    }
    
    collapseDeck() {
        const optionsDeck = document.getElementById('themeOptionsDeck');
        const floatingBtn = document.getElementById('themeFloatingBtn');
        
        optionsDeck.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
        optionsDeck.classList.remove('opacity-100', 'pointer-events-auto', 'scale-100');
        
        if (floatingBtn) {
            floatingBtn.style.display = 'flex';
        }
    }
    
    loadRandomTheme() {
        const themeKeys = Object.keys(this.themes);
        
        // Get previously loaded theme from sessionStorage (only for current session)
        const lastTheme = sessionStorage.getItem('lastTheme');
        
        // Filter out the last theme to ensure we get a different one
        let availableThemes = lastTheme 
            ? themeKeys.filter(t => t !== lastTheme) 
            : themeKeys;
        
        // If all themes filtered out (shouldn't happen), use all themes
        if (availableThemes.length === 0) {
            availableThemes = themeKeys;
        }
        
        const randomIndex = Math.floor(Math.random() * availableThemes.length);
        const randomTheme = availableThemes[randomIndex];
        
        // Store this theme as the last one
        sessionStorage.setItem('lastTheme', randomTheme);
        
        console.log(`🎲 Random theme selected: ${randomTheme} (previous: ${lastTheme || 'none'})`);
        this.loadTheme(randomTheme);
    }
    
    loadTheme(themeName) {
        console.log(`🎨 Loading theme: ${themeName}`);
        
        if (!this.themes[themeName]) {
            console.error(`❌ Theme "${themeName}" not found`);
            return;
        }
        
        console.log(`✅ Theme "${themeName}" exists, type:`, typeof this.themes[themeName]);
        console.log(`✅ Theme render function:`, typeof this.themes[themeName].render);
        
        // Cleanup current theme if it has a cleanup method
        if (this.currentTheme && this.themes[this.currentTheme]?.cleanup) {
            this.themes[this.currentTheme].cleanup();
        }
        
        // Show loading overlay
        const loadingOverlay = document.getElementById('themeLoadingOverlay');
        const container = document.getElementById('themeContainer');
        
        loadingOverlay.classList.remove('hidden');
        container.style.opacity = '0';
        container.style.transform = 'scale(0.98)';
        
        // DISABLED: URL routing (doesn't work on static hosting without server)
        // Keeping this commented for future reference
        /*
        // Update URL with theme name for tracking (only if running on a server, not file://)
        try {
            if (window.location.protocol !== 'file:') {
                const newPath = `/${themeName}`;
                window.history.pushState({ theme: themeName }, '', newPath);
            }
        } catch (e) {
            // Silently fail if pushState is not available (e.g., file:// protocol)
            console.log('URL routing disabled (not running on web server)');
        }
        */
        
        // Update current theme
        this.currentTheme = themeName;
        
        // Load new theme after animation
        setTimeout(() => {
            try {
                console.log(`🎬 Calling render() for ${themeName}...`);
                this.themes[themeName].render();
                console.log(`✅ Theme ${themeName} rendered successfully`);
            } catch (error) {
                console.error(`❌ Error rendering theme ${themeName}:`, error);
                console.error('Stack trace:', error.stack);
            }
            
            // Fade in new theme
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
                container.style.opacity = '1';
                container.style.transform = 'scale(1)';
            }, 300);
        }, 400);
        
        // Log theme change
        console.log(`Theme changed to: ${this.themeNames[themeName]}`);
    }
    
    getCurrentTheme() {
        return this.currentTheme;
    }
}

// Initialize portfolio when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM Content Loaded');
    try {
        window.portfolioController = new PortfolioController();
        console.log('✅ Portfolio Controller created successfully');
    } catch (error) {
        console.error('❌ Error creating Portfolio Controller:', error);
        console.error('Stack:', error.stack);
        
        // Show error on page
        document.body.innerHTML = `
            <div style="background: #1f2937; color: white; padding: 40px; font-family: monospace;">
                <h1 style="color: #ef4444; font-size: 24px; margin-bottom: 20px;">⚠️ Portfolio Error</h1>
                <p style="margin-bottom: 10px;"><strong>Error:</strong> ${error.message}</p>
                <pre style="background: black; padding: 20px; overflow: auto; border-radius: 8px;">${error.stack}</pre>
            </div>
        `;
    }
});

// Prevent FOUC (Flash of Unstyled Content)
window.addEventListener('load', () => {
    document.body.style.visibility = 'visible';
    console.log('📦 Page fully loaded');
});
