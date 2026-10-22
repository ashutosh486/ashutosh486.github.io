// API Documentation Portfolio Theme (Swagger/Postman Style)
const APIDocsTheme = {
    name: "API Documentation",
    activeEndpoint: '/about',
    
    render() {
        const container = document.getElementById('themeContainer');
        container.innerHTML = `
            <div class="flex h-screen bg-gray-50">
                <!-- Sidebar -->
                <div class="w-80 bg-gray-900 text-white overflow-y-auto">
                    <div class="p-6 border-b border-gray-700">
                        <h1 class="text-2xl font-bold mb-2">${portfolioContent.name} API</h1>
                        <p class="text-sm text-gray-400">v${new Date().getFullYear()}.1</p>
                        <p class="text-xs text-gray-500 mt-2">Base URL: <code class="bg-gray-800 px-2 py-1 rounded">https://api.${portfolioContent.name.toLowerCase().replace(' ', '')}.dev</code></p>
                    </div>
                    
                    <div class="p-4">
                        <h3 class="text-xs uppercase text-gray-500 font-semibold mb-3">Endpoints</h3>
                        <div class="space-y-1">
                            <button class="endpoint-btn w-full text-left px-3 py-2 rounded hover:bg-gray-800 transition-colors" data-endpoint="/about">
                                <span class="text-green-400 font-mono text-sm font-bold">GET</span>
                                <span class="ml-3 text-white font-mono text-sm">/about</span>
                            </button>
                            <button class="endpoint-btn w-full text-left px-3 py-2 rounded hover:bg-gray-800 transition-colors" data-endpoint="/skills">
                                <span class="text-green-400 font-mono text-sm font-bold">GET</span>
                                <span class="ml-3 text-white font-mono text-sm">/skills</span>
                            </button>
                            <button class="endpoint-btn w-full text-left px-3 py-2 rounded hover:bg-gray-800 transition-colors" data-endpoint="/projects">
                                <span class="text-green-400 font-mono text-sm font-bold">GET</span>
                                <span class="ml-3 text-white font-mono text-sm">/projects</span>
                            </button>
                            <button class="endpoint-btn w-full text-left px-3 py-2 rounded hover:bg-gray-800 transition-colors" data-endpoint="/reading">
                                <span class="text-green-400 font-mono text-sm font-bold">GET</span>
                                <span class="ml-3 text-white font-mono text-sm">/reading</span>
                            </button>
                            <button class="endpoint-btn w-full text-left px-3 py-2 rounded hover:bg-gray-800 transition-colors" data-endpoint="/experience">
                                <span class="text-green-400 font-mono text-sm font-bold">GET</span>
                                <span class="ml-3 text-white font-mono text-sm">/experience</span>
                            </button>
                            <button class="endpoint-btn w-full text-left px-3 py-2 rounded hover:bg-gray-800 transition-colors" data-endpoint="/certifications">
                                <span class="text-green-400 font-mono text-sm font-bold">GET</span>
                                <span class="ml-3 text-white font-mono text-sm">/certifications</span>
                            </button>
                            <button class="endpoint-btn w-full text-left px-3 py-2 rounded hover:bg-gray-800 transition-colors" data-endpoint="/contact">
                                <span class="text-green-400 font-mono text-sm font-bold">GET</span>
                                <span class="ml-3 text-white font-mono text-sm">/contact</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="flex-1 overflow-y-auto">
                    <div class="max-w-5xl mx-auto p-8" id="apiContent">
                        <!-- Content will be rendered here -->
                    </div>
                </div>
            </div>
        `;
        
        this.initialize();
    },
    
    initialize() {
        // Set up endpoint click handlers
        document.querySelectorAll('.endpoint-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const endpoint = e.currentTarget.dataset.endpoint;
                this.activeEndpoint = endpoint;
                
                // Update active state
                document.querySelectorAll('.endpoint-btn').forEach(b => b.classList.remove('bg-gray-800'));
                e.currentTarget.classList.add('bg-gray-800');
                
                this.renderEndpoint(endpoint);
            });
        });
        
        // Render default endpoint
        document.querySelector('.endpoint-btn').classList.add('bg-gray-800');
        this.renderEndpoint('/about');
    },
    
    renderEndpoint(endpoint) {
        const content = document.getElementById('apiContent');
        
        const responses = {
            '/about': {
                name: portfolioContent.name,
                title: portfolioContent.title,
                location: portfolioContent.location,
                bio: portfolioContent.about.bio,
                interests: portfolioContent.about.interests,
                hobbies: portfolioContent.hobbies || portfolioContent.about.hobbies
            },
            '/skills': portfolioContent.skills,
            '/projects': portfolioContent.projects.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                tags: p.tags,
                highlights: p.highlights,
                ...(p.site && { site: p.site })
            })),
            '/reading': portfolioContent.currentlyReading.map(book => ({
                title: book.title,
                author: book.author,
                status: book.status,
                progress: book.progress,
                startDate: book.startDate,
                endDate: book.endDate,
                notes: book.notes,
                ...(book.link && { link: book.link })
            })),
            '/experience': portfolioContent.experience.map(e => ({
                company: e.company,
                position: e.position,
                duration: e.duration,
                location: e.location,
                achievements: e.achievements
            })),
            '/certifications': {
                certifications: portfolioContent.certifications,
                patents: portfolioContent.patents
            },
            '/contact': {
                email: portfolioContent.email,
                phone: portfolioContent.phone,
                location: portfolioContent.location,
                social: portfolioContent.social
            }
        };
        
        const responseData = responses[endpoint];
        
        content.innerHTML = `
            <div class="space-y-6">
                <!-- Endpoint Header -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center gap-3 mb-4">
                        <span class="px-3 py-1 bg-green-100 text-green-700 rounded font-mono text-sm font-bold">GET</span>
                        <code class="text-xl font-mono">${endpoint}</code>
                    </div>
                    <p class="text-gray-600">${this.getEndpointDescription(endpoint)}</p>
                </div>

                <!-- Try It Button -->
                <button class="try-it-btn px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
                    <i class="fas fa-play"></i>
                    <span>Try It Out</span>
                </button>

                <!-- Response Section -->
                <div class="response-section hidden">
                    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div class="bg-gray-100 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                            <h3 class="font-semibold text-gray-900">Response</h3>
                            <span class="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-semibold">200 OK</span>
                        </div>
                        <div class="p-6">
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-sm text-gray-600">application/json</span>
                                <button class="copy-btn text-blue-600 hover:text-blue-800 text-sm font-semibold">
                                    <i class="fas fa-copy mr-1"></i>Copy
                                </button>
                            </div>
                            <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code class="language-json">${JSON.stringify(responseData, null, 2)}</code></pre>
                        </div>
                    </div>
                </div>

                <!-- Parameters (optional) -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 class="font-semibold text-gray-900 mb-4">Parameters</h3>
                    <p class="text-sm text-gray-600">No parameters required</p>
                </div>

                <!-- Response Schema -->
                <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 class="font-semibold text-gray-900 mb-4">Response Schema</h3>
                    <div class="space-y-2 text-sm">
                        ${this.renderSchema(responseData)}
                    </div>
                </div>
            </div>
        `;
        
        // Add try it button handler
        content.querySelector('.try-it-btn').addEventListener('click', (e) => {
            const responseSection = content.querySelector('.response-section');
            responseSection.classList.remove('hidden');
            e.target.disabled = true;
            e.target.classList.add('opacity-50');
            
            // Syntax highlighting
            this.applySyntaxHighlighting();
        });
        
        // Copy button handler
        content.querySelector('.copy-btn')?.addEventListener('click', () => {
            navigator.clipboard.writeText(JSON.stringify(responseData, null, 2));
            alert('Copied to clipboard!');
        });
    },
    
    getEndpointDescription(endpoint) {
        const descriptions = {
            '/about': 'Retrieve detailed information about professional background, bio, interests, and hobbies.',
            '/skills': 'Get a comprehensive list of technical skills organized by category.',
            '/projects': 'Fetch all notable projects with descriptions, technologies, and highlights.',
            '/reading': 'Get current reading list with books, progress, and completion status.',
            '/experience': 'Access complete work history with positions, companies, and key achievements.',
            '/certifications': 'Retrieve all professional certifications and patent information.',
            '/contact': 'Get contact information including email, phone, location, and social media profiles.'
        };
        return descriptions[endpoint] || '';
    },
    
    renderSchema(obj, indent = 0) {
        const indentStr = '  '.repeat(indent);
        let html = '';
        
        if (Array.isArray(obj)) {
            html += `<div class="ml-${indent * 4}"><span class="text-purple-600 font-mono">Array</span> of objects</div>`;
        } else if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj).slice(0, 5)) {
                const type = Array.isArray(value) ? 'array' : typeof value;
                html += `<div class="ml-${indent * 4}">
                    <span class="text-blue-600 font-mono">${key}</span>
                    <span class="text-gray-400">:</span>
                    <span class="text-purple-600 font-mono">${type}</span>
                </div>`;
            }
        }
        
        return html;
    },
    
    applySyntaxHighlighting() {
        // Simple JSON syntax highlighting
        const codeBlocks = document.querySelectorAll('code.language-json');
        codeBlocks.forEach(block => {
            let highlighted = block.textContent
                .replace(/"([^"]+)":/g, '<span class="text-blue-400">"$1"</span>:')
                .replace(/: "([^"]*)"/g, ': <span class="text-green-400">"$1"</span>')
                .replace(/: (\d+)/g, ': <span class="text-yellow-400">$1</span>')
                .replace(/: (true|false|null)/g, ': <span class="text-purple-400">$1</span>');
            
            block.innerHTML = highlighted;
        });
    }
};

if (typeof window !== 'undefined') {
    window.APIDocsTheme = APIDocsTheme;
}
