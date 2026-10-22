// Minimalist Apple-Style AI Persona Card Theme
const AppleTheme = {
    name: "Apple Persona",
    
    currentView: 'card',
    
    render() {
        const container = document.getElementById('themeContainer');
        container.innerHTML = `
            <div class="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
                <div class="w-full max-w-6xl">
                    <!-- Main Card -->
                    <div id="mainCard" class="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-700 ease-out">
                        <div class="grid md:grid-cols-2">
                            <!-- Left: Hero Image/Visual -->
                            <div class="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
                                <div class="absolute inset-0 bg-black/10"></div>
                                <div class="relative z-10 text-center">
                                    <div class="w-32 h-32 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center mb-6 mx-auto border-4 border-white/30 shadow-2xl">
                                        <span class="text-6xl font-bold">${portfolioContent.name.split(' ').map(n => n[0]).join('')}</span>
                                    </div>
                                    <h1 class="text-5xl font-bold mb-3 tracking-tight">${portfolioContent.name}</h1>
                                    <p class="text-xl opacity-90 font-medium">${portfolioContent.about.tagline}</p>
                                    
                                    <div class="mt-8 flex flex-wrap gap-3 justify-center">
                                        ${portfolioContent.about.interests.slice(0, 3).map(interest => 
                                            `<span class="px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm font-medium">${interest}</span>`
                                        ).join('')}
                                    </div>
                                </div>
                                
                                <!-- Floating orbs decoration -->
                                <div class="absolute top-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
                                <div class="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                            </div>
                            
                            <!-- Right: Info -->
                            <div class="p-12">
                                <div class="space-y-8">
                                    <!-- About -->
                                    <div>
                                        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">About</h2>
                                        <p class="text-gray-700 leading-relaxed">${portfolioContent.about.bio.substring(0, 200)}...</p>
                                    </div>
                                    
                                    <!-- Quick Stats -->
                                    <div class="grid grid-cols-3 gap-4">
                                        <div class="text-center p-4 bg-gray-50 rounded-2xl">
                                            <div class="text-3xl font-bold text-blue-600">${portfolioContent.stats.skills}+</div>
                                            <div class="text-xs text-gray-600 mt-1 font-medium">Skills</div>
                                        </div>
                                        <div class="text-center p-4 bg-gray-50 rounded-2xl">
                                            <div class="text-3xl font-bold text-purple-600">${portfolioContent.projects.length}</div>
                                            <div class="text-xs text-gray-600 mt-1 font-medium">Projects</div>
                                        </div>
                                        <div class="text-center p-4 bg-gray-50 rounded-2xl">
                                            <div class="text-3xl font-bold text-pink-600">${portfolioContent.stats.years}+</div>
                                            <div class="text-xs text-gray-600 mt-1 font-medium">Years</div>
                                        </div>
                                    </div>
                                    
                                    <!-- Action Buttons -->
                                    <div class="flex gap-3">
                                        <button id="viewDetails" class="flex-1 bg-black hover:bg-gray-800 text-white rounded-full py-4 font-semibold text-sm transition-all shadow-lg">
                                            View Details
                                        </button>
                                        <a href="mailto:${portfolioContent.email}" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full py-4 font-semibold text-sm text-center transition-all shadow-lg">
                                            Contact
                                        </a>
                                    </div>
                                    
                                    <!-- Social Links -->
                                    <div class="flex justify-center gap-4 pt-4">
                                        <a href="${portfolioContent.social.github}" target="_blank" class="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all">
                                            <i class="fab fa-github text-gray-700 text-xl"></i>
                                        </a>
                                        <a href="${portfolioContent.social.linkedin}" target="_blank" class="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all">
                                            <i class="fab fa-linkedin text-gray-700 text-xl"></i>
                                        </a>
                                        ${portfolioContent.social.twitter ? `
                                            <a href="https://twitter.com/${portfolioContent.social.twitter}" target="_blank" class="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all">
                                                <i class="fab fa-twitter text-gray-700 text-xl"></i>
                                            </a>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Detailed View (Hidden Initially) -->
                    <div id="detailView" class="mt-8 hidden opacity-0 transition-opacity duration-500">
                        <div class="bg-white rounded-[2.5rem] shadow-2xl p-12">
                            <button id="backToCard" class="mb-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-all inline-flex items-center gap-2">
                                <i class="fas fa-arrow-left"></i>
                                Back to Card
                            </button>
                            
                            <!-- Skills Section -->
                            <div class="mb-12">
                                <h2 class="text-3xl font-bold text-gray-900 mb-6">Technical Expertise</h2>
                                <p class="text-gray-600 mb-6">Comprehensive skill set organized by domain</p>
                                
                                <div class="bg-white rounded-3xl border border-gray-200 overflow-hidden">
                                    <table class="w-full">
                                        <thead>
                                            <tr class="bg-gray-50 border-b border-gray-200">
                                                <th class="text-left px-6 py-4 font-bold text-gray-900 text-sm uppercase tracking-wider w-1/4">Category</th>
                                                <th class="text-left px-6 py-4 font-bold text-gray-900 text-sm uppercase tracking-wider">Technologies</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${Object.entries(portfolioContent.skills).map(([category, skills], idx) => `
                                                <tr class="${idx !== Object.keys(portfolioContent.skills).length - 1 ? 'border-b border-gray-100' : ''}">
                                                    <td class="px-6 py-4 font-semibold text-gray-800 align-top">
                                                        ${category.toUpperCase().replace('_', ' ')}
                                                    </td>
                                                    <td class="px-6 py-4">
                                                        <div class="flex flex-wrap gap-2">
                                                            ${skills.map(skill => 
                                                                `<span class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium text-gray-700 transition-all cursor-default">${skill}</span>`
                                                            ).join('')}
                                                        </div>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <!-- Experience Section with Service Record Popup -->
                            <div class="mb-12">
                                <div class="flex items-center justify-between mb-6">
                                    <h2 class="text-3xl font-bold text-gray-900">Experience</h2>
                                    <button id="viewServiceRecord" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-semibold transition-all shadow-md">
                                        <i class="fas fa-list-check mr-2"></i>
                                        View Full Service Record
                                    </button>
                                </div>
                                <div class="space-y-8">
                                    ${portfolioContent.experience.slice(0, 2).map(exp => `
                                        <div class="relative pl-8 border-l-2 border-gray-200">
                                            <div class="absolute -left-[9px] top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
                                            <h3 class="text-xl font-bold text-gray-900">${exp.position}</h3>
                                            <div class="text-sm text-gray-600 mt-1 mb-3">
                                                ${exp.company} • ${exp.period}${exp.location ? ` • ${exp.location}` : ''}
                                            </div>
                                            <ul class="space-y-2 text-sm text-gray-700">
                                                ${exp.achievements.slice(0, 2).map(item => 
                                                    `<li class="flex items-start gap-2">
                                                        <i class="fas fa-check text-blue-600 mt-1 text-xs"></i>
                                                        <span>${item}</span>
                                                    </li>`
                                                ).join('')}
                                            </ul>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <!-- Projects Section -->
                            <div class="mb-12">
                                <h2 class="text-3xl font-bold text-gray-900 mb-6">Featured Projects</h2>
                                <div class="grid md:grid-cols-2 gap-6">
                                    ${portfolioContent.projects.slice(0, 4).map(project => `
                                        <div class="bg-gray-50 rounded-3xl p-6 hover:shadow-lg transition-all">
                                            <h3 class="text-lg font-bold text-gray-900 mb-2">${project.title}</h3>
                                            <p class="text-sm text-gray-600 mb-4">${project.description.substring(0, 100)}...</p>
                                            <div class="flex flex-wrap gap-2">
                                                ${project.tags.slice(0, 4).map(tag => 
                                                    `<span class="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700">${tag}</span>`
                                                ).join('')}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <!-- Education & Contact Section -->
                            <div class="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h2 class="text-2xl font-bold text-gray-900 mb-4">Education</h2>
                                    ${portfolioContent.education.map(edu => `
                                        <div class="bg-gray-50 rounded-3xl p-6">
                                            <h3 class="text-lg font-bold text-gray-900">${edu.degree}</h3>
                                            <div class="text-sm text-gray-600 mt-1">
                                                ${edu.institution} • ${edu.year}
                                            </div>
                                            ${edu.description ? `<p class="text-sm text-gray-700 mt-3">${edu.description}</p>` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                                <div>
                                    <h2 class="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
                                    <button id="viewContact" class="w-full bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-3xl p-6 text-left transition-all shadow-lg">
                                        <i class="fas fa-address-card text-2xl mb-3"></i>
                                        <h3 class="text-lg font-bold">Contact Information</h3>
                                        <p class="text-sm opacity-90 mt-1">View all contact details</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Service Record Modal -->
                <div id="serviceRecordModal" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div class="bg-white rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div class="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-[2.5rem] flex items-center justify-between">
                            <h2 class="text-2xl font-bold text-gray-900">Complete Service Record</h2>
                            <button class="closeModal w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all">
                                <i class="fas fa-times text-gray-700"></i>
                            </button>
                        </div>
                        <div class="p-8 space-y-6">
                            ${portfolioContent.experience.map((exp, idx) => `
                                <div class="pb-6 ${idx !== portfolioContent.experience.length - 1 ? 'border-b border-gray-200' : ''}">
                                    <div class="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 class="text-xl font-bold text-gray-900">${exp.position}</h3>
                                            <div class="text-sm text-gray-600 mt-1">
                                                ${exp.company} • ${exp.period}${exp.location ? ` • ${exp.location}` : ''}
                                            </div>
                                        </div>
                                        <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                            ${exp.period.split('-')[0].trim()}
                                        </span>
                                    </div>
                                    <ul class="space-y-2 text-sm text-gray-700">
                                        ${exp.achievements.map(item => 
                                            `<li class="flex items-start gap-2">
                                                <i class="fas fa-check-circle text-blue-600 mt-1"></i>
                                                <span>${item}</span>
                                            </li>`
                                        ).join('')}
                                    </ul>
                                    ${exp.technologies && exp.technologies.length > 0 ? `
                                        <div class="mt-3 flex flex-wrap gap-2">
                                            ${exp.technologies.map(tech => 
                                                `<span class="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">${tech}</span>`
                                            ).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <!-- Contact Modal -->
                <div id="contactModal" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div class="bg-white rounded-[2.5rem] max-w-2xl w-full shadow-2xl">
                        <div class="bg-gradient-to-br from-blue-500 to-purple-500 text-white px-8 py-6 rounded-t-[2.5rem] flex items-center justify-between">
                            <h2 class="text-2xl font-bold">Contact Information</h2>
                            <button class="closeModal w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="p-8 space-y-4">
                            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <i class="fas fa-envelope text-blue-600 text-xl"></i>
                                </div>
                                <div>
                                    <div class="text-xs text-gray-500 font-semibold uppercase">Email</div>
                                    <a href="mailto:${portfolioContent.email}" class="text-gray-900 font-medium hover:text-blue-600">${portfolioContent.email}</a>
                                </div>
                            </div>
                            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <i class="fas fa-phone text-green-600 text-xl"></i>
                                </div>
                                <div>
                                    <div class="text-xs text-gray-500 font-semibold uppercase">Phone</div>
                                    <a href="tel:${portfolioContent.phone}" class="text-gray-900 font-medium hover:text-green-600">${portfolioContent.phone}</a>
                                </div>
                            </div>
                            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                                <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <i class="fas fa-map-marker-alt text-purple-600 text-xl"></i>
                                </div>
                                <div>
                                    <div class="text-xs text-gray-500 font-semibold uppercase">Location</div>
                                    <div class="text-gray-900 font-medium">${portfolioContent.location}</div>
                                </div>
                            </div>
                            <div class="pt-4 border-t border-gray-200">
                                <div class="text-xs text-gray-500 font-semibold uppercase mb-3">Social Links</div>
                                <div class="grid grid-cols-2 gap-3">
                                    <a href="${portfolioContent.social.github}" target="_blank" class="flex items-center gap-3 p-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all">
                                        <i class="fab fa-github text-xl"></i>
                                        <span class="text-sm font-medium">GitHub</span>
                                    </a>
                                    <a href="${portfolioContent.social.linkedin}" target="_blank" class="flex items-center gap-3 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all">
                                        <i class="fab fa-linkedin text-xl"></i>
                                        <span class="text-sm font-medium">LinkedIn</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.attachEventListeners();
    },
    
    attachEventListeners() {
        const viewDetailsBtn = document.getElementById('viewDetails');
        const backBtn = document.getElementById('backToCard');
        const mainCard = document.getElementById('mainCard');
        const detailView = document.getElementById('detailView');
        
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', () => {
                mainCard.style.transform = 'scale(0.95)';
                mainCard.style.opacity = '0';
                
                setTimeout(() => {
                    mainCard.classList.add('hidden');
                    detailView.classList.remove('hidden');
                    setTimeout(() => {
                        detailView.style.opacity = '1';
                    }, 50);
                }, 300);
            });
        }
        
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                detailView.style.opacity = '0';
                
                setTimeout(() => {
                    detailView.classList.add('hidden');
                    mainCard.classList.remove('hidden');
                    mainCard.style.transform = 'scale(1)';
                    mainCard.style.opacity = '1';
                }, 300);
            });
        }
        
        // Service Record Modal
        const viewServiceRecordBtn = document.getElementById('viewServiceRecord');
        const serviceRecordModal = document.getElementById('serviceRecordModal');
        
        if (viewServiceRecordBtn) {
            viewServiceRecordBtn.addEventListener('click', () => {
                serviceRecordModal.classList.remove('hidden');
            });
        }
        
        // Contact Modal
        const viewContactBtn = document.getElementById('viewContact');
        const contactModal = document.getElementById('contactModal');
        
        if (viewContactBtn) {
            viewContactBtn.addEventListener('click', () => {
                contactModal.classList.remove('hidden');
            });
        }
        
        // Close modals
        document.querySelectorAll('.closeModal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('[id$="Modal"]');
                if (modal) {
                    modal.classList.add('hidden');
                }
            });
        });
        
        // Close modals on backdrop click
        [serviceRecordModal, contactModal].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.add('hidden');
                    }
                });
            }
        });
    },
    
    cleanup() {
        // No cleanup needed
    }
};

if (typeof window !== 'undefined') {
    window.AppleTheme = AppleTheme;
}
