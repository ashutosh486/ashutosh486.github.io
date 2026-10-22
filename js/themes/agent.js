// Agent Orchestration Dashboard Theme (LangGraph-Style)
const AgentTheme = {
    name: "Agent Orchestration",
    
    agents: [
        {
            id: 'genai',
            name: 'GenAI Specialist',
            icon: 'fa-wand-magic-sparkles',
            color: '#8b5cf6',
            position: { x: 200, y: 100 },
            category: 'expertise',
            skills: portfolioContent.skills.ml.filter(s => s.includes('GPT') || s.includes('LangChain') || s.includes('transformers')),
            description: 'Develops generative AI solutions using GPT-4, LangChain, and transformer models. Led GenAI chatbot launch with full enterprise compliance.',
            achievements: portfolioContent.experience[0].achievements.filter(a => a.toLowerCase().includes('genai') || a.toLowerCase().includes('gpt'))
        },
        {
            id: 'ml',
            name: 'ML/NLP Engineer',
            icon: 'fa-brain',
            color: '#3b82f6',
            position: { x: 500, y: 100 },
            category: 'expertise',
            skills: portfolioContent.skills.ml.slice(0, 6),
            description: 'Expert in machine learning, NLP, and classification models. Built extreme multi-class classification handling 50K+ classes.',
            achievements: portfolioContent.experience[1].achievements.filter(a => a.toLowerCase().includes('classification') || a.toLowerCase().includes('nlp'))
        },
        {
            id: 'system',
            name: portfolioContent.name.split(' ')[0],
            icon: 'fa-user-astronaut',
            color: '#10b981',
            position: { x: 350, y: 250 },
            category: 'central',
            skills: [],
            description: `${portfolioContent.title} - Central orchestrator coordinating all specialized capabilities to deliver innovative AI solutions.`,
            achievements: []
        },
        {
            id: 'cloud',
            name: 'Cloud Architect',
            icon: 'fa-cloud',
            color: '#06b6d4',
            position: { x: 100, y: 300 },
            category: 'infrastructure',
            skills: portfolioContent.skills.cloud,
            description: 'Designs and implements cloud infrastructure on AWS and Azure. Built scalable ML systems and storage solutions.',
            achievements: portfolioContent.experience[2].achievements.filter(a => a.toLowerCase().includes('aws') || a.toLowerCase().includes('cloud'))
        },
        {
            id: 'fullstack',
            name: 'Full-Stack Developer',
            icon: 'fa-code',
            color: '#f59e0b',
            position: { x: 600, y: 300 },
            category: 'development',
            skills: [...portfolioContent.skills.languages, ...portfolioContent.skills.frameworks.slice(0, 4)],
            description: 'Builds end-to-end applications with Flask, Angular, and modern web technologies. Created automation platforms saving 14+ FTE.',
            achievements: portfolioContent.experience[0].achievements.filter(a => a.toLowerCase().includes('automation') || a.toLowerCase().includes('platform'))
        },
        {
            id: 'data',
            name: 'Data Engineer',
            icon: 'fa-database',
            color: '#ec4899',
            position: { x: 200, y: 450 },
            category: 'data',
            skills: portfolioContent.skills.databases,
            description: 'Manages data pipelines, databases, and storage solutions. Expert in SQL, MongoDB, and data processing at scale.',
            achievements: []
        },
        {
            id: 'vision',
            name: 'Computer Vision',
            icon: 'fa-eye',
            color: '#ef4444',
            position: { x: 500, y: 450 },
            category: 'specialized',
            skills: ['Object Detection', 'NER', 'Annotation Pipelines'],
            description: 'Develops computer vision and object detection systems. Created pipelines for extracting products from retail flyers.',
            achievements: portfolioContent.experience[1].achievements.filter(a => a.toLowerCase().includes('object') || a.toLowerCase().includes('detection'))
        }
    ],

    connections: [
        { from: 'research', to: 'system' },
        { from: 'coding', to: 'system' },
        { from: 'mlops', to: 'system' },
        { from: 'llm', to: 'system' },
        { from: 'data', to: 'system' },
        { from: 'evaluation', to: 'system' },
        { from: 'research', to: 'llm' },
        { from: 'coding', to: 'mlops' },
        { from: 'data', to: 'evaluation' }
    ],

    selectedAgent: null,
    animationFrame: null,
    
    render() {
        const container = document.getElementById('themeContainer');
        container.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
                <!-- Header -->
                <div class="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm px-6 py-4">
                    <div class="max-w-7xl mx-auto">
                        <div class="flex items-center justify-between">
                            <div>
                                <h1 class="text-2xl font-bold flex items-center gap-3">
                                    <i class="fas fa-project-diagram text-purple-400"></i>
                                    <span class="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                        Agent Orchestration System
                                    </span>
                                </h1>
                                <p class="text-sm text-slate-400 mt-1">${portfolioContent.name} - Multi-Agent Portfolio Dashboard</p>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full border border-green-500/30">
                                    <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span class="text-xs text-green-300 font-medium">All Agents Online</span>
                                </div>
                                <a href="mailto:${portfolioContent.email}" class="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-purple-500/50">
                                    <i class="fas fa-rocket mr-1"></i> Deploy Me
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="max-w-7xl mx-auto p-6">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <!-- Graph Visualization -->
                        <div class="lg:col-span-2">
                            <div class="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 p-6 shadow-xl">
                                <div class="flex items-center justify-between mb-4">
                                    <h2 class="text-lg font-semibold text-slate-200">Agent Network Topology</h2>
                                    <button id="resetView" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs transition-colors">
                                        <i class="fas fa-sync-alt mr-1"></i> Reset View
                                    </button>
                                </div>
                                <div class="relative bg-slate-900/50 rounded-lg border border-slate-700" style="height: 600px;">
                                    <canvas id="agentCanvas" class="w-full h-full"></canvas>
                                    <div class="absolute bottom-4 left-4 text-xs text-slate-500">
                                        <i class="fas fa-info-circle mr-1"></i> Click on any agent to view details
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Agent Details Panel -->
                        <div class="lg:col-span-1">
                            <div class="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 p-6 shadow-xl sticky top-6">
                                <h2 class="text-lg font-semibold text-slate-200 mb-4">Agent Details</h2>
                                <div id="agentDetails" class="space-y-4">
                                    <div class="text-center py-12 text-slate-500">
                                        <i class="fas fa-mouse-pointer text-4xl mb-3 opacity-50"></i>
                                        <p class="text-sm">Click on an agent node to view its details</p>
                                    </div>
                                </div>
                            </div>

                            <!-- System Stats -->
                            <div class="mt-6 bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 p-6 shadow-xl">
                                <h3 class="text-sm font-semibold text-slate-300 mb-3">System Metrics</h3>
                                <div class="space-y-3">
                                    <div class="flex justify-between items-center">
                                        <span class="text-xs text-slate-400">Total Agents</span>
                                        <span class="text-sm font-bold text-purple-400">${this.agents.length}</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-xs text-slate-400">Active Connections</span>
                                        <span class="text-sm font-bold text-blue-400">${this.connections.length}</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-xs text-slate-400">Skills Covered</span>
                                        <span class="text-sm font-bold text-green-400">${portfolioContent.stats.skills}</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-xs text-slate-400">Projects Delivered</span>
                                        <span class="text-sm font-bold text-pink-400">${portfolioContent.projects.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- About Section -->
                    <div class="mt-6 bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 p-6 shadow-xl">
                        <h2 class="text-lg font-semibold text-slate-200 mb-4">
                            <i class="fas fa-user-circle text-purple-400 mr-2"></i>
                            System Overview
                        </h2>
                        <p class="text-slate-300 leading-relaxed">${portfolioContent.about.bio}</p>
                        <div class="mt-4 flex flex-wrap gap-2">
                            ${portfolioContent.about.interests.map(interest => 
                                `<span class="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300">${interest}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.initCanvas();
        this.attachEventListeners();
        this.startAnimation();
    },
    
    initCanvas() {
        const canvas = document.getElementById('agentCanvas');
        if (!canvas) return;
        
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        this.ctx = canvas.getContext('2d');
        this.drawGraph();
    },
    
    drawGraph() {
        if (!this.ctx) return;
        
        const canvas = this.ctx.canvas;
        const ctx = this.ctx;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw connections first (so they appear behind nodes)
        ctx.lineWidth = 2;
        this.connections.forEach(conn => {
            const fromAgent = this.agents.find(a => a.id === conn.from);
            const toAgent = this.agents.find(a => a.id === conn.to);
            
            if (fromAgent && toAgent) {
                const fromX = fromAgent.position.x * (canvas.width / 700);
                const fromY = fromAgent.position.y * (canvas.height / 600);
                const toX = toAgent.position.x * (canvas.width / 700);
                const toY = toAgent.position.y * (canvas.height / 600);
                
                // Animated connection
                const gradient = ctx.createLinearGradient(fromX, fromY, toX, toY);
                const phase = (Date.now() / 1000) % 1;
                gradient.addColorStop(0, fromAgent.color + '40');
                gradient.addColorStop(phase, fromAgent.color + 'aa');
                gradient.addColorStop(1, toAgent.color + '40');
                
                ctx.strokeStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(fromX, fromY);
                ctx.lineTo(toX, toY);
                ctx.stroke();
            }
        });
        
        // Draw agent nodes
        this.agents.forEach(agent => {
            const x = agent.position.x * (canvas.width / 700);
            const y = agent.position.y * (canvas.height / 600);
            const radius = agent.id === 'system' ? 50 : 40;
            
            // Outer glow
            const glowGradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 1.5);
            glowGradient.addColorStop(0, agent.color + '60');
            glowGradient.addColorStop(1, agent.color + '00');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Main circle
            ctx.fillStyle = agent.id === 'system' ? agent.color : '#1e293b';
            ctx.strokeStyle = agent.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Highlight if selected
            if (this.selectedAgent === agent.id) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Agent name
            ctx.fillStyle = agent.id === 'system' ? '#fff' : agent.color;
            ctx.font = agent.id === 'system' ? 'bold 14px system-ui' : 'bold 12px system-ui';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(agent.name.split(' ')[0], x, y - 5);
            if (agent.name.split(' ')[1]) {
                ctx.fillText(agent.name.split(' ')[1], x, y + 10);
            }
        });
    },
    
    attachEventListeners() {
        const canvas = document.getElementById('agentCanvas');
        if (canvas) {
            canvas.addEventListener('click', (e) => {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) * (700 / canvas.width);
                const y = (e.clientY - rect.top) * (600 / canvas.height);
                
                // Check if clicked on any agent
                const clickedAgent = this.agents.find(agent => {
                    const dx = x - agent.position.x;
                    const dy = y - agent.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const radius = agent.id === 'system' ? 50 : 40;
                    return distance <= radius;
                });
                
                if (clickedAgent) {
                    this.selectedAgent = clickedAgent.id;
                    this.showAgentDetails(clickedAgent);
                    this.drawGraph();
                }
            });
        }
        
        const resetBtn = document.getElementById('resetView');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.selectedAgent = null;
                this.drawGraph();
                document.getElementById('agentDetails').innerHTML = `
                    <div class="text-center py-12 text-slate-500">
                        <i class="fas fa-mouse-pointer text-4xl mb-3 opacity-50"></i>
                        <p class="text-sm">Click on an agent node to view its details</p>
                    </div>
                `;
            });
        }
    },
    
    showAgentDetails(agent) {
        const detailsPanel = document.getElementById('agentDetails');
        
        // Get relevant projects for this agent
        const relevantProjects = portfolioContent.projects.filter(project => 
            agent.skills.some(skill => 
                project.tags.some(tag => tag.toLowerCase().includes(skill.toLowerCase()))
            )
        ).slice(0, 3);
        
        detailsPanel.innerHTML = `
            <div class="space-y-4 animate-fade-in">
                <div class="flex items-center gap-3 pb-3 border-b border-slate-700">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center" style="background: ${agent.color}20; border: 2px solid ${agent.color};">
                        <i class="fas ${agent.icon} text-xl" style="color: ${agent.color};"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-100">${agent.name}</h3>
                        <p class="text-xs text-slate-400">${agent.category === 'central' ? 'Core System' : agent.category.charAt(0).toUpperCase() + agent.category.slice(1)}</p>
                    </div>
                </div>
                
                <div>
                    <p class="text-sm text-slate-300 leading-relaxed">${agent.description}</p>
                </div>
                
                ${agent.skills.length > 0 ? `
                    <div>
                        <h4 class="text-xs font-semibold text-slate-400 mb-2">CAPABILITIES</h4>
                        <div class="flex flex-wrap gap-2">
                            ${agent.skills.map(skill => 
                                `<span class="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300 border border-slate-600">${skill}</span>`
                            ).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${agent.achievements && agent.achievements.length > 0 ? `
                    <div>
                        <h4 class="text-xs font-semibold text-slate-400 mb-2">KEY ACHIEVEMENTS</h4>
                        <ul class="space-y-2 text-xs text-slate-300">
                            ${agent.achievements.map(achievement => `
                                <li class="flex items-start gap-2">
                                    <i class="fas fa-check-circle text-green-400 mt-0.5 flex-shrink-0"></i>
                                    <span>${achievement}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${relevantProjects.length > 0 ? `
                    <div>
                        <h4 class="text-xs font-semibold text-slate-400 mb-2">RELEVANT PROJECTS</h4>
                        <div class="space-y-2">
                            ${relevantProjects.map(project => `
                                <div class="p-2 bg-slate-900/50 rounded border border-slate-700">
                                    <div class="font-medium text-sm text-slate-200">${project.title}</div>
                                    <div class="text-xs text-slate-400 mt-1">${project.description.substring(0, 80)}...</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="pt-3 border-t border-slate-700">
                    <div class="flex items-center justify-between text-xs">
                        <span class="text-slate-400">Status</span>
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span class="text-green-400 font-medium">Active</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    startAnimation() {
        const animate = () => {
            this.drawGraph();
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    },
    
    cleanup() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
};

if (typeof window !== 'undefined') {
    window.AgentTheme = AgentTheme;
}
