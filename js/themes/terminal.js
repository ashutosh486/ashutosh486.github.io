// Terminal-Style Portfolio Theme
const TerminalTheme = {
    name: "Terminal",
    commandHistory: [],
    historyIndex: -1,
    
    commands: {
        help: {
            desc: "Show all available commands",
            output: () => `
Available commands:
  <span class="text-cyan-400">about</span>            - Display information about me
  <span class="text-cyan-400">skills</span>           - List technical skills
  <span class="text-cyan-400">experience</span>       - Show work experience
  <span class="text-cyan-400">projects</span>         - View my projects
  <span class="text-cyan-400">reading</span>          - Show currently reading books
  <span class="text-cyan-400">education</span>        - Display education background
  <span class="text-cyan-400">certifications</span>   - Show certifications
  <span class="text-cyan-400">contact</span>          - Show contact information
  <span class="text-cyan-400">hire</span>             - Ready to hire me!
  <span class="text-cyan-400">clear</span>            - Clear the terminal
  <span class="text-cyan-400">whoami</span>           - Display current user
  <span class="text-cyan-400">help</span>             - Show this help message

<span class="text-yellow-400">Pro Tip:</span> Press <span class="text-cyan-400">Tab</span> to autocomplete commands!`
        },
        whoami: {
            desc: "Display current user",
            output: () => `${portfolioContent.name.toLowerCase().replace(' ', '_')}`
        },
        about: {
            desc: "Show about information",
            output: () => `
<span class="text-yellow-400 font-bold">${portfolioContent.name}</span>
<span class="text-cyan-400">${portfolioContent.title}</span>

${portfolioContent.about.bio}

<span class="text-green-400">Location:</span> ${portfolioContent.location}
<span class="text-green-400">Interests:</span> ${portfolioContent.about.interests.join(', ')}

<span class="text-magenta-400">${portfolioContent.about.funFact}</span>`
        },
        skills: {
            desc: "List technical skills",
            output: () => {
                let output = '<span class="text-yellow-400 font-bold">Technical Skills:</span>\n\n';
                output += '<div class="font-mono text-xs">';
                output += '┌────────────────┬─────────────────────────────────────────────────────────────┐\n';
                output += '│ <span class="text-cyan-400">Category</span>       │ <span class="text-cyan-400">Skills</span>                                                      │\n';
                output += '├────────────────┼─────────────────────────────────────────────────────────────┤\n';
                
                Object.entries(portfolioContent.skills).forEach(([cat, skills]) => {
                    const categoryName = cat.toUpperCase().padEnd(14);
                    const skillText = skills.join(', ');
                    const chunks = [];
                    let currentChunk = '';
                    
                    skillText.split(', ').forEach(skill => {
                        if ((currentChunk + skill).length > 57) {
                            chunks.push(currentChunk.slice(0, -2));
                            currentChunk = skill + ', ';
                        } else {
                            currentChunk += skill + ', ';
                        }
                    });
                    if (currentChunk) chunks.push(currentChunk.slice(0, -2));
                    
                    chunks.forEach((chunk, i) => {
                        if (i === 0) {
                            output += `│ <span class="text-green-400">${categoryName}</span> │ ${chunk.padEnd(59)} │\n`;
                        } else {
                            output += `│ ${' '.repeat(14)} │ ${chunk.padEnd(59)} │\n`;
                        }
                    });
                });
                
                output += '└────────────────┴─────────────────────────────────────────────────────────────┘';
                output += '</div>';
                return output;
            }
        },
        experience: {
            desc: "Show work experience",
            output: () => {
                let output = '<span class="text-yellow-400 font-bold">Work Experience:</span>\n\n';
                portfolioContent.experience.forEach((exp, i) => {
                    output += `<span class="text-cyan-400">[${i + 1}] ${exp.position}</span>\n`;
                    output += `    <span class="text-green-400">Company:</span> ${exp.company}\n`;
                    output += `    <span class="text-green-400">Duration:</span> ${exp.duration}\n`;
                    output += `    <span class="text-green-400">Location:</span> ${exp.location}\n`;
                    output += `    <span class="text-green-400">Achievements:</span>\n`;
                    exp.achievements.slice(0, 2).forEach(ach => {
                        // Wrap long lines properly
                        const maxWidth = 80;
                        const words = ach.split(' ');
                        let line = '      • ';
                        words.forEach(word => {
                            if ((line + word).length > maxWidth) {
                                output += line + '\n';
                                line = '        ' + word + ' ';
                            } else {
                                line += word + ' ';
                            }
                        });
                        output += line + '\n';
                    });
                    output += '\n';
                });
                return output;
            }
        },
        projects: {
            desc: "View projects",
            output: () => {
                let output = '<span class="text-yellow-400 font-bold">Projects Portfolio:</span>\n\n';
                portfolioContent.projects.forEach((proj, i) => {
                    output += `<span class="text-cyan-400">[${i + 1}] ${proj.title}</span>\n`;
                    
                    // Show site link if available (only ForkCV has one)
                    if (proj.site) {
                        output += `    <span class="text-green-400">🌐 Site:</span> <a href="https://${proj.site}" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline">${proj.site} ↗</a>\n`;
                    }
                    
                    // Wrap description properly
                    const maxWidth = 80;
                    const words = proj.description.split(' ');
                    let line = '    ';
                    words.forEach(word => {
                        if ((line + word).length > maxWidth) {
                            output += line + '\n';
                            line = '    ' + word + ' ';
                        } else {
                            line += word + ' ';
                        }
                    });
                    output += line + '\n';
                    
                    output += `    <span class="text-green-400">Tech:</span> ${proj.tags.join(', ')}\n`;
                    output += `    <span class="text-green-400">Highlights:</span>\n`;
                    proj.highlights.forEach(h => {
                        output += `      • ${h}\n`;
                    });
                    output += '\n';
                });
                return output;
            }
        },
        reading: {
            desc: "Show currently reading books",
            output: () => {
                let output = '<span class="text-yellow-400 font-bold">📚 Currently Reading:</span>\n\n';
                portfolioContent.currentlyReading.forEach((book, i) => {
                    output += `<span class="text-cyan-400">[${i + 1}] ${book.title}</span>\n`;
                    output += `    <span class="text-green-400">Author:</span> ${book.author}\n`;
                    output += `    <span class="text-green-400">Status:</span> ${book.status === 'completed' ? '[✅ COMPLETED]' : `[📖 IN PROGRESS - ${book.progress}%]`}\n`;
                    output += `    <span class="text-green-400">Started:</span> ${book.startDate}\n`;
                    if (book.endDate) {
                        output += `    <span class="text-green-400">Finished:</span> ${book.endDate}\n`;
                    }
                    output += `    <span class="text-green-400">Notes:</span> ${book.notes}\n`;
                    if (book.link) {
                        output += `    <span class="text-green-400">Link:</span> <a href="${book.link}" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline">${book.link} ↗</a>\n`;
                    }
                    output += '\n';
                });
                return output;
            }
        },
        education: {
            desc: "Display education",
            output: () => {
                let output = '<span class="text-yellow-400 font-bold">Education:</span>\n\n';
                portfolioContent.education.forEach(edu => {
                    output += `<span class="text-cyan-400">${edu.degree}</span>\n`;
                    output += `${edu.institution}\n`;
                    output += `${edu.year} | GPA: ${edu.gpa}\n`;
                });
                return output;
            }
        },
        contact: {
            desc: "Show contact info",
            output: () => `
<span class="text-yellow-400 font-bold">Contact Information:</span>

<span class="text-green-400">Email:</span>    <a href="mailto:${portfolioContent.email}" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline">${portfolioContent.email}</a>
<span class="text-green-400">Phone:</span>    <a href="tel:${portfolioContent.phone}" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline">${portfolioContent.phone}</a>
<span class="text-green-400">LinkedIn:</span> <a href="${portfolioContent.social.linkedin}" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline">${portfolioContent.social.linkedin} ↗</a>
<span class="text-green-400">GitHub:</span>   <a href="${portfolioContent.social.github}" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline">${portfolioContent.social.github} ↗</a>

<span class="text-cyan-400">Feel free to reach out for opportunities or collaboration!</span>`
        },
        education: {
            desc: "Display education",
            output: () => {
                let output = '<span class="text-yellow-400 font-bold">Education:</span>\n\n';
                portfolioContent.education.forEach(edu => {
                    output += `<span class="text-cyan-400">${edu.degree}</span>\n`;
                    output += `${edu.institution}\n`;
                    output += `${edu.year} | GPA: ${edu.gpa}\n`;
                });
                return output;
            }
        },
        certifications: {
            desc: "Display certifications",
            output: () => {
                let output = '<span class="text-yellow-400 font-bold">Certifications:</span>\n\n';
                portfolioContent.certifications.forEach((cert, i) => {
                    output += `<span class="text-cyan-400">[${i + 1}] ${cert.title}</span>\n`;
                    output += `    Issuer: ${cert.issuer} (${cert.year})\n\n`;
                });
                return output;
            }
        },
        hire: {
            desc: "Get hiring information",
            output: () => `
<span class="text-yellow-400 font-bold">╔═══════════════════════════════════════════════╗</span>
<span class="text-yellow-400 font-bold">║         READY TO WORK TOGETHER! 🚀           ║</span>
<span class="text-yellow-400 font-bold">╚═══════════════════════════════════════════════╝</span>

<span class="text-cyan-400">I'm available for:</span>
  • Full-time opportunities
  • Contract/Consulting work
  • AI/ML project collaboration
  • Technical advisory roles

<span class="text-green-400">Contact Information:</span>
  📧 Email:    ${portfolioContent.email}
  📞 Phone:    ${portfolioContent.phone}
  📍 Location: ${portfolioContent.location}

<span class="text-green-400">Social Links:</span>
  💼 LinkedIn: ${portfolioContent.social.linkedin}
  🔗 GitHub:   ${portfolioContent.social.github}

<span class="text-magenta-400">⏱️  Response Time: Typically within 24 hours</span>

<span class="text-cyan-400">Let's build something amazing together!</span>`
        }
    },
    
    render() {
        const container = document.getElementById('themeContainer');
        container.innerHTML = `
            <div class="min-h-screen bg-black text-green-400 font-mono p-8">
                <div class="max-w-5xl mx-auto">
                    <!-- ASCII Art Header -->
                    <pre class="text-green-500 mb-6 text-xs leading-tight">
╔═══════════════════════════════════════════════════════════════════════════╗
║   █████╗ ███████╗██╗  ██╗██╗   ██╗████████╗ ██████╗ ███████╗██╗  ██╗    ║
║  ██╔══██╗██╔════╝██║  ██║██║   ██║╚══██╔══╝██╔═══██╗██╔════╝██║  ██║    ║
║  ███████║███████╗███████║██║   ██║   ██║   ██║   ██║███████╗███████║    ║
║  ██╔══██║╚════██║██╔══██║██║   ██║   ██║   ██║   ██║╚════██║██╔══██║    ║
║  ██║  ██║███████║██║  ██║╚██████╔╝   ██║   ╚██████╔╝███████║██║  ██║    ║
║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝ ╚══════╝╚═╝  ╚═╝    ║
║                                                                           ║
║  ${portfolioContent.title.padEnd(70)}  ║
╚═══════════════════════════════════════════════════════════════════════════╝
                    </pre>
                    
                    <div class="mb-4 text-sm">
                        <div>Welcome to ${portfolioContent.name}'s Portfolio Terminal v1.0.0</div>
                        <div>Type '<span class="text-cyan-400">help</span>' to see available commands.</div>
                        <div class="text-gray-600">Last login: ${new Date().toLocaleString()} from 127.0.0.1</div>
                    </div>

                    <!-- Terminal Output -->
                    <div id="terminalOutput" class="mb-4 space-y-2"></div>

                    <!-- Input Line -->
                    <div class="flex items-center gap-2">
                        <span class="text-cyan-400">guest@portfolio</span>
                        <span class="text-white">:</span>
                        <span class="text-blue-400">~</span>
                        <span class="text-white">$</span>
                        <input 
                            type="text" 
                            id="terminalInput" 
                            class="flex-1 bg-transparent outline-none border-none text-green-400 font-mono"
                            autofocus
                            autocomplete="off"
                            spellcheck="false"
                        />
                    </div>
                </div>
            </div>
        `;
        
        this.initialize();
    },
    
    initialize() {
        const input = document.getElementById('terminalInput');
        const output = document.getElementById('terminalOutput');
        
        // Show welcome command automatically
        setTimeout(() => {
            this.executeCommand('help');
        }, 500);
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = input.value.trim();
                if (command) {
                    this.commandHistory.push(command);
                    this.historyIndex = this.commandHistory.length;
                    this.executeCommand(command);
                }
                input.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    input.value = this.commandHistory[this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex < this.commandHistory.length - 1) {
                    this.historyIndex++;
                    input.value = this.commandHistory[this.historyIndex];
                } else {
                    this.historyIndex = this.commandHistory.length;
                    input.value = '';
                }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                const partial = input.value.toLowerCase().trim();
                const matches = Object.keys(this.commands).filter(cmd => cmd.startsWith(partial));
                
                if (matches.length === 1) {
                    // Single match - autocomplete
                    input.value = matches[0];
                } else if (matches.length > 1) {
                    // Multiple matches - show suggestions
                    const output = document.getElementById('terminalOutput');
                    const suggestionDiv = document.createElement('div');
                    suggestionDiv.className = 'text-cyan-400 ml-4 mb-2';
                    suggestionDiv.innerHTML = matches.map(m => `<span class="mr-4">${m}</span>`).join('');
                    output.appendChild(suggestionDiv);
                    output.scrollTop = output.scrollHeight;
                    
                    // Find common prefix
                    if (partial.length > 0) {
                        let commonPrefix = matches[0];
                        for (let i = 1; i < matches.length; i++) {
                            let j = 0;
                            while (j < commonPrefix.length && j < matches[i].length && commonPrefix[j] === matches[i][j]) {
                                j++;
                            }
                            commonPrefix = commonPrefix.substring(0, j);
                        }
                        if (commonPrefix.length > partial.length) {
                            input.value = commonPrefix;
                        }
                    }
                }
            }
        });
        
        // Keep input focused
        document.addEventListener('click', () => input.focus());
    },
    
    executeCommand(commandStr) {
        const output = document.getElementById('terminalOutput');
        const [cmd, ...args] = commandStr.trim().split(' ');
        
        // Add command to output
        const cmdDiv = document.createElement('div');
        cmdDiv.className = 'flex items-center gap-2';
        cmdDiv.innerHTML = `
            <span class="text-cyan-400">guest@portfolio</span>
            <span class="text-white">:</span>
            <span class="text-blue-400">~</span>
            <span class="text-white">$</span>
            <span class="text-green-400">${commandStr}</span>
        `;
        output.appendChild(cmdDiv);
        
        // Execute command
        if (cmd === 'clear') {
            output.innerHTML = '';
            return;
        }
        
        const resultDiv = document.createElement('div');
        resultDiv.className = 'ml-4 mb-4 whitespace-pre-wrap typing-effect';
        
        if (this.commands[cmd]) {
            const result = typeof this.commands[cmd].output === 'function' 
                ? this.commands[cmd].output(args) 
                : this.commands[cmd].output;
            resultDiv.innerHTML = result;
        } else {
            resultDiv.innerHTML = `<span class="text-red-400">Command not found: ${cmd}</span>\nType '<span class="text-cyan-400">help</span>' for available commands.`;
        }
        
        output.appendChild(resultDiv);
        
        // Scroll to bottom
        window.scrollTo(0, document.body.scrollHeight);
    }
};

if (typeof window !== 'undefined') {
    window.TerminalTheme = TerminalTheme;
}
