// ChatGPT-Style Portfolio Theme
const ChatGPTTheme = {
    name: "ChatGPT Interface",
    
    render() {
        const container = document.getElementById('themeContainer');
        container.innerHTML = `
            <div class="flex h-screen bg-gray-50">
                <!-- Sidebar -->
                <div class="w-16 bg-gray-900 flex flex-col items-center py-4 space-y-6 border-r border-gray-800">
                    <div class="sidebar-item-wrapper relative group">
                        <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                            <i class="fas fa-home text-white text-lg"></i>
                        </div>
                        <div class="sidebar-tooltip">Home</div>
                    </div>
                    
                    <div class="sidebar-item-wrapper relative group">
                        <div class="nav-item w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors" data-section="about">
                            <i class="fas fa-user text-gray-400"></i>
                        </div>
                        <div class="sidebar-tooltip">About</div>
                    </div>
                    
                    <div class="sidebar-item-wrapper relative group">
                        <div class="nav-item w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors" data-section="skills">
                            <i class="fas fa-code text-gray-400"></i>
                        </div>
                        <div class="sidebar-tooltip">Skills</div>
                    </div>
                    
                    <div class="sidebar-item-wrapper relative group">
                        <div class="nav-item w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors" data-section="projects">
                            <i class="fas fa-briefcase text-gray-400"></i>
                        </div>
                        <div class="sidebar-tooltip">Projects</div>
                    </div>
                    
                    <div class="sidebar-item-wrapper relative group">
                        <div class="nav-item w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors" data-section="experience">
                            <i class="fas fa-building text-gray-400"></i>
                        </div>
                        <div class="sidebar-tooltip">Experience</div>
                    </div>
                    
                    <div class="sidebar-item-wrapper relative group">
                        <div class="nav-item w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors" data-section="reading">
                            <i class="fas fa-book-reader text-gray-400"></i>
                        </div>
                        <div class="sidebar-tooltip">Reading</div>
                    </div>
                    
                    <div class="sidebar-item-wrapper relative group">                    <div class="nav-item w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors" data-section="contact">
                            <i class="fas fa-envelope text-gray-400"></i>
                        </div>
                        <div class="sidebar-tooltip">Contact</div>
                    </div>
                    
                    <!-- Spacer -->
                    <div class="flex-grow"></div>
                    
                    <!-- Social Links (moved up to avoid theme button overlap) -->
                    <!-- Spacer to push social icons to bottom -->
                    <div class="flex-1"></div>
                    
                    <div class="sidebar-item-wrapper relative group">
                        <a href="${portfolioContent.social.github}" target="_blank" class="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors">
                            <i class="fab fa-github text-gray-400"></i>
                        </a>
                        <div class="sidebar-tooltip">GitHub</div>
                    </div>
                    
                    <div class="sidebar-item-wrapper relative group">
                        <a href="${portfolioContent.social.linkedin}" target="_blank" class="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors">
                            <i class="fab fa-linkedin text-gray-400"></i>
                        </a>
                        <div class="sidebar-tooltip">LinkedIn</div>
                    </div>
                    
                    <!-- Extra bottom spacing to avoid theme button -->
                    <div class="h-24"></div>
                </div>

                <!-- Main Chat Area -->
                <div class="flex-1 flex flex-col">
                    <!-- Header -->
                    <div class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                <span class="text-white font-bold text-lg">${portfolioContent.name.charAt(0)}</span>
                            </div>
                            <div>
                                <h1 class="text-xl font-semibold text-gray-800">${portfolioContent.name}</h1>
                                <p class="text-sm text-gray-500">${portfolioContent.title}</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <span class="w-2 h-2 bg-green-500 rounded-full pulse-animation"></span>
                            <span class="text-sm text-gray-600">Online</span>
                        </div>
                    </div>

                    <!-- Chat Messages Container -->
                    <div id="chatMessages" class="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-gray-50">
                        <!-- Welcome message will be inserted here -->
                    </div>

                    <!-- Input Area -->
                    <div class="bg-white border-t border-gray-200 px-6 py-4">
                        <div class="relative">
                            <!-- Suggestion Box (positioned above input) -->
                            <div id="suggestionBox" class="hidden absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 w-48"></div>
                            
                            <div class="flex items-center space-x-4">
                                <input 
                                    type="text" 
                                    id="chatInput" 
                                    placeholder="Type a command like /projects or /contact..."
                                    class="flex-1 px-4 py-3 bg-gray-100 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <button id="sendButton" class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-all flex items-center space-x-2">
                                    <span>Send</span>
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </div>
                        <div class="mt-3 flex flex-wrap gap-2">
                            ${portfolioContent.chatCommands.map(cmd => `
                                <button class="quick-command px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-full transition-colors" data-command="${cmd.command}">
                                    ${cmd.command}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.initialize();
    },
    
    initialize() {
        // Show welcome message
        this.showWelcomeMessage();
        
        // Setup event listeners
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendButton');
        const navItems = document.querySelectorAll('.nav-item');
        const quickCommands = document.querySelectorAll('.quick-command');
        
        // Available commands for autocomplete
        this.availableCommands = ['about', 'skills', 'experience', 'education', 'certifications', 'projects', 'reading', 'contact', 'hire', 'help'];
        this.currentSuggestionIndex = -1;
        
        // Send button click
        sendButton.addEventListener('click', () => this.handleCommand());
        
        // Enter key press
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.hideSuggestions();
                this.handleCommand();
            }
        });
        
        // Input changes - show suggestions
        chatInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            if (value.startsWith('/')) {
                this.showSuggestions(value.substring(1));
            } else {
                this.hideSuggestions();
            }
        });
        
        // Tab key for autocomplete
        chatInput.addEventListener('keydown', (e) => {
            const suggestionBox = document.getElementById('suggestionBox');
            
            if (e.key === 'Tab' && suggestionBox && !suggestionBox.classList.contains('hidden')) {
                e.preventDefault();
                const suggestions = suggestionBox.querySelectorAll('.suggestion-item');
                if (suggestions.length > 0) {
                    // Tab through suggestions
                    this.currentSuggestionIndex = (this.currentSuggestionIndex + 1) % suggestions.length;
                    const selectedCmd = suggestions[this.currentSuggestionIndex].dataset.command;
                    chatInput.value = `/${selectedCmd}`;
                }
            } else if (e.key === 'Escape') {
                this.hideSuggestions();
            }
        });
        
        // Quick command buttons
        quickCommands.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const command = e.target.dataset.command;
                chatInput.value = command;
                this.handleCommand();
            });
        });
        
        // Sidebar navigation
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                chatInput.value = `/${section}`;
                this.handleCommand();
            });
        });
    },
    
    showSuggestions(partial) {
        const suggestionBox = document.getElementById('suggestionBox');
        
        if (!suggestionBox) return;
        
        // Filter matching commands
        const matches = this.availableCommands.filter(cmd => 
            cmd.toLowerCase().startsWith(partial.toLowerCase()) || partial === ''
        );
        
        if (matches.length > 0) {
            suggestionBox.innerHTML = matches.map((cmd, index) => `
                <div class="suggestion-item px-3 py-2 hover:bg-purple-50 cursor-pointer flex items-center gap-2 ${index === 0 ? 'bg-purple-50' : ''}" 
                     data-command="${cmd}"
                     onclick="document.getElementById('chatInput').value='/${cmd}'; document.getElementById('suggestionBox').classList.add('hidden');">
                    <code class="text-purple-600 font-mono text-xs">/${cmd}</code>
                </div>
            `).join('');
            suggestionBox.classList.remove('hidden');
            this.currentSuggestionIndex = -1;
        } else {
            this.hideSuggestions();
        }
    },
    
    hideSuggestions() {
        const suggestionBox = document.getElementById('suggestionBox');
        if (suggestionBox) {
            suggestionBox.classList.add('hidden');
        }
        this.currentSuggestionIndex = -1;
    },
    
    handleCommand() {
        const input = document.getElementById('chatInput');
        const command = input.value.trim().toLowerCase();
        
        if (!command) return;
        
        // Show user message
        this.addMessage(command, 'user');
        
        // Clear input
        input.value = '';
        
        // Process command with delay for realistic feel
        setTimeout(() => {
            this.processCommand(command);
        }, 500);
    },
    
    processCommand(command) {
        // Remove leading slash if present
        const cmd = command.startsWith('/') ? command.substring(1) : command;
        
        switch(cmd) {
            case 'about':
                this.showAbout();
                break;
            case 'skills':
                this.showSkills();
                break;
            case 'projects':
                this.showProjects();
                break;
            case 'experience':
                this.showExperience();
                break;
            case 'education':
                this.showEducation();
                break;
            case 'certifications':
                this.showCertifications();
                break;
            case 'reading':
                this.showReading();
                break;
            case 'contact':
                this.showContact();
                break;
            case 'hire':
            case 'hireme':
                this.showHireMe();
                break;
            case 'help':
                this.showHelp();
                break;
            default:
                this.showUnknownCommand(cmd);
        }
    },
    
    addMessage(content, type = 'bot', isHtml = false) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${type === 'user' ? 'justify-end' : 'justify-start'} message-fade-in`;
        
        if (type === 'user') {
            messageDiv.innerHTML = `
                <div class="max-w-2xl">
                    <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-2xl rounded-tr-sm shadow-md">
                        ${content}
                    </div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="max-w-3xl">
                    <div class="bg-white text-gray-800 px-6 py-4 rounded-2xl rounded-tl-sm shadow-md border border-gray-200">
                        ${isHtml ? content : `<p>${content}</p>`}
                    </div>
                </div>
            `;
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    
    showWelcomeMessage() {
        const welcomeHtml = `
            <div class="text-center mb-4">
                <div class="inline-block w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                    <span class="text-white font-bold text-2xl">${portfolioContent.name.charAt(0)}</span>
                </div>
            </div>
            <h2 class="text-2xl font-bold mb-2">${portfolioContent.about.greeting}</h2>
            <p class="text-gray-600 mb-4">${portfolioContent.about.bio}</p>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p class="text-sm text-gray-700 mb-2"><strong>💡 Quick Tips:</strong></p>
                <p class="text-sm text-gray-600">• Use commands like <code class="bg-white px-2 py-1 rounded text-purple-600">/projects</code> to explore</p>
                <p class="text-sm text-gray-600">• Click the sidebar icons for quick navigation</p>
                <p class="text-sm text-gray-600">• Type <code class="bg-white px-2 py-1 rounded text-purple-600">/help</code> to see all commands</p>
            </div>
        `;
        
        this.addMessage(welcomeHtml, 'bot', true);
    },
    
    showAbout() {
        const aboutHtml = `
            <h3 class="text-xl font-bold mb-3 text-purple-600">👨‍💻 About Me</h3>
            <p class="mb-4">${portfolioContent.about.bio}</p>
            <div class="mb-4">
                <h4 class="font-semibold mb-2">Interests:</h4>
                <div class="flex flex-wrap gap-2">
                    ${portfolioContent.about.interests.map(interest => `
                        <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">${interest}</span>
                    `).join('')}
                </div>
            </div>
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                <p class="text-sm"><strong>Fun Fact:</strong> ${portfolioContent.about.funFact}</p>
            </div>
        `;
        
        this.addMessage(aboutHtml, 'bot', true);
    },
    
    showSkills() {
        const skillsHtml = `
            <h3 class="text-xl font-bold mb-4 text-purple-600">🚀 Technical Skills</h3>
            
            <div class="overflow-x-auto">
                <table class="w-full border-collapse text-sm">
                    <thead>
                        <tr class="bg-purple-100">
                            <th class="border border-purple-200 px-4 py-2 text-left font-semibold text-purple-900">Category</th>
                            <th class="border border-purple-200 px-4 py-2 text-left font-semibold text-purple-900">Skills</th>
                        </tr>
                    </thead>
                    <tbody class="font-sans">
                        <tr class="hover:bg-purple-50">
                            <td class="border border-gray-200 px-4 py-2 font-semibold text-gray-700">Backend</td>
                            <td class="border border-gray-200 px-4 py-2 text-gray-600">${portfolioContent.skills.backend.join(', ')}</td>
                        </tr>
                        <tr class="hover:bg-purple-50">
                            <td class="border border-gray-200 px-4 py-2 font-semibold text-gray-700">Frontend</td>
                            <td class="border border-gray-200 px-4 py-2 text-gray-600">${portfolioContent.skills.frontend.join(', ')}</td>
                        </tr>
                        <tr class="hover:bg-purple-50">
                            <td class="border border-gray-200 px-4 py-2 font-semibold text-gray-700">Database</td>
                            <td class="border border-gray-200 px-4 py-2 text-gray-600">${portfolioContent.skills.database.join(', ')}</td>
                        </tr>
                        <tr class="hover:bg-purple-50">
                            <td class="border border-gray-200 px-4 py-2 font-semibold text-gray-700">Cloud</td>
                            <td class="border border-gray-200 px-4 py-2 text-gray-600">${portfolioContent.skills.cloud.join(', ')}</td>
                        </tr>
                        <tr class="hover:bg-purple-50">
                            <td class="border border-gray-200 px-4 py-2 font-semibold text-gray-700">AI/ML</td>
                            <td class="border border-gray-200 px-4 py-2 text-gray-600">${portfolioContent.skills.aiml.join(', ')}</td>
                        </tr>
                        <tr class="hover:bg-purple-50">
                            <td class="border border-gray-200 px-4 py-2 font-semibold text-gray-700">MLOps</td>
                            <td class="border border-gray-200 px-4 py-2 text-gray-600">${portfolioContent.skills.mlops.join(', ')}</td>
                        </tr>
                        <tr class="hover:bg-purple-50">
                            <td class="border border-gray-200 px-4 py-2 font-semibold text-gray-700">Tools</td>
                            <td class="border border-gray-200 px-4 py-2 text-gray-600">${portfolioContent.skills.tools.join(', ')}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
        
        this.addMessage(skillsHtml, 'bot', true);
    },
    
    showProjects() {
        const projectsHtml = `
            <h3 class="text-xl font-bold mb-4 text-purple-600">💼 Featured Projects</h3>
            <div class="space-y-4">
                ${portfolioContent.projects.map(project => `
                    <div class="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow bg-white">
                        <h4 class="font-bold text-lg mb-3 text-gray-800">${project.title}</h4>
                        ${project.site ? `
                            <p class="text-sm text-purple-600 mb-2">
                                <i class="fas fa-globe mr-1"></i>
                                <a href="https://${project.site}" target="_blank" class="hover:underline">${project.site}</a>
                            </p>
                        ` : ''}
                        <p class="text-gray-700 text-sm mb-4 leading-relaxed">${project.description}</p>
                        <div class="mb-3">
                            <p class="text-xs font-semibold text-gray-500 mb-2">Technologies:</p>
                            <div class="flex flex-wrap gap-2">
                                ${project.tags.map(tag => `
                                    <span class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">${tag}</span>
                                `).join('')}
                            </div>
                        </div>
                        <div>
                            <p class="text-xs font-semibold text-gray-500 mb-2">Key Highlights:</p>
                            <ul class="space-y-1">
                                ${project.highlights.map(highlight => `
                                    <li class="text-xs text-gray-600 flex items-start gap-2">
                                        <span class="text-green-500 mt-0.5">✓</span>
                                        <span>${highlight}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        this.addMessage(projectsHtml, 'bot', true);
    },
    
    showExperience() {
        const experienceHtml = `
            <h3 class="text-xl font-bold mb-4 text-purple-600">💼 Work Experience</h3>
            <div class="space-y-4">
                ${portfolioContent.experience.map(exp => `
                    <div class="border-l-4 border-purple-500 pl-4">
                        <h4 class="font-bold text-lg text-gray-800">${exp.position}</h4>
                        <p class="text-purple-600 font-medium">${exp.company}</p>
                        <p class="text-sm text-gray-500 mb-2">${exp.duration} • ${exp.location}</p>
                        <ul class="space-y-1 mt-2">
                            ${exp.achievements.map(achievement => `
                                <li class="text-sm text-gray-700">✓ ${achievement}</li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
        
        this.addMessage(experienceHtml, 'bot', true);
    },
    
    showContact() {
        const contactHtml = `
            <h3 class="text-xl font-bold mb-4 text-purple-600">📬 Get In Touch</h3>
            <p class="mb-4">I'd love to hear from you! Feel free to reach out through any of these channels:</p>
            <div class="space-y-3">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-envelope text-blue-600"></i>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Email</p>
                        <a href="mailto:${portfolioContent.email}" target="_blank" class="text-purple-600 hover:text-purple-800 hover:underline font-medium">${portfolioContent.email}</a>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-phone text-green-600"></i>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Phone</p>
                        <a href="tel:${portfolioContent.phone}" target="_blank" class="text-purple-600 hover:text-purple-800 hover:underline font-medium">${portfolioContent.phone}</a>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <i class="fab fa-linkedin text-purple-600"></i>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">LinkedIn</p>
                        <a href="${portfolioContent.social.linkedin}" target="_blank" class="text-purple-600 hover:text-purple-800 hover:underline font-medium">Connect with me <i class="fas fa-external-link-alt text-xs ml-1"></i></a>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                        <i class="fab fa-github text-white"></i>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">GitHub</p>
                        <a href="${portfolioContent.social.github}" target="_blank" class="text-purple-600 hover:text-purple-800 hover:underline font-medium">Check out my code <i class="fas fa-external-link-alt text-xs ml-1"></i></a>
                    </div>
                </div>
            </div>
            <div class="mt-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <p class="text-sm text-gray-700">💡 <strong>Response Time:</strong> I typically respond within 24 hours. Looking forward to connecting!</p>
            </div>
        `;
        
        this.addMessage(contactHtml, 'bot', true);
    },
    
    showEducation() {
        const educationHtml = `
            <h3 class="text-xl font-bold mb-4 text-purple-600">🎓 Education</h3>
            <div class="space-y-4">
                ${portfolioContent.education.map(edu => `
                    <div class="border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded-r-lg">
                        <h4 class="font-bold text-lg text-gray-800">${edu.degree}</h4>
                        <p class="text-blue-600 font-medium">${edu.institution}</p>
                        <p class="text-sm text-gray-500 mb-2">${edu.duration} • GPA: ${edu.gpa}</p>
                        <ul class="space-y-1 mt-3">
                            ${edu.achievements.map(achievement => `
                                <li class="text-sm text-gray-700">✓ ${achievement}</li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
        
        this.addMessage(educationHtml, 'bot', true);
    },
    
    showCertifications() {
        const certificationsHtml = `
            <h3 class="text-xl font-bold mb-4 text-purple-600">📜 Certifications</h3>
            <div class="space-y-3">
                ${portfolioContent.certifications.map(cert => `
                    <div class="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                        <div class="flex items-start gap-3">
                            <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <i class="fas fa-certificate text-white"></i>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-bold text-gray-800">${cert.title}</h4>
                                <p class="text-sm text-gray-600">${cert.issuer} • ${cert.year}</p>
                                <a href="${cert.link}" target="_blank" class="text-xs text-purple-600 hover:text-purple-800 mt-1 inline-block">
                                    View Certificate <i class="fas fa-external-link-alt ml-1"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        this.addMessage(certificationsHtml, 'bot', true);
    },
    
    showReading() {
        const readingHtml = `
            <h3 class="text-xl font-bold mb-4 text-purple-600">📚 Currently Reading</h3>
            <div class="space-y-4">
                ${portfolioContent.currentlyReading.map(book => `
                    <div class="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow bg-white">
                        <div class="flex gap-4">
                            <div class="flex-shrink-0">
                                <img src="${book.coverImage}" alt="${book.title}" class="w-24 h-32 object-cover rounded-lg shadow-md">
                            </div>
                            <div class="flex-1">
                                <h4 class="font-bold text-lg mb-1 text-gray-800">${book.title}</h4>
                                <p class="text-sm text-gray-600 mb-2">by ${book.author}</p>
                                <div class="flex items-center gap-2 mb-2">
                                    ${book.status === 'completed' 
                                        ? '<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"><i class="fas fa-check-double"></i> Completed</span>'
                                        : '<span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"><i class="fas fa-book-reader"></i> In Progress</span>'
                                    }
                                </div>
                                <div class="text-xs text-gray-500 mb-2">
                                    <span>Started: ${new Date(book.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                    ${book.endDate ? ` • Finished: ${new Date(book.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}` : ''}
                                </div>
                                ${book.status === 'in-progress' ? `
                                    <div class="mb-2">
                                        <div class="flex justify-between text-xs text-gray-600 mb-1">
                                            <span>Progress</span>
                                            <span>${book.progress}%</span>
                                        </div>
                                        <div class="w-full bg-gray-200 rounded-full h-2">
                                            <div class="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all" style="width: ${book.progress}%"></div>
                                        </div>
                                    </div>
                                ` : ''}
                                <p class="text-sm text-gray-600 italic">${book.notes}</p>
                                ${book.link ? `
                                    <a href="${book.link}" target="_blank" class="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 text-sm mt-2">
                                        <i class="fas fa-external-link-alt text-xs"></i>
                                        <span>Learn more</span>
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        this.addMessage(readingHtml, 'bot', true);
    },
    
    showHireMe() {
        const hireMeHtml = `
            <div class="text-center">
                <div class="mb-4">
                    <div class="inline-block w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-handshake text-white text-3xl"></i>
                    </div>
                </div>
                <h3 class="text-2xl font-bold mb-3 text-purple-600">Let's Work Together! 🚀</h3>
                <p class="text-gray-700 mb-6">I'm always interested in hearing about new opportunities and exciting projects.</p>
                
                <div class="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 mb-4">
                    <h4 class="font-bold text-gray-800 mb-4">Contact Information</h4>
                    <div class="space-y-3 text-left">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow">
                                <i class="fas fa-envelope text-purple-600"></i>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500">Email</p>
                                <a href="mailto:${portfolioContent.email}" class="text-purple-600 hover:text-purple-800 font-semibold">${portfolioContent.email}</a>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow">
                                <i class="fas fa-phone text-green-600"></i>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500">Phone</p>
                                <a href="tel:${portfolioContent.phone}" class="text-purple-600 hover:text-purple-800 font-semibold">${portfolioContent.phone}</a>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow">
                                <i class="fas fa-map-marker-alt text-red-600"></i>
                            </div>
                            <div>
                                <p class="text-xs text-gray-500">Location</p>
                                <p class="text-gray-700 font-semibold">${portfolioContent.location}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="flex gap-3 justify-center flex-wrap">
                    <a href="mailto:${portfolioContent.email}" class="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold">
                        <i class="fas fa-envelope mr-2"></i>Send Email
                    </a>
                    <a href="${portfolioContent.social.linkedin}" target="_blank" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold">
                        <i class="fab fa-linkedin mr-2"></i>LinkedIn
                    </a>
                    <a href="${portfolioContent.social.github}" target="_blank" class="px-6 py-3 bg-gray-800 text-white rounded-lg hover:shadow-lg transition-all font-semibold">
                        <i class="fab fa-github mr-2"></i>GitHub
                    </a>
                </div>
                
                <p class="text-sm text-gray-600 mt-6">⏱️ I typically respond within 24 hours. Looking forward to connecting!</p>
            </div>
        `;
        
        this.addMessage(hireMeHtml, 'bot', true);
    },
    
    showHelp() {
        const helpHtml = `
            <h3 class="text-xl font-bold mb-4 text-purple-600">❓ Available Commands</h3>
            <div class="space-y-2">
                <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 cursor-pointer" onclick="document.getElementById('chatInput').value='/about';">
                    <code class="bg-purple-100 text-purple-800 px-3 py-1 rounded font-mono text-sm">/about</code>
                    <span class="text-gray-600 text-sm">Learn more about me</span>
                </div>
                <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 cursor-pointer" onclick="document.getElementById('chatInput').value='/skills';">
                    <code class="bg-purple-100 text-purple-800 px-3 py-1 rounded font-mono text-sm">/skills</code>
                    <span class="text-gray-600 text-sm">View my technical skills</span>
                </div>
                <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 cursor-pointer" onclick="document.getElementById('chatInput').value='/experience';">
                    <code class="bg-purple-100 text-purple-800 px-3 py-1 rounded font-mono text-sm">/experience</code>
                    <span class="text-gray-600 text-sm">See my work history</span>
                </div>
                <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 cursor-pointer" onclick="document.getElementById('chatInput').value='/education';">
                    <code class="bg-purple-100 text-purple-800 px-3 py-1 rounded font-mono text-sm">/education</code>
                    <span class="text-gray-600 text-sm">View my education</span>
                </div>
                <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 cursor-pointer" onclick="document.getElementById('chatInput').value='/certifications';">
                    <code class="bg-purple-100 text-purple-800 px-3 py-1 rounded font-mono text-sm">/certifications</code>
                    <span class="text-gray-600 text-sm">See my certifications</span>
                </div>
                <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 cursor-pointer" onclick="document.getElementById('chatInput').value='/projects';">
                    <code class="bg-purple-100 text-purple-800 px-3 py-1 rounded font-mono text-sm">/projects</code>
                    <span class="text-gray-600 text-sm">Explore my projects</span>
                </div>
                <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 cursor-pointer" onclick="document.getElementById('chatInput').value='/reading';">
                    <code class="bg-purple-100 text-purple-800 px-3 py-1 rounded font-mono text-sm">/reading</code>
                    <span class="text-gray-600 text-sm">See what I'm reading</span>
                </div>
                <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 cursor-pointer" onclick="document.getElementById('chatInput').value='/contact';">
                    <code class="bg-purple-100 text-purple-800 px-3 py-1 rounded font-mono text-sm">/contact</code>
                    <span class="text-gray-600 text-sm">Get in touch with me</span>
                </div>
                <div class="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-300 p-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-100 hover:to-blue-100 cursor-pointer" onclick="document.getElementById('chatInput').value='/hire';">
                    <code class="bg-purple-600 text-white px-3 py-1 rounded font-mono text-sm">/hire</code>
                    <span class="text-purple-800 text-sm font-semibold">Ready to hire me!</span>
                </div>
            </div>
            <div class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p class="text-sm text-gray-700">💡 <strong>Pro Tips:</strong></p>
                <p class="text-xs text-gray-600 mt-1">• Type <kbd class="bg-white px-2 py-1 rounded border">/</kbd> to see command suggestions</p>
                <p class="text-xs text-gray-600 mt-1">• Press <kbd class="bg-white px-2 py-1 rounded border">Tab</kbd> to autocomplete commands</p>
                <p class="text-xs text-gray-600 mt-1">• Click on any command above to auto-fill it</p>
            </div>
        `;
        
        this.addMessage(helpHtml, 'bot', true);
    },
    
    showUnknownCommand(cmd) {
        const unknownHtml = `
            <p class="mb-2">🤔 Hmm, I don't recognize the command "<strong>${cmd}</strong>".</p>
            <p class="text-sm text-gray-600">Try one of these commands:</p>
            <div class="flex flex-wrap gap-2 mt-2">
                ${portfolioContent.chatCommands.map(c => `
                    <code class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">${c.command}</code>
                `).join('')}
            </div>
        `;
        
        this.addMessage(unknownHtml, 'bot', true);
    }
};

// Make it globally available
if (typeof window !== 'undefined') {
    window.ChatGPTTheme = ChatGPTTheme;
}
