// LLM Training Dashboard Theme (W&B/TensorBoard-Style)
const TrainingTheme = {
    name: "Training Dashboard",
    
    metrics: {
        currentEpoch: 0,
        totalEpochs: 100,
        trainingLoss: [],
        validationLoss: [],
        learningRate: [],
        accuracy: []
    },
    
    animationFrame: null,
    chartInstances: {},
    
    render() {
        const container = document.getElementById('themeContainer');
        
        // Initialize metrics with sample data
        this.initializeMetrics();
        
        container.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
                <!-- Top Navigation Bar -->
                <div class="border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm">
                    <div class="max-w-7xl mx-auto px-6 py-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <i class="fas fa-brain text-white"></i>
                                </div>
                                <div>
                                    <h1 class="text-xl font-bold">${portfolioContent.name} - Training Run</h1>
                                    <p class="text-xs text-gray-400">Professional ML Engineer Portfolio</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-3">
                                <a href="mailto:${portfolioContent.email}" class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-sm font-semibold transition-all shadow-lg">
                                    <i class="fas fa-envelope mr-2"></i>Contact Me
                                </a>
                                <a href="${portfolioContent.social.linkedin}" target="_blank" class="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                                    <i class="fab fa-linkedin"></i>
                                </a>
                                <a href="${portfolioContent.social.github}" target="_blank" class="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                                    <i class="fab fa-github"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="max-w-7xl mx-auto p-6">
                    <!-- Status Bar -->
                    <div class="mb-6 bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
                        <div class="flex items-center justify-between flex-wrap gap-4">
                            <div class="flex items-center gap-2">
                                <div class="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-lg border border-green-500/30">
                                    <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span class="text-sm font-medium text-green-300">Training Active</span>
                                </div>
                                <div class="px-3 py-1.5 bg-blue-500/20 rounded-lg border border-blue-500/30 text-sm text-blue-300">
                                    <i class="fas fa-stopwatch mr-2"></i>
                                    <span id="runtime">00:00:00</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-6 text-sm">
                                <div>
                                    <span class="text-gray-400">Epoch:</span>
                                    <span class="font-bold text-blue-400 ml-2" id="currentEpoch">0</span>
                                    <span class="text-gray-500">/ ${this.metrics.totalEpochs}</span>
                                </div>
                                <div>
                                    <span class="text-gray-400">Progress:</span>
                                    <span class="font-bold text-purple-400 ml-2" id="progress">0%</span>
                                </div>
                            </div>
                        </div>
                        <!-- Progress Bar -->
                        <div class="mt-3 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div id="progressBar" class="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500" style="width: 0%"></div>
                        </div>
                    </div>

                    <!-- Main Metrics Grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                        <div class="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
                            <div class="flex items-center justify-between mb-2">
                                <h3 class="text-xs font-semibold text-gray-400 uppercase">Training Loss</h3>
                                <i class="fas fa-arrow-down text-green-400 text-xs"></i>
                            </div>
                            <div class="text-2xl font-bold text-blue-400" id="trainLoss">0.0000</div>
                            <div class="text-xs text-gray-500 mt-1">Target: &lt; 0.1</div>
                        </div>
                        
                        <div class="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
                            <div class="flex items-center justify-between mb-2">
                                <h3 class="text-xs font-semibold text-gray-400 uppercase">Validation Loss</h3>
                                <i class="fas fa-arrow-down text-green-400 text-xs"></i>
                            </div>
                            <div class="text-2xl font-bold text-purple-400" id="valLoss">0.0000</div>
                            <div class="text-xs text-gray-500 mt-1">Best: <span id="bestValLoss">N/A</span></div>
                        </div>
                        
                        <div class="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
                            <div class="flex items-center justify-between mb-2">
                                <h3 class="text-xs font-semibold text-gray-400 uppercase">Accuracy</h3>
                                <i class="fas fa-arrow-up text-green-400 text-xs"></i>
                            </div>
                            <div class="text-2xl font-bold text-green-400" id="accuracy">0.00%</div>
                            <div class="text-xs text-gray-500 mt-1">Goal: &gt; 95%</div>
                        </div>
                        
                        <div class="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-4">
                            <div class="flex items-center justify-between mb-2">
                                <h3 class="text-xs font-semibold text-gray-400 uppercase">Learning Rate</h3>
                                <i class="fas fa-chart-line text-yellow-400 text-xs"></i>
                            </div>
                            <div class="text-2xl font-bold text-yellow-400" id="lr">0.0000</div>
                            <div class="text-xs text-gray-500 mt-1">Scheduler: Cosine</div>
                        </div>
                    </div>

                    <!-- Charts -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div class="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                            <h3 class="text-sm font-semibold text-gray-200 mb-4">
                                <i class="fas fa-chart-line text-blue-400 mr-2"></i>
                                Loss Curves
                            </h3>
                            <canvas id="lossChart" height="250"></canvas>
                        </div>
                        
                        <div class="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                            <h3 class="text-sm font-semibold text-gray-200 mb-4">
                                <i class="fas fa-bullseye text-green-400 mr-2"></i>
                                Accuracy Over Time
                            </h3>
                            <canvas id="accuracyChart" height="250"></canvas>
                        </div>
                    </div>

                    <!-- Hyperparameters & System Info -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <div class="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                            <h3 class="text-sm font-semibold text-gray-200 mb-4">
                                <i class="fas fa-sliders-h text-purple-400 mr-2"></i>
                                Hyperparameters
                            </h3>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Batch Size</span>
                                    <span class="font-mono text-gray-200">32</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Initial LR</span>
                                    <span class="font-mono text-gray-200">0.001</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Optimizer</span>
                                    <span class="font-mono text-gray-200">AdamW</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Weight Decay</span>
                                    <span class="font-mono text-gray-200">0.01</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-400">Model Type</span>
                                    <span class="font-mono text-gray-200">Transformer</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                            <h3 class="text-sm font-semibold text-gray-200 mb-4">
                                <i class="fas fa-server text-yellow-400 mr-2"></i>
                                System Resources
                            </h3>
                            <div class="space-y-3">
                                <div>
                                    <div class="flex justify-between text-sm mb-1">
                                        <span class="text-gray-400">GPU Utilization</span>
                                        <span class="text-green-400 font-mono">87%</span>
                                    </div>
                                    <div class="w-full bg-gray-700 rounded-full h-2">
                                        <div class="h-full bg-green-500 rounded-full" style="width: 87%"></div>
                                    </div>
                                </div>
                                <div>
                                    <div class="flex justify-between text-sm mb-1">
                                        <span class="text-gray-400">GPU Memory</span>
                                        <span class="text-blue-400 font-mono">14.2 / 16 GB</span>
                                    </div>
                                    <div class="w-full bg-gray-700 rounded-full h-2">
                                        <div class="h-full bg-blue-500 rounded-full" style="width: 88.75%"></div>
                                    </div>
                                </div>
                                <div>
                                    <div class="flex justify-between text-sm mb-1">
                                        <span class="text-gray-400">CPU Usage</span>
                                        <span class="text-purple-400 font-mono">42%</span>
                                    </div>
                                    <div class="w-full bg-gray-700 rounded-full h-2">
                                        <div class="h-full bg-purple-500 rounded-full" style="width: 42%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                            <h3 class="text-sm font-semibold text-gray-200 mb-4">
                                <i class="fas fa-user-circle text-pink-400 mr-2"></i>
                                Engineer Profile
                            </h3>
                            <div class="text-sm text-gray-300 space-y-2">
                                <p class="text-xs text-gray-400 leading-relaxed">${portfolioContent.about.bio.substring(0, 120)}...</p>
                                <div class="pt-2 border-t border-gray-700">
                                    <div class="font-semibold text-gray-200 mb-1">Core Specializations:</div>
                                    <div class="flex flex-wrap gap-1">
                                        ${portfolioContent.skills.ml.slice(0, 4).map(skill => 
                                            `<span class="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300">${skill}</span>`
                                        ).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Projects as "Experiments" -->
                    <div class="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
                        <h3 class="text-lg font-semibold text-gray-200 mb-4">
                            <i class="fas fa-flask text-blue-400 mr-2"></i>
                            Previous Experiments (Projects)
                        </h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="border-b border-gray-700">
                                        <th class="text-left py-3 px-4 text-gray-400 font-semibold">Experiment Name</th>
                                        <th class="text-left py-3 px-4 text-gray-400 font-semibold">Description</th>
                                        <th class="text-left py-3 px-4 text-gray-400 font-semibold">Technologies</th>
                                        <th class="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${portfolioContent.projects.slice(0, 5).map((project, idx) => `
                                        <tr class="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                                            <td class="py-3 px-4">
                                                <div class="font-medium text-gray-200">${project.title}</div>
                                            </td>
                                            <td class="py-3 px-4 text-gray-300 max-w-md">
                                                ${project.description.substring(0, 80)}...
                                            </td>
                                            <td class="py-3 px-4">
                                                <div class="flex flex-wrap gap-1">
                                                    ${project.tags.slice(0, 3).map(tag => 
                                                        `<span class="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">${tag}</span>`
                                                    ).join('')}
                                                </div>
                                            </td>
                                            <td class="py-3 px-4">
                                                <span class="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-300">
                                                    <i class="fas fa-check-circle mr-1"></i>Completed
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.startTraining();
        this.initCharts();
    },
    
    initializeMetrics() {
        // Initialize with empty arrays
        this.metrics.trainingLoss = [];
        this.metrics.validationLoss = [];
        this.metrics.accuracy = [];
        this.metrics.learningRate = [];
        this.metrics.currentEpoch = 0;
    },
    
    initCharts() {
        // Loss Chart
        const lossCtx = document.getElementById('lossChart');
        if (lossCtx) {
            this.chartInstances.loss = new Chart(lossCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Training Loss',
                            data: [],
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Validation Loss',
                            data: [],
                            borderColor: '#a855f7',
                            backgroundColor: 'rgba(168, 85, 247, 0.1)',
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            labels: { color: '#9ca3af' }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: '#374151' },
                            ticks: { color: '#9ca3af' }
                        },
                        y: {
                            grid: { color: '#374151' },
                            ticks: { color: '#9ca3af' }
                        }
                    }
                }
            });
        }
        
        // Accuracy Chart
        const accCtx = document.getElementById('accuracyChart');
        if (accCtx) {
            this.chartInstances.accuracy = new Chart(accCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Accuracy (%)',
                        data: [],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            labels: { color: '#9ca3af' }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: '#374151' },
                            ticks: { color: '#9ca3af' }
                        },
                        y: {
                            grid: { color: '#374151' },
                            ticks: { color: '#9ca3af' },
                            min: 0,
                            max: 100
                        }
                    }
                }
            });
        }
    },
    
    startTraining() {
        let startTime = Date.now();
        
        const updateMetrics = () => {
            if (this.metrics.currentEpoch >= this.metrics.totalEpochs) {
                this.metrics.currentEpoch = 0;
                this.initializeMetrics();
                if (this.chartInstances.loss) {
                    this.chartInstances.loss.data.labels = [];
                    this.chartInstances.loss.data.datasets[0].data = [];
                    this.chartInstances.loss.data.datasets[1].data = [];
                    this.chartInstances.loss.update();
                }
                if (this.chartInstances.accuracy) {
                    this.chartInstances.accuracy.data.labels = [];
                    this.chartInstances.accuracy.data.datasets[0].data = [];
                    this.chartInstances.accuracy.update();
                }
                startTime = Date.now();
            }
            
            this.metrics.currentEpoch++;
            
            // Simulate realistic training metrics
            const progress = this.metrics.currentEpoch / this.metrics.totalEpochs;
            const trainLoss = 2.5 * Math.exp(-3 * progress) + 0.05 + Math.random() * 0.05;
            const valLoss = 2.5 * Math.exp(-3 * progress) + 0.1 + Math.random() * 0.1;
            const accuracy = (1 - Math.exp(-3 * progress)) * 95 + Math.random() * 3;
            const lr = 0.001 * Math.cos(progress * Math.PI / 2);
            
            this.metrics.trainingLoss.push(trainLoss);
            this.metrics.validationLoss.push(valLoss);
            this.metrics.accuracy.push(accuracy);
            this.metrics.learningRate.push(lr);
            
            // Update UI
            document.getElementById('currentEpoch').textContent = this.metrics.currentEpoch;
            document.getElementById('progress').textContent = Math.round(progress * 100) + '%';
            document.getElementById('progressBar').style.width = (progress * 100) + '%';
            document.getElementById('trainLoss').textContent = trainLoss.toFixed(4);
            document.getElementById('valLoss').textContent = valLoss.toFixed(4);
            document.getElementById('accuracy').textContent = accuracy.toFixed(2) + '%';
            document.getElementById('lr').textContent = lr.toFixed(6);
            
            const bestVal = Math.min(...this.metrics.validationLoss);
            document.getElementById('bestValLoss').textContent = bestVal.toFixed(4);
            
            // Update runtime
            const elapsed = Date.now() - startTime;
            const hours = Math.floor(elapsed / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            document.getElementById('runtime').textContent = 
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            
            // Update charts
            if (this.chartInstances.loss) {
                this.chartInstances.loss.data.labels.push(this.metrics.currentEpoch);
                this.chartInstances.loss.data.datasets[0].data.push(trainLoss);
                this.chartInstances.loss.data.datasets[1].data.push(valLoss);
                this.chartInstances.loss.update('none');
            }
            
            if (this.chartInstances.accuracy) {
                this.chartInstances.accuracy.data.labels.push(this.metrics.currentEpoch);
                this.chartInstances.accuracy.data.datasets[0].data.push(accuracy);
                this.chartInstances.accuracy.update('none');
            }
            
            this.animationFrame = setTimeout(updateMetrics, 200); // Update every 200ms
        };
        
        updateMetrics();
    },
    
    cleanup() {
        if (this.animationFrame) {
            clearTimeout(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Destroy chart instances
        Object.values(this.chartInstances).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.chartInstances = {};
    }
};

if (typeof window !== 'undefined') {
    window.TrainingTheme = TrainingTheme;
}
