// Model Card Resume Portfolio Theme
const ModelCardTheme = {
    name: "Model Card Resume",
    
    render() {
        const container = document.getElementById('themeContainer');
        container.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <!-- Header -->
                <div class="bg-white border-b border-gray-200 shadow-sm">
                    <div class="max-w-6xl mx-auto px-8 py-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <h1 class="text-4xl font-bold text-gray-900 mb-1">${portfolioContent.name.toUpperCase()}-AI</h1>
                                <p class="text-gray-600">Model Card • Version 2025.1 • Last Updated: ${new Date().toLocaleDateString()}</p>
                            </div>
                            <div class="flex gap-3">
                                <span class="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">Production Ready</span>
                                <span class="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Open to Opportunities</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="max-w-6xl mx-auto px-8 py-12">
                    <!-- Overview Card -->
                    <div class="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                <i class="fas fa-info-circle text-white text-sm"></i>
                            </span>
                            Overview
                        </h2>
                        <div class="prose max-w-none">
                            <p class="text-gray-700 text-lg leading-relaxed mb-4">${portfolioContent.about.bio}</p>
                            <div class="grid grid-cols-2 gap-4 mt-6">
                                <div class="bg-gray-50 rounded-lg p-4">
                                    <p class="text-sm text-gray-600 mb-1">Model Type</p>
                                    <p class="text-lg font-semibold text-gray-900">${portfolioContent.title}</p>
                                </div>
                                <div class="bg-gray-50 rounded-lg p-4">
                                    <p class="text-sm text-gray-600 mb-1">Location</p>
                                    <p class="text-lg font-semibold text-gray-900">${portfolioContent.location}</p>
                                </div>
                                <div class="bg-gray-50 rounded-lg p-4">
                                    <p class="text-sm text-gray-600 mb-1">Training Duration</p>
                                    <p class="text-lg font-semibold text-gray-900">7+ Years</p>
                                </div>
                                <div class="bg-gray-50 rounded-lg p-4">
                                    <p class="text-sm text-gray-600 mb-1">Specialization</p>
                                    <p class="text-lg font-semibold text-gray-900">GenAI & Automation</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Capabilities Card -->
                    <div class="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                        <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span class="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                                <i class="fas fa-cogs text-white text-xs"></i>
                            </span>
                            Capabilities
                        </h2>
                        <div class="grid md:grid-cols-3 gap-3">
                            ${Object.entries(portfolioContent.skills).map(([category, skills]) => `
                                <div class="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-200">
                                    <h3 class="font-semibold text-gray-900 mb-2 text-sm capitalize">${category.replace('aiml', 'AI/ML').replace('mlops', 'MLOps')}</h3>
                                    <div class="flex flex-wrap gap-1">
                                        ${skills.map(skill => `
                                            <span class="px-2 py-0.5 bg-white border border-gray-300 text-gray-700 rounded text-xs">${skill}</span>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Training Data Card -->
                    <div class="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <i class="fas fa-database text-white text-sm"></i>
                            </span>
                            Training Data (Experience)
                        </h2>
                        <div class="space-y-4">
                            ${portfolioContent.experience.map(exp => `
                                <div class="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-purple-300 transition-colors">
                                    <div class="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 class="text-lg font-bold text-gray-900">${exp.position}</h3>
                                            <p class="text-purple-600 font-medium">${exp.company}</p>
                                        </div>
                                        <span class="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">${exp.duration}</span>
                                    </div>
                                    <ul class="space-y-2">
                                        ${exp.achievements.slice(0, 3).map(achievement => `
                                            <li class="text-sm text-gray-700 flex items-start gap-2">
                                                <span class="text-purple-500 mt-1">▸</span>
                                                <span>${achievement}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Benchmarks Card -->
                    <div class="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                <i class="fas fa-chart-line text-white text-sm"></i>
                            </span>
                            Benchmarks & Performance
                        </h2>
                        <div class="grid md:grid-cols-3 gap-6">
                            <div class="text-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
                                <div class="text-4xl font-bold text-purple-600 mb-2">14+ FTE</div>
                                <div class="text-sm text-gray-600">Equivalent Savings Delivered</div>
                            </div>
                            <div class="text-center p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl">
                                <div class="text-4xl font-bold text-green-600 mb-2">50K+</div>
                                <div class="text-sm text-gray-600">Classes Handled in ML Model</div>
                            </div>
                            <div class="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                                <div class="text-4xl font-bold text-orange-600 mb-2">4000+</div>
                                <div class="text-sm text-gray-600">Hours ASR Training Data</div>
                            </div>
                        </div>
                        
                        <!-- Projects as Benchmarks -->
                        <div class="mt-8">
                            <h3 class="font-bold text-gray-900 mb-4">Key Projects</h3>
                            <div class="grid md:grid-cols-2 gap-4">
                                ${portfolioContent.projects.slice(0, 4).map(project => `
                                    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <h4 class="font-semibold text-gray-900 mb-2">${project.title}</h4>
                                        <p class="text-sm text-gray-600 mb-3">${project.description.substring(0, 100)}...</p>
                                        <div class="flex flex-wrap gap-1">
                                            ${project.tags.map(tag => `
                                                <span class="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">${tag}</span>
                                            `).join('')}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Education Card -->
                    <div class="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                                <i class="fas fa-graduation-cap text-white text-sm"></i>
                            </span>
                            Education
                        </h2>
                        ${portfolioContent.education.map(edu => `
                            <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                <h3 class="text-lg font-bold text-gray-900">${edu.degree}</h3>
                                <p class="text-purple-600 font-medium">${edu.institution}</p>
                                <p class="text-sm text-gray-600 mt-1">${edu.duration} • GPA: ${edu.gpa}</p>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Certifications Card -->
                    <div class="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span class="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                                <i class="fas fa-certificate text-white text-sm"></i>
                            </span>
                            Certifications
                        </h2>
                        <div class="grid md:grid-cols-2 gap-4">
                            ${portfolioContent.certifications.map(cert => `
                                <a href="${cert.link}" target="_blank" class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all">
                                    <h4 class="font-semibold text-gray-900 mb-1">${cert.title}</h4>
                                    <p class="text-sm text-gray-600">${cert.issuer}</p>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Publications Card -->
                    <div class="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span class="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                                <i class="fas fa-file-alt text-white text-sm"></i>
                            </span>
                            Patents & Publications
                        </h2>
                        ${portfolioContent.patents.length > 0 ? portfolioContent.patents.map(patent => `
                            <a href="${patent.link}" target="_blank" class="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-6 border border-red-200 hover:border-red-300 hover:shadow-md transition-all block mb-4">
                                <div class="flex items-start gap-3">
                                    <span class="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">PATENT</span>
                                    <div>
                                        <h4 class="font-bold text-gray-900 mb-1">${patent.title}</h4>
                                        <p class="text-sm text-gray-600 mb-1">${patent.description}</p>
                                        <p class="text-xs text-gray-500">${patent.number} • ${patent.status} • ${patent.year}</p>
                                    </div>
                                </div>
                            </a>
                        `).join('') : '<p class="text-gray-500 text-sm">No patents to display</p>'}
                        ${portfolioContent.publications.length > 0 ? portfolioContent.publications.map(pub => `
                            <a href="${pub.link}" target="_blank" class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all block mb-4">
                                <div class="flex items-start gap-3">
                                    <span class="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">PUBLICATION</span>
                                    <div>
                                        <h4 class="font-bold text-gray-900 mb-1">${pub.title}</h4>
                                        <p class="text-sm text-gray-600">${pub.description}</p>
                                    </div>
                                </div>
                            </a>
                        `).join('') : ''}
                    </div>

                    <!-- Contact Card -->
                    <div class="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
                        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <i class="fas fa-envelope text-white text-sm"></i>
                            </span>
                            Contact & Deployment
                        </h2>
                        <p class="text-white/90 mb-6">Interested in deploying this model for your organization? Get in touch to discuss opportunities.</p>
                        <a href="mailto:${portfolioContent.email}" class="block w-full bg-white text-purple-600 font-bold text-center py-4 rounded-lg mb-4 hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl">
                            <i class="fas fa-handshake mr-2"></i>HIRE ME
                        </a>
                        <div class="grid md:grid-cols-2 gap-4">
                            <a href="mailto:${portfolioContent.email}" class="bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg p-4 transition-colors flex items-center gap-3">
                                <i class="fas fa-envelope text-xl"></i>
                                <div>
                                    <p class="text-sm text-white/70">Email</p>
                                    <p class="font-medium">${portfolioContent.email}</p>
                                </div>
                            </a>
                            <a href="${portfolioContent.social.linkedin}" target="_blank" class="bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg p-4 transition-colors flex items-center gap-3">
                                <i class="fab fa-linkedin text-xl"></i>
                                <div>
                                    <p class="text-sm text-white/70">LinkedIn</p>
                                    <p class="font-medium">Connect with me</p>
                                </div>
                            </a>
                            <a href="${portfolioContent.social.github}" target="_blank" class="bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg p-4 transition-colors flex items-center gap-3">
                                <i class="fab fa-github text-xl"></i>
                                <div>
                                    <p class="text-sm text-white/70">GitHub</p>
                                    <p class="font-medium">View repositories</p>
                                </div>
                            </a>
                            <div class="bg-white/10 backdrop-blur rounded-lg p-4 flex items-center gap-3">
                                <i class="fas fa-phone text-xl"></i>
                                <div>
                                    <p class="text-sm text-white/70">Phone</p>
                                    <p class="font-medium">${portfolioContent.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

if (typeof window !== 'undefined') {
    window.ModelCardTheme = ModelCardTheme;
}
