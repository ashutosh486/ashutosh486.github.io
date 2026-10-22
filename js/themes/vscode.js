// VSCode Developer Workspace Portfolio Theme
const VSCodeTheme = {
    name: "VSCode Workspace",
    currentFile: 'About.md',
    
    files: {
        'About.md': {
            icon: 'fa-user',
            content: `# About Me

${portfolioContent.about.bio}

## Interests
${portfolioContent.about.interests.map(i => `- ${i}`).join('\n')}

## Fun Fact
${portfolioContent.about.funFact}

---
*Location:* ${portfolioContent.location}  
*Email:* ${portfolioContent.email}  
*Phone:* ${portfolioContent.phone}`
        },
        'Skills.md': {
            icon: 'fa-code',
            content: `# Technical Skills

| Category | Skills |
|----------|--------|
${Object.entries(portfolioContent.skills).map(([cat, skills]) => 
    `| **${cat.charAt(0).toUpperCase() + cat.slice(1).replace('aiml', 'AI/ML').replace('mlops', 'MLOps')}** | ${skills.join(', ')} |`
).join('\n')}`
        },
        'Experience.md': {
            icon: 'fa-briefcase',
            content: `# Work Experience

${portfolioContent.experience.map(exp => `## ${exp.position}
**${exp.company}** | ${exp.duration}  
*${exp.location}*

${exp.achievements.map(a => `- ${a}`).join('\n')}
`).join('\n\n')}`
        },
        'Projects.md': {
            icon: 'fa-folder-open',
            content: `# Projects Portfolio

${portfolioContent.projects.map(proj => `## ${proj.title}

${proj.description}

**Technologies:** ${proj.tags.join(', ')}

**Highlights:**
${proj.highlights.map(h => `- ${h}`).join('\n')}
${proj.site ? `\n**🌐 Live Site:** [${proj.site}](https://${proj.site})` : ''}
`).join('\n\n---\n\n')}`
        },
        'Reading.md': {
            icon: 'fa-book',
            content: `# 📚 Currently Reading

${portfolioContent.currentlyReading.map(book => `## ${book.title}

**Author:** ${book.author}  
**Status:** ${book.status === 'completed' ? '✅ Completed' : '📖 In Progress (' + book.progress + '%)'}  
**Started:** ${book.startDate}  
${book.endDate ? '**Finished:** ' + book.endDate + '\n' : ''}
> ${book.notes}
${book.link ? '\n[Learn More](' + book.link + ')' : ''}
`).join('\n---\n\n')}`
        },
        'Education.md': {
            icon: 'fa-graduation-cap',
            content: `# Education

${portfolioContent.education.map(edu => `## ${edu.degree}
**${edu.institution}**  
*${edu.year}* | GPA: ${edu.gpa}

${edu.achievements.map(a => `- ${a}`).join('\n')}
`).join('\n\n')}`
        },
        'Contact.md': {
            icon: 'fa-envelope',
            content: `# Contact Information

## Get In Touch

I'm always interested in hearing about new opportunities and collaborations.

## Contact Details

**Email:** [${portfolioContent.email}](mailto:${portfolioContent.email})

**Phone:** [${portfolioContent.phone}](tel:${portfolioContent.phone})

**Location:** ${portfolioContent.location}

## Social Media

- [LinkedIn Profile](${portfolioContent.social.linkedin})
- [GitHub Profile](${portfolioContent.social.github})
- [Personal Portfolio](${portfolioContent.social.portfolio})

---

## Open To

Feel free to reach out for:
- Job opportunities
- Collaboration on AI/ML projects
- Speaking engagements
- Technical consulting`
        }
    },
    
    render() {
        const container = document.getElementById('themeContainer');
        container.innerHTML = `
            <div class="flex h-screen bg-[#1e1e1e] text-gray-300 font-mono text-sm">
                <!-- Activity Bar -->
                <div class="w-12 bg-[#333333] flex flex-col items-center py-4 space-y-6">
                    <div class="w-10 h-10 flex items-center justify-center text-white cursor-pointer">
                        <i class="fas fa-bars"></i>
                    </div>
                    <div class="w-10 h-10 flex items-center justify-center text-white bg-[#1e1e1e] rounded cursor-pointer">
                        <i class="fas fa-copy"></i>
                    </div>
                    <div class="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">
                        <i class="fas fa-search"></i>
                    </div>
                    <div class="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">
                        <i class="fas fa-code-branch"></i>
                    </div>
                    <div class="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">
                        <i class="fas fa-play"></i>
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="w-64 bg-[#252526] flex flex-col">
                    <div class="p-4 border-b border-[#1e1e1e]">
                        <h2 class="text-xs text-gray-400 uppercase tracking-wide mb-2">Explorer</h2>
                        <p class="text-white font-semibold">${portfolioContent.name.replace(' ', '_').toUpperCase()}_PORTFOLIO</p>
                    </div>
                    <div class="flex-1 overflow-y-auto">
                        <div class="p-2">
                            ${Object.keys(this.files).map(filename => `
                                <div class="vscode-file flex items-center gap-2 px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer rounded ${filename === this.currentFile ? 'bg-[#2a2d2e]' : ''}" data-file="${filename}">
                                    <i class="fas ${this.files[filename].icon} text-blue-400 text-xs"></i>
                                    <span class="text-sm">${filename}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Bottom Info -->
                    <div class="p-4 border-t border-[#1e1e1e] text-xs text-gray-500">
                        <div class="flex items-center gap-2 mb-2">
                            <i class="fas fa-user-circle"></i>
                            <span>${portfolioContent.name}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="fas fa-code-branch"></i>
                            <span>main</span>
                        </div>
                    </div>
                </div>

                <!-- Main Editor Area -->
                <div class="flex-1 flex flex-col">
                    <!-- Tabs -->
                    <div class="bg-[#252526] border-b border-[#1e1e1e] flex items-center">
                        <div class="tab-item flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] text-white border-r border-[#1e1e1e]">
                            <i class="fas ${this.files[this.currentFile].icon} text-blue-400 text-xs"></i>
                            <span id="currentTab">${this.currentFile}</span>
                        </div>
                    </div>

                    <!-- Editor Content -->
                    <div class="flex-1 overflow-y-auto bg-[#1e1e1e] p-6" id="editorContent">
                        ${this.renderMarkdown(this.files[this.currentFile].content)}
                    </div>

                    <!-- Terminal -->
                    <div class="h-48 bg-[#1e1e1e] border-t border-[#252526] flex flex-col">
                        <div class="bg-[#252526] px-4 py-2 flex items-center gap-4 text-xs">
                            <div class="flex items-center gap-2 text-white">
                                <i class="fas fa-terminal"></i>
                                <span>TERMINAL</span>
                            </div>
                            <div class="text-gray-500">PROBLEMS</div>
                            <div class="text-gray-500">OUTPUT</div>
                            <div class="text-gray-500">DEBUG CONSOLE</div>
                        </div>
                        <div class="flex-1 p-4 overflow-y-auto font-mono text-xs">
                            <div class="text-green-400">ashutosh@portfolio:~$ ls -la</div>
                            <div class="text-gray-400">total 7</div>
                            <div class="text-gray-400">drwxr-xr-x  7 ashutosh  staff  224 ${new Date().toDateString().slice(4)} .</div>
                            <div class="text-gray-400">-rw-r--r--  1 ashutosh  staff  2.1K About.md</div>
                            <div class="text-gray-400">-rw-r--r--  1 ashutosh  staff  1.5K Skills.md</div>
                            <div class="text-gray-400">-rw-r--r--  1 ashutosh  staff  3.2K Experience.md</div>
                            <div class="text-gray-400">-rw-r--r--  1 ashutosh  staff  2.8K Projects.md</div>
                            <div class="text-green-400 mt-2">ashutosh@portfolio:~$ git status</div>
                            <div class="text-gray-400">On branch main</div>
                            <div class="text-gray-400">Your branch is up to date with 'origin/main'.</div>
                            <div class="text-gray-400 mt-1">nothing to commit, working tree clean</div>
                            <div class="text-green-400 mt-2">ashutosh@portfolio:~$ echo "Welcome to my portfolio!"</div>
                            <div class="text-white">Welcome to my portfolio!</div>
                            <div class="text-green-400 mt-2">ashutosh@portfolio:~$ <span class="animate-pulse">▊</span></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.attachEventListeners();
    },
    
    renderMarkdown(content) {
        // Simple markdown to HTML converter with table support
        let html = content;
        
        // Handle tables
        const tableRegex = /\|(.+)\|\n\|[-\s|]+\|\n((?:\|.+\|\n?)+)/g;
        html = html.replace(tableRegex, (match, header, rows) => {
            const headers = header.split('|').map(h => h.trim()).filter(h => h);
            const rowData = rows.trim().split('\n').map(row => 
                row.split('|').map(cell => cell.trim()).filter(cell => cell)
            );
            
            let table = '<table class="w-full my-4 border-collapse"><thead class="bg-[#2d2d2d]"><tr>';
            headers.forEach(h => {
                table += `<th class="border border-gray-700 px-4 py-2 text-left text-cyan-400">${h}</th>`;
            });
            table += '</tr></thead><tbody>';
            rowData.forEach(row => {
                table += '<tr class="border-b border-gray-800">';
                row.forEach(cell => {
                    table += `<td class="border border-gray-700 px-4 py-2 text-gray-300">${cell}</td>`;
                });
                table += '</tr>';
            });
            table += '</tbody></table>';
            return table;
        });
        
        html = html
            .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4 text-blue-400">$1</h1>')
            .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-3 mt-6 text-green-400">$1</h2>')
            .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mb-2 mt-4 text-yellow-400">$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="text-gray-400">$1</em>')
            .replace(/^- (.*$)/gim, '<div class="ml-4 mb-1 text-gray-300">• $1</div>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-blue-400 hover:underline hover:text-blue-300">$1 <i class="fas fa-external-link-alt text-xs"></i></a>')
            .replace(/^---$/gim, '<hr class="my-6 border-gray-700">')
            .replace(/\n\n/g, '</p><p class="mb-3 text-gray-300">')
            .replace(/`([^`]+)`/g, '<code class="bg-[#2d2d2d] px-2 py-1 rounded text-yellow-300">$1</code>');
        
        return `<div class="prose prose-invert max-w-none"><p class="mb-3 text-gray-300">${html}</p></div>`;
    },
    
    attachEventListeners() {
        const fileItems = document.querySelectorAll('.vscode-file');
        fileItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const filename = e.currentTarget.dataset.file;
                this.switchFile(filename);
            });
        });
    },
    
    switchFile(filename) {
        this.currentFile = filename;
        const editorContent = document.getElementById('editorContent');
        const currentTab = document.getElementById('currentTab');
        
        // Update content with fade effect
        editorContent.style.opacity = '0';
        setTimeout(() => {
            editorContent.innerHTML = this.renderMarkdown(this.files[filename].content);
            currentTab.textContent = filename;
            editorContent.style.opacity = '1';
            
            // Update active file in sidebar
            document.querySelectorAll('.vscode-file').forEach(el => {
                el.classList.remove('bg-[#2a2d2e]');
            });
            document.querySelector(`[data-file="${filename}"]`).classList.add('bg-[#2a2d2e]');
        }, 150);
    }
};

if (typeof window !== 'undefined') {
    window.VSCodeTheme = VSCodeTheme;
}
