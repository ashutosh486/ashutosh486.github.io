// Neural Network Visualizer Portfolio Theme
const NeuralTheme = {
    name: "Neural Network Viz",
    selectedNode: null,
    
    nodes: [
        // Layer 0 - About
        { id: 'about', x: 10, y: 50, layer: 0, label: 'About', color: '#3b82f6', data: { 
            type: 'about', 
            content: {
                bio: portfolioContent.about.bio,
                interests: portfolioContent.about.interests,
                hobbies: portfolioContent.hobbies || portfolioContent.about.hobbies || []
            }
        }},
        
        // Layer 1 - Education
        { id: 'education', x: 25, y: 50, layer: 1, label: 'Education', color: '#8b5cf6', data: { type: 'education', content: portfolioContent.education } },
        
        // Layer 2 - Experience (one node per role, centred vertically)
        ...portfolioContent.experience.map((exp, i, all) => (
            { id: `exp${i}`, x: 40, y: 50 + (i - (all.length - 1) / 2) * Math.min(20, 80 / all.length), layer: 2, label: exp.company, color: '#ec4899', data: exp }
        )),

        // Layer 3 - Projects (first 3)
        ...portfolioContent.projects.slice(0, 3).map((proj, i, all) => (
            { id: `proj${i}`, x: 55, y: 50 + (i - (all.length - 1) / 2) * 20, layer: 3, label: proj.title.substring(0, 15), color: '#10b981', data: proj }
        )),
        
        // Layer 4 - Certifications & Patents
        { id: 'certifications', x: 70, y: 40, layer: 4, label: 'Certifications', color: '#f59e0b', data: { type: 'certifications', content: portfolioContent.certifications } },
        { id: 'patents', x: 70, y: 60, layer: 4, label: 'Patents', color: '#f59e0b', data: { type: 'patents', content: portfolioContent.patents } },
        
        // Layer 5 - Hire Me (Contact)
        { id: 'contact', x: 90, y: 50, layer: 5, label: 'Hire Me', color: '#10b981', data: { type: 'contact', content: portfolioContent } }
    ],
    
    connections: [
        // About to Education
        { from: 'about', to: 'education' },
        
        // Education to Experience, Experience to Projects (fully connected, like a dense layer)
        ...portfolioContent.experience.flatMap((_, i) => [
            { from: 'education', to: `exp${i}` },
            ...portfolioContent.projects.slice(0, 3).map((_, j) => ({ from: `exp${i}`, to: `proj${j}` }))
        ]),

        // Projects to Certifications/Patents
        ...portfolioContent.projects.slice(0, 3).flatMap((_, j) => [
            { from: `proj${j}`, to: 'certifications' },
            { from: `proj${j}`, to: 'patents' }
        ]),
        
        // Certifications/Patents back to Contact
        { from: 'certifications', to: 'contact' },
        { from: 'patents', to: 'contact' }
    ],
    
    render() {
        const container = document.getElementById('themeContainer');
        
        // Disable body scroll for neural network theme
        document.body.style.overflow = 'hidden';
        
        container.innerHTML = `
            <div class="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden">
                <!-- Header -->
                <div class="absolute top-0 left-0 right-0 z-10 bg-black/30 backdrop-blur-sm border-b border-white/10">
                    <div class="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
                        <div>
                            <h1 class="text-2xl font-bold text-white">${portfolioContent.name} - Neural Network</h1>
                            <p class="text-sm text-gray-300">Click on any neuron to explore my career journey • Press ESC to close</p>
                        </div>
                        <div id="legend" class="flex gap-4 text-xs">
                            <div class="flex items-center gap-2">
                                <span class="text-gray-400 font-semibold">LEGEND</span>
                            </div>
                            <div class="flex items-center gap-1.5 legend-item cursor-pointer" data-color="#3b82f6">
                                <div class="w-3 h-3 bg-blue-500 rounded-full shadow-lg"></div>
                                <span class="text-gray-300">About</span>
                            </div>
                            <div class="w-px h-4 bg-gray-600"></div>
                            <div class="flex items-center gap-1.5 legend-item cursor-pointer" data-color="#8b5cf6">
                                <div class="w-3 h-3 bg-purple-500 rounded-full shadow-lg"></div>
                                <span class="text-gray-300">Education</span>
                            </div>
                            <div class="w-px h-4 bg-gray-600"></div>
                            <div class="flex items-center gap-1.5 legend-item cursor-pointer" data-color="#ec4899">
                                <div class="w-3 h-3 bg-pink-500 rounded-full shadow-lg"></div>
                                <span class="text-gray-300">Experience</span>
                            </div>
                            <div class="w-px h-4 bg-gray-600"></div>
                            <div class="flex items-center gap-1.5 legend-item cursor-pointer" data-color="#10b981">
                                <div class="w-3 h-3 bg-green-500 rounded-full shadow-lg"></div>
                                <span class="text-gray-300">Projects/Contact</span>
                            </div>
                            <div class="w-px h-4 bg-gray-600"></div>
                            <div class="flex items-center gap-1.5 legend-item cursor-pointer" data-color="#f59e0b">
                                <div class="w-3 h-3 bg-orange-500 rounded-full shadow-lg"></div>
                                <span class="text-gray-300">Certs/Patents</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Neural Network SVG -->
                <svg id="neuralNetwork" class="w-full h-screen" style="margin-top: 80px;">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    <g id="connections"></g>
                    <g id="nodes"></g>
                </svg>

                <!-- Info Card -->
                <div id="infoCard" class="hidden fixed right-8 top-32 w-96 bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 p-6 z-20 transform transition-all duration-300 scale-95 opacity-0">
                    <button id="closeCard" class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                    <div id="cardContent"></div>
                </div>
                
                
            </div>
        `;
        
        this.initialize();
    },
    
    initialize() {
        setTimeout(() => {
            this.drawNetwork();
            this.animateNetwork();
            this.setupLegendInteractivity();
        }, 100);
        
        // Close card button
        document.getElementById('closeCard').addEventListener('click', () => {
            this.closeCard();
        });
        
        // Close on click outside
        document.addEventListener('click', (e) => {
            const infoCard = document.getElementById('infoCard');
            if (!infoCard.classList.contains('hidden') && 
                !infoCard.contains(e.target) && 
                !e.target.closest('.node-group')) {
                this.closeCard();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCard();
            }
        });
    },
    
    setupLegendInteractivity() {
        const legendItems = document.querySelectorAll('.legend-item');
        
        legendItems.forEach(item => {
            const color = item.dataset.color;
            
            item.addEventListener('mouseenter', () => {
                // Highlight matching nodes without moving them
                document.querySelectorAll('.node').forEach(node => {
                    if (node.getAttribute('fill') === color) {
                        // Only change visual properties, no transform/scale
                        node.style.filter = 'brightness(1.5) drop-shadow(0 0 15px currentColor)';
                        node.style.strokeWidth = '3';
                        node.style.stroke = color;
                    } else {
                        node.style.opacity = '0.3';
                    }
                });
                
                // Highlight the legend item
                item.style.transform = 'scale(1.1)';
                item.style.transition = 'transform 0.2s';
            });
            
            item.addEventListener('mouseleave', () => {
                // Reset all nodes
                document.querySelectorAll('.node').forEach(node => {
                    node.style.filter = 'url(#glow)';
                    node.style.opacity = '1';
                    node.style.strokeWidth = '';
                    node.style.stroke = '';
                });
                
                // Reset legend item
                item.style.transform = 'scale(1)';
            });
        });
    },
    
    closeCard() {
        const card = document.getElementById('infoCard');
        card.classList.remove('scale-100', 'opacity-100');
        card.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            card.classList.add('hidden');
        }, 300);
        this.selectedNode = null;
        this.updateNodeStates();
    },
    
    drawNetwork() {
        const svg = document.getElementById('neuralNetwork');
        const connections = document.getElementById('connections');
        const nodesGroup = document.getElementById('nodes');
        const svgWidth = svg.clientWidth;
        const svgHeight = svg.clientHeight - 80;
        
        // Draw connections
        this.connections.forEach((conn, i) => {
            const fromNode = this.nodes.find(n => n.id === conn.from);
            const toNode = this.nodes.find(n => n.id === conn.to);
            
            const x1 = (fromNode.x / 100) * svgWidth;
            const y1 = (fromNode.y / 100) * svgHeight;
            const x2 = (toNode.x / 100) * svgWidth;
            const y2 = (toNode.y / 100) * svgHeight;
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', 'rgba(139, 92, 246, 0.2)');
            line.setAttribute('stroke-width', '2');
            line.classList.add('connection');
            line.style.strokeDasharray = Math.hypot(x2 - x1, y2 - y1);
            line.style.strokeDashoffset = Math.hypot(x2 - x1, y2 - y1);
            line.style.animation = `drawLine 2s ease-out ${i * 0.05}s forwards`;
            
            connections.appendChild(line);
        });
        
        // Draw nodes with fixed size (no growing circles)
        this.nodes.forEach((node, i) => {
            const x = (node.x / 100) * svgWidth;
            const y = (node.y / 100) * svgHeight;
            
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', 'node-group');
            group.setAttribute('data-node-id', node.id);
            group.style.cursor = 'pointer';
            group.style.opacity = '0';
            group.style.animation = `fadeInNode 0.5s ease-out ${i * 0.1}s forwards`;
            
            // Fixed radius based on layer importance
            const radius = node.layer === 0 || node.layer === 5 ? 30 : (node.layer === 4 ? 25 : 20);
            
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', radius);
            circle.setAttribute('fill', node.color);
            circle.setAttribute('filter', 'url(#glow)');
            circle.classList.add('node');
            circle.dataset.baseRadius = radius; // Store base radius
            circle.style.transition = 'all 0.3s ease';
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y + radius + 20);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'white');
            text.setAttribute('font-size', '12');
            text.setAttribute('font-weight', 'bold');
            text.textContent = node.label;
            
            group.appendChild(circle);
            group.appendChild(text);
            nodesGroup.appendChild(group);
            
            group.addEventListener('click', () => this.showNodeInfo(node));
        });
        
        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes drawLine {
                to { stroke-dashoffset: 0; }
            }
            @keyframes fadeInNode {
                to { opacity: 1; }
            }
            .node-group:hover circle {
                filter: brightness(1.3) url(#glow);
            }
            .node-group.active circle {
                filter: brightness(1.5) drop-shadow(0 0 10px currentColor);
            }
        `;
        document.head.appendChild(style);
    },
    
    animateNetwork() {
        // Subtle pulse animation for connections only
        setInterval(() => {
            document.querySelectorAll('.connection').forEach((conn, i) => {
                setTimeout(() => {
                    conn.style.transition = 'stroke 0.5s ease';
                    conn.style.stroke = 'rgba(139, 92, 246, 0.4)';
                    setTimeout(() => {
                        conn.style.stroke = 'rgba(139, 92, 246, 0.2)';
                    }, 500);
                }, i * 50);
            });
        }, 5000);
    },
    
    showNodeInfo(node) {
        this.selectedNode = node;
        this.updateNodeStates();
        
        const card = document.getElementById('infoCard');
        const content = document.getElementById('cardContent');
        
        // Animate from node to card
        const nodeGroup = document.querySelector(`[data-node-id="${node.id}"]`);
        if (nodeGroup) {
            const rect = nodeGroup.getBoundingClientRect();
            card.style.transformOrigin = `${rect.left}px ${rect.top}px`;
        }
        
        let html = `<h3 class="text-xl font-bold text-white mb-4">${node.label}</h3>`;
        
        if (node.data.type === 'about') {
            html += `
                <div class="space-y-3 text-gray-300 text-sm">
                    <p>${node.data.content.bio}</p>
                    <div>
                        <strong class="text-white">Interests:</strong>
                        <div class="flex flex-wrap gap-2 mt-2">
                            ${node.data.content.interests.map(int => `<span class="px-2 py-1 bg-blue-900/50 text-blue-200 rounded text-xs">${int}</span>`).join('')}
                        </div>
                    </div>
                    <div>
                        <strong class="text-white">Hobbies:</strong>
                        <div class="flex flex-wrap gap-2 mt-2">
                            ${node.data.content.hobbies.map(hobby => `<span class="px-2 py-1 bg-blue-900/50 text-blue-200 rounded text-xs">${hobby}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;
        } else if (node.data.type === 'education') {
            html += `
                <div class="space-y-3 text-gray-300 text-sm">
                    ${node.data.content.map(edu => `
                        <div class="border-l-2 border-purple-500 pl-3">
                            <p class="font-bold text-white">${edu.degree}</p>
                            <p class="text-gray-400">${edu.institution}</p>
                            <p class="text-gray-500">${edu.year}</p>
                            ${edu.gpa ? `<p class="text-purple-300">GPA: ${edu.gpa}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (node.data.type === 'certifications') {
            html += `
                <div class="space-y-2 text-gray-300 text-sm max-h-96 overflow-y-auto">
                    ${node.data.content.map(cert => `
                        <div class="flex items-start gap-2 mb-3">
                            <i class="fas fa-certificate text-orange-400 mt-1"></i>
                            <div>
                                <p class="font-bold text-white">${cert.title}</p>
                                <p class="text-gray-400 text-xs">${cert.issuer} • ${cert.year}</p>
                                ${cert.link ? `<a href="${cert.link}" target="_blank" class="text-blue-400 hover:text-blue-300 text-xs mt-1 inline-block"><i class="fas fa-external-link-alt mr-1"></i>View Certificate</a>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (node.data.type === 'patents') {
            html += `
                <div class="space-y-2 text-gray-300 text-sm max-h-96 overflow-y-auto">
                    ${node.data.content.map(patent => `
                        <div class="border-l-2 border-orange-500 pl-3 mb-3">
                            <p class="font-bold text-white">${patent.title}</p>
                            <p class="text-gray-400 text-xs">${patent.number} • ${patent.status}</p>
                            <p class="text-gray-500 text-xs mt-1">${patent.description}</p>
                            ${patent.link ? `<a href="${patent.link}" target="_blank" class="text-blue-400 hover:text-blue-300 text-xs mt-1 inline-block"><i class="fas fa-external-link-alt mr-1"></i>View Patent</a>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (node.data.type === 'contact') {
            html += `
                <div class="space-y-4">
                    <p class="text-lg text-white">Let's connect and build something amazing together!</p>
                    <div class="space-y-2 text-sm text-gray-300">
                        <p><i class="fas fa-envelope mr-2 text-blue-400"></i>${node.data.content.email}</p>
                        <p><i class="fas fa-phone mr-2 text-blue-400"></i>${node.data.content.phone}</p>
                        <p><i class="fas fa-map-marker-alt mr-2 text-blue-400"></i>${node.data.content.location}</p>
                    </div>
                    <div class="flex flex-col gap-2 mt-4">
                        <a href="mailto:${node.data.content.email}" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center transition-colors">
                            <i class="fas fa-envelope mr-2"></i>Email Me
                        </a>
                        <a href="${node.data.content.social.linkedin}" target="_blank" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center transition-colors">
                            <i class="fab fa-linkedin mr-2"></i>LinkedIn
                        </a>
                        <a href="${node.data.content.social.github}" target="_blank" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-center transition-colors">
                            <i class="fab fa-github mr-2"></i>GitHub
                        </a>
                    </div>
                </div>
            `;
        } else if (node.data.company) {
            html += `
                <div class="space-y-2 text-gray-300 text-sm">
                    <p><strong class="text-white">Position:</strong> ${node.data.position}</p>
                    <p><strong class="text-white">Duration:</strong> ${node.data.duration}</p>
                    <p><strong class="text-white">Location:</strong> ${node.data.location}</p>
                    <div class="mt-3">
                        <strong class="text-white">Key Achievements:</strong>
                        <ul class="mt-2 space-y-1">
                            ${node.data.achievements.slice(0, 3).map(a => `<li class="ml-4">• ${a}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        } else if (node.data.title && node.data.description) {
            html += `
                <div class="space-y-3 text-gray-300 text-sm">
                    <p>${node.data.description}</p>
                    <div>
                        <strong class="text-white">Technologies:</strong>
                        <div class="flex flex-wrap gap-2 mt-2">
                            ${node.data.tags.map(tag => `<span class="px-2 py-1 bg-green-900/50 text-green-200 rounded text-xs">${tag}</span>`).join('')}
                        </div>
                    </div>
                    <div>
                        <strong class="text-white">Highlights:</strong>
                        <ul class="mt-2 space-y-1">
                            ${node.data.highlights.map(h => `<li class="ml-4">• ${h}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }
        
        content.innerHTML = html;
        card.classList.remove('hidden');
        
        // Trigger animation
        setTimeout(() => {
            card.classList.remove('scale-95', 'opacity-0');
            card.classList.add('scale-100', 'opacity-100');
        }, 10);
    },
    
    updateNodeStates() {
        document.querySelectorAll('.node-group').forEach(group => {
            if (this.selectedNode && group.dataset.nodeId === this.selectedNode.id) {
                group.classList.add('active');
            } else {
                group.classList.remove('active');
            }
        });
    },
    
    cleanup() {
        // Re-enable scrolling when leaving theme
        document.body.style.overflow = '';
    }
};

if (typeof window !== 'undefined') {
    window.NeuralTheme = NeuralTheme;
}
