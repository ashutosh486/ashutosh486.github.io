// Markdown Book Theme (GitBook-Style)
const BookTheme = {
    name: "Markdown Book",
    
    currentChapter: 'intro',
    
    chapters: [
        { id: 'intro', title: 'Introduction', icon: 'fa-book-open' },
        { id: 'about', title: 'About the Author', icon: 'fa-user' },
        { id: 'skills', title: 'Technical Skills', icon: 'fa-code' },
        { id: 'experience', title: 'Work Experience', icon: 'fa-briefcase' },
        { id: 'projects', title: 'Notable Projects', icon: 'fa-rocket' },
        { id: 'reading', title: 'Currently Reading', icon: 'fa-book' },
        { id: 'education', title: 'Education & Learning', icon: 'fa-graduation-cap' },
        { id: 'contact', title: 'Get in Touch', icon: 'fa-envelope' }
    ],
    
    render() {
        const container = document.getElementById('themeContainer');
        container.innerHTML = `
            <div class="min-h-screen bg-white text-gray-900 flex h-screen overflow-hidden">
                <!-- Sidebar TOC (Fixed, Non-Scrollable) -->
                <div id="sidebar" class="w-72 border-r border-gray-200 bg-gray-50 flex flex-col transition-all duration-300 fixed lg:relative h-full z-40 overflow-hidden">
                    <div class="p-6 border-b border-gray-200 bg-white flex-shrink-0">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                ${portfolioContent.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <h1 class="text-lg font-bold text-gray-900">${portfolioContent.name}</h1>
                                <p class="text-xs text-gray-500">Professional Portfolio</p>
                            </div>
                        </div>
                        <button id="closeSidebar" class="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <nav class="flex-1 overflow-y-auto p-4 flex-shrink min-h-0">
                        <div class="space-y-1">
                            ${this.chapters.map(chapter => `
                                <button 
                                    class="chapter-link w-full text-left px-3 py-2 rounded-lg transition-all ${this.currentChapter === chapter.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}"
                                    data-chapter="${chapter.id}"
                                >
                                    <i class="fas ${chapter.icon} w-5 mr-2 text-sm"></i>
                                    <span class="text-sm">${chapter.title}</span>
                                </button>
                            `).join('')}
                        </div>
                    </nav>
                    
                    <div class="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                        <div class="flex items-center gap-2 mb-3">
                            <a href="${portfolioContent.social.github}" target="_blank" class="flex-1 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-center text-sm transition-colors">
                                <i class="fab fa-github mr-1"></i> GitHub
                            </a>
                            <a href="${portfolioContent.social.linkedin}" target="_blank" class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center text-sm transition-colors">
                                <i class="fab fa-linkedin mr-1"></i> LinkedIn
                            </a>
                        </div>
                        <a href="mailto:${portfolioContent.email}" class="block w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-center text-sm font-semibold transition-all shadow-md">
                            <i class="fas fa-envelope mr-1"></i> Contact Me
                        </a>
                    </div>
                </div>
                
                <!-- Mobile Menu Button -->
                <button id="openSidebar" class="lg:hidden fixed bottom-6 left-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg z-30 flex items-center justify-center transition-transform hover:scale-110">
                    <i class="fas fa-bars text-xl"></i>
                </button>
                
                <!-- Main Content (Only this scrolls) -->
                <div class="flex-1 overflow-y-auto h-full">
                    <div class="max-w-4xl mx-auto px-6 py-12">
                        <div id="content" class="prose prose-lg max-w-none">
                            <!-- Content will be dynamically inserted -->
                        </div>
                        
                        <!-- Chapter Navigation -->
                        <div class="mt-12 pt-6 border-t border-gray-200 flex justify-between items-center">
                            <button id="prevChapter" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <i class="fas fa-arrow-left mr-2"></i>
                                Previous
                            </button>
                            <div class="text-sm text-gray-500">
                                Chapter <span id="chapterNum">1</span> of ${this.chapters.length}
                            </div>
                            <button id="nextChapter" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                Next
                                <i class="fas fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.attachEventListeners();
        this.renderChapter(this.currentChapter);
    },
    
    attachEventListeners() {
        // Chapter navigation
        document.querySelectorAll('.chapter-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const chapterId = e.currentTarget.dataset.chapter;
                this.navigateToChapter(chapterId);
            });
        });
        
        // Previous/Next buttons
        const prevBtn = document.getElementById('prevChapter');
        const nextBtn = document.getElementById('nextChapter');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const currentIndex = this.chapters.findIndex(c => c.id === this.currentChapter);
                if (currentIndex > 0) {
                    this.navigateToChapter(this.chapters[currentIndex - 1].id);
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const currentIndex = this.chapters.findIndex(c => c.id === this.currentChapter);
                if (currentIndex < this.chapters.length - 1) {
                    this.navigateToChapter(this.chapters[currentIndex + 1].id);
                }
            });
        }
        
        // Mobile sidebar toggle
        const sidebar = document.getElementById('sidebar');
        const openBtn = document.getElementById('openSidebar');
        const closeBtn = document.getElementById('closeSidebar');
        
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                sidebar.classList.remove('-translate-x-full');
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                sidebar.classList.add('-translate-x-full');
            });
        }
    },
    
    navigateToChapter(chapterId) {
        this.currentChapter = chapterId;
        this.renderChapter(chapterId);
        
        // Update sidebar active state
        document.querySelectorAll('.chapter-link').forEach(link => {
            if (link.dataset.chapter === chapterId) {
                link.classList.add('bg-blue-100', 'text-blue-700', 'font-semibold');
                link.classList.remove('text-gray-700', 'hover:bg-gray-100');
            } else {
                link.classList.remove('bg-blue-100', 'text-blue-700', 'font-semibold');
                link.classList.add('text-gray-700', 'hover:bg-gray-100');
            }
        });
        
        // Update prev/next buttons
        const currentIndex = this.chapters.findIndex(c => c.id === chapterId);
        const prevBtn = document.getElementById('prevChapter');
        const nextBtn = document.getElementById('nextChapter');
        
        if (prevBtn) prevBtn.disabled = currentIndex === 0;
        if (nextBtn) nextBtn.disabled = currentIndex === this.chapters.length - 1;
        
        document.getElementById('chapterNum').textContent = currentIndex + 1;
        
        // Scroll to top
        document.querySelector('.overflow-y-auto').scrollTo({ top: 0, behavior: 'smooth' });
        
        // Close mobile sidebar
        if (window.innerWidth < 1024) {
            document.getElementById('sidebar').classList.add('-translate-x-full');
        }
    },
    
    renderChapter(chapterId) {
        const contentDiv = document.getElementById('content');
        let content = '';
        
        switch(chapterId) {
            case 'intro':
                content = `
                    <h1>Welcome to My Professional Portfolio</h1>
                    <p class="lead text-xl text-gray-600 mb-6">
                        A comprehensive guide to my experience, skills, and projects in the field of software engineering and machine learning.
                    </p>
                    
                    <div class="bg-blue-50 border-l-4 border-blue-600 p-4 my-6">
                        <p class="text-sm text-blue-900">
                            <strong>📘 About This Book:</strong> This interactive portfolio is structured like a technical book, 
                            allowing you to navigate through different chapters to learn about my professional journey.
                        </p>
                    </div>
                    
                    <h2>What You'll Find Here</h2>
                    <ul>
                        <li><strong>Technical Expertise:</strong> Deep dive into my skills across ML, software engineering, and cloud technologies</li>
                        <li><strong>Work History:</strong> Detailed accounts of my professional experience and contributions</li>
                        <li><strong>Project Showcase:</strong> Real-world applications and implementations</li>
                        <li><strong>Educational Background:</strong> Academic achievements and continuous learning</li>
                    </ul>
                    
                    <h2>Quick Stats</h2>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 my-6 not-prose">
                        <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
                            <div class="text-3xl font-bold text-blue-600">${portfolioContent.stats.skills}+</div>
                            <div class="text-sm text-gray-600 mt-1">Skills</div>
                        </div>
                        <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center">
                            <div class="text-3xl font-bold text-purple-600">${portfolioContent.projects.length}</div>
                            <div class="text-sm text-gray-600 mt-1">Projects</div>
                        </div>
                        <div class="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
                            <div class="text-3xl font-bold text-green-600">${portfolioContent.stats.years}+</div>
                            <div class="text-sm text-gray-600 mt-1">Years Exp.</div>
                        </div>
                        <div class="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg text-center">
                            <div class="text-3xl font-bold text-pink-600">${portfolioContent.education.length}</div>
                            <div class="text-sm text-gray-600 mt-1">Degrees</div>
                        </div>
                    </div>
                    
                    <blockquote>
                        <p>"${portfolioContent.about.tagline}"</p>
                    </blockquote>
                `;
                break;
                
            case 'about':
                content = `
                    <h1>About the Author</h1>
                    <p class="lead text-xl text-gray-600 italic">"${portfolioContent.about.tagline}"</p>
                    <p class="text-gray-700 mt-4">${portfolioContent.about.bio}</p>
                    
                    <h2>Core Interests</h2>
                    <div class="flex flex-wrap gap-2 my-4 not-prose">
                        ${portfolioContent.about.interests.map(interest => 
                            `<span class="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">${interest}</span>`
                        ).join('')}
                    </div>
                    
                    <h2>Professional Philosophy</h2>
                    <p>I believe in building intelligent solutions that make a tangible impact. My approach combines deep technical expertise with a pragmatic focus on delivering real-world value. Whether it's developing GenAI applications, optimizing ML pipelines, or architecting scalable systems, I'm driven by the challenge of turning complex problems into elegant solutions.</p>
                    
                    <div class="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg my-6 border-l-4 border-blue-600">
                        <h3 class="text-lg font-semibold text-gray-900 mb-3">Key Strengths</h3>
                        <ul class="space-y-2 text-gray-700">
                            <li>✅ <strong>ML/AI Mastery:</strong> Deep foundation in machine learning, NLP, and GenAI</li>
                            <li>✅ <strong>Full-Stack Capabilities:</strong> End-to-end development from concept to deployment</li>
                            <li>✅ <strong>Cloud & MLOps:</strong> Expertise in scalable infrastructure and production ML</li>
                            <li>✅ <strong>Innovation Focus:</strong> Passion for building solutions that drive real impact</li>
                        </ul>
                    </div>
                    
                    <h2>Fun Facts</h2>
                    <p>${portfolioContent.about.funFact}</p>
                    
                    <div class="mt-12 pt-6 border-t border-gray-200 not-prose">
                        <div class="text-center">
                            <p class="text-gray-500 text-sm mb-3">With gratitude and excitement for the journey ahead,</p>
                            <div class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2" style="font-family: 'Brush Script MT', cursive;">
                                ${portfolioContent.name}
                            </div>
                            <p class="text-gray-600 text-sm">${portfolioContent.title}</p>
                            <p class="text-gray-500 text-xs mt-1">${portfolioContent.location}</p>
                        </div>
                    </div>
                `;
                break;
                
            case 'skills':
                content = `
                    <h1>Technical Skills</h1>
                    <p class="lead text-xl text-gray-600">A comprehensive overview of my technical expertise across multiple domains.</p>
                    
                    <div class="bg-blue-50 border-l-4 border-blue-600 p-4 my-6">
                        <p class="text-sm text-blue-900">
                            <strong>📚 Format:</strong> Skills organized in a clear table format for easy reference.
                        </p>
                    </div>
                    
                    <h2>Skills Matrix</h2>
                    <div class="not-prose my-6">
                        <table class="w-full border-collapse border border-gray-300 text-sm">
                            <thead>
                                <tr class="bg-gray-100">
                                    <th class="border border-gray-300 px-4 py-3 text-left font-bold text-gray-900 w-1/4">Category</th>
                                    <th class="border border-gray-300 px-4 py-3 text-left font-bold text-gray-900">Technologies & Tools</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(portfolioContent.skills).map(([category, skills], idx) => `
                                    <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
                                        <td class="border border-gray-300 px-4 py-3 font-semibold text-gray-800 align-top">
                                            ${category.toUpperCase().replace('_', ' ')}
                                        </td>
                                        <td class="border border-gray-300 px-4 py-3 text-gray-700">
                                            ${skills.map(skill => 
                                                `<span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium mr-2 mb-2">${skill}</span>`
                                            ).join('')}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <h2>Proficiency Overview</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
                        <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                            <h3 class="font-bold text-blue-900 mb-2">Core Strengths</h3>
                            <ul class="space-y-1 text-sm text-blue-800">
                                <li>• Machine Learning & Deep Learning</li>
                                <li>• Natural Language Processing</li>
                                <li>• Full-Stack Development</li>
                                <li>• Cloud Infrastructure</li>
                            </ul>
                        </div>
                        <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                            <h3 class="font-bold text-purple-900 mb-2">Total Arsenal</h3>
                            <div class="text-4xl font-bold text-purple-700">${portfolioContent.stats.skills}+</div>
                            <p class="text-sm text-purple-800 mt-1">Technologies & Tools</p>
                        </div>
                    </div>
                    
                    <blockquote>
                        <p>💡 <strong>Note:</strong> I'm constantly learning and expanding my skill set. These skills represent my current expertise, with many more in development.</p>
                    </blockquote>
                `;
                break;
                
            case 'experience':
                content = `
                    <h1>Work Experience</h1>
                    <p class="lead text-xl text-gray-600 italic mb-8">A chronological journey through my professional career, showcasing growth, impact, and continuous learning.</p>
                    
                    ${portfolioContent.experience.map((exp, idx) => `
                        <article class="my-12 ${idx > 0 ? 'border-t-2 border-gray-200 pt-12' : ''}">
                            <!-- Header Section -->
                            <header class="mb-6">
                                <h2 class="mb-2">${exp.position}</h2>
                                <div class="flex flex-wrap items-center gap-3 text-base text-gray-600 not-prose">
                                    <span class="font-bold text-blue-600">${exp.company}</span>
                                    <span class="text-gray-400">•</span>
                                    <time datetime="${exp.period}" class="font-medium">${exp.period}</time>
                                    ${exp.location ? `
                                        <span class="text-gray-400">•</span>
                                        <span class="flex items-center gap-1">
                                            <i class="fas fa-map-marker-alt text-gray-400 text-sm"></i>
                                            ${exp.location}
                                        </span>
                                    ` : ''}
                                </div>
                            </header>
                            
                            <!-- Main Content -->
                            <section>
                                <h3 class="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <i class="fas fa-star text-yellow-500 text-sm"></i>
                                    Key Contributions & Impact
                                </h3>
                                <ul class="space-y-3 mb-6">
                                    ${exp.achievements.map(item => `
                                        <li class="leading-relaxed text-gray-700">${item}</li>
                                    `).join('')}
                                </ul>
                            </section>
                            
                            ${exp.technologies && exp.technologies.length > 0 ? `
                                <!-- Tech Stack -->
                                <footer class="mt-6 pt-4 border-t border-gray-100">
                                    <h4 class="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Tech Stack</h4>
                                    <div class="flex flex-wrap gap-2 not-prose">
                                        ${exp.technologies.map(tech => 
                                            `<span class="px-3 py-1.5 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:shadow-md transition-shadow">${tech}</span>`
                                        ).join('')}
                                    </div>
                                </footer>
                            ` : ''}
                        </article>
                    `).join('')}
                    
                    <div class="bg-blue-50 border-l-4 border-blue-600 p-6 my-8 rounded-r-lg">
                        <p class="text-blue-900">
                            <strong>💼 Career Insight:</strong> This experience represents ${portfolioContent.stats.years}+ years of hands-on work in AI/ML and software engineering, with a consistent focus on innovation, leadership, and measurable business impact.
                        </p>
                    </div>
                `;
                break;
                
            case 'projects':
                content = `
                    <h1>Notable Projects</h1>
                    <p class="lead text-xl text-gray-600 italic mb-8">Showcase of significant projects that demonstrate technical innovation, problem-solving, and real-world impact.</p>
                    
                    ${portfolioContent.projects.map((project, idx) => `
                        <article class="my-10 ${idx > 0 ? 'border-t-2 border-gray-200 pt-10' : ''} hover:bg-gray-50 rounded-lg p-6 transition-all">
                            <!-- Project Header -->
                            <header class="mb-4">
                                <div class="flex items-start justify-between gap-4 mb-3">
                                    <h2 class="flex-1 mb-0">${project.title}</h2>
                                    <span class="flex-shrink-0 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full text-xs font-bold">
                                        Project #${idx + 1}
                                    </span>
                                </div>
                                ${project.site ? `
                                    <div class="mt-2">
                                        <a href="https://${project.site}" target="_blank" class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
                                            <i class="fas fa-globe"></i>
                                            <span>${project.site}</span>
                                            <i class="fas fa-external-link-alt text-xs"></i>
                                        </a>
                                    </div>
                                ` : ''}
                            </header>
                            
                            <!-- Description -->
                            <div class="mb-6">
                                <p class="text-lg text-gray-700 leading-relaxed">${project.description}</p>
                            </div>
                            
                            ${project.highlights ? `
                                <!-- Impact & Highlights -->
                                <div class="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-r-lg p-4">
                                    <h3 class="text-base font-bold text-green-900 mb-3 flex items-center gap-2">
                                        <i class="fas fa-trophy text-yellow-500"></i>
                                        Impact & Achievements
                                    </h3>
                                    <ul class="space-y-2 text-sm">
                                        ${project.highlights.map(h => `
                                            <li class="flex items-start gap-2 text-green-900">
                                                <i class="fas fa-check-circle text-green-600 mt-0.5"></i>
                                                <span>${h}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            
                            <!-- Tech Stack -->
                            <footer class="flex flex-wrap items-center gap-3">
                                <span class="text-sm font-semibold text-gray-600">Built with:</span>
                                ${project.tags.map(tag => 
                                    `<span class="px-3 py-1.5 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 text-purple-700 rounded-lg text-sm font-medium">${tag}</span>`
                                ).join('')}
                            </footer>
                        </article>
                    `).join('')}
                    
                    <div class="bg-gradient-to-br from-purple-50 to-blue-50 border-l-4 border-purple-600 p-6 my-8 rounded-r-lg">
                        <p class="text-purple-900">
                            <strong>🚀 Portfolio Note:</strong> These ${portfolioContent.projects.length} projects represent a curated selection of work spanning GenAI, ML/AI, automation, and full-stack development—demonstrating versatility and depth across the technical spectrum.
                        </p>
                    </div>
                `;
                break;
                
            case 'reading':
                content = `
                    <h1>📚 Currently Reading</h1>
                    <p class="lead text-xl text-gray-600 italic mb-8">Books I'm actively engaging with to expand my technical and professional knowledge.</p>
                    
                    ${portfolioContent.currentlyReading.map((book, idx) => `
                        <article class="my-8 ${idx > 0 ? 'border-t-2 border-gray-200 pt-8' : ''} hover:bg-gray-50 rounded-lg p-6 transition-all">
                            <!-- Book Header -->
                            <header class="mb-4">
                                <div class="flex items-start justify-between gap-4 mb-3">
                                    <div class="flex-1">
                                        <h2 class="mb-1">${book.title}</h2>
                                        <p class="text-lg text-gray-600 italic">by ${book.author}</p>
                                    </div>
                                    <span class="flex-shrink-0 px-3 py-1 ${book.status === 'completed' ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'} text-white rounded-full text-sm font-bold">
                                        ${book.status === 'completed' ? '✅ Completed' : '📖 In Progress'}
                                    </span>
                                </div>
                            </header>
                            
                            <!-- Reading Progress -->
                            ${book.status === 'in-progress' ? `
                                <div class="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-sm font-semibold text-blue-900">Reading Progress</span>
                                        <span class="text-sm font-bold text-blue-700">${book.progress}%</span>
                                    </div>
                                    <div class="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                                        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500" style="width: ${book.progress}%"></div>
                                    </div>
                                </div>
                            ` : ''}
                            
                            <!-- Reading Dates -->
                            <div class="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div class="flex items-center gap-2">
                                    <i class="fas fa-calendar-alt text-gray-500"></i>
                                    <span><strong>Started:</strong> ${new Date(book.startDate).toLocaleDateString()}</span>
                                </div>
                                ${book.endDate ? `
                                    <div class="flex items-center gap-2">
                                        <i class="fas fa-calendar-check text-green-500"></i>
                                        <span><strong>Finished:</strong> ${new Date(book.endDate).toLocaleDateString()}</span>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <!-- Notes -->
                            <div class="mb-4">
                                <blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-700">
                                    ${book.notes}
                                </blockquote>
                            </div>
                            
                            <!-- External Link -->
                            ${book.link ? `
                                <footer class="mt-4">
                                    <a href="${book.link}" target="_blank" class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
                                        <i class="fas fa-external-link-alt"></i>
                                        <span>Learn More</span>
                                    </a>
                                </footer>
                            ` : ''}
                        </article>
                    `).join('')}
                    
                    <div class="bg-gradient-to-br from-purple-50 to-blue-50 border-l-4 border-purple-600 p-6 my-8 rounded-r-lg">
                        <p class="text-purple-900">
                            <strong>📖 Reading Philosophy:</strong> Continuous learning through books is essential in the fast-evolving tech landscape. These readings help me stay current with best practices, deepen understanding of complex systems, and broaden my technical perspective.
                        </p>
                    </div>
                `;
                break;
                
            case 'education':
                content = `
                    <h1>Education & Learning</h1>
                    <p class="lead text-xl text-gray-600 italic mb-8">Academic foundation combined with continuous learning—the cornerstone of technical excellence.</p>
                    
                    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-10 border-l-4 border-blue-600">
                        <h2 class="text-2xl font-bold text-blue-900 mb-2">Academic Credentials</h2>
                        ${portfolioContent.education.map((edu, idx) => `
                            <div class="mt-6 ${idx > 0 ? 'pt-6 border-t border-blue-200' : ''}">
                                <h3 class="text-xl font-bold text-blue-800 mb-2">${edu.degree}</h3>
                                <div class="flex flex-wrap items-center gap-3 text-base text-blue-700 mb-3 not-prose">
                                    <span class="font-semibold">${edu.institution}</span>
                                    <span>•</span>
                                    <span>${edu.year}</span>
                                    ${edu.gpa ? `
                                        <span>•</span>
                                        <span class="font-medium">GPA: ${edu.gpa}</span>
                                    ` : ''}
                                    ${edu.location ? `
                                        <span>•</span>
                                        <span>${edu.location}</span>
                                    ` : ''}
                                </div>
                                
                                ${edu.description ? `<p class="text-blue-800 mb-3">${edu.description}</p>` : ''}
                                
                                ${edu.achievements && edu.achievements.length > 0 ? `
                                    <div class="mt-3">
                                        <h4 class="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-2">Key Highlights</h4>
                                        <ul class="space-y-2 text-sm">
                                            ${edu.achievements.map(a => `
                                                <li class="flex items-start gap-2 text-blue-800">
                                                    <i class="fas fa-graduation-cap text-blue-600 mt-0.5"></i>
                                                    <span>${a}</span>
                                                </li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- Certifications -->
                    <div class="mb-10">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6">Professional Certifications</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
                            ${portfolioContent.certifications.map(cert => `
                                <div class="bg-white border-2 border-gray-200 hover:border-purple-400 rounded-xl p-5 transition-all hover:shadow-lg">
                                    <div class="flex items-start gap-3">
                                        <div class="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <i class="fas fa-certificate text-purple-600 text-xl"></i>
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <h3 class="text-base font-bold text-gray-900 mb-1 leading-tight">${cert.title}</h3>
                                            <p class="text-sm text-gray-600 mb-2">${cert.issuer} • ${cert.year}</p>
                                            ${cert.link ? `
                                                <a href="${cert.link}" target="_blank" class="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                                    <i class="fas fa-external-link-alt"></i>
                                                    Verify Certificate
                                                </a>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Patents -->
                    ${portfolioContent.patents && portfolioContent.patents.length > 0 ? `
                    <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 mb-10 border-l-4 border-yellow-500">
                        <h2 class="text-2xl font-bold text-yellow-900 mb-6 flex items-center gap-2">
                            <i class="fas fa-lightbulb text-yellow-600"></i>
                            Intellectual Property
                        </h2>
                        ${portfolioContent.patents.map(patent => `
                            <div class="bg-white/50 rounded-xl p-6 backdrop-blur">
                                <h3 class="text-xl font-bold text-yellow-900 mb-2">${patent.title}</h3>
                                <div class="flex flex-wrap items-center gap-3 text-sm text-yellow-800 mb-3">
                                    <span class="font-mono font-semibold">${patent.number}</span>
                                    <span>•</span>
                                    <span class="px-2 py-1 bg-green-100 text-green-800 rounded font-medium">${patent.status}</span>
                                    <span>•</span>
                                    <span>${patent.year}</span>
                                </div>
                                <p class="text-yellow-900 mb-3">${patent.description}</p>
                                ${patent.link ? `
                                    <a href="${patent.link}" target="_blank" class="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                                        <i class="fas fa-file-pdf"></i>
                                        View Patent Document
                                    </a>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                    
                    <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg my-8">
                        <h3 class="text-lg font-semibold text-gray-900 mb-3">
                            <i class="fas fa-book-reader text-blue-600 mr-2"></i>
                            Continuous Learning
                        </h3>
                        <p class="text-gray-700">
                            Beyond formal education, I actively pursue knowledge through online courses, 
                            technical books, research papers, and hands-on projects. Staying current with 
                            the latest advancements in AI and software engineering is a core part of my 
                            professional development.
                        </p>
                    </div>
                `;
                break;
                
            case 'contact':
                content = `
                    <h1>Get in Touch</h1>
                    <p class="text-xl text-gray-600">
                        I'm always interested in new opportunities, collaborations, and conversations about technology.
                    </p>
                    
                    <div class="grid md:grid-cols-2 gap-6 my-8 not-prose">
                        <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                            <i class="fas fa-envelope text-3xl text-blue-600 mb-3"></i>
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">Email</h3>
                            <a href="mailto:${portfolioContent.email}" class="text-blue-600 hover:underline">${portfolioContent.email}</a>
                        </div>
                        
                        <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                            <i class="fab fa-linkedin text-3xl text-purple-600 mb-3"></i>
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">LinkedIn</h3>
                            <a href="${portfolioContent.social.linkedin}" target="_blank" class="text-purple-600 hover:underline">
                                ${portfolioContent.social.linkedin.replace('https://', '')}
                            </a>
                        </div>
                        
                        <div class="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl">
                            <i class="fab fa-github text-3xl text-gray-900 mb-3"></i>
                            <h3 class="text-lg font-semibold text-gray-900 mb-2">GitHub</h3>
                            <a href="${portfolioContent.social.github}" target="_blank" class="text-gray-900 hover:underline">
                                ${portfolioContent.social.github.replace('https://', '')}
                            </a>
                        </div>
                        
                        ${portfolioContent.social.twitter ? `
                            <div class="bg-gradient-to-br from-sky-50 to-sky-100 p-6 rounded-xl">
                                <i class="fab fa-twitter text-3xl text-sky-600 mb-3"></i>
                                <h3 class="text-lg font-semibold text-gray-900 mb-2">Twitter</h3>
                                <a href="https://twitter.com/${portfolioContent.social.twitter}" target="_blank" class="text-sky-600 hover:underline">
                                    @${portfolioContent.social.twitter}
                                </a>
                            </div>
                        ` : ''}
                    </div>
                    
                    <blockquote>
                        <p>
                            "Whether you're looking for a dedicated engineer to join your team, 
                            a collaborator for an exciting project, or just want to discuss the 
                            latest in AI and software development, I'd love to hear from you!"
                        </p>
                    </blockquote>
                    
                    <div class="text-center my-8">
                        <a href="mailto:${portfolioContent.email}" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold text-lg transition-all shadow-lg">
                            <i class="fas fa-paper-plane"></i>
                            Send Me a Message
                        </a>
                    </div>
                `;
                break;
        }
        
        contentDiv.innerHTML = content;
    },
    
    cleanup() {
        // No cleanup needed for this theme
    }
};

if (typeof window !== 'undefined') {
    window.BookTheme = BookTheme;
}
