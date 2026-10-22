// Research Paper Portfolio Theme (NeurIPS/ICML Style)
const PaperTheme = {
    name: "Research Paper",
    
    render() {
        const container = document.getElementById('themeContainer');
        container.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400&display=swap');
                
                /* Force dark text and serif font on everything */
                body #themeContainer .paper-content,
                body #themeContainer .paper-content *,
                body #themeContainer .paper-content *::before,
                body #themeContainer .paper-content *::after {
                    color: #1a1a1a !important;
                    font-family: 'Times New Roman', 'Crimson Text', 'Georgia', serif !important;
                }
                
                body #themeContainer .paper-content { 
                    background-color: #ffffff !important;
                    line-height: 1.6;
                }
                
                /* Headings - even darker */
                body #themeContainer .paper-content h1, 
                body #themeContainer .paper-content h2, 
                body #themeContainer .paper-content h3,
                body #themeContainer .paper-content h4,
                body #themeContainer .paper-content strong {
                    color: #000000 !important;
                    font-weight: 700 !important;
                }
                
                /* Text elements */
                body #themeContainer .paper-content .text-gray-900 { color: #000000 !important; }
                body #themeContainer .paper-content .text-gray-800 { color: #2a2a2a !important; }
                body #themeContainer .paper-content .text-gray-700 { color: #3a3a3a !important; }
                body #themeContainer .paper-content .text-gray-600 { color: #4a4a4a !important; }
                body #themeContainer .paper-content .text-gray-500 { color: #5a5a5a !important; }
                
                /* Links */
                body #themeContainer .paper-content a {
                    color: #1a1a1a !important;
                    text-decoration: none !important;
                }
                
                body #themeContainer .paper-content a:hover {
                    text-decoration: underline !important;
                }
                
                /* Borders */
                body #themeContainer .paper-content .border-gray-300,
                body #themeContainer .paper-content .border-gray-800,
                body #themeContainer .paper-content .border-b-2 {
                    border-color: #333333 !important;
                }
                
                /* Background for contact section */
                body #themeContainer .paper-content .bg-gray-50 {
                    background-color: #f9f9f9 !important;
                }
            </style>
            <div class="min-h-screen bg-white paper-content" style="color: #1a1a1a;">
                <!-- Paper Container -->
                <div class="max-w-5xl mx-auto px-12 py-16 bg-white" style="color: #1a1a1a;">
                    <!-- Header -->
                    <div class="text-center mb-12 pb-8 border-b-2 border-gray-800">
                        <h1 class="text-4xl font-serif font-bold mb-6 text-gray-900" style="letter-spacing: 0.02em;">${portfolioContent.name.toUpperCase()}<br/>A TECHNICAL OVERVIEW</h1>
                        <p class="text-lg font-serif italic text-gray-700 mb-6">An Empirical Analysis of Professional Contributions in AI/ML Engineering</p>
                        <div class="flex items-center justify-center gap-4 text-sm font-serif text-gray-800">
                            <span>${portfolioContent.name}</span>
                            <span>•</span>
                            <a href="mailto:${portfolioContent.email}">${portfolioContent.email}</a>
                            <span>•</span>
                            <span>${portfolioContent.location}</span>
                        </div>
                        <div class="flex items-center justify-center gap-3 mt-3 text-sm font-serif text-gray-800">
                            <a href="${portfolioContent.social.github}" target="_blank">GitHub</a>
                            <span>•</span>
                            <a href="${portfolioContent.social.linkedin}" target="_blank">LinkedIn</a>
                        </div>
                    </div>

                    <!-- Two Column Layout (Desktop) -->
                    <div class="grid md:grid-cols-2 gap-12">
                        <!-- Left Column -->
                        <div class="space-y-8">
                            <!-- Abstract -->
                            <section>
                                <h2 class="text-xl font-serif font-bold mb-4 text-gray-900 uppercase" style="letter-spacing: 0.05em;">Abstract</h2>
                                <p class="text-sm font-serif leading-relaxed text-gray-800 text-justify" style="text-indent: 1.5em;">
                                    ${portfolioContent.about.bio} This work presents a comprehensive analysis of contributions spanning 
                                    ${portfolioContent.stats.companies} major organizations, with demonstrated expertise in 
                                    ${Object.keys(portfolioContent.skills).length} technical domains and 
                                    ${portfolioContent.projects.length}+ production-grade implementations.
                                </p>
                            </section>

                            <!-- 1. Introduction -->
                            <section>
                                <h2 class="text-xl font-serif font-bold mb-4 text-gray-900 uppercase" style="letter-spacing: 0.05em;">1. Introduction</h2>
                                <p class="text-sm font-serif leading-relaxed text-gray-800 text-justify mb-4" style="text-indent: 1.5em;">
                                    As the field of artificial intelligence continues to evolve, the demand for experienced practitioners 
                                    capable of bridging theoretical concepts with production systems has intensified. This paper presents 
                                    ${portfolioContent.name}, an ML/AI engineer with ${portfolioContent.stats.years}+ years of hands-on experience.
                                </p>
                                <p class="text-sm font-serif leading-relaxed text-gray-800 text-justify mb-4" style="text-indent: 1.5em;">
                                    <em>Research Interests:</em> ${portfolioContent.about.interests.join(', ')}.
                                </p>
                                <p class="text-sm font-serif leading-relaxed text-gray-800 text-justify" style="text-indent: 1.5em;">
                                    <em>Current Position:</em> ${portfolioContent.experience[0].position} at ${portfolioContent.experience[0].company}, 
                                    focusing on GenAI, automation, and scalable ML systems.
                                </p>
                            </section>

                            <!-- 2. Methods & Technical Skills -->
                            <section>
                                <h2 class="text-xl font-serif font-bold mb-4 text-gray-900 uppercase" style="letter-spacing: 0.05em;">2. Methodology & Technical Stack</h2>
                                <p class="text-sm font-serif leading-relaxed text-gray-800 text-justify mb-4" style="text-indent: 1.5em;">
                                    Our approach leverages a diverse technical stack across multiple domains:
                                </p>
                                ${Object.entries(portfolioContent.skills).map(([category, skills]) => `
                                    <div class="mb-4">
                                        <h3 class="text-sm font-serif font-bold text-gray-900 mb-2 italic">${category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}</h3>
                                        <p class="text-xs font-serif text-gray-700 leading-relaxed pl-4" style="text-align: justify;">
                                            ${skills.join(', ')}.
                                        </p>
                                    </div>
                                `).join('')}
                            </section>
                        </div>

                        <!-- Right Column -->
                        <div class="space-y-6">
                            <!-- 3. Experiments (Projects) -->
                            <section>
                                <h2 class="text-xl font-serif font-bold mb-3 text-gray-900">3. Experimental Implementations</h2>
                                <p class="text-sm font-serif leading-relaxed text-gray-800 text-justify mb-3">
                                    We present ${portfolioContent.projects.length} notable implementations demonstrating practical applications 
                                    of ML/AI technologies:
                                </p>
                                ${portfolioContent.projects.slice(0, 3).map((proj, i) => `
                                    <div class="mb-4 pb-3 border-b border-gray-200">
                                        <h3 class="text-sm font-serif font-bold text-gray-900 mb-1">
                                            3.${i+1}. ${proj.title} [${i+1}]
                                        </h3>
                                        <p class="text-xs font-serif text-gray-700 leading-relaxed text-justify mb-2">
                                            ${proj.description}
                                        </p>
                                        <p class="text-xs font-serif italic text-gray-600">
                                            <strong>Technologies:</strong> ${proj.tags.join(', ')}
                                        </p>
                                        <ul class="text-xs font-serif text-gray-700 mt-2 space-y-1">
                                            ${proj.highlights.slice(0, 2).map(h => `<li>• ${h}</li>`).join('')}
                                        </ul>
                                    </div>
                                `).join('')}
                            </section>

                            <!-- 4. Results (Achievements) -->
                            <section>
                                <h2 class="text-xl font-serif font-bold mb-3 text-gray-900">4. Results & Impact</h2>
                                <p class="text-sm font-serif leading-relaxed text-gray-800 text-justify mb-3">
                                    Key achievements from recent work at ${portfolioContent.experience[0].company}:
                                </p>
                                <ul class="text-xs font-serif text-gray-700 space-y-2">
                                    ${portfolioContent.experience[0].achievements.slice(0, 4).map(achievement => `
                                        <li class="leading-relaxed">• ${achievement}</li>
                                    `).join('')}
                                </ul>
                            </section>

                            <!-- 5. Conclusion -->
                            <section>
                                <h2 class="text-xl font-serif font-bold mb-3 text-gray-900">5. Conclusion & Future Work</h2>
                                <p class="text-sm font-serif leading-relaxed text-gray-800 text-justify">
                                    This work demonstrates comprehensive expertise in ML/AI engineering, with proven ability to deliver 
                                    production-grade systems. Currently pursuing advanced applications in GenAI, with focus on scalable 
                                    automation and enterprise solutions. Open to collaboration on challenging ML/AI projects.
                                </p>
                            </section>
                        </div>
                    </div>

                    <!-- Full Width Sections -->
                    <div class="mt-8 pt-6 border-t-2 border-gray-300 space-y-6">
                        <!-- Experience Timeline -->
                        <section>
                            <h2 class="text-xl font-serif font-bold mb-3 text-gray-900">Appendix A: Professional Experience</h2>
                            <div class="space-y-3">
                                ${portfolioContent.experience.map((exp, i) => `
                                    <div class="text-xs font-serif">
                                        <strong class="text-gray-900">[E${i+1}]</strong> 
                                        <span class="text-gray-800">${exp.position}</span>, 
                                        <em>${exp.company}</em>. 
                                        <span class="text-gray-600">${exp.duration}</span>.
                                    </div>
                                `).join('')}
                            </div>
                        </section>

                        <!-- Education & Certifications -->
                        <section>
                            <h2 class="text-xl font-serif font-bold mb-3 text-gray-900">Appendix B: Academic Background</h2>
                            ${portfolioContent.education.map((edu, i) => `
                                <div class="text-xs font-serif mb-2">
                                    <strong class="text-gray-900">[ED${i+1}]</strong> 
                                    <span class="text-gray-800">${edu.degree}</span>, 
                                    <em>${edu.institution}</em>. 
                                    <span class="text-gray-600">${edu.year}</span>. 
                                    GPA: ${edu.gpa}.
                                </div>
                            `).join('')}
                            
                            <h3 class="text-sm font-serif font-bold mt-4 mb-2 text-gray-900">Certifications:</h3>
                            <ul class="text-xs font-serif text-gray-700 space-y-1">
                                ${portfolioContent.certifications.map((cert, i) => `
                                    <li><strong>[C${i+1}]</strong> ${cert.title}. <em>${cert.issuer}</em>, ${cert.year}.</li>
                                `).join('')}
                            </ul>
                        </section>

                        <!-- References (Contact) -->
                        <section>
                            <h2 class="text-xl font-serif font-bold mb-3 text-gray-900">Appendix C: Contact Information</h2>
                            <div class="bg-gray-50 border border-gray-300 rounded p-4">
                                <p class="text-sm font-serif text-gray-800 mb-2">
                                    For collaboration inquiries, consulting opportunities, or further information:
                                </p>
                                <div class="text-sm font-serif space-y-1">
                                    <p><strong>Email:</strong> <a href="mailto:${portfolioContent.email}" class="text-blue-600 hover:underline">${portfolioContent.email}</a></p>
                                    <p><strong>Phone:</strong> ${portfolioContent.phone}</p>
                                    <p><strong>Location:</strong> ${portfolioContent.location}</p>
                                    <p><strong>GitHub:</strong> <a href="${portfolioContent.social.github}" target="_blank" class="text-blue-600 hover:underline">${portfolioContent.social.github}</a></p>
                                    <p><strong>LinkedIn:</strong> <a href="${portfolioContent.social.linkedin}" target="_blank" class="text-blue-600 hover:underline">${portfolioContent.social.linkedin}</a></p>
                                </div>
                            </div>
                        </section>

                        <!-- References Section -->
                        <section>
                            <h2 class="text-xl font-serif font-bold mb-3 text-gray-900">References</h2>
                            <div class="text-xs font-serif text-gray-700 space-y-1">
                                ${portfolioContent.projects.slice(0, 3).map((proj, i) => `
                                    <p><strong>[${i+1}]</strong> ${portfolioContent.name}. "${proj.title}". ${proj.tags[0]} Implementation. ${new Date().getFullYear()}.</p>
                                `).join('')}
                            </div>
                        </section>
                    </div>

                    <!-- Footer -->
                    <div class="mt-8 pt-4 border-t border-gray-300 text-center text-xs font-serif text-gray-500">
                        <p>Published: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p class="mt-1">© ${new Date().getFullYear()} ${portfolioContent.name}. All rights reserved.</p>
                    </div>
                </div>
            </div>
        `;
    }
};

if (typeof window !== 'undefined') {
    window.PaperTheme = PaperTheme;
}
