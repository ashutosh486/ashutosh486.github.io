// Git Diff Resume Theme
const GitDiffTheme = {
    name: "Git Diff Resume",
    
    render() {
        const container = document.getElementById('themeContainer');
        container.innerHTML = `
            <div class="min-h-screen bg-gray-900 text-gray-100 font-mono text-sm">
                <!-- Git Header -->
                <div class="bg-gray-950 border-b border-gray-800 px-6 py-4">
                    <div class="max-w-6xl mx-auto">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <i class="fab fa-git-alt text-orange-500 text-2xl"></i>
                                <div>
                                    <div class="text-xs text-gray-500">commit <span class="text-yellow-400">a1b2c3d4e5f6</span></div>
                                    <div class="text-base">
                                        <span class="text-green-400">Author:</span> ${portfolioContent.name} &lt;${portfolioContent.email}&gt;
                                    </div>
                                    <div class="text-xs text-gray-500">Date: ${new Date().toUTCString()}</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <a href="${portfolioContent.social.github}" target="_blank" class="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs transition-colors">
                                    <i class="fab fa-github mr-1"></i> GitHub
                                </a>
                                <a href="${portfolioContent.social.linkedin}" target="_blank" class="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs transition-colors">
                                    <i class="fab fa-linkedin mr-1"></i> LinkedIn
                                </a>
                                <a href="mailto:${portfolioContent.email}" class="px-3 py-1.5 bg-green-600 hover:bg-green-700 border border-green-500 rounded text-xs transition-colors font-semibold">
                                    <i class="fas fa-envelope mr-1"></i> Contact
                                </a>
                            </div>
                        </div>
                        <div class="mt-3 pl-12">
                            <div class="text-white font-bold">feat: Add ${portfolioContent.title} to team 🚀</div>
                        </div>
                    </div>
                </div>

                <div class="max-w-6xl mx-auto px-6 py-6">
                    <!-- Diff Stats -->
                    <div class="bg-gray-950 border border-gray-800 rounded-lg p-4 mb-6">
                        <div class="text-xs text-gray-500 mb-2">Showing changes with ${portfolioContent.stats.skills} additions</div>
                        <div class="space-y-1">
                            <div class="flex items-center gap-3 text-xs">
                                <span class="text-gray-400 w-48">profile/about.json</span>
                                <div class="flex-1 flex items-center gap-2">
                                    <div class="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden">
                                        <div class="bg-green-500 h-full" style="width: 100%"></div>
                                    </div>
                                    <span class="text-green-400">+${portfolioContent.about.bio.split(' ').length} lines</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-3 text-xs">
                                <span class="text-gray-400 w-48">skills/*.json</span>
                                <div class="flex-1 flex items-center gap-2">
                                    <div class="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden">
                                        <div class="bg-green-500 h-full" style="width: 100%"></div>
                                    </div>
                                    <span class="text-green-400">+${portfolioContent.stats.skills} skills</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-3 text-xs">
                                <span class="text-gray-400 w-48">projects/*.md</span>
                                <div class="flex-1 flex items-center gap-2">
                                    <div class="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden">
                                        <div class="bg-green-500 h-full" style="width: 100%"></div>
                                    </div>
                                    <span class="text-green-400">+${portfolioContent.projects.length} projects</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-3 text-xs">
                                <span class="text-gray-400 w-48">experience/*.yaml</span>
                                <div class="flex-1 flex items-center gap-2">
                                    <div class="flex-1 bg-gray-800 h-2 rounded-full overflow-hidden">
                                        <div class="bg-green-500 h-full" style="width: 100%"></div>
                                    </div>
                                    <span class="text-green-400">+${portfolioContent.experience.length} positions</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- File Diffs -->
                    
                    <!-- About Section -->
                    <div class="bg-gray-950 border border-gray-800 rounded-lg mb-6 overflow-hidden">
                        <div class="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
                            <span class="text-xs">
                                <i class="fas fa-file-alt text-blue-400 mr-2"></i>
                                profile/about.json
                            </span>
                            <span class="text-xs text-gray-500">Binary file modified</span>
                        </div>
                        <div class="p-4">
                            <div class="flex">
                                <div class="w-12 text-right pr-4 text-gray-600 select-none">
                                    ${[...Array(portfolioContent.about.bio.split('.').length + 5)].map((_, i) => `<div>${i + 1}</div>`).join('')}
                                </div>
                                <div class="flex-1">
                                    <div class="text-green-400">+{</div>
                                    <div class="text-green-400">+  "name": "${portfolioContent.name}",</div>
                                    <div class="text-green-400">+  "email": "${portfolioContent.email}",</div>
                                    <div class="text-green-400">+  "tagline": "${portfolioContent.about.tagline}",</div>
                                    <div class="text-green-400">+  "bio": "${portfolioContent.about.bio.substring(0, 100)}...",</div>
                                    <div class="text-green-400">+  "interests": [</div>
                                    ${portfolioContent.about.interests.map(interest => 
                                        `<div class="text-green-400">+    "${interest}",</div>`
                                    ).join('')}
                                    <div class="text-green-400">+  ]</div>
                                    <div class="text-green-400">+}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Skills Section -->
                    <div class="bg-gray-950 border border-gray-800 rounded-lg mb-6 overflow-hidden">
                        <div class="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
                            <span class="text-xs">
                                <i class="fas fa-file-code text-purple-400 mr-2"></i>
                                skills/technical.yaml
                            </span>
                            <span class="text-xs text-green-400">+${portfolioContent.stats.skills} additions</span>
                        </div>
                        <div class="p-4">
                            ${Object.entries(portfolioContent.skills).map(([category, skills]) => `
                                <div class="mb-4">
                                    <div class="text-green-400">+${category}:</div>
                                    ${skills.map(skill => 
                                        `<div class="text-green-400 pl-4">+  - ${skill}</div>`
                                    ).join('')}
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Experience Section -->
                    <div class="bg-gray-950 border border-gray-800 rounded-lg mb-6 overflow-hidden">
                        <div class="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
                            <span class="text-xs">
                                <i class="fas fa-file-alt text-yellow-400 mr-2"></i>
                                experience/work-history.md
                            </span>
                            <span class="text-xs text-green-400">+${portfolioContent.experience.length} positions</span>
                        </div>
                        <div class="p-4">
                            ${portfolioContent.experience.map((exp, idx) => `
                                <div class="mb-6 ${idx > 0 ? 'border-t border-gray-800 pt-6' : ''}">
                                    <div class="text-green-400">+## ${exp.position}</div>
                                    <div class="text-green-400">+</div>
                                    <div class="text-green-400">+**Company:** ${exp.company}</div>
                                    <div class="text-green-400">+**Period:** ${exp.period}</div>
                                    ${exp.location ? `<div class="text-green-400">+**Location:** ${exp.location}</div>` : ''}
                                    <div class="text-green-400">+</div>
                                    <div class="text-green-400">+### Responsibilities</div>
                                    <div class="text-green-400">+</div>
                                    ${exp.achievements.slice(0, 3).map(item => 
                                        `<div class="text-green-400">+- ${item}</div>`
                                    ).join('')}
                                    ${exp.technologies && exp.technologies.length > 0 ? `
                                        <div class="text-green-400">+</div>
                                        <div class="text-green-400">+**Tech Stack:** ${exp.technologies.join(', ')}</div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Projects Section -->
                    <div class="bg-gray-950 border border-gray-800 rounded-lg mb-6 overflow-hidden">
                        <div class="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
                            <span class="text-xs">
                                <i class="fas fa-folder text-green-400 mr-2"></i>
                                projects/
                            </span>
                            <span class="text-xs text-green-400">+${portfolioContent.projects.length} projects</span>
                        </div>
                        <div class="p-4">
                            ${portfolioContent.projects.slice(0, 4).map(project => `
                                <div class="mb-4">
                                    <div class="text-green-400">+### ${project.title}</div>
                                    <div class="text-green-400">+</div>
                                    <div class="text-green-400">+</div>
                                    <div class="text-green-400">+${project.description}</div>
                                    <div class="text-green-400">+</div>
                                    <div class="text-green-400">+**Tags:** \`${project.tags.join('`, `')}\`</div>
                                    <div class="text-green-400">+</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Education Section -->
                    <div class="bg-gray-950 border border-gray-800 rounded-lg mb-6 overflow-hidden">
                        <div class="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
                            <span class="text-xs">
                                <i class="fas fa-graduation-cap text-blue-400 mr-2"></i>
                                education/credentials.json
                            </span>
                            <span class="text-xs text-green-400">+${portfolioContent.education.length} degrees</span>
                        </div>
                        <div class="p-4">
                            <div class="text-green-400">+[</div>
                            ${portfolioContent.education.map((edu, idx) => `
                                <div class="pl-4">
                                    <div class="text-green-400">+  {</div>
                                    <div class="text-green-400 pl-4">+    "degree": "${edu.degree}",</div>
                                    <div class="text-green-400 pl-4">+    "institution": "${edu.institution}",</div>
                                    <div class="text-green-400 pl-4">+    "year": "${edu.year}"</div>
                                    <div class="text-green-400">+  }${idx < portfolioContent.education.length - 1 ? ',' : ''}</div>
                                </div>
                            `).join('')}
                            <div class="text-green-400">+]</div>
                        </div>
                    </div>

                    <!-- Certifications Section -->
                    <div class="bg-gray-950 border border-gray-800 rounded-lg mb-6 overflow-hidden">
                        <div class="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
                            <span class="text-xs">
                                <i class="fas fa-certificate text-purple-400 mr-2"></i>
                                certifications/professional.json
                            </span>
                            <span class="text-xs text-green-400">+${portfolioContent.certifications.length} certifications</span>
                        </div>
                        <div class="p-4">
                            <div class="text-green-400">+[</div>
                            ${portfolioContent.certifications.map((cert, idx) => `
                                <div class="pl-4">
                                    <div class="text-green-400">+  {</div>
                                    <div class="text-green-400 pl-4">+    "title": "${cert.title}",</div>
                                    <div class="text-green-400 pl-4">+    "issuer": "${cert.issuer}",</div>
                                    <div class="text-green-400 pl-4">+    "year": "${cert.year}"</div>
                                    <div class="text-green-400">+  }${idx < portfolioContent.certifications.length - 1 ? ',' : ''}</div>
                                </div>
                            `).join('')}
                            <div class="text-green-400">+]</div>
                        </div>
                    </div>

                    <!-- Patents Section -->
                    ${portfolioContent.patents && portfolioContent.patents.length > 0 ? `
                    <div class="bg-gray-950 border border-gray-800 rounded-lg mb-6 overflow-hidden">
                        <div class="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
                            <span class="text-xs">
                                <i class="fas fa-lightbulb text-yellow-400 mr-2"></i>
                                patents/intellectual-property.json
                            </span>
                            <span class="text-xs text-green-400">+${portfolioContent.patents.length} patent(s)</span>
                        </div>
                        <div class="p-4">
                            <div class="text-green-400">+[</div>
                            ${portfolioContent.patents.map((patent, idx) => `
                                <div class="pl-4">
                                    <div class="text-green-400">+  {</div>
                                    <div class="text-green-400 pl-4">+    "title": "${patent.title}",</div>
                                    <div class="text-green-400 pl-4">+    "number": "${patent.number}",</div>
                                    <div class="text-green-400 pl-4">+    "status": "${patent.status}",</div>
                                    <div class="text-green-400 pl-4">+    "year": "${patent.year}"</div>
                                    <div class="text-green-400">+  }${idx < portfolioContent.patents.length - 1 ? ',' : ''}</div>
                                </div>
                            `).join('')}
                            <div class="text-green-400">+]</div>
                        </div>
                    </div>
                    ` : ''}

                    <!-- Footer -->
                    <div class="bg-gray-950 border border-gray-800 rounded-lg p-4 text-center">
                        <div class="text-xs text-gray-500 mb-2">
                            <i class="fas fa-code-branch text-orange-500 mr-2"></i>
                            End of diff • Ready to merge
                        </div>
                        <a href="mailto:${portfolioContent.email}" class="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold text-sm transition-all">
                            <i class="fas fa-check mr-2"></i>
                            Approve & Merge (Hire Me)
                        </a>
                    </div>
                </div>
            </div>
        `;
    },
    
    cleanup() {
        // No cleanup needed
    }
};

if (typeof window !== 'undefined') {
    window.GitDiffTheme = GitDiffTheme;
}
