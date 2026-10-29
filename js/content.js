// Portfolio Content - Edit this file to update your information
console.log('📄 Loading portfolioContent...');

const portfolioContent = {
    // Personal Information
    name: "Ashutosh Pandey",
    title: "Manager - AI & Automation Specialist",
    tagline: "Building intelligent solutions with GenAI and ML",
    specialization: "GenAI & Automation",
    location: "Prayagraj, India",
    email: "ashutosh14486@gmail.com",
    phone: "+91-8004644122",
    
    // Social Links
    social: {
        github: "https://github.com/ashutosh486",
        linkedin: "https://linkedin.com/in/ashutosh14486",
        twitter: "",  // Optional: add your Twitter username
        portfolio: "https://about.ashutoshcodes.in",
    },
    
    // About Section
    about: {
        greeting: "Hey there!",
        tagline: "Building intelligent solutions with GenAI and ML",
        bio: "I am a skilled AI and automation specialist with a proven track record in launching innovative solutions and improving operational efficiency. With rich experience in machine learning, natural language processing, and cloud technologies, I have successfully led cross-functional teams and developed end-to-end automation projects that drive significant organizational improvements.",
        shortBio: "AI and automation specialist with expertise in GenAI, NLP, and cloud technologies, driving innovation and operational efficiency.",
        interests: ["GenAI", "Machine Learning", "NLP", "Cloud Technologies", "Automation", "MLOps"],
        funFact: "I hold a patent in Textual Entailment and have delivered solutions saving 14+ FTE equivalent! 🚀"
    },
    
    // Headline impact numbers (Model Card benchmarks, Prompt Studio)
    impact: [
        { value: "14+ FTE", label: "Equivalent Savings Delivered" },
        { value: "50K+", label: "Classes Handled in ML Model" },
        { value: "4000+", label: "Hours ASR Training Data" }
    ],

    // Skills
    skills: {
        languages: ["Python", "JavaScript", "HTML", "CSS", "SQL"],
        backend: ["Python", "Flask", "Jinja2", "psycopg2", "pandas", "numpy", "Streamlit"],
        frontend: ["HTML", "CSS", "JavaScript", "Angular", "Tailwind CSS"],
        database: ["PostgreSQL", "SQLite", "MongoDB"],
        ml: ["sklearn", "keras", "fastText", "gensim", "nltk", "spaCy", "transformers", "sentence-transformers", "LangChain", "GPT-4", "TensorFlow", "PyTorch"],
        frameworks: ["Flask", "Angular", "Tailwind CSS", "Streamlit", "LangChain", "pandas", "numpy"],
        cloud: ["AWS", "Azure", "Databricks"],
        aiml: ["sklearn", "keras", "fastText", "gensim", "nltk", "spaCy", "transformers", "sentence-transformers", "LangChain", "GPT-4"],
        mlops: ["mlflow", "PySpark", "Databricks", "CVAT", "Docker"],
        databases: ["PostgreSQL", "SQLite", "MongoDB"],
        tools: ["VSCode", "PyCharm", "git", "Jira", "Confluence", "Docker", "mlflow"]
    },
    
    // Display names for the skill categories above
    skillLabels: {
        languages: "Languages", backend: "Backend", frontend: "Frontend", database: "Databases", ml: "Machine Learning",
        frameworks: "Frameworks", cloud: "Cloud", aiml: "AI / ML", mlops: "MLOps", databases: "Databases", tools: "Tools"
    },
    
    // Projects
    projects: [
        {
            id: 1,
            title: "ForkCV - Modern Resume Builder",
            description: "Modern resume builder for freshers and early-career tech/data professionals in India. Features AI-powered suggestions, real-time editing, and professional ATS-friendly templates. Built with Angular 18 standalone components and FastAPI backend.",
            tags: ["Angular", "Tailwind CSS", "TypeScript", "FastAPI", "LLM Integration"],
            site: "forkcv.ashutoshcodes.in",
            image: "https://via.placeholder.com/600x400/667eea/ffffff?text=ForkCV",
            highlights: ["AI-powered suggestions", "Real-time editing", "ATS-friendly templates"]
        },
        {
            id: 2,
            title: "GenAI Support Chatbot",
            description: "Launched a GenAI support chatbot with full compliance across security, legal, cloud and architecture policies. Built using GPT-4o-mini with LangChain to create intelligent agents/skills for automating support chats.",
            tags: ["GPT-4", "LangChain", "Python", "Azure"],
            image: "https://via.placeholder.com/600x400/667eea/ffffff?text=GenAI+Chatbot",
            highlights: ["Enterprise compliance", "Multi-agent system", "Automated support"]
        },
        {
            id: 3,
            title: "Extreme Multi-Class Classification",
            description: "Built a transformer-based classification model with vector database for handling 50,000+ classes. Implemented semantic search with retrieval, encoding, and reranking to match products from millions of options.",
            tags: ["Transformers", "VectorDB", "Python", "NLP"],
            image: "https://via.placeholder.com/600x400/764ba2/ffffff?text=Multi-Class+ML",
            highlights: ["50K+ classes", "Semantic search", "High accuracy"]
        },
        {
            id: 4,
            title: "Object Detection Pipeline",
            description: "Created annotation and training pipelines for object detection to extract promotions, descriptions, and products from retail flyers. Trained NER models to extract brand, quantity, UoM, and price from product descriptions.",
            tags: ["Computer Vision", "NER", "Python", "CVAT"],
            image: "https://via.placeholder.com/600x400/f093fb/ffffff?text=Object+Detection",
            highlights: ["End-to-end pipeline", "NER extraction", "Retail automation"]
        },
        {
            id: 5,
            title: "End-to-End Automation Platform",
            description: "Developed comprehensive automation solution with Jinja2/HTML/CSS frontend, Flask/Python/pandas backend, and SQL + Azure Blob storage. Realized ~14+ FTE equivalent savings through multiple automation solutions.",
            tags: ["Flask", "Python", "Azure", "SQL"],
            image: "https://via.placeholder.com/600x400/4facfe/ffffff?text=Automation+Platform",
            highlights: ["14+ FTE savings", "Full-stack", "Cloud storage"]
        },
        {
            id: 6,
            title: "Custom ASR System",
            description: "Built custom Automatic Speech Recognition model via transfer learning on ~4000 hours of raw audio. Led team of 3 to deliver ASR in dockerized setup, achieving ~5% accuracy improvement and higher customer satisfaction.",
            tags: ["ASR", "Deep Learning", "Docker", "AWS"],
            image: "https://via.placeholder.com/600x400/10b981/ffffff?text=ASR+System",
            highlights: ["4000+ hours training", "5% accuracy boost", "Dockerized"]
        }
    ],
    
    // Experience
    experience: [
        {
            company: "NielsenIQ",
            position: "Manager",
            period: "February 2025 - Present",
            duration: "February 2025 - Present",
            location: "Remote",
            achievements: [
                "Leading GenAI and automation initiatives, coordinating cross-functional teams to ensure data privacy and system integrity",
                "Oversaw launch of GenAI support chatbot with compliance across security, legal, cloud and architecture policies",
                "Used GPT-4o-mini with LangChain to build agents/skills automating support chats",
                "Implemented multiple automation solutions realizing ~14+ FTE equivalent savings",
                "Coordinated cross-functional teams ensuring data privacy and system integrity"
            ],
            technologies: ["GPT-4", "LangChain", "Python", "Azure", "Flask"]
        },
        {
            company: "NielsenIQ",
            position: "Senior Expert – Innovation & Automation",
            period: "September 2022 - February 2025",
            duration: "September 2022 - February 2025",
            location: "Remote",
            achievements: [
                "Drove innovation in ML/NLP solutions and end-to-end automation platforms for retail analytics",
                "Built Extreme Multi-Class Classification model (transformer + vectorDB) for 50k+ classes",
                "Delivered Semantic Search (retrieval/encoding/reranking) matching products from millions of options",
                "Created annotation & training pipelines for Object Detection extracting promos/descriptions/products from flyers",
                "Trained NER to extract brand, quantity, UoM, price from descriptions",
                "Developed end-to-end automation: Jinja2/HTML/CSS frontend, Flask/Python/pandas backend, SQL + Azure Blob storage"
            ],
            technologies: ["Python", "transformers", "Flask", "Azure", "SQL", "Streamlit", "spaCy"]
        },
        {
            company: "Accenture Solutions Pvt. Ltd",
            position: "AI Engineering Senior Analyst",
            period: "June 2021 - August 2022",
            duration: "June 2021 - August 2022",
            location: "Mumbai, India",
            achievements: [
                "Led team delivering ASR solutions and AWS infrastructure for audio transcription services",
                "Led team of 3 to deliver ASR in dockerized setup; achieved ~5% accuracy improvement and higher CSAT",
                "Implemented monitoring and fortnightly AWS pricing reports with cost-optimization recommendations",
                "Designed multi-service AWS solution for audio transcription: Transcribe, Comprehend, S3, EC2, Glacier, CodeCommit"
            ],
            technologies: ["AWS", "Docker", "Python", "ASR", "Transcribe", "S3", "EC2"]
        },
        {
            company: "Accenture Solutions Pvt. Ltd",
            position: "AI Engineering Analyst",
            period: "September 2018 - May 2021",
            duration: "September 2018 - May 2021",
            location: "Mumbai, India",
            achievements: [
                "Built custom ASR models and implemented text analytics solutions including emotion/sentiment analysis and entity extraction",
                "Built custom ASR model via transfer learning on ~4000 hours of raw audio; improved accuracy/performance",
                "Delivered text analytics: Emotion/Sentiment (BERT TL), document similarity (doc2vec, WMD, LSI)",
                "Implemented entity extraction in queries; mapped SQL data to Neo4j with graph visualization",
                "Enhanced recommendations by reducing space complexity; executed JMeter load tests for scalability"
            ],
            technologies: ["Python", "BERT", "ASR", "Neo4j", "doc2vec", "NLP"]
        }
    ],
    
    // Education
    education: [
        {
            degree: "M.Tech. in AIML (Artificial Intelligence and Machine Learning)",
            institution: "Birla Institute of Technology and Science, Pilani (BITS Pilani)",
            year: "2026 - Present",
            gpa: "9.0/10.0",
            location: "Rajasthan, India",
            description: "",
            achievements: [
                ]
        },
        {
            degree: "B.Tech. in Electronics & Communication Engineering",
            institution: "National Institute of Technology, Hamirpur (NIT Hamirpur)",
            year: "2014 - 2018",
            gpa: "8.20/10.0",
            location: "H.P. India",
            description: "Strong foundation in signal processing and communication with focus on machine learning and data structures",
            achievements: [
                "Strong foundation in signal processing and communication",
                "Relevant coursework in machine learning and data structures",
                "Active participation in technical clubs and hackathons"
            ]
        }
    ],
    
    // Certifications
    certifications: [
        {
            title: "Deep Learning Specialization",
            issuer: "Coursera",
            year: "2020",
            link: "https://www.coursera.org/verify/specialization/8YQRZ4Y7JKVY"
        },
        {
            title: "Deep Learning",
            issuer: "NPTEL (IIT Madras)",
            year: "2019",
            link: "https://nptel.ac.in/noc/E_Certificate/NPTEL19CS85S41820511191175777"
        },
        {
            title: "Introduction to TensorFlow for AI, ML, and DL",
            issuer: "Coursera",
            year: "2019",
            link: "https://www.coursera.org/verify/XR3T4N255MD9"
        },
        {
            title: "Machine Learning with Python—A Practical Introduction",
            issuer: "edX (IBM)",
            year: "2018",
            link: "https://courses.edx.org/certificates/2c36b5d6be984eb28ed78e796a2d2151"
        }
    ],
    
    // Patents
    patents: [
        {
            title: "Textual Entailment",
            number: "US20210110277A1",
            status: "Published",
            description: "System and method for determining textual entailment in natural language processing",
            link: "https://patents.google.com/patent/US20210110277A1/",
            year: "2021"
        }
    ],
    
    // Publications
    publications: [],
    
    // Currently Reading
    currentlyReading: [
        {
            id: 1,
            title: "Deep Learning",
            author: "Ian Goodfellow, Yoshua Bengio, Aaron Courville",
            coverImage: "https://via.placeholder.com/150x220/667eea/ffffff?text=Deep+Learning",
            status: "in-progress", // "in-progress", "completed"
            startDate: "2025-01-01",
            endDate: null,
            progress: 45, // percentage
            notes: "Comprehensive guide to deep learning fundamentals and advanced topics.",
            link: "https://www.deeplearningbook.org/"
        },
        {
            id: 2,
            title: "Designing Data-Intensive Applications",
            author: "Martin Kleppmann",
            coverImage: "https://via.placeholder.com/150x220/764ba2/ffffff?text=DDIA",
            status: "completed",
            startDate: "2024-10-15",
            endDate: "2024-12-10",
            progress: 100,
            notes: "Essential reading for understanding distributed systems and data architecture.",
            link: "https://dataintensive.net/"
        }
    ],
    
    // About Summary
    summary: "Experienced AI and automation specialist with 6+ years of expertise in developing and deploying GenAI, NLP, and ML solutions. Proven track record of leading cross-functional teams and delivering innovative solutions that drive significant operational efficiency. Holds a patent in Textual Entailment and has realized 14+ FTE equivalent savings through automation initiatives.",
    
    // Hobbies (array format)
    hobbies: ["Traveling and exploring places", "Listening to music", "Playing Chess", "Badminton", "Table Tennis"],
    
    // Picture placeholder
    picture: "images/profile.jpg",
    
    // Résumé PDF offered for download (theme chooser, ChatGPT /resume, sidebar, hire card)
    resume: "docs/Ashutosh_Pandey_Resume.pdf",
    
    // Chat Commands (for ChatGPT theme)
    chatCommands: [
        { command: "/about", description: "Learn more about me" },
        { command: "/skills", description: "View my technical skills" },
        { command: "/experience", description: "See my work history" },
        { command: "/education", description: "View my education" },
        { command: "/certifications", description: "See my certifications" },
        { command: "/projects", description: "Explore my projects" },
        { command: "/reading", description: "See what I'm reading" },
        { command: "/contact", description: "Get in touch with me" },
        { command: "/hire", description: "Ready to hire me!" },
        { command: "/resume", description: "Download my résumé" },
        { command: "/help", description: "Show available commands" }
    ]
};

// Derived numbers shown by themes - computed from the data above, don't edit by hand
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const careerStart = Math.min(...portfolioContent.experience.map(exp => {
    const [month, year] = exp.period.split(' - ')[0].split(' ');
    return new Date(+year, MONTHS.indexOf(month)).getTime();
}));
portfolioContent.stats = {
    years: Math.floor((Date.now() - careerStart) / (365.25 * 24 * 3600 * 1000)),
    // Skill categories overlap (e.g. Python is in several), so count each skill once
    skills: new Set(Object.values(portfolioContent.skills).flat().map(s => s.toLowerCase())).size,
    projects: portfolioContent.projects.length,
    companies: new Set(portfolioContent.experience.map(exp => exp.company)).size
};

console.log('✅ portfolioContent loaded successfully');
console.log('   Name:', portfolioContent.name);
console.log('   Skills categories:', Object.keys(portfolioContent.skills));
console.log('   Experience entries:', portfolioContent.experience.length);
console.log('   First experience has achievements?', portfolioContent.experience[0].achievements ? 'YES' : 'NO');

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = portfolioContent;
}
