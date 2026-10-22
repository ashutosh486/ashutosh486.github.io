// Prompt Engineering Studio Theme
const PromptTheme = {
    name: "Prompt Studio",
    
    currentPrompt: 'intro',
    typingInterval: null,
    currentText: '',
    targetText: '',
    charIndex: 0,
    
    prompts: {
        intro: {
            title: 'System Initialization',
            prompt: `You are interviewing ${portfolioContent.name}, a highly skilled software engineer specializing in machine learning and AI.

Generate a comprehensive professional summary highlighting:
- Technical expertise and core competencies
- Professional experience and notable achievements  
- Education and continuous learning commitment
- Unique value proposition

Response should be engaging, professional, and demonstrate deep technical knowledge.`,
            output: `# Professional Summary: ${portfolioContent.name}

${portfolioContent.about.bio}

## Core Competencies

${portfolioContent.about.tagline}

**Primary Interests:** ${portfolioContent.about.interests.join(', ')}

## Key Strengths

✓ Extensive expertise in machine learning and AI development
✓ Full-stack software engineering with modern frameworks
✓ Cloud infrastructure and MLOps implementation
✓ Strong problem-solving and system design capabilities
✓ Passion for innovation and continuous learning

This professional combines technical depth with practical experience, making them an ideal candidate for challenging roles in AI/ML engineering and software development.`
        },
        
        skills: {
            title: 'Skills Extraction',
            prompt: `Analyze the technical skill set of ${portfolioContent.name} and categorize them by domain.

Input Data:
${JSON.stringify(portfolioContent.skills, null, 2)}

Task: Create a structured breakdown of skills with proficiency indicators and real-world application examples.`,
            output: `# Technical Skills Analysis

## Machine Learning & AI
${portfolioContent.skills.ml.map(skill => `• **${skill}** - Production-grade experience`).join('\n')}

## Programming Languages
${portfolioContent.skills.languages.map(skill => `• **${skill}** - Expert level proficiency`).join('\n')}

## Frameworks & Tools
${portfolioContent.skills.frameworks.map(skill => `• **${skill}** - Extensive practical usage`).join('\n')}

## Cloud & DevOps
${portfolioContent.skills.cloud.map(skill => `• **${skill}** - Infrastructure and deployment`).join('\n')}

## Assessment Summary
Total Skills: ${portfolioContent.stats.skills}
Skill Diversity: High
Domain Coverage: Full-stack ML Engineer
Experience Level: Senior Professional`
        },
        
        projects: {
            title: 'Project Portfolio Generation',
            prompt: `Generate a compelling portfolio showcase for ${portfolioContent.name}'s projects.

Requirements:
1. Highlight technical complexity and innovation
2. Emphasize real-world impact and outcomes
3. Showcase diverse technology stack
4. Demonstrate problem-solving approach

Projects to feature:
${portfolioContent.projects.map(p => `- ${p.title}`).join('\n')}`,
            output: `# Featured Projects Portfolio

${portfolioContent.projects.slice(0, 4).map(project => `
## ${project.title}

${project.description}

**Technology Stack:**
${project.tags.map(tag => `\`${tag}\``).join(' • ')}

**Impact & Outcomes:**
${project.highlights ? project.highlights.map(h => `✓ ${h}`).join('\n') : '✓ Successfully delivered production-ready solution\n✓ Demonstrated expertise in modern tech stack\n✓ Solved complex technical challenges'}

---
`).join('\n')}

**Portfolio Insights:**
- ${portfolioContent.projects.length} completed projects
- Diverse technology stack utilization
- Strong focus on ML/AI applications
- Proven track record of delivery`
        },
        
        experience: {
            title: 'Career Trajectory Analysis',
            prompt: `Analyze the professional journey of ${portfolioContent.name} and identify key growth patterns.

Experience Data:
${portfolioContent.experience.map(exp => `
${exp.position} at ${exp.company} (${exp.period})
Responsibilities: ${exp.achievements.join('; ')}
`).join('\n')}

Generate: Career progression narrative, skill development timeline, and value proposition.`,
            output: `# Professional Experience Analysis

${portfolioContent.experience.map((exp, idx) => `
## ${exp.position}
**${exp.company}** | ${exp.period}${exp.location ? ` | ${exp.location}` : ''}

### Key Contributions:
${exp.achievements.map(item => `• ${item}`).join('\n')}

${exp.technologies && exp.technologies.length > 0 ? `### Technical Environment:
${exp.technologies.join(' • ')}` : ''}

${idx < portfolioContent.experience.length - 1 ? '---\n' : ''}
`).join('\n')}

## Career Insights

**Progression Pattern:** Consistent growth in technical leadership and system complexity
**Domain Expertise:** Strong focus on ML/AI with full-stack capabilities
**Impact Scale:** Enterprise-level contributions with measurable outcomes
**Technology Adoption:** Early adopter of cutting-edge ML frameworks and tools`
        },
        
        education: {
            title: 'Education & Learning',
            prompt: `Extract and present the educational background and certifications of ${portfolioContent.name}.

Education Data:
${portfolioContent.education.map(edu => `- ${edu.degree} from ${edu.institution} (${edu.year}), GPA: ${edu.gpa}`).join('\n')}

Certifications:
${portfolioContent.certifications.map(cert => `- ${cert.title} by ${cert.issuer} (${cert.year})`).join('\n')}

Task: Create a comprehensive education profile highlighting academic achievements, continuous learning commitment, and professional development.`,
            output: `# Education & Continuous Learning Profile

## Academic Foundation

${portfolioContent.education.map(edu => `
### ${edu.degree}
**${edu.institution}** | ${edu.location}  
**Period:** ${edu.year} | **GPA:** ${edu.gpa}/10.0

**Description:** ${edu.description}

**Key Achievements:**
${edu.achievements.map(achievement => `• ${achievement}`).join('\n')}
`).join('\n---\n')}

## Professional Certifications

${portfolioContent.certifications.map((cert, idx) => `
### ${idx + 1}. ${cert.title}
**Issuer:** ${cert.issuer} | **Year:** ${cert.year}  
${cert.link ? `🔗 [Verify Certificate](${cert.link})` : ''}
`).join('\n')}

## Learning Philosophy

${portfolioContent.name} demonstrates a strong commitment to continuous learning and professional development. The combination of formal education in Electronics & Communication Engineering with specialized ML/AI certifications showcases a deliberate progression from foundational concepts to advanced practical applications.

**Key Highlights:**
• Solid academic foundation from a premier technical institution (NIT)
• ${portfolioContent.certifications.length} specialized certifications in ML/Deep Learning
• Continuous upskilling in emerging technologies
• Theory-to-practice approach with hands-on implementations

This educational background provides the theoretical foundation that complements extensive practical experience in the field.`
        },
        
        patents: {
            title: 'Intellectual Property',
            prompt: `Analyze the patent portfolio and innovative contributions of ${portfolioContent.name}.

Patents:
${portfolioContent.patents.map(patent => `- ${patent.title} (${patent.number}), Status: ${patent.status}, Year: ${patent.year}`).join('\n')}

Task: Generate a detailed analysis of the patent's significance, technical innovation, and impact on the field.`,
            output: `# Intellectual Property & Innovation

## Patent Portfolio

${portfolioContent.patents.map(patent => `
### ${patent.title}
**Patent Number:** ${patent.number}  
**Status:** ${patent.status}  
**Publication Year:** ${patent.year}

#### Abstract
${patent.description}

#### Technical Significance
This patent represents a significant contribution to the field of Natural Language Processing, specifically in the domain of textual entailment - a fundamental task that involves determining whether one piece of text logically follows from another.

#### Innovation Highlights
• Novel approach to determining semantic relationships in text
• Practical applications in information retrieval and question answering
• Demonstrates deep understanding of NLP fundamentals
• Published and recognized by USPTO

#### Impact & Applications
- **Search Engines:** Improving relevance of search results
- **Question Answering:** Validating answer accuracy
- **Information Extraction:** Identifying related content
- **Chatbots & Assistants:** Understanding user intent

🔗 [View Patent](${patent.link})
`).join('\n---\n')}

## Innovation Profile

**Patent Count:** ${portfolioContent.patents.length}  
**Primary Domain:** Natural Language Processing  
**Research Areas:** Textual Entailment, Semantic Analysis

### What This Means

Holding a patent demonstrates:
✓ **Research Capability:** Ability to conduct original research
✓ **Technical Depth:** Understanding at the algorithmic level
✓ **Innovation Mindset:** Solving novel problems creatively
✓ **IP Awareness:** Understanding of intellectual property protection

This patent, combined with extensive practical experience, positions ${portfolioContent.name.split(' ')[0]} as both an innovator and implementor - someone who can both create new solutions and deploy them effectively in production.`
        },
        
        hire: {
            title: 'Hiring Recommendation',
            prompt: `You are a technical hiring manager evaluating ${portfolioContent.name} for a senior ML/AI engineering role.

Evaluation Criteria:
- Technical depth and breadth
- Problem-solving capability
- Communication and collaboration
- Cultural fit and growth potential
- Portfolio quality and diversity

Provide: Hiring recommendation with confidence score and key hiring arguments.`,
            output: `# Hiring Evaluation Report

## Candidate: ${portfolioContent.name}

### Overall Assessment: **STRONG HIRE** 
**Confidence Score: 95/100** ✨

---

### Technical Evaluation

**Strengths:**
✓ **Deep ML/AI Expertise:** Comprehensive knowledge across the ML pipeline
✓ **Full-Stack Proficiency:** Can contribute across the entire tech stack
✓ **Modern Tech Stack:** Up-to-date with latest frameworks and tools
✓ **Cloud & MLOps:** Production deployment and scaling experience

**Skills Coverage:**
- Machine Learning: ${portfolioContent.skills.ml.length} specialized skills
- Programming: ${portfolioContent.skills.languages.length} languages
- Frameworks: ${portfolioContent.skills.frameworks.length}+ modern tools
- Infrastructure: Cloud-native development experience

---

### Portfolio Highlights

**Project Quality:** Demonstrates strong technical execution
**Diversity:** ${portfolioContent.projects.length} projects across various domains
**Impact:** Focus on real-world applications and solutions
**Innovation:** Uses cutting-edge technologies effectively

---

### Unique Differentiators

**🏆 Patent Holder:** ${portfolioContent.patents.length} USPTO patent in NLP/Textual Entailment
**📚 Certified Expert:** ${portfolioContent.certifications.length} specialized certifications from Coursera, NPTEL, edX
**💼 Proven Leader:** Manager-level experience leading cross-functional teams
**💰 Business Impact:** 14+ FTE equivalent savings through automation

---

### Key Hiring Arguments

1. **Immediate Contribution:** Ready to tackle complex ML challenges from day one
2. **Technical Leadership:** Can mentor and guide technical decisions
3. **Full-Stack Capability:** Flexibility across the development lifecycle
4. **Continuous Learner:** Stays current with rapidly evolving ML landscape
5. **Problem Solver:** Strong analytical and system design capabilities
6. **Innovation Track Record:** Patent holder with research mindset

---

### Recommendation

**Action:** Proceed to next interview stage immediately
**Role Fit:** Excellent match for Senior ML Engineer / Staff Engineer roles
**Team Impact:** High potential for technical leadership and innovation
**Risk Level:** Low - strong portfolio validates capabilities

---

### Contact Information
📧 Email: ${portfolioContent.email}
💼 LinkedIn: ${portfolioContent.social.linkedin}
🐙 GitHub: ${portfolioContent.social.github}

**Next Steps:** Schedule technical deep-dive interview to discuss specific project contributions and system design approach.`
        }
    },
    
    render() {
        const container = document.getElementById('themeContainer');
        container.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
                <!-- Header -->
                <div class="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
                    <div class="max-w-7xl mx-auto px-6 py-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                    <i class="fas fa-wand-magic-sparkles text-white"></i>
                                </div>
                                <div>
                                    <h1 class="text-xl font-bold">Prompt Engineering Studio</h1>
                                    <p class="text-xs text-slate-400">AI-Powered Portfolio Analysis</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <a href="mailto:${portfolioContent.email}" class="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg text-sm font-semibold transition-all shadow-lg">
                                    <i class="fas fa-rocket mr-2"></i>Hire ${portfolioContent.name.split(' ')[0]}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="max-w-7xl mx-auto px-6 py-8">
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <!-- Prompt Library Sidebar -->
                        <div class="lg:col-span-1">
                            <div class="bg-slate-900/50 backdrop-blur rounded-xl border border-slate-800 p-4 sticky top-6">
                                <h2 class="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                    <i class="fas fa-layer-group text-emerald-400"></i>
                                    Prompt Library
                                </h2>
                                <div class="space-y-2">
                                    ${Object.entries(this.prompts).map(([key, data]) => `
                                        <button 
                                            class="prompt-btn w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${this.currentPrompt === key ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}"
                                            data-prompt="${key}"
                                        >
                                            <i class="fas fa-file-code mr-2 text-xs"></i>
                                            ${data.title}
                                        </button>
                                    `).join('')}
                                </div>
                                
                                <div class="mt-6 pt-4 border-t border-slate-800">
                                    <div class="text-xs text-slate-500 mb-2">SOCIAL LINKS</div>
                                    <div class="flex flex-col gap-2">
                                        <a href="${portfolioContent.social.github}" target="_blank" class="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">
                                            <i class="fab fa-github"></i>
                                            <span>GitHub</span>
                                        </a>
                                        <a href="${portfolioContent.social.linkedin}" target="_blank" class="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">
                                            <i class="fab fa-linkedin"></i>
                                            <span>LinkedIn</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Main Prompt Area -->
                        <div class="lg:col-span-3 space-y-6">
                            <!-- Prompt Input -->
                            <div class="bg-slate-900/50 backdrop-blur rounded-xl border border-slate-800">
                                <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                    <h3 class="text-sm font-semibold text-slate-200 flex items-center gap-2">
                                        <i class="fas fa-terminal text-emerald-400"></i>
                                        System Prompt
                                    </h3>
                                    <button id="copyPrompt" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs transition-colors">
                                        <i class="fas fa-copy mr-1"></i>Copy
                                    </button>
                                </div>
                                <div class="p-6">
                                    <pre id="promptText" class="text-sm text-slate-300 font-mono leading-relaxed whitespace-pre-wrap bg-slate-950/50 p-4 rounded-lg border border-slate-800"></pre>
                                </div>
                            </div>

                            <!-- Output Response -->
                            <div class="bg-slate-900/50 backdrop-blur rounded-xl border border-slate-800">
                                <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                    <h3 class="text-sm font-semibold text-slate-200 flex items-center gap-2">
                                        <i class="fas fa-sparkles text-teal-400"></i>
                                        AI Response
                                        <span class="ml-2 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded text-xs text-emerald-300">
                                            <span class="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1 animate-pulse"></span>
                                            Generating...
                                        </span>
                                    </h3>
                                    <button id="copyOutput" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs transition-colors">
                                        <i class="fas fa-copy mr-1"></i>Copy
                                    </button>
                                </div>
                                <div class="p-6">
                                    <div id="outputText" class="text-sm text-slate-300 leading-relaxed prose prose-invert prose-sm max-w-none
                                        prose-headings:text-slate-200 prose-headings:font-bold
                                        prose-h1:text-2xl prose-h1:mb-4 prose-h1:text-emerald-400
                                        prose-h2:text-xl prose-h2:mb-3 prose-h2:text-teal-400
                                        prose-h3:text-lg prose-h3:mb-2
                                        prose-p:text-slate-300 prose-p:mb-3
                                        prose-strong:text-slate-100 prose-strong:font-semibold
                                        prose-ul:my-3 prose-li:text-slate-300
                                        prose-code:text-emerald-400 prose-code:bg-slate-950/50 prose-code:px-1 prose-code:rounded
                                        min-h-[400px] bg-slate-950/30 p-6 rounded-lg border border-slate-800">
                                    </div>
                                </div>
                            </div>

                            <!-- Metadata -->
                            <div class="grid grid-cols-3 gap-4">
                                <div class="bg-slate-900/50 backdrop-blur rounded-xl border border-slate-800 p-4">
                                    <div class="text-xs text-slate-500 mb-1">Model</div>
                                    <div class="text-sm font-semibold text-slate-200">GPT-4 Turbo</div>
                                </div>
                                <div class="bg-slate-900/50 backdrop-blur rounded-xl border border-slate-800 p-4">
                                    <div class="text-xs text-slate-500 mb-1">Temperature</div>
                                    <div class="text-sm font-semibold text-slate-200">0.7</div>
                                </div>
                                <div class="bg-slate-900/50 backdrop-blur rounded-xl border border-slate-800 p-4">
                                    <div class="text-xs text-slate-500 mb-1">Tokens</div>
                                    <div class="text-sm font-semibold text-slate-200" id="tokenCount">0</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.attachEventListeners();
        this.loadPrompt(this.currentPrompt);
    },
    
    attachEventListeners() {
        // Prompt selection
        document.querySelectorAll('.prompt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const promptKey = e.currentTarget.dataset.prompt;
                this.loadPrompt(promptKey);
            });
        });
        
        // Copy buttons
        document.getElementById('copyPrompt')?.addEventListener('click', () => {
            const text = document.getElementById('promptText').textContent;
            navigator.clipboard.writeText(text);
            this.showCopyFeedback('copyPrompt');
        });
        
        document.getElementById('copyOutput')?.addEventListener('click', () => {
            const text = document.getElementById('outputText').innerText;
            navigator.clipboard.writeText(text);
            this.showCopyFeedback('copyOutput');
        });
    },
    
    loadPrompt(promptKey) {
        this.currentPrompt = promptKey;
        const prompt = this.prompts[promptKey];
        
        // Update active button
        document.querySelectorAll('.prompt-btn').forEach(btn => {
            if (btn.dataset.prompt === promptKey) {
                btn.classList.add('bg-emerald-500/20', 'text-emerald-300', 'border', 'border-emerald-500/30');
                btn.classList.remove('text-slate-400', 'hover:bg-slate-800');
            } else {
                btn.classList.remove('bg-emerald-500/20', 'text-emerald-300', 'border', 'border-emerald-500/30');
                btn.classList.add('text-slate-400', 'hover:bg-slate-800');
            }
        });
        
        // Set prompt text
        document.getElementById('promptText').textContent = prompt.prompt;
        
        // Animate output typing
        this.typeOutput(prompt.output);
        
        // Update token count
        const tokenCount = Math.ceil((prompt.prompt.length + prompt.output.length) / 4);
        document.getElementById('tokenCount').textContent = tokenCount.toLocaleString();
    },
    
    typeOutput(text) {
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
        }
        
        const outputDiv = document.getElementById('outputText');
        outputDiv.innerHTML = '';
        
        this.targetText = text;
        this.currentText = '';
        this.charIndex = 0;
        
        // Convert markdown to HTML
        const htmlContent = this.markdownToHtml(text);
        
        // Type character by character
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const fullText = tempDiv.textContent || tempDiv.innerText;
        
        this.typingInterval = setInterval(() => {
            if (this.charIndex < fullText.length) {
                this.charIndex += Math.floor(Math.random() * 3) + 1; // Variable speed
                const currentContent = fullText.substring(0, this.charIndex);
                
                // Find the corresponding HTML by progressively revealing
                const progress = this.charIndex / fullText.length;
                const htmlChars = Math.floor(htmlContent.length * progress);
                
                outputDiv.innerHTML = htmlContent.substring(0, htmlChars) + '<span class="inline-block w-2 h-4 bg-emerald-400 animate-pulse ml-1"></span>';
                
                // Auto-scroll
                outputDiv.scrollTop = outputDiv.scrollHeight;
            } else {
                clearInterval(this.typingInterval);
                outputDiv.innerHTML = htmlContent;
            }
        }, 10);
    },
    
    markdownToHtml(markdown) {
        return markdown
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$2</h2>')
            .replace(/^### (.*$)/gm, '<h3>$3</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/^- (.*$)/gm, '<li>$1</li>')
            .replace(/^• (.*$)/gm, '<li>$1</li>')
            .replace(/^✓ (.*$)/gm, '<li class="flex items-start gap-2"><i class="fas fa-check text-emerald-400 mt-1"></i><span>$1</span></li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(?!<[h|u|l])(.*$)/gm, '<p>$1</p>')
            .replace(/<p><\/p>/g, '')
            .replace(/---/g, '<hr class="my-6 border-slate-800">');
    },
    
    showCopyFeedback(buttonId) {
        const btn = document.getElementById(buttonId);
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check mr-1"></i>Copied!';
        btn.classList.add('bg-emerald-600');
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.classList.remove('bg-emerald-600');
        }, 2000);
    },
    
    cleanup() {
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
            this.typingInterval = null;
        }
    }
};

if (typeof window !== 'undefined') {
    window.PromptTheme = PromptTheme;
}
