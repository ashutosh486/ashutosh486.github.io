// Fake Interactive Notebook Portfolio Theme
const NotebookTheme = {
    name: "Interactive Notebook",
    
    cells: [
        {
            type: 'markdown',
            content: `# ${portfolioContent.name} - Portfolio Notebook\n\nWelcome to my interactive portfolio! This notebook demonstrates my professional journey through code and data.\n\n**Role:** ${portfolioContent.title}  \n**Location:** ${portfolioContent.location}  \n**Contact:** ${portfolioContent.email}`
        },
        {
            type: 'code',
            content: `# Import required libraries\nimport pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nfrom datetime import datetime\n\nprint("Portfolio initialized successfully!")\nprint(f"Last updated: {datetime.now().strftime('%Y-%m-%d')}")`,
            output: `Portfolio initialized successfully!\nLast updated: 2025-11-25`,
            executed: true
        },
        {
            type: 'markdown',
            content: `## About Me\n\n${portfolioContent.about.bio}`
        },
        {
            type: 'code',
            content: `# Personal Information\npersonal_info = {\n    'name': '${portfolioContent.name}',\n    'title': '${portfolioContent.title}',\n    'location': '${portfolioContent.location}',\n    'interests': ${JSON.stringify(portfolioContent.about.interests)}\n}\n\nfor key, value in personal_info.items():\n    print(f"{key.capitalize()}: {value}")`,
            output: `Name: ${portfolioContent.name}\nTitle: ${portfolioContent.title}\nLocation: ${portfolioContent.location}\nInterests: ${portfolioContent.about.interests.join(', ')}`,
            executed: false
        },
        {
            type: 'markdown',
            content: `## Technical Skills\n\nHere's a breakdown of my technical expertise across different domains:`
        },
        {
            type: 'code',
            content: `# Skills Analysis\nskills_data = ${JSON.stringify(portfolioContent.skills, null, 2)}\n\n# Count skills by category\nfor category, skills in skills_data.items():\n    print(f"\\n{category.upper()}:")\n    print(f"  Total skills: {len(skills)}")\n    print(f"  Skills: {', '.join(skills)}")\n\nprint(f"\\nTotal skill categories: {len(skills_data)}")`,
            output: Object.entries(portfolioContent.skills).map(([cat, skills]) => 
                `\n${cat.toUpperCase()}:\n  Total skills: ${skills.length}\n  Skills: ${skills.join(', ')}`
            ).join('') + `\n\nTotal skill categories: ${Object.keys(portfolioContent.skills).length}`,
            executed: false
        },
        {
            type: 'markdown',
            content: `## Work Experience\n\nMy professional journey spans multiple organizations and roles:`
        },
        {
            type: 'code',
            content: `# Experience Timeline\nexperience_data = [\n${portfolioContent.experience.map(exp => 
    `    {'company': '${exp.company}', 'position': '${exp.position}', 'duration': '${exp.duration}'}`
).join(',\n')}\n]\n\ndf_experience = pd.DataFrame(experience_data)\nprint(f"Total positions: {len(df_experience)}")\nprint("\\nExperience Summary:")\nfor idx, exp in enumerate(experience_data, 1):\n    print(f"{idx}. {exp['position']} at {exp['company']}")\n    print(f"   Duration: {exp['duration']}")`,
            output: `Total positions: ${portfolioContent.experience.length}\n\nExperience Summary:\n` + 
            portfolioContent.experience.map((exp, i) => 
                `${i+1}. ${exp.position} at ${exp.company}\n   Duration: ${exp.duration}`
            ).join('\n'),
            executed: false
        },
        {
            type: 'markdown',
            content: `### Key Achievements\n\nHighlights from my most recent role:`
        },
        {
            type: 'code',
            content: `# Recent Achievements\nrecent_achievements = ${JSON.stringify(portfolioContent.experience[0].achievements, null, 2)}\n\nprint(f"Company: ${portfolioContent.experience[0].company}")\nprint(f"Position: ${portfolioContent.experience[0].position}\\n")\nprint("Key Achievements:")\nfor i, achievement in enumerate(recent_achievements, 1):\n    print(f"{i}. {achievement}")`,
            output: `Company: ${portfolioContent.experience[0].company}\nPosition: ${portfolioContent.experience[0].position}\n\nKey Achievements:\n` +
            portfolioContent.experience[0].achievements.map((a, i) => `${i+1}. ${a}`).join('\n'),
            executed: false
        },
        {
            type: 'markdown',
            content: `## Projects Portfolio\n\nA collection of my most impactful projects:`
        },
        {
            type: 'code',
            content: `# Projects Analysis\nprojects = [\n${portfolioContent.projects.slice(0, 3).map(proj => 
    `    {'title': '${proj.title}', 'tags': ${JSON.stringify(proj.tags)}, 'highlights': ${JSON.stringify(proj.highlights)}${proj.site ? `, 'site': '${proj.site}'` : ''}}`
).join(',\n')}\n]\n\nprint(f"Total featured projects: {len(projects)}\\n")\n\nfor i, proj in enumerate(projects, 1):\n    print(f"[{i}] {proj['title']}")\n    if 'site' in proj:\n        print(f"    🌐 Site: {proj['site']}")\n    print(f"    Technologies: {', '.join(proj['tags'])}")\n    print(f"    Highlights: {proj['highlights'][0]}")\n    print()`,
            output: `Total featured projects: 3\n\n` + 
            portfolioContent.projects.slice(0, 3).map((proj, i) => 
                `[${i+1}] ${proj.title}\n${proj.site ? '    🌐 Site: ' + proj.site + '\n' : ''}    Technologies: ${proj.tags.join(', ')}\n    Highlights: ${proj.highlights[0]}\n`
            ).join('\n'),
            executed: false
        },
        {
            type: 'markdown',
            content: `## 📚 Currently Reading\n\nBooks I'm actively reading to expand my knowledge:`
        },
        {
            type: 'code',
            content: `# Reading List\nreading_list = [\n${portfolioContent.currentlyReading.map(book => 
    `    {'title': '${book.title}', 'author': '${book.author}', 'status': '${book.status}', 'progress': ${book.progress}}`
).join(',\n')}\n]\n\nprint(f"Currently tracking: {len(reading_list)} books\\n")\n\nfor i, book in enumerate(reading_list, 1):\n    status_emoji = "✅" if book['status'] == 'completed' else "📖"\n    status_text = "Completed" if book['status'] == 'completed' else f"In Progress ({book['progress']}%)"\n    print(f"{status_emoji} [{i}] {book['title']}")\n    print(f"     Author: {book['author']}")\n    print(f"     Status: {status_text}")\n    print()`,
            output: `Currently tracking: ${portfolioContent.currentlyReading.length} books\n\n` +
            portfolioContent.currentlyReading.map((book, i) => {
                const emoji = book.status === 'completed' ? '✅' : '📖';
                const status = book.status === 'completed' ? 'Completed' : `In Progress (${book.progress}%)`;
                return `${emoji} [${i+1}] ${book.title}\n     Author: ${book.author}\n     Status: ${status}\n`;
            }).join('\n'),
            executed: false
        },
        {
            type: 'markdown',
            content: `## Education & Certifications\n\nAcademic background and professional certifications:`
        },
        {
            type: 'code',
            content: `# Education\neducation = ${JSON.stringify(portfolioContent.education[0], null, 2)}\n\nprint("EDUCATION")\nprint("="*50)\nprint(f"Degree: {education['degree']}")\nprint(f"Institution: {education['institution']}")\nprint(f"Duration: {education['duration']}")\nprint(f"GPA: {education['gpa']}")\n\n# Certifications\ncertifications = ${JSON.stringify(portfolioContent.certifications.map(c => c.title))}\n\nprint("\\nCERTIFICATIONS")\nprint("="*50)\nfor i, cert in enumerate(certifications, 1):\n    print(f"{i}. {cert}")`,
            output: `EDUCATION\n==================================================\nDegree: ${portfolioContent.education[0].degree}\nInstitution: ${portfolioContent.education[0].institution}\nDuration: ${portfolioContent.education[0].duration}\nGPA: ${portfolioContent.education[0].gpa}\n\nCERTIFICATIONS\n==================================================\n` +
            portfolioContent.certifications.map((c, i) => `${i+1}. ${c.title}`).join('\n'),
            executed: false
        },
        {
            type: 'markdown',
            content: `## Contact Information\n\nLet's connect! Feel free to reach out through any of these channels:`
        },
        {
            type: 'code',
            content: `# Contact Details\ncontact = {\n    'Email': '${portfolioContent.email}',\n    'Phone': '${portfolioContent.phone}',\n    'LinkedIn': '${portfolioContent.social.linkedin}',\n    'GitHub': '${portfolioContent.social.github}'\n}\n\nprint("CONTACT INFORMATION")\nprint("="*50)\nfor platform, details in contact.items():\n    print(f"{platform:.<20} {details}")\n\nprint("\\n✓ Open to new opportunities and collaborations!")`,
            output: `CONTACT INFORMATION\n==================================================\nEmail............... ${portfolioContent.email}\nPhone............... ${portfolioContent.phone}\nLinkedIn............ ${portfolioContent.social.linkedin}\nGitHub.............. ${portfolioContent.social.github}\n\n✓ Open to new opportunities and collaborations!`,
            executed: false
        }
    ],
    
    render() {
        const container = document.getElementById('themeContainer');
        container.innerHTML = `
            <div class="min-h-screen bg-white">
                <!-- Notebook Header -->
                <div class="bg-gray-100 border-b border-gray-300 px-6 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <i class="fas fa-book text-orange-500 text-2xl"></i>
                        <div>
                            <h1 class="text-lg font-semibold text-gray-800">${portfolioContent.name.replace(' ', '_')}_Portfolio.ipynb</h1>
                            <p class="text-xs text-gray-600">Interactive Portfolio Notebook • Click <i class="fas fa-play text-orange-500 text-xs"></i> to run cells</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button id="runAllBtn" class="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-all flex items-center gap-2 shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                            <i id="runAllIcon" class="fas fa-play"></i>
                            <span id="runAllText">Run All</span>
                        </button>
                        <a href="mailto:${portfolioContent.email}" class="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg text-sm font-bold transition-all shadow hover:shadow-md">
                            <i class="fas fa-rocket mr-1"></i> Hire Me
                        </a>
                    </div>
                </div>

                <!-- Notebook Cells -->
                <div class="max-w-5xl mx-auto py-8">
                    ${this.cells.map((cell, index) => this.renderCell(cell, index)).join('')}
                </div>
            </div>
        `;
        
        this.attachEventListeners();
    },
    
    renderCell(cell, index) {
        if (cell.type === 'markdown') {
            return `
                <div class="notebook-cell mb-4 group" data-index="${index}">
                    <div class="flex">
                        <div class="w-16 flex-shrink-0 text-right pr-4 pt-2">
                            <span class="text-xs text-gray-400"></span>
                        </div>
                        <div class="flex-1 border border-transparent hover:border-blue-300 rounded p-4 markdown-cell">
                            ${this.renderMarkdown(cell.content)}
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="notebook-cell mb-4 group" data-index="${index}" tabindex="0">
                    <div class="flex">
                        <div class="w-20 flex-shrink-0 text-right pr-4 pt-2 flex items-start justify-end gap-2">
                            <button class="${cell.executed ? 'rerun-cell-icon' : 'run-cell-icon'} text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded p-1 transition-colors" data-index="${index}" title="${cell.executed ? 'Re-run cell' : 'Run cell'}">
                                <i class="fas ${cell.executed ? 'fa-redo' : 'fa-play'} text-xs"></i>
                            </button>
                            <span class="text-xs font-mono text-blue-600">In [${cell.executed ? index : ' '}]:</span>
                        </div>
                        <div class="flex-1">
                            <div class="border border-gray-300 rounded overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                                <pre class="bg-gray-50 p-4 font-mono text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap break-words"><code>${cell.content}</code></pre>
                                ${cell.executed ? `
                                    <div class="border-t border-gray-300 bg-white">
                                        <div class="flex items-start">
                                            <div class="w-20 text-right pr-4 pt-2 flex-shrink-0 flex items-start justify-end gap-2">
                                                <span class="text-xs font-mono text-red-600">Out[${index}]:</span>
                                            </div>
                                            <pre class="flex-1 p-4 font-mono text-sm text-gray-700 overflow-x-auto whitespace-pre-wrap break-words" id="output-${index}">${cell.output || ''}</pre>
                                        </div>
                                    </div>
                                ` : `
                                    <div class="bg-gray-100 px-4 py-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button class="run-cell text-xs text-blue-600 hover:text-blue-800 font-medium" data-index="${index}">
                                            <i class="fas fa-play mr-1"></i> Run cell
                                        </button>
                                        <span class="text-xs text-gray-500">Ctrl+Enter to run | Shift+Enter for next</span>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    
    renderMarkdown(content) {
        return content
            .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4 text-gray-900">$1</h1>')
            .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-3 mt-6 text-gray-800">$1</h2>')
            .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mb-2 mt-4 text-gray-700">$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
            .replace(/\n\n/g, '</p><p class="mb-3 text-gray-700">')
            .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-red-600">$1</code>');
    },
    
    attachEventListeners() {
        // Individual cell run buttons (text)
        document.querySelectorAll('.run-cell').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.executeCell(index);
            });
        });
        
        // Individual cell run buttons (icon)
        document.querySelectorAll('.run-cell-icon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.executeCell(index);
            });
        });
        
        // Re-run cell buttons
        document.querySelectorAll('.rerun-cell-icon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.rerunCell(index);
            });
        });
        
        // Run All button
        const runAllBtn = document.getElementById('runAllBtn');
        if (runAllBtn) {
            runAllBtn.addEventListener('click', () => {
                this.runAllCells();
            });
        }
        
        // Keyboard shortcuts for code cells
        document.querySelectorAll('.notebook-cell').forEach((cellEl, index) => {
            const cell = this.cells[index];
            if (cell.type === 'code') {
                cellEl.addEventListener('keydown', (e) => {
                    // Ctrl+Enter or Cmd+Enter to run cell
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        e.preventDefault();
                        if (cell.executed) {
                            this.rerunCell(index);
                        } else {
                            this.executeCell(index);
                        }
                    }
                    // Shift+Enter to run cell and move to next
                    else if (e.shiftKey && e.key === 'Enter') {
                        e.preventDefault();
                        if (cell.executed) {
                            this.rerunCell(index);
                        } else {
                            this.executeCell(index);
                        }
                        // Focus next cell after execution
                        setTimeout(() => {
                            const nextCell = document.querySelector(`[data-index="${index + 1}"]`);
                            if (nextCell) {
                                nextCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                nextCell.focus();
                            }
                        }, 900);
                    }
                });
            }
        });
    },
    
    runAllCells() {
        const runAllBtn = document.getElementById('runAllBtn');
        const runAllIcon = document.getElementById('runAllIcon');
        const runAllText = document.getElementById('runAllText');
        
        // Disable button and show spinner
        runAllBtn.disabled = true;
        runAllIcon.className = 'fas fa-spinner fa-spin';
        runAllText.textContent = 'Running...';
        
        let delay = 0;
        let executedCount = 0;
        const codeCells = this.cells.filter(c => c.type === 'code');
        let lastCodeCellIndex = -1;
        
        // Find the last code cell index
        for (let i = this.cells.length - 1; i >= 0; i--) {
            if (this.cells[i].type === 'code') {
                lastCodeCellIndex = i;
                break;
            }
        }
        
        this.cells.forEach((cell, index) => {
            if (cell.type === 'code') {
                setTimeout(() => {
                    const isLastCell = index === lastCodeCellIndex;
                    
                    if (cell.executed) {
                        this.rerunCell(index, isLastCell);
                    } else {
                        this.executeCell(index, isLastCell);
                    }
                    executedCount++;
                    
                    // Update progress
                    runAllText.textContent = `Running... (${executedCount}/${codeCells.length})`;
                    
                    // Re-enable button when done
                    if (executedCount === codeCells.length) {
                        setTimeout(() => {
                            runAllBtn.disabled = false;
                            runAllIcon.className = 'fas fa-check';
                            runAllText.textContent = 'Complete!';
                            setTimeout(() => {
                                runAllIcon.className = 'fas fa-play';
                                runAllText.textContent = 'Run All';
                            }, 2000);
                        }, 500);
                    }
                }, delay);
                delay += 1000; // 1 second delay between each cell execution
            }
        });
    },
    
    executeCell(index, shouldScroll = true) {
        const cell = this.cells[index];
        if (cell.type === 'code') {
            const wasExecuted = cell.executed;
            cell.executed = true;
            
            // Re-render the specific cell with animation
            const cellElement = document.querySelector(`[data-index="${index}"]`);
            const currentScrollPos = window.scrollY;
            
            // Show loading animation
            cellElement.style.transition = 'opacity 0.3s';
            cellElement.style.opacity = '0.5';
            
            setTimeout(() => {
                // Save scroll position before DOM manipulation
                const beforeHeight = cellElement.offsetHeight;
                
                // Replace the cell HTML
                cellElement.outerHTML = this.renderCell(cell, index);
                
                // Restore scroll position to prevent shifting
                const newCell = document.querySelector(`[data-index="${index}"]`);
                const afterHeight = newCell.offsetHeight;
                const heightDiff = afterHeight - beforeHeight;
                
                // Only adjust scroll if the cell is above viewport or partially visible
                if (cellElement.getBoundingClientRect().top < window.innerHeight) {
                    window.scrollTo(0, currentScrollPos + heightDiff);
                }
                
                // Re-attach event listeners
                this.attachEventListeners();
                
                // Fade in
                newCell.style.transition = 'opacity 0.3s';
                newCell.style.opacity = '1';
                
                // Scroll to the output if requested
                if (shouldScroll) {
                    setTimeout(() => {
                        const output = document.getElementById(`output-${index}`);
                        if (output) {
                            output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                    }, 100);
                }
            }, 800);
        }
    },
    
    rerunCell(index, shouldScroll = true) {
        const cell = this.cells[index];
        if (cell.type === 'code') {
            const output = document.getElementById(`output-${index}`);
            
            if (output) {
                // Show loading state with animation
                output.style.transition = 'opacity 0.3s';
                output.style.opacity = '0.5';
                output.innerHTML = '<div class="text-blue-600"><i class="fas fa-spinner fa-spin mr-2"></i>Executing...</div>';
                
                setTimeout(() => {
                    output.innerHTML = cell.output || '';
                    output.style.opacity = '1';
                    
                    if (shouldScroll) {
                        setTimeout(() => {
                            output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }, 100);
                    }
                }, 800);
            }
        }
    }
};

if (typeof window !== 'undefined') {
    window.NotebookTheme = NotebookTheme;
}
