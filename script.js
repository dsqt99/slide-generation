// DOM Elements
const generateBtn = document.getElementById('generateBtn');
const slideForm = document.getElementById('slideForm');
const outputSection = document.getElementById('output-section');
const errorSection = document.getElementById('errorSection');
const errorText = document.getElementById('errorText');
const previewFrame = document.getElementById('preview-frame');

// API Configuration
const API_URL = 'http://localhost:5678/webhook/ai-slide-autogen';
const SERVER_URL = 'http://localhost:8001';
const SLIDE_JSON_PATH = 'logs/slide.json';
const PREVIEW_URL = 'http://localhost:8001/preview-slide.html';

// State Management
let isGenerating = false;



// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

// Initialize all event listeners
function initializeEventListeners() {
    if (slideForm) {
        slideForm.addEventListener('submit', handleFormSubmit);
    }
    if (generateBtn) {
        generateBtn.addEventListener('click', handleFormSubmit);
    }
}

// Show loading state
function showLoading() {
    isGenerating = true;
    if (errorSection) errorSection.style.display = 'none';
    if (generateBtn) {
        generateBtn.disabled = true;
        const spinner = generateBtn.querySelector('.loading-spinner');
        const span = generateBtn.querySelector('span');
        if (spinner) spinner.style.display = 'inline-block';
        if (span) span.textContent = 'Đang tạo báo cáo...';
    }
}

// Hide loading state
function hideLoading() {
    isGenerating = false;
    if (generateBtn) {
        generateBtn.disabled = false;
        const spinner = generateBtn.querySelector('.loading-spinner');
        const span = generateBtn.querySelector('span');
        if (spinner) spinner.style.display = 'none';
        if (span) span.textContent = 'Tạo Báo Cáo';
    }
}

// Show error message
function showError(message) {
    if (errorSection && errorText) {
        errorText.textContent = message;
        errorSection.style.display = 'block';
    }
    console.error('Error:', message);
}

// Save JSON data to logs/slide.json
async function saveSlideData(data) {
    try {
        const response = await fetch('/save-slide-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to save slide data');
        }

        console.log('Slide data saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving slide data:', error);
        // Fallback: try to save using localStorage for client-side storage
        try {
            localStorage.setItem('slideData', JSON.stringify(data));
            console.log('Slide data saved to localStorage as fallback');
            return true;
        } catch (storageError) {
            console.error('Error saving to localStorage:', storageError);
            return false;
        }
    }
}

// Generate HTML template from JSON data with widget support
function generateRevealJsHtmlFromJson(slideData) {
    // Ensure slideData is an array
    const slides = Array.isArray(slideData) ? slideData : (slideData.slides || [slideData]);
    
    // Add 3D positions to slides
    const positions = [
        { x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0, scale: 1 },
        { x: 1500, y: 0, z: -500, rotateX: 0, rotateY: 15, scale: 1.1 },
        { x: 3000, y: 800, z: -1000, rotateX: 10, rotateY: -10, scale: 1.2 },
        { x: 0, y: -1200, z: -800, rotateX: -5, rotateY: 20, scale: 1.3 },
        { x: -1800, y: -1200, z: -600, rotateX: 5, rotateY: -25, scale: 1.1 },
        { x: -3000, y: 0, z: -1200, rotateX: 0, rotateY: 30, scale: 1.4 },
        { x: -2000, y: 1500, z: -800, rotateX: 15, rotateY: -15, scale: 1.2 },
        { x: 1000, y: 2000, z: -1000, rotateX: -10, rotateY: 25, scale: 1.3 },
        { x: 2500, y: 1200, z: -1500, rotateX: 8, rotateY: -20, scale: 1.1 },
        { x: 0, y: 0, z: -2500, rotateX: 0, rotateY: 0, scale: 1.5 }
    ];

    const slidesWithPositions = slides.map((slide, index) => ({
        ...slide,
        position: positions[index % positions.length]
    }));

    return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Generated Slides - Báo cáo Tài chính Chuyên nghiệp</title>
    
    <!-- TailwindCSS -->
    <script src="https://cdn.tailwindcss.com"><\/script>
    
    <!-- Reveal.js CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/reveal.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/theme/white.css">
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    
    <!-- Chart Libraries -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"><\/script>
    
    <!-- D3.js for Graph Visualization -->
    <script src="https://d3js.org/d3.v7.min.js"><\/script>
    
    <!-- Custom Configuration -->
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        'sans': ['Inter', 'system-ui', 'sans-serif'],
                    },
                    colors: {
                        primary: {
                            50: '#eff6ff',
                            100: '#dbeafe',
                            200: '#bfdbfe',
                            300: '#93c5fd',
                            400: '#60a5fa',
                            500: '#3b82f6',
                            600: '#2563eb',
                            700: '#1d4ed8',
                            800: '#1e40af',
                            900: '#1e3a8a',
                        },
                        secondary: {
                            50: '#f8fafc',
                            100: '#f1f5f9',
                            200: '#e2e8f0',
                            300: '#cbd5e1',
                            400: '#94a3b8',
                            500: '#64748b',
                            600: '#475569',
                            700: '#334155',
                            800: '#1e293b',
                            900: '#0f172a',
                        }
                    },
                    animation: {
                        'fade-in': 'fadeIn 0.5s ease-in-out',
                        'slide-up': 'slideUp 0.6s ease-out',
                        'slide-in-left': 'slideInLeft 0.8s ease-out',
                        'slide-in-right': 'slideInRight 0.8s ease-out',
                        'scale-in': 'scaleIn 0.5s ease-out',
                        'bounce-in': 'bounceIn 0.8s ease-out',
                    }
                }
            }
        }
        
        // Custom CSS Animations
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { 
                    opacity: 0; 
                    transform: translateY(30px); 
                }
                to { 
                    opacity: 1; 
                    transform: translateY(0); 
                }
            }
            
            @keyframes slideInLeft {
                from { 
                    opacity: 0; 
                    transform: translateX(-50px); 
                }
                to { 
                    opacity: 1; 
                    transform: translateX(0); 
                }
            }
            
            @keyframes slideInRight {
                from { 
                    opacity: 0; 
                    transform: translateX(50px); 
                }
                to { 
                    opacity: 1; 
                    transform: translateX(0); 
                }
            }
            
            @keyframes scaleIn {
                from { 
                    opacity: 0; 
                    transform: scale(0.9); 
                }
                to { 
                    opacity: 1; 
                    transform: scale(1); 
                }
            }
            
            @keyframes bounceIn {
                0% { 
                    opacity: 0; 
                    transform: scale(0.3) translateY(100px); 
                }
                50% { 
                    opacity: 1; 
                    transform: scale(1.05) translateY(-10px); 
                }
                70% { 
                    transform: scale(0.95) translateY(5px); 
                }
                100% { 
                    opacity: 1; 
                    transform: scale(1) translateY(0); 
                }
            }
            
            .reveal .slides section {
                text-align: left;
                font-family: 'Inter', sans-serif;
            }
            
            .reveal h1, .reveal h2, .reveal h3 {
                color: #1f2937;
                font-weight: 700;
                line-height: 1.2;
            }
            
            .reveal h1 {
                font-size: 1.2rem;
                font-weight: 800;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .reveal h2 {
                font-size: 1rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
            }
            
            .slide-title {
                text-align: center;
                margin-bottom: 0.5rem;
                animation: slideUp 0.8s ease-out;
            }
            
            .slide-content {
                max-width: 900px;
                margin: 0 auto;
                animation: fadeIn 0.6s ease-out;
            }
            
            /* Layout tối ưu: Title 20%, Chart/Table 80% */
            .reveal .slides section {
                height: 100vh !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: flex-start !important;
                align-items: center !important;
                padding: 0 !important;
            }
            
            /* Title area - chỉ chiếm 20% chiều cao */
            .reveal .slides section h1,
            .reveal .slides section h2 {
                flex: 0 0 20% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                margin: 0 !important;
                padding: 1rem !important;
                width: 100% !important;
                text-align: center !important;
                font-size: 0.8rem !important;
                line-height: 1.2 !important;
            }
            
            .reveal .slides section h2 {
                font-size: 0.7rem !important;
            }
            
            /* Chart container - chiếm 80% chiều cao */
            .chart-container {
                flex: 1 1 80% !important;
                width: 90% !important;
                height: 80vh !important;
                margin: 0 !important;
                padding: 1rem !important;
                animation: scaleIn 0.8s ease-out;
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
            }
            
            .chart-container canvas {
                width: 100% !important;
                height: 100% !important;
                max-height: 70vh !important;
            }
            
            .chart-container #echart-container {
                width: 100% !important;
                height: 100% !important;
                max-height: 70vh !important;
            }
            
            /* Table container - chiếm 80% chiều cao */
            .table-container {
                flex: 1 1 80% !important;
                width: 90% !important;
                height: 80vh !important;
                margin: 0 !important;
                padding: 1rem !important;
                animation: scaleIn 0.8s ease-out;
                overflow-y: auto !important;
                display: flex !important;
                flex-direction: column !important;
            }
            
            .bullet-point {
                margin: 1rem 0;
                padding-left: 1rem;
                border-left: 3px solid #667eea;
                animation: slideInLeft 0.6s ease-out;
            }
            
            .interactive-card {
                transition: all 0.3s ease;
            }
            
            .interactive-card:hover {
                transform: translateY(-5px) scale(1.02);
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            }
            
            .gradient-bg {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            
            .glass-effect {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .text-gradient {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            /* Enhanced Reveal.js Theme */
            .reveal {
                font-family: 'Inter', sans-serif;
                font-size: 1.1rem;
                line-height: 1.6;
            }
            
            .reveal .progress {
                color: #3b82f6;
            }
            
            .reveal .controls {
                color: #3b82f6;
            }
            
            /* Custom slide layouts */
            .slide-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
                align-items: center;
            }
            
            .slide-grid.single {
                grid-template-columns: 1fr;
            }
            
            .slide-grid.thirds {
                grid-template-columns: 1fr 2fr;
            }
            
            .slide-grid.reverse {
                grid-template-columns: 2fr 1fr;
            }
            
            @media (max-width: 768px) {
                .slide-grid {
                    grid-template-columns: 1fr !important;
                    gap: 1rem;
                }
            }
            
            /* Enhanced animations for different elements */
            .animate-delay-1 { animation-delay: 0.1s; }
            .animate-delay-2 { animation-delay: 0.2s; }
            .animate-delay-3 { animation-delay: 0.3s; }
            .animate-delay-4 { animation-delay: 0.4s; }
            .animate-delay-5 { animation-delay: 0.5s; }
            
            /* Interactive elements */
            .hover-lift {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .hover-lift:hover {
                transform: translateY(-5px);
                box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
            }
            
            /* Progress indicators */
            .progress-bar {
                width: 100%;
                height: 8px;
                background: #e5e7eb;
                border-radius: 4px;
                overflow: hidden;
                margin: 1rem 0;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                border-radius: 4px;
                transition: width 0.8s ease;
            }
            
            /* Data visualization enhancements */
            .data-card {
                background: white;
                border-radius: 12px;
                padding: 1.5rem;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                border: 1px solid #e5e7eb;
                transition: all 0.3s ease;
            }
            
            .data-card:hover {
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                transform: translateY(-2px);
            }
            
            .metric-large {
                font-size: 2.5rem;
                font-weight: 800;
                color: #1f2937;
                line-height: 1;
            }
            
            .metric-label {
                font-size: 0.875rem;
                color: #6b7280;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            
            .trend-indicator {
                display: inline-flex;
                align-items: center;
                gap: 0.25rem;
                font-size: 0.875rem;
                font-weight: 600;
                padding: 0.25rem 0.5rem;
                border-radius: 6px;
            }
            
            .trend-up {
                color: #10b981;
                background: rgba(16, 185, 129, 0.1);
            }
            
            .trend-down {
                color: #ef4444;
                background: rgba(239, 68, 68, 0.1);
            }
        \`;
        document.head.appendChild(style);
    <\/script>
    
    <style>
        /* Enhanced Reveal.js Theme */
        .reveal {
            font-family: 'Inter', sans-serif;
            font-size: 1.1rem;
            line-height: 1.6;
        }
        
        .reveal .progress {
            color: #3b82f6;
        }
        
        .reveal .controls {
            color: #3b82f6;
        }
        
        /* Custom slide layouts */
        .slide-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            align-items: center;
        }
        
        .slide-grid.single {
            grid-template-columns: 1fr;
        }
        
        .slide-grid.thirds {
            grid-template-columns: 1fr 2fr;
        }
        
        .slide-grid.reverse {
            grid-template-columns: 2fr 1fr;
        }
        
        @media (max-width: 768px) {
            .slide-grid {
                grid-template-columns: 1fr !important;
                gap: 1rem;
            }
        }
        
        /* Enhanced animations for different elements */
        .animate-delay-1 { animation-delay: 0.1s; }
        .animate-delay-2 { animation-delay: 0.2s; }
        .animate-delay-3 { animation-delay: 0.3s; }
        .animate-delay-4 { animation-delay: 0.4s; }
        .animate-delay-5 { animation-delay: 0.5s; }
        
        /* Interactive elements */
        .hover-lift {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .hover-lift:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
        }
        
        /* Progress indicators */
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
            margin: 1rem 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            border-radius: 4px;
            transition: width 0.8s ease;
        }
        
        /* Data visualization enhancements */
        .data-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
            transition: all 0.3s ease;
        }
        
        .data-card:hover {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
        }
        
        .metric-large {
            font-size: 2.5rem;
            font-weight: 800;
            color: #1f2937;
            line-height: 1;
        }
        
        .metric-label {
            font-size: 0.875rem;
            color: #6b7280;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .trend-indicator {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.875rem;
            font-weight: 600;
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
        }
        
        .trend-up {
            color: #10b981;
            background: rgba(16, 185, 129, 0.1);
        }
        
        .trend-down {
            color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
        }
    </style>
</head>
<body class="bg-gray-50">
    <div class="reveal">
        <div class="slides">
            ${slidesWithPositions.map((slide, index) => {
                const bgColor = slide.style?.bgColor || `gradient-bg-${(index % 5) + 1}`;
                const textColor = slide.style?.textColor || 'text-white';
                const align = slide.style?.align || 'left';
                
                // Handle widget-based slides
                if (slide.widget) {
                    switch (slide.widget.widget_type) {
                        case 'chart':
                            return renderWidgetChartSlide(slide, index, bgColor, textColor, align);
                        case 'table':
                            return renderWidgetTableSlide(slide, index, bgColor, textColor, align);
                        case 'graph':
                            return renderWidgetGraphSlide(slide, index, bgColor, textColor, align);
                        case 'content':
                        default:
                            return renderWidgetContentSlide(slide, index, bgColor, textColor, align);
                    }
                }
            }).join('')}
        </div>
    </div>

    <!-- Reveal.js JavaScript -->
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/reveal.js"><\\/script>
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/plugin/notes/notes.js"><\\/script>

    <script>
        // Initialize Reveal.js
        Reveal.initialize({
            hash: true,
            controls: true,
            progress: true,
            center: false,
            transition: 'slide',
            plugins: [ RevealNotes ]
        });

        // Initialize charts after Reveal.js is ready
        Reveal.addEventListener('ready', function() {
            initializeCharts();
        });

        // Initialize all charts
        function initializeCharts() {
            ${slidesWithPositions.map((slide, index) => {
                // Handle new widget format
                if (slide.widget && slide.widget.widget_type === 'chart') {
                    return generateWidgetChartScript(slide, index);
                } else if (slide.widget && slide.widget.widget_type === 'graph') {
                    return generateWidgetGraphScript(slide, index);
                }
                return '';
            }).filter(script => script).join('\n')}
        }
    <\\/script>
</body>
</html>`;
}

// Generate chart script for widget format
function generateWidgetChartScript(slide, index) {
    const chartData = slide.widget.data || {};
    
    // Convert slide data to Chart.js format
    const labels = chartData.labels || [];
    const series = chartData.series || [];
    
    const chartJsData = {
        labels: labels,
        datasets: series.map((serie, i) => ({
            label: serie.name || `Series ${i + 1}`,
            data: serie.data || [],
            backgroundColor: [
                '#2F7ED8', '#46bdff', '#0D52D1', '#42A5F5', 
                '#1976D2', '#1565C0', '#0D47A1', '#82B1FF'
            ],
            borderColor: '#2F7ED8',
            borderWidth: 2
        }))
    };
    
    return `
        // Initialize chart for slide ${index} (widget format)
        try {
            // Chart.js implementation
            const ctx${index} = document.getElementById('chart-${index}');
            if (ctx${index}) {
                const chart${index} = new Chart(ctx${index}, {
                    type: 'bar',
                    data: ${JSON.stringify(chartJsData)},
                    options: ${JSON.stringify(chartData.options || {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: { color: '#ffffff' }
                            },
                            title: {
                                display: true,
                                text: slide.title || 'Chart',
                                color: '#ffffff'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { color: '#ffffff' },
                                grid: { color: 'rgba(255, 255, 255, 0.1)' }
                            },
                            x: {
                                ticks: { color: '#ffffff' },
                                grid: { color: 'rgba(255, 255, 255, 0.1)' }
                            }
                        }
                    })}
                });
            }
            
            // ECharts implementation
            const echartContainer${index} = document.getElementById('echart-${index}');
            if (echartContainer${index} && typeof echarts !== 'undefined') {
                const myChart${index} = echarts.init(echartContainer${index});
                
                const option${index} = ${JSON.stringify(chartData.echarts_option || {
                    title: {
                        text: slide.title || 'Chart',
                        textStyle: { color: '#ffffff' }
                    },
                    tooltip: { trigger: 'axis' },
                    legend: {
                        data: ['Sample Series'],
                        textStyle: { color: '#ffffff' }
                    },
                    xAxis: {
                        type: 'category',
                        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        axisLabel: { color: '#ffffff' },
                        axisLine: { lineStyle: { color: '#ffffff' } }
                    },
                    yAxis: {
                        type: 'value',
                        axisLabel: { color: '#ffffff' },
                        axisLine: { lineStyle: { color: '#ffffff' } },
                        splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } }
                    },
                    series: [{
                        name: 'Sample Series',
                        type: 'bar',
                        data: [120, 200, 150, 80, 70, 110, 130],
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#83bff6' },
                                { offset: 0.5, color: '#188df0' },
                                { offset: 1, color: '#188df0' }
                            ])
                        }
                    }]
                })};
                
                myChart${index}.setOption(option${index});
                
                // Handle window resize
                window.addEventListener('resize', function() {
                    myChart${index}.resize();
                });
            }
        } catch (error) {
            console.error('Error creating widget chart for slide ${index}:', error);
        }
    `;
}

// Widget rendering functions for new format
function renderWidgetContentSlide(slide, index, bgColor, textColor, align) {
    const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
    const position = slide.position;
    
    return `
        <section class="slide ${bgColor} ${textColor}" 
                 data-x="${position.x}" 
                 data-y="${position.y}" 
                 data-z="${position.z}" 
                 data-rotate-x="${position.rotateX}" 
                 data-rotate-y="${position.rotateY}" 
                 data-scale="${position.scale}">
            <div class="slide-container ${alignClass}">
                ${slide.title ? `<h1 class="slide-title ${textColor} fadeIn">${escapeHtml(slide.title)}</h1>` : ''}
                ${slide.subtitle ? `<h2 class="slide-subtitle ${textColor} slideUp">${escapeHtml(slide.subtitle)}</h2>` : ''}
                
                ${slide.image ? `<div class="image-container slideInLeft">
                    <img src="${escapeHtml(slide.image)}" alt="Slide image" class="slide-image" />
                </div>` : ''}
                
                <div class="content-container slideInRight">
                    ${slide.content || ''}
                </div>
                
                ${slide.button ? `<div class="button-container scaleIn">
                    <a href="${escapeHtml(slide.button.url)}" class="slide-button" target="_blank">
                        ${escapeHtml(slide.button.text)}
                    </a>
                </div>` : ''}
            </div>
        </section>
    `;
}

// Generate graph script for widget format
function generateWidgetGraphScript(slide, index) {
    const graphData = slide.widget.data || {};
    const nodes = graphData.nodes || [];
    const links = graphData.links || [];
    
    // Create safe JavaScript object strings
    const nodesStr = nodes.map(node => 
        `{id: ${JSON.stringify(node.id)}, label: ${JSON.stringify(node.label)}}`
    ).join(',\n                    ');
    
    const linksStr = links.map(link => 
        `{source: ${JSON.stringify(link.source)}, target: ${JSON.stringify(link.target)}}`
    ).join(',\n                    ');
    
    return `
        // Initialize graph for slide ${index} (widget format)
        try {
            const graphContainer${index} = document.getElementById('graph-${index}');
            if (graphContainer${index} && typeof d3 !== 'undefined') {
                // Clear any existing content
                d3.select('#graph-${index}').selectAll("*").remove();
                
                // Set up dimensions
                const width = graphContainer${index}.clientWidth || 800;
                const height = graphContainer${index}.clientHeight || 500;
                
                // Create SVG
                const svg = d3.select('#graph-${index}')
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height);
                
                // Create graph data
                const nodes = [
                    ${nodesStr}
                ];
                const links = [
                    ${linksStr}
                ];
                
                // Debug: Log the parsed data
                console.log('Parsed nodes for slide ${index}:', nodes);
                console.log('Parsed links for slide ${index}:', links);
                
                // Create force simulation
                const simulation = d3.forceSimulation(nodes)
                    .force('link', d3.forceLink(links).id(d => d.id).distance(100))
                    .force('charge', d3.forceManyBody().strength(-300))
                    .force('center', d3.forceCenter(width / 2, height / 2));
                
                // Create links
                const link = svg.append('g')
                    .attr('class', 'links')
                    .selectAll('line')
                    .data(links)
                    .enter().append('line')
                    .attr('stroke', '#999')
                    .attr('stroke-opacity', 0.6)
                    .attr('stroke-width', 2);
                
                // Create nodes
                const node = svg.append('g')
                    .attr('class', 'nodes')
                    .selectAll('g')
                    .data(nodes)
                    .enter().append('g')
                    .call(d3.drag()
                        .on('start', dragstarted)
                        .on('drag', dragged)
                        .on('end', dragended));
                
                // Add circles to nodes
                node.append('circle')
                    .attr('r', 20)
                    .attr('fill', d => d.label.includes('Nam') ? '#4F46E5' : '#EC4899')
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 2);
                
                // Add labels to nodes
                node.append('text')
                    .text(d => d.label.split(' ')[0] + '\\n' + d.label.split(' ').slice(1).join(' '))
                    .attr('text-anchor', 'middle')
                    .attr('dy', '.35em')
                    .attr('font-size', '10px')
                    .attr('fill', '#fff')
                    .attr('font-weight', 'bold');
                
                // Add title tooltip
                node.append('title')
                    .text(d => d.label);
                
                // Update positions on simulation tick
                simulation.on('tick', () => {
                    link
                        .attr('x1', d => d.source.x)
                        .attr('y1', d => d.source.y)
                        .attr('x2', d => d.target.x)
                        .attr('y2', d => d.target.y);
                    
                    node
                        .attr('transform', d => \`translate(\${d.x},\${d.y})\`);
                });
                
                // Drag functions
                function dragstarted(event, d) {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                }
                
                function dragged(event, d) {
                    d.fx = event.x;
                    d.fy = event.y;
                }
                
                function dragended(event, d) {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }
                
                // Handle window resize
                window.addEventListener('resize', function() {
                    const newWidth = graphContainer${index}.clientWidth || 800;
                    const newHeight = graphContainer${index}.clientHeight || 500;
                    svg.attr('width', newWidth).attr('height', newHeight);
                    simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2));
                    simulation.alpha(0.3).restart();
                });
            }
        } catch (error) {
            console.error('Error creating widget graph for slide ${index}:', error);
        }
    `;
}

function renderWidgetContentSlide(slide, index, bgColor, textColor, align) {
    const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
    const position = slide.position;
    
    return `
        <section class="slide ${bgColor} ${textColor}" 
                 data-x="${position.x}" 
                 data-y="${position.y}" 
                 data-z="${position.z}" 
                 data-rotate-x="${position.rotateX}" 
                 data-rotate-y="${position.rotateY}" 
                 data-scale="${position.scale}">
            <div class="slide-container ${alignClass}">
                ${slide.title ? `<h1 class="slide-title ${textColor} fadeIn">${escapeHtml(slide.title)}</h1>` : ''}
                ${slide.subtitle ? `<h2 class="slide-subtitle ${textColor} slideUp">${escapeHtml(slide.subtitle)}</h2>` : ''}
                
                <div class="chart-container slideInLeft">
                    <canvas id="chart-${index}" class="chart-canvas"></canvas>
                    <div id="echart-${index}" class="echart-container"></div>
                </div>
                
                ${slide.button ? `<div class="button-container scaleIn">
                    <a href="${escapeHtml(slide.button.url)}" class="slide-button" target="_blank">
                        ${escapeHtml(slide.button.text)}
                    </a>
                </div>` : ''}
            </div>
        </section>
    `;
}

function renderWidgetGraphSlide(slide, index, bgColor, textColor, align) {
    const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
    const position = slide.position;
    
    return `
        <section class="slide ${bgColor} ${textColor}" 
                 data-x="${position.x}" 
                 data-y="${position.y}" 
                 data-z="${position.z}" 
                 data-rotate-x="${position.rotateX}" 
                 data-rotate-y="${position.rotateY}" 
                 data-scale="${position.scale}">
            <div class="slide-container ${alignClass}">
                ${slide.title ? `<h1 class="slide-title ${textColor} fadeIn">${escapeHtml(slide.title)}</h1>` : ''}
                ${slide.subtitle ? `<h2 class="slide-subtitle ${textColor} slideUp">${escapeHtml(slide.subtitle)}</h2>` : ''}
                
                <div class="graph-container slideInLeft">
                    <div id="graph-${index}" class="graph-canvas" style="width: 100%; height: 500px;"></div>
                </div>
                
                ${slide.button ? `<div class="button-container scaleIn">
                    <a href="${escapeHtml(slide.button.url)}" class="slide-button" target="_blank">
                        ${escapeHtml(slide.button.text)}
                    </a>
                </div>` : ''}
            </div>
        </section>
    `;
}

function renderWidgetTableSlide(slide, index, bgColor, textColor, align) {
    const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
    const position = slide.position;
    
    let tableHtml = '';
    
    // Helper function to format numbers and currency
    function formatCellValue(value, header) {
        if (typeof value === 'string' && value.includes('VND')) {
            // Format Vietnamese currency
            return value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        } else if (typeof value === 'number' || (typeof value === 'string' && /^\d+\.?\d*$/.test(value))) {
            // Format numbers with commas
            const num = typeof value === 'number' ? value : parseFloat(value);
            return num.toLocaleString('vi-VN');
        }
        return value;
    }
    
    // Handle different table data sources
    if (slide.widget.html_content) {
        tableHtml = slide.widget.html_content;
    } else if (slide.widget.data && slide.widget.data.columns && slide.widget.data.rows) {
        // Handle {columns: [...], rows: [...]} format from slide.json
        const columns = slide.widget.data.columns;
        const rows = slide.widget.data.rows;
        
        tableHtml = `
            <table class="financial-table-element ${textColor}">
                <thead>
                    <tr class="financial-table-row">
                        ${columns.map(column => `<th class="financial-table-header">${escapeHtml(column)}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(row => `
                        <tr class="financial-table-row">
                            ${row.map((cell, cellIndex) => `<td class="financial-table-cell">${escapeHtml(formatCellValue(cell, columns[cellIndex]))}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else if (slide.widget.data && Array.isArray(slide.widget.data)) {
        // Convert array data to table
        if (slide.widget.data.length > 0) {
            const headers = Object.keys(slide.widget.data[0]);
            tableHtml = `
                <table class="financial-table-element ${textColor}">
                    <thead>
                        <tr class="financial-table-row">
                            ${headers.map(header => `<th class="financial-table-header">${escapeHtml(header)}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${slide.widget.data.map(row => `
                            <tr class="financial-table-row">
                                ${headers.map(header => `<td class="financial-table-cell">${escapeHtml(formatCellValue(row[header] || '', header))}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    } else if (slide.widget.data && typeof slide.widget.data === 'object') {
        // Convert object data to simple table
        tableHtml = `
            <table class="financial-table-element ${textColor}">
                <tbody>
                    ${Object.entries(slide.widget.data).map(([key, value]) => `
                        <tr class="financial-table-row">
                            <td class="financial-table-cell"><strong>${escapeHtml(key)}</strong></td>
                            <td class="financial-table-cell">${escapeHtml(formatCellValue(value, key))}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    return `
        <section class="slide ${bgColor} ${textColor}" 
                 data-x="${position.x}" 
                 data-y="${position.y}" 
                 data-z="${position.z}" 
                 data-rotate-x="${position.rotateX}" 
                 data-rotate-y="${position.rotateY}" 
                 data-scale="${position.scale}">
            <div class="slide-container ${alignClass}">
                ${slide.title ? `<h1 class="slide-title ${textColor} fadeIn">${escapeHtml(slide.title)}</h1>` : ''}
                ${slide.subtitle ? `<h2 class="slide-subtitle ${textColor} slideUp">${escapeHtml(slide.subtitle)}</h2>` : ''}
                
                ${slide.image ? `<div class="image-container slideInLeft">
                    <img src="${escapeHtml(slide.image)}" alt="Slide image" class="slide-image" />
                </div>` : ''}
                
                <div class="table-container slideInRight">
                    ${tableHtml}
                </div>
                
                ${slide.button ? `<div class="button-container scaleIn">
                    <a href="${escapeHtml(slide.button.url)}" class="slide-button" target="_blank">
                        ${escapeHtml(slide.button.text)}
                    </a>
                </div>` : ''}
            </div>
        </section>
    `;
}

// Utility function to escape HTML
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Write HTML content to preview-slide.html
async function writeHtmlToPreview(htmlContent) {
    try {
        // Method 1: Try File System Access API (modern browsers)
        if ('showSaveFilePicker' in window) {
            try {
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: 'preview-slide.html',
                    types: [{
                        description: 'HTML Files',
                        accept: { 'text/html': ['.html'] }
                    }]
                });
                
                const writableStream = await fileHandle.createWritable();
                await writableStream.write(htmlContent);
                await writableStream.close();
                
                console.log('HTML file saved successfully via File System Access API');
                return true;
            } catch (fileError) {
                console.warn('File System Access API failed, falling back to blob method:', fileError);
            }
        }
        
        // Method 2: Create blob and download
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Create temporary download link
        const link = document.createElement('a');
        link.href = url;
        link.download = 'preview-slide.html';
        link.style.display = 'none';
        
        // Add to document, click, and cleanup
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup blob URL
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        console.log('HTML file downloaded successfully via blob method');
        return true;
        
    } catch (error) {
        console.error('Error writing HTML to preview:', error);
        
        // Method 3: Fallback - open in new window
        try {
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(htmlContent);
                newWindow.document.close();
                console.log('HTML opened in new window as fallback');
                return true;
            }
        } catch (windowError) {
            console.error('Fallback window method also failed:', windowError);
        }
        
        return false;
    }
}

// Navigate to preview page
function navigateToPreview() {
    window.location.href = PREVIEW_URL;
}

// Main form submit handler (Offline mode - demo only)
async function handleFormSubmit(event) {
    if (event) {
        event.preventDefault();
    }

    if (isGenerating) {
        return;
    }

    try {
        showLoading();

        // Get user prompt from textarea
        const userPrompt = document.getElementById('userPrompt');
        if (!userPrompt || !userPrompt.value.trim()) {
            throw new Error('Vui lòng nhập nội dung để tạo báo cáo');
        }

        // In offline mode, create sample data based on user prompt
        console.log('Creating sample slides for prompt:', userPrompt.value);
        
        const sampleSlideData = {
            "title": `Báo cáo: ${userPrompt.value.substring(0, 50)}...`,
            "subtitle": "Tạo bởi AI - Chế độ Demo Offline",
            "slides": [
                {
                    "type": "title",
                    "title": userPrompt.value.substring(0, 100),
                    "subtitle": "Báo cáo tài chính và phân tích dữ liệu",
                    "content": "Dựa trên yêu cầu: '" + userPrompt.value + "'. Đây là bản demo offline với dữ liệu mẫu."
                },
                {
                    "type": "content",
                    "title": "Phân tích Tổng quan",
                    "subtitle": "Kết quả kinh doanh quý gần nhất",
                    "content": "<ul><li>Doanh thu đạt <b>200 tỷ đồng</b>, tăng trưởng 15% so với quý trước</li><li>Lợi nhuận gộp cải thiện lên <b>42%</b> nhờ tối ưu chi phí</li><li>Thị phần tăng thêm <b>3.5%</b> trong phân khúc mục tiêu</li><li>Chi phí vận hành giảm <b>8%</b> so với cùng kỳ</li></ul>"
                },
                {
                    "type": "chart",
                    "title": "Xu hướng Doanh thu 6 Tháng",
                    "subtitle": "Tăng trưởng ổn định và bền vững",
                    "chart_type": "line",
                    "chart_data": {
                        "labels": ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"],
                        "datasets": [{
                            "label": "Doanh thu (tỷ đồng)",
                            "data": [150, 165, 180, 175, 190, 200],
                            "borderColor": "#3b82f6",
                            "backgroundColor": "rgba(59, 130, 246, 0.1)",
                            "fill": true
                        }]
                    }
                },
                {
                    "type": "chart",
                    "title": "Cơ cấu Doanh thu theo Phân khúc",
                    "subtitle": "Đa dạng hóa nguồn thu",
                    "chart_type": "doughnut",
                    "chart_data": {
                        "labels": ["Sản phẩm A", "Sản phẩm B", "Sản phẩm C", "Dịch vụ", "Khác"],
                        "datasets": [{
                            "label": "Tỷ trọng (%)",
                            "data": [35, 25, 20, 15, 5],
                            "backgroundColor": ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
                        }]
                    }
                },
                {
                    "type": "content",
                    "title": "Kế hoạch Phát triển",
                    "subtitle": "Chiến lược tăng trưởng bền vững",
                    "content": "<ul><li><b>Mở rộng thị trường:</b> Tập trung vào 3 khu vực trọng điểm với tiềm năng tăng trưởng cao</li><li><b>Đầu tư công nghệ:</b> Nâng cấp hệ thống với ngân sách <b>50 tỷ đồng</b></li><li><b>Phát triển nhân lực:</b> Tuyển dụng và đào tạo 200 nhân sự chất lượng cao</li><li><b>Đột phá sản phẩm:</b> Ra mắt 5 sản phẩm mới trong 18 tháng tới</li></ul>"
                }
            ]
        };

        // Save JSON data to localStorage
        const saveSuccess = await saveSlideData(sampleSlideData);
        if (!saveSuccess) {
            console.warn('Failed to save slide data, but continuing with generation');
        }

        // Generate HTML template from JSON
        const htmlContent = generateRevealJsHtmlFromJson(sampleSlideData);
        
        // Write HTML to preview-slide.html
        const writeSuccess = await writeHtmlToPreview(htmlContent);
        if (!writeSuccess) {
            console.warn('Failed to write HTML to preview file, but continuing');
        }

        hideLoading();

        // Navigate to preview page
        window.location.href = PREVIEW_URL;

    } catch (error) {
        hideLoading();
        showError(`Lỗi khi tạo báo cáo: ${error.message}`);
        console.error('Error in handleFormSubmit:', error);
    }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleFormSubmit,
        generateRevealJsHtmlFromJson,
        saveSlideData,
        escapeHtml
    };
}