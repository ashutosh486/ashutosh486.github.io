// AI Playground UI Portfolio Theme
const AIPlaygroundTheme = {
    name: "AI Playground",
    currentModel: portfolioContent.projects[0].title,
    
    render() {
        const container = document.getElementById('themeContainer');
        container.innerHTML = `
            <div class="flex h-screen bg-gray-900">
                <!-- Left Sidebar - Models -->
                <div class="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
                    <div class="p-4 border-b border-gray-700">
                        <h2 class="text-white font-bold text-lg mb-1">AI Models</h2>
                        <p class="text-gray-400 text-xs">Select a project to explore</p>
                    </div>
                    <div class="flex-1 overflow-y-auto p-2">
                        ${portfolioContent.projects.map((project, i) => `
                            <div class="model-item p-3 rounded-lg mb-2 cursor-pointer transition-colors ${i === 0 ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}" data-model="${project.title}">
                                <div class="font-semibold text-sm mb-1">${project.title}</div>
                                <div class="text-xs opacity-75">${project.tags.slice(0, 2).join(', ')}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="p-4 border-t border-gray-700">
                        <div class="text-xs text-gray-500 mb-2">Model Information</div>
                        <div class="text-xs text-gray-400">
                            <div class="mb-1">Version: 2025.1</div>
                            <div>Status: <span class="text-green-400">Active</span></div>
                        </div>
                    </div>
                </div>

                <!-- Main Content Area -->
                <div class="flex-1 flex flex-col">
                    <!-- Header -->
                    <div class="bg-gray-800 border-b border-gray-700 px-6 py-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <h1 class="text-white text-2xl font-bold" id="modelTitle">${portfolioContent.projects[0].title}</h1>
                                <p class="text-gray-400 text-sm">Interactive AI Playground</p>
                            </div>
                            <div class="flex gap-2">
                                <button class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors">
                                    <i class="fas fa-play mr-2"></i>Run
                                </button>
                                <button class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                                    <i class="fas fa-redo mr-2"></i>Reset
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="flex-1 flex overflow-hidden">
                        <!-- Input Panel -->
                        <div class="flex-1 flex flex-col bg-gray-900 border-r border-gray-700">
                            <div class="bg-gray-800 px-6 py-3 border-b border-gray-700">
                                <h3 class="text-white font-semibold">Input</h3>
                            </div>
                            <div class="flex-1 p-6 overflow-y-auto">
                                <textarea 
                                    id="aiInput" 
                                    class="w-full h-40 bg-gray-800 text-white p-4 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none resize-none font-mono text-sm"
                                    placeholder="Describe what you want to know about this project..."
                                ></textarea>
                                
                                <!-- Parameters -->
                                <div class="mt-6">
                                    <h4 class="text-white font-semibold mb-4">Model Parameters</h4>
                                    
                                    <!-- Temperature -->
                                    <div class="mb-6">
                                        <div class="flex justify-between mb-2">
                                            <label class="text-gray-400 text-sm">Temperature</label>
                                            <span class="text-purple-400 text-sm font-mono" id="tempValue">0.7</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            id="temperature" 
                                            min="0" 
                                            max="1" 
                                            step="0.1" 
                                            value="0.7"
                                            class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                        />
                                        <div class="flex justify-between text-xs text-gray-600 mt-1">
                                            <span>Precise</span>
                                            <span>Creative</span>
                                        </div>
                                    </div>
                                    
                                    <!-- Max Length -->
                                    <div class="mb-6">
                                        <div class="flex justify-between mb-2">
                                            <label class="text-gray-400 text-sm">Max Length</label>
                                            <span class="text-purple-400 text-sm font-mono" id="lengthValue">256</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            id="maxLength" 
                                            min="50" 
                                            max="1000" 
                                            step="50" 
                                            value="256"
                                            class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                        />
                                    </div>
                                    
                                    <!-- Top P -->
                                    <div class="mb-6">
                                        <div class="flex justify-between mb-2">
                                            <label class="text-gray-400 text-sm">Top P</label>
                                            <span class="text-purple-400 text-sm font-mono" id="topPValue">0.9</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            id="topP" 
                                            min="0" 
                                            max="1" 
                                            step="0.1" 
                                            value="0.9"
                                            class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                        />
                                    </div>
                                    
                                    <!-- Presence Penalty -->
                                    <div class="mb-6">
                                        <div class="flex justify-between mb-2">
                                            <label class="text-gray-400 text-sm">Presence Penalty</label>
                                            <span class="text-purple-400 text-sm font-mono" id="presenceValue">0.0</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            id="presence" 
                                            min="-2" 
                                            max="2" 
                                            step="0.1" 
                                            value="0"
                                            class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Output Panel -->
                        <div class="flex-1 flex flex-col bg-gray-900">
                            <div class="bg-gray-800 px-6 py-3 border-b border-gray-700 flex items-center justify-between">
                                <h3 class="text-white font-semibold">Output</h3>
                                <span class="text-xs text-gray-500">Tokens: <span id="tokenCount">0</span></span>
                            </div>
                            <div class="flex-1 p-6 overflow-y-auto">
                                <div id="aiOutput" class="bg-gray-800 text-gray-300 p-4 rounded-lg border border-gray-700 min-h-full font-mono text-sm whitespace-pre-wrap">
                                    <div class="text-gray-500 italic">Model output will appear here...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Sidebar - Info -->
                <div class="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
                    <div class="p-6">
                        <h3 class="text-white font-bold mb-4">Model Details</h3>
                        <div id="modelDetails" class="space-y-4">
                            ${this.renderModelDetails(portfolioContent.projects[0])}
                        </div>
                        
                        <div class="mt-8">
                            <h3 class="text-white font-bold mb-4">About Me</h3>
                            <div class="text-gray-400 text-sm space-y-2">
                                <p><strong class="text-white">${portfolioContent.name}</strong></p>
                                <p>${portfolioContent.title}</p>
                                <div class="pt-4 space-y-2">
                                    <a href="mailto:${portfolioContent.email}" class="block text-purple-400 hover:text-purple-300">
                                        <i class="fas fa-envelope mr-2"></i>${portfolioContent.email}
                                    </a>
                                    <a href="${portfolioContent.social.github}" target="_blank" class="block text-purple-400 hover:text-purple-300">
                                        <i class="fab fa-github mr-2"></i>GitHub Profile
                                    </a>
                                    <a href="${portfolioContent.social.linkedin}" target="_blank" class="block text-purple-400 hover:text-purple-300">
                                        <i class="fab fa-linkedin mr-2"></i>LinkedIn Profile
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.initialize();
    },
    
    renderModelDetails(project) {
        return `
            <div class="bg-gray-900 rounded-lg p-4">
                <p class="text-gray-300 text-sm mb-3">${project.description}</p>
                <div class="space-y-2 text-sm">
                    <div><span class="text-gray-500">Technologies:</span></div>
                    <div class="flex flex-wrap gap-2">
                        ${project.tags.map(tag => `
                            <span class="px-2 py-1 bg-purple-900 text-purple-300 rounded text-xs">${tag}</span>
                        `).join('')}
                    </div>
                </div>
                <div class="mt-4 space-y-1">
                    ${project.highlights.map(h => `
                        <div class="text-xs text-gray-400">• ${h}</div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    initialize() {
        // Setup slider value displays
        ['temperature', 'maxLength', 'topP', 'presence'].forEach(param => {
            const slider = document.getElementById(param);
            const display = document.getElementById(param + 'Value');
            if (slider && display) {
                slider.addEventListener('input', (e) => {
                    display.textContent = e.target.value;
                });
            }
        });
        
        // Model selection
        document.querySelectorAll('.model-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const modelName = e.currentTarget.dataset.model;
                const project = portfolioContent.projects.find(p => p.title === modelName);
                if (project) {
                    this.switchModel(project);
                    // Update active state
                    document.querySelectorAll('.model-item').forEach(el => {
                        el.classList.remove('bg-purple-600', 'text-white');
                        el.classList.add('bg-gray-700', 'text-gray-300');
                    });
                    e.currentTarget.classList.remove('bg-gray-700', 'text-gray-300');
                    e.currentTarget.classList.add('bg-purple-600', 'text-white');
                }
            });
        });
        
        // Setup input handling
        const input = document.getElementById('aiInput');
        const output = document.getElementById('aiOutput');
        
        input.addEventListener('input', () => {
            const project = portfolioContent.projects.find(p => p.title === this.currentModel);
            if (input.value.trim()) {
                output.innerHTML = `<div class="text-purple-400 mb-4">Processing with ${this.currentModel}...</div>
<div class="text-white">${project.description}</div>

<div class="mt-4 text-gray-400">
<strong class="text-white">Key Features:</strong>
${project.highlights.map(h => `• ${h}`).join('\n')}
</div>

<div class="mt-4 text-gray-400">
<strong class="text-white">Technologies Used:</strong>
${project.tags.join(', ')}
</div>

<div class="mt-4 text-green-400">
✓ Analysis complete. This project demonstrates expertise in ${project.tags[0]}.
</div>`;
                document.getElementById('tokenCount').textContent = Math.floor(output.textContent.length / 4);
            } else {
                output.innerHTML = '<div class="text-gray-500 italic">Model output will appear here...</div>';
                document.getElementById('tokenCount').textContent = '0';
            }
        });
    },
    
    switchModel(project) {
        this.currentModel = project.title;
        document.getElementById('modelTitle').textContent = project.title;
        document.getElementById('modelDetails').innerHTML = this.renderModelDetails(project);
        document.getElementById('aiOutput').innerHTML = '<div class="text-gray-500 italic">Model output will appear here...</div>';
        document.getElementById('aiInput').value = '';
        document.getElementById('tokenCount').textContent = '0';
    }
};

if (typeof window !== 'undefined') {
    window.AIPlaygroundTheme = AIPlaygroundTheme;
}
