// Sci-Fi Holographic Console Theme
const SciFiTheme = {
    name: "Sci-Fi Console",
    
    animationFrame: null,
    particles: [],
    
    render() {
        const container = document.getElementById('themeContainer');
        container.innerHTML = `
            <div class="min-h-screen bg-black text-cyan-400 relative overflow-hidden font-mono">
                <!-- Animated Background -->
                <canvas id="bgCanvas" class="fixed inset-0 w-full h-full opacity-20"></canvas>
                
                <!-- Scanline Effect -->
                <div class="fixed inset-0 pointer-events-none" style="background: repeating-linear-gradient(0deg, rgba(0, 255, 255, 0.03) 0px, transparent 2px); z-index: 1;"></div>
                
                <!-- Main Console -->
                <div class="relative z-10 min-h-screen p-6">
                    <!-- Header -->
                    <div class="border-2 border-cyan-500 bg-black/80 backdrop-blur mb-6 p-4 shadow-[0_0_30px_rgba(0,255,255,0.3)]">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,255,0.8)]"></div>
                                <div>
                                    <div class="text-xs text-cyan-600">SYSTEM PERSONNEL FILE</div>
                                    <div class="text-xl font-bold tracking-wider text-cyan-300">${portfolioContent.name.toUpperCase()}</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="text-right text-xs">
                                    <div class="text-cyan-600">STATUS</div>
                                    <div class="text-cyan-300 font-bold">AVAILABLE</div>
                                </div>
                                <a href="mailto:${portfolioContent.email}" class="px-4 py-2 border-2 border-cyan-500 hover:bg-cyan-500 hover:text-black transition-all text-xs font-bold tracking-wider shadow-[0_0_15px_rgba(0,255,255,0.5)]">
                                    ESTABLISH LINK
                                </a>
                            </div>
                        </div>
                        <div class="mt-3 flex gap-2 text-xs">
                            <div class="px-2 py-1 border border-cyan-600 text-cyan-400">ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                            <div class="px-2 py-1 border border-cyan-600 text-cyan-400">CLEARANCE: ALPHA</div>
                            <div class="px-2 py-1 border border-cyan-600 text-cyan-400">TIMESTAMP: ${new Date().toISOString().split('T')[0]}</div>
                        </div>
                    </div>

                    <div class="grid lg:grid-cols-3 gap-6">
                        <!-- Main Display -->
                        <div class="lg:col-span-2 space-y-6">
                            <!-- Bio Scanner -->
                            <div class="border-2 border-cyan-500 bg-black/80 backdrop-blur p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                                <div class="flex items-center gap-2 mb-4 pb-3 border-b border-cyan-900">
                                    <i class="fas fa-user-circle text-cyan-500"></i>
                                    <span class="text-sm font-bold tracking-wider">BIOGRAPHICAL DATA</span>
                                </div>
                                <div class="text-cyan-300 text-sm leading-relaxed">
                                    ${portfolioContent.about.bio}
                                </div>
                                <div class="mt-4 pt-4 border-t border-cyan-900">
                                    <div class="text-xs text-cyan-600 mb-2">PRIMARY DIRECTIVES:</div>
                                    <div class="flex flex-wrap gap-2">
                                        ${portfolioContent.about.interests.map(interest => 
                                            `<div class="px-3 py-1 border border-cyan-600 text-xs text-cyan-400 shadow-[0_0_5px_rgba(0,255,255,0.3)]">${interest.toUpperCase()}</div>`
                                        ).join('')}
                                    </div>
                                </div>
                            </div>

                            <!-- Skill Matrix -->
                            <div class="border-2 border-cyan-500 bg-black/80 backdrop-blur p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                                <div class="flex items-center gap-2 mb-4 pb-3 border-b border-cyan-900">
                                    <i class="fas fa-microchip text-cyan-500"></i>
                                    <span class="text-sm font-bold tracking-wider">SKILL MATRIX</span>
                                </div>
                                <div class="space-y-4">
                                    ${Object.entries(portfolioContent.skills).map(([category, skills]) => `
                                        <div>
                                            <div class="text-xs text-cyan-600 mb-2">&gt; ${category.toUpperCase().replace('_', ' ')}</div>
                                            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                ${skills.map(skill => `
                                                    <div class="flex items-center gap-2 text-xs">
                                                        <div class="w-1.5 h-1.5 bg-cyan-400 shadow-[0_0_5px_rgba(0,255,255,0.8)]"></div>
                                                        <span class="text-cyan-300">${skill}</span>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <!-- Mission Log (Projects) -->
                            <div class="border-2 border-cyan-500 bg-black/80 backdrop-blur p-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                                <div class="flex items-center gap-2 mb-4 pb-3 border-b border-cyan-900">
                                    <i class="fas fa-rocket text-cyan-500"></i>
                                    <span class="text-sm font-bold tracking-wider">MISSION LOG</span>
                                </div>
                                <div class="space-y-4">
                                    ${portfolioContent.projects.slice(0, 4).map((project, idx) => `
                                        <div class="border-l-2 border-cyan-700 pl-4">
                                            <div class="flex items-start justify-between gap-4 mb-2">
                                                <div class="text-sm font-bold text-cyan-300">MISSION-${String(idx + 1).padStart(3, '0')}: ${project.title.toUpperCase()}</div>
                                                <div class="text-xs text-cyan-600 whitespace-nowrap">${project.period}</div>
                                            </div>
                                            <div class="text-xs text-cyan-400 leading-relaxed mb-2">
                                                ${project.description.substring(0, 120)}...
                                            </div>
                                            <div class="flex flex-wrap gap-1">
                                                ${project.tags.slice(0, 4).map(tag => 
                                                    `<span class="px-2 py-0.5 bg-cyan-950 border border-cyan-800 text-xs text-cyan-400">${tag}</span>`
                                                ).join('')}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Side Panel -->
                        <div class="lg:col-span-1 space-y-6">
                            <!-- System Stats -->
                            <div class="border-2 border-cyan-500 bg-black/80 backdrop-blur p-4 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                                <div class="text-xs font-bold tracking-wider mb-4 text-cyan-500">SYSTEM ANALYTICS</div>
                                <div class="space-y-4">
                                    <div>
                                        <div class="flex justify-between text-xs mb-1">
                                            <span class="text-cyan-600">SKILL INDEX</span>
                                            <span class="text-cyan-300 font-bold">${Object.values(portfolioContent.skills).flat().length}</span>
                                        </div>
                                        <div class="h-1 bg-cyan-950 border border-cyan-900">
                                            <div class="h-full bg-cyan-500 shadow-[0_0_10px_rgba(0,255,255,0.8)]" style="width: 95%"></div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div class="flex justify-between text-xs mb-1">
                                            <span class="text-cyan-600">MISSIONS COMPLETE</span>
                                            <span class="text-cyan-300 font-bold">${portfolioContent.projects.length}</span>
                                        </div>
                                        <div class="h-1 bg-cyan-950 border border-cyan-900">
                                            <div class="h-full bg-cyan-500 shadow-[0_0_10px_rgba(0,255,255,0.8)]" style="width: 87%"></div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div class="flex justify-between text-xs mb-1">
                                            <span class="text-cyan-600">EXPERIENCE LEVEL</span>
                                            <span class="text-cyan-300 font-bold">${portfolioContent.experience.length}+ YRS</span>
                                        </div>
                                        <div class="h-1 bg-cyan-950 border border-cyan-900">
                                            <div class="h-full bg-cyan-500 shadow-[0_0_10px_rgba(0,255,255,0.8)]" style="width: 92%"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Service Record -->
                            <div class="border-2 border-cyan-500 bg-black/80 backdrop-blur p-4 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                                <div class="text-xs font-bold tracking-wider mb-4 text-cyan-500">SERVICE RECORD</div>
                                <div class="space-y-3">
                                    ${portfolioContent.experience.map((exp, idx) => `
                                        <div class="text-xs">
                                            <div class="flex items-start gap-2 mb-1">
                                                <div class="text-cyan-600 mt-1">&gt;</div>
                                                <div class="flex-1">
                                                    <div class="text-cyan-300 font-bold">${exp.position.toUpperCase()}</div>
                                                    <div class="text-cyan-600 text-[10px] mt-0.5">${exp.company} | ${exp.period}</div>
                                                </div>
                                            </div>
                                        </div>
                                        ${idx < portfolioContent.experience.length - 1 ? '<div class="border-b border-cyan-950 my-2"></div>' : ''}
                                    `).join('')}
                                </div>
                            </div>

                            <!-- Network Access -->
                            <div class="border-2 border-cyan-500 bg-black/80 backdrop-blur p-4 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                                <div class="text-xs font-bold tracking-wider mb-4 text-cyan-500">NETWORK ACCESS</div>
                                <div class="space-y-2">
                                    <a href="mailto:${portfolioContent.email}" class="flex items-center gap-3 p-2 border border-cyan-700 hover:border-cyan-400 hover:bg-cyan-950 transition-all group">
                                        <i class="fas fa-envelope text-cyan-500 group-hover:text-cyan-300"></i>
                                        <div class="text-xs">
                                            <div class="text-cyan-600">EMAIL PROTOCOL</div>
                                            <div class="text-cyan-400 text-[10px] break-all">${portfolioContent.email}</div>
                                        </div>
                                    </a>
                                    
                                    <a href="https://github.com/${portfolioContent.social.github}" target="_blank" class="flex items-center gap-3 p-2 border border-cyan-700 hover:border-cyan-400 hover:bg-cyan-950 transition-all group">
                                        <i class="fab fa-github text-cyan-500 group-hover:text-cyan-300"></i>
                                        <div class="text-xs">
                                            <div class="text-cyan-600">CODE REPOSITORY</div>
                                            <div class="text-cyan-400 text-[10px]">github.com/${portfolioContent.social.github}</div>
                                        </div>
                                    </a>
                                    
                                    <a href="https://linkedin.com/in/${portfolioContent.social.linkedin}" target="_blank" class="flex items-center gap-3 p-2 border border-cyan-700 hover:border-cyan-400 hover:bg-cyan-950 transition-all group">
                                        <i class="fab fa-linkedin text-cyan-500 group-hover:text-cyan-300"></i>
                                        <div class="text-xs">
                                            <div class="text-cyan-600">PROFESSIONAL NETWORK</div>
                                            <div class="text-cyan-400 text-[10px]">linkedin.com/in/${portfolioContent.social.linkedin}</div>
                                        </div>
                                    </a>
                                </div>
                            </div>

                            <!-- Education -->
                            <div class="border-2 border-cyan-500 bg-black/80 backdrop-blur p-4 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                                <div class="text-xs font-bold tracking-wider mb-4 text-cyan-500">TRAINING CREDENTIALS</div>
                                <div class="space-y-3">
                                    ${portfolioContent.education.map((edu, idx) => `
                                        <div class="text-xs">
                                            <div class="text-cyan-300 font-bold">${edu.degree}</div>
                                            <div class="text-cyan-600 text-[10px] mt-1">${edu.institution}</div>
                                            <div class="text-cyan-700 text-[10px]">${edu.year}</div>
                                        </div>
                                        ${idx < portfolioContent.education.length - 1 ? '<div class="border-b border-cyan-950 my-2"></div>' : ''}
                                    `).join('')}
                                </div>
                            </div>

                            <!-- Knowledge Acquisition Logs -->
                            <div class="border-2 border-cyan-500 bg-black/80 backdrop-blur p-4 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                                <div class="text-xs font-bold tracking-wider mb-4 text-cyan-500">
                                    <span class="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-pulse mr-2"></span>
                                    KNOWLEDGE ACQUISITION LOGS
                                </div>
                                <div class="space-y-2">
                                    ${portfolioContent.currentlyReading.map(book => `
                                        <div class="text-xs border-l-2 border-cyan-700 pl-3 py-1">
                                            <div class="text-cyan-600 text-[10px]">${book.startDate}</div>
                                            <div class="text-cyan-300 mt-1">
                                                ACQUIRING: ${book.title} [${book.author}]
                                            </div>
                                            <div class="text-cyan-500 text-[10px] mt-1">
                                                STATUS: ${book.status === 'completed' ? '[COMPLETE]' : '[' + book.progress + '%]'}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="mt-6 border-2 border-cyan-500 bg-black/80 backdrop-blur p-3 text-center shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                        <div class="text-xs text-cyan-600 tracking-wider">
                            SYSTEM ACCESS GRANTED • <span class="text-cyan-400">${portfolioContent.about.tagline.toUpperCase()}</span> • END TRANSMISSION
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.initCanvas();
        this.startAnimation();
    },
    
    initCanvas() {
        const canvas = document.getElementById('bgCanvas');
        if (!canvas) return;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.ctx = canvas.getContext('2d');
        
        // Initialize particles
        this.particles = [];
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2
            });
        }
    },
    
    startAnimation() {
        const animate = () => {
            if (!this.ctx) return;
            
            const canvas = this.ctx.canvas;
            const ctx = this.ctx;
            
            // Clear canvas
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Update and draw particles
            ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
            
            this.particles.forEach((p, i) => {
                // Update position
                p.x += p.vx;
                p.y += p.vy;
                
                // Wrap around edges
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
                
                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw connections
                this.particles.slice(i + 1).forEach(p2 => {
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.globalAlpha = (150 - dist) / 150 * 0.2;
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }
                });
            });
            
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
    window.SciFiTheme = SciFiTheme;
}
