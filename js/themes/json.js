// JSON Resume / Config File Portfolio Theme
const JsonTheme = {
    name: "JSON Resume",
    
    render() {
        const container = document.getElementById('themeContainer');
        
        // Build the JSON structure
        const resumeJson = {
            "$schema": "https://json.schemastore.org/resume",
            "basics": {
                "name": portfolioContent.name,
                "label": portfolioContent.about.tagline,
                "email": portfolioContent.email,
                "summary": portfolioContent.about.bio,
                "profiles": [
                    {
                        "network": "GitHub",
                        "username": portfolioContent.social.github,
                        "url": `${portfolioContent.social.github}`
                    },
                    {
                        "network": "LinkedIn",
                        "username": portfolioContent.social.linkedin,
                        "url": `${portfolioContent.social.linkedin}`
                    }
                ],
                "interests": portfolioContent.about.interests
            },
            "skills": Object.entries(portfolioContent.skills).map(([category, skills]) => ({
                "name": category.replace('_', ' ').toUpperCase(),
                "keywords": skills
            })),
            "work": portfolioContent.experience.map(exp => ({
                "name": exp.company,
                "position": exp.position,
                "startDate": exp.period.split(' - ')[0] || exp.period,
                "endDate": exp.period.split(' - ')[1] || "Present",
                "location": exp.location || "",
                "highlights": exp.achievements,
                "technologies": exp.technologies || []
            })),
            "projects": portfolioContent.projects.map(project => ({
                "name": project.title,
                "description": project.description,
                "highlights": project.highlights || [],
                "keywords": project.tags,
                ...(project.site && { "url": `https://${project.site}` })
            })),
            "currentlyReading": portfolioContent.currentlyReading.map(book => ({
                "title": book.title,
                "author": book.author,
                "status": book.status,
                "progress": book.progress,
                "startDate": book.startDate,
                ...(book.endDate && { "endDate": book.endDate }),
                "notes": book.notes,
                ...(book.link && { "link": book.link })
            })),
            "education": portfolioContent.education.map(edu => ({
                "institution": edu.institution,
                "area": edu.degree,
                "studyType": edu.degree.includes('PhD') ? 'PhD' : edu.degree.includes('Master') ? 'Masters' : 'Bachelor',
                "endDate": edu.year,
                "score": edu.gpa || ""
            })),
            "certificates": portfolioContent.certifications.map(cert => ({
                "name": cert.title,
                "issuer": cert.issuer,
                "date": cert.year,
                "url": cert.link || ""
            })),
            "patents": (portfolioContent.patents || []).map(patent => ({
                "title": patent.title,
                "number": patent.number,
                "status": patent.status,
                "date": patent.year,
                "url": patent.link || ""
            }))
        };
        
        const jsonString = JSON.stringify(resumeJson, null, 2);
        
        container.innerHTML = `
            <div class="min-h-screen bg-gray-950 text-gray-100">
                <!-- Editor Header -->
                <div class="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="flex items-center gap-2">
                            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div class="flex items-center gap-2 text-sm">
                            <i class="fas fa-file-code text-blue-400"></i>
                            <span class="text-gray-400">resume.json</span>
                            <span class="text-gray-600">•</span>
                            <span class="text-gray-500 text-xs">JSON</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button id="copyJson" class="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs transition-colors flex items-center gap-2">
                            <i class="fas fa-copy"></i>
                            Copy JSON
                        </button>
                        <button id="downloadJson" class="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs transition-colors flex items-center gap-2">
                            <i class="fas fa-download"></i>
                            Download
                        </button>
                        <a href="mailto:${portfolioContent.email}" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-semibold transition-colors">
                            <i class="fas fa-envelope mr-1"></i>
                            Contact
                        </a>
                    </div>
                </div>

                <div class="flex h-[calc(100vh-45px)]">
                    <!-- Sidebar File Explorer -->
                    <div class="w-64 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto">
                        <div class="text-xs font-semibold text-gray-500 uppercase mb-3">Explorer</div>
                        <div class="space-y-1 text-sm">
                            <div class="flex items-center gap-2 text-gray-400 hover:text-gray-200 cursor-pointer p-1 hover:bg-gray-800 rounded">
                                <i class="fas fa-folder text-blue-400"></i>
                                <span>portfolio/</span>
                            </div>
                            <div class="pl-4 space-y-1">
                                <div class="flex items-center gap-2 text-blue-300 bg-gray-800 p-1 rounded">
                                    <i class="fas fa-file-code text-blue-400"></i>
                                    <span>resume.json</span>
                                </div>
                                <div class="flex items-center gap-2 text-gray-500 p-1">
                                    <i class="fas fa-file text-gray-600"></i>
                                    <span>package.json</span>
                                </div>
                                <div class="flex items-center gap-2 text-gray-500 p-1">
                                    <i class="fas fa-file text-gray-600"></i>
                                    <span>README.md</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-8 pt-4 border-t border-gray-800">
                            <div class="text-xs font-semibold text-gray-500 uppercase mb-3">Outline</div>
                            <div class="space-y-2 text-xs">
                                <div class="flex items-center gap-2 text-gray-400 hover:text-gray-200 cursor-pointer" onclick="document.getElementById('basics-line').scrollIntoView({behavior: 'smooth', block: 'center'})">
                                    <i class="fas fa-chevron-right text-xs"></i>
                                    <span>basics</span>
                                </div>
                                <div class="flex items-center gap-2 text-gray-400 hover:text-gray-200 cursor-pointer" onclick="document.getElementById('skills-line').scrollIntoView({behavior: 'smooth', block: 'center'})">
                                    <i class="fas fa-chevron-right text-xs"></i>
                                    <span>skills</span>
                                    <span class="text-gray-600">[${Object.keys(portfolioContent.skills).length}]</span>
                                </div>
                                <div class="flex items-center gap-2 text-gray-400 hover:text-gray-200 cursor-pointer" onclick="document.getElementById('work-line').scrollIntoView({behavior: 'smooth', block: 'center'})">
                                    <i class="fas fa-chevron-right text-xs"></i>
                                    <span>work</span>
                                    <span class="text-gray-600">[${portfolioContent.experience.length}]</span>
                                </div>
                                <div class="flex items-center gap-2 text-gray-400 hover:text-gray-200 cursor-pointer" onclick="document.getElementById('projects-line').scrollIntoView({behavior: 'smooth', block: 'center'})">
                                    <i class="fas fa-chevron-right text-xs"></i>
                                    <span>projects</span>
                                    <span class="text-gray-600">[${portfolioContent.projects.length}]</span>
                                </div>
                                <div class="flex items-center gap-2 text-gray-400 hover:text-gray-200 cursor-pointer" onclick="document.getElementById('education-line').scrollIntoView({behavior: 'smooth', block: 'center'})">
                                    <i class="fas fa-chevron-right text-xs"></i>
                                    <span>education</span>
                                    <span class="text-gray-600">[${portfolioContent.education.length}]</span>
                                </div>
                                <div class="flex items-center gap-2 text-gray-400 hover:text-gray-200 cursor-pointer" onclick="document.getElementById('certificates-line').scrollIntoView({behavior: 'smooth', block: 'center'})">
                                    <i class="fas fa-chevron-right text-xs"></i>
                                    <span>certificates</span>
                                    <span class="text-gray-600">[${portfolioContent.certifications.length}]</span>
                                </div>
                                ${portfolioContent.patents && portfolioContent.patents.length > 0 ? `
                                <div class="flex items-center gap-2 text-gray-400 hover:text-gray-200 cursor-pointer" onclick="document.getElementById('patents-line').scrollIntoView({behavior: 'smooth', block: 'center'})">
                                    <i class="fas fa-chevron-right text-xs"></i>
                                    <span>patents</span>
                                    <span class="text-gray-600">[${portfolioContent.patents.length}]</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <div class="mt-8 pt-4 border-t border-gray-800">
                            <div class="text-xs font-semibold text-gray-500 uppercase mb-3">Links</div>
                            <div class="space-y-2">
                                <a href="${portfolioContent.social.github}" target="_blank" class="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-200 transition-colors">
                                    <i class="fab fa-github"></i>
                                    <span>GitHub Profile</span>
                                </a>
                                <a href="${portfolioContent.social.linkedin}" target="_blank" class="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-200 transition-colors">
                                    <i class="fab fa-linkedin"></i>
                                    <span>LinkedIn Profile</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Main Editor Area -->
                    <div class="flex-1 overflow-hidden flex flex-col">
                        <!-- Editor Tabs -->
                        <div class="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center gap-2 overflow-x-auto">
                            <div class="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-t text-sm">
                                <i class="fas fa-file-code text-blue-400 text-xs"></i>
                                <span class="text-gray-200">resume.json</span>
                                <i class="fas fa-circle text-blue-500 text-[6px]"></i>
                            </div>
                        </div>

                        <!-- Code Editor -->
                        <div class="flex-1 overflow-auto bg-gray-950">
                            <div class="flex font-mono text-sm">
                                <!-- Line Numbers -->
                                <div class="sticky left-0 bg-gray-950 text-right pr-4 pl-4 py-4 text-gray-600 select-none border-r border-gray-800 text-xs">
                                    ${jsonString.split('\n').map((_, i) => `<div class="leading-6">${i + 1}</div>`).join('')}
                                </div>
                                
                                <!-- Code Content -->
                                <pre id="jsonContent" class="flex-1 p-4 text-xs leading-6 overflow-x-auto">${this.syntaxHighlight(jsonString)}</pre>
                            </div>
                        </div>

                        <!-- Status Bar -->
                        <div class="bg-blue-600 px-4 py-1 flex items-center justify-between text-xs">
                            <div class="flex items-center gap-4">
                                <span><i class="fas fa-code-branch mr-1"></i> main</span>
                                <span><i class="fas fa-check-circle mr-1"></i> JSON Valid</span>
                                <span>Lines: ${jsonString.split('\n').length}</span>
                                <span>Characters: ${jsonString.length}</span>
                            </div>
                            <div class="flex items-center gap-4">
                                <span>UTF-8</span>
                                <span>LF</span>
                                <span>JSON</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.attachEventListeners(jsonString);
    },
    
    syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            let cls = '<span class="text-orange-400">'; // number
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = '<span id="' + match.slice(1, -2) + '-line" class="text-blue-400">'; // key
                } else {
                    cls = '<span class="text-green-400">'; // string
                }
            } else if (/true|false/.test(match)) {
                cls = '<span class="text-purple-400">'; // boolean
            } else if (/null/.test(match)) {
                cls = '<span class="text-red-400">'; // null
            }
            return cls + match + '</span>';
        });
    },
    
    attachEventListeners(jsonString) {
        const copyBtn = document.getElementById('copyJson');
        const downloadBtn = document.getElementById('downloadJson');
        
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(jsonString);
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyBtn.classList.add('bg-green-600');
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy JSON';
                    copyBtn.classList.remove('bg-green-600');
                }, 2000);
            });
        }
        
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${portfolioContent.name.replace(/\s+/g, '_')}_resume.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                downloadBtn.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
                downloadBtn.classList.add('bg-green-600');
                setTimeout(() => {
                    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
                    downloadBtn.classList.remove('bg-green-600');
                }, 2000);
            });
        }
    },
    
    cleanup() {
        // No cleanup needed
    }
};

if (typeof window !== 'undefined') {
    window.JsonTheme = JsonTheme;
}
