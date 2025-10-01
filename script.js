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

// Chart Converter Class - JavaScript equivalent of Python ChartConverter
class ChartConverter {
    constructor() {
        this.jsFunctionPattern = /"__js_function__"\s*:\s*true/;
    }

    /**
     * Convert objects to native JavaScript objects
     */
    toNative(obj) {
        try {
            // Handle objects
            if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
                const result = {};
                for (const [key, value] of Object.entries(obj)) {
                    try {
                        result[this.toNative(key)] = this.toNative(value);
                    } catch (e) {
                        console.warn(`Failed to convert key-value pair ${key}:`, e);
                        result[String(key)] = value !== null ? String(value) : null;
                    }
                }
                return result;
            }
            
            // Handle arrays
            else if (Array.isArray(obj)) {
                return obj.map(item => {
                    try {
                        return this.toNative(item);
                    } catch (e) {
                        console.warn('Failed to convert array item:', e);
                        return item !== null ? String(item) : null;
                    }
                });
            }
            
            // Handle primitive types
            else if (typeof obj === 'string' || typeof obj === 'number' || 
                     typeof obj === 'boolean' || obj === null || obj === undefined) {
                return obj;
            }
            
            // Fallback for unknown types
            else {
                return String(obj);
            }
        } catch (e) {
            console.error('Error in toNative conversion:', e);
            return obj !== null ? String(obj) : null;
        }
    }

    /**
     * Process JavaScript functions in chart configuration
     */
    processJsFunctions(obj) {
        if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'object' && value !== null &&
                    value.__js_function__ === true && 'value' in value) {
                    // Keep the JavaScript function structure for frontend processing
                    result[key] = {
                        __js_function__: true,
                        value: this.cleanJsFunction(value.value)
                    };
                } else {
                    result[key] = this.processJsFunctions(value);
                }
            }
            return result;
        } else if (Array.isArray(obj)) {
            return obj.map(item => this.processJsFunctions(item));
        } else {
            return obj;
        }
    }

    /**
     * Clean and format JavaScript function code
     */
    cleanJsFunction(jsCode) {
        if (typeof jsCode !== 'string') {
            return String(jsCode);
        }
        
        // Remove extra escaping
        let cleaned = jsCode.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\'/g, "'");
        
        // Remove leading/trailing whitespace
        cleaned = cleaned.trim();
        
        return cleaned;
    }

    /**
     * Check if object is an ECharts configuration
     */
    isEchartsConfig(obj) {
        if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
            return false;
        }
        
        const echartsProperties = [
            'backgroundColor', 'color', 'title', 'legend', 'tooltip',
            'grid', 'xAxis', 'yAxis', 'series', 'graphic', 'animation'
        ];
        
        const foundProperties = echartsProperties.filter(prop => prop in obj);
        return foundProperties.length >= 2;
    }

    /**
     * Convert chart data to slide format
     */
    convertChartToSlideFormat(chartData) {
        const processedData = this.processJsFunctions(this.toNative(chartData));
        
        return {
            widget_type: "chart",
            widget_name: "ECharts Visualization",
            output_type: "chart",
            data: processedData.data || {},
            widget_code: processedData,
            image_url: null,
            html_content: null,
            filename: null
        };
    }

    /**
     * Create slide from chart data
     */
    createSlideFromChart(chartData, slideId = null) {
        const widget = this.convertChartToSlideFormat(chartData);
        
        return {
            id: slideId || `slide_${Date.now()}`,
            title: chartData.title?.text || "Chart Slide",
            subtitle: chartData.title?.subtext || "Generated from chart",
            content: "",
            style: {
                bgColor: "bg-white",
                textColor: "text-gray-800",
                align: "center"
            },
            widget: widget
        };
    }

    /**
     * Convert chart.json to slides format
     */
    async convertChartJsonToSlides(chartJsonPath) {
        try {
            const response = await fetch(chartJsonPath);
            if (!response.ok) {
                throw new Error(`Failed to load ${chartJsonPath}: ${response.statusText}`);
            }
            
            const rawChart = await response.json();
            const chartData = this.toNative(rawChart);
            
            let slides = [];
            
            // Handle different data structures
            if (Array.isArray(chartData)) {
                // Array of charts
                chartData.forEach((chart, index) => {
                    const slide = this.createSlideFromChart(chart, `slide_${index + 1}`);
                    slides.push(slide);
                });
            } else if (this.isEchartsConfig(chartData)) {
                // Single ECharts configuration
                const slide = this.createSlideFromChart(chartData, 'slide_1');
                slides.push(slide);
            } else if (typeof chartData === 'object' && chartData !== null) {
                // Single chart object
                const slide = this.createSlideFromChart(chartData, 'slide_1');
                slides.push(slide);
            } else {
                throw new Error('Invalid chart data format');
            }
            
            const slideData = {
                slide_data: {
                    title: "Chart Presentation",
                    subtitle: "Generated from chart.json",
                    slides: slides
                }
            };
            
            console.log(`✅ Converted ${slides.length} slide(s) from chart data`);
            return slideData;
            
        } catch (error) {
            console.error('Error converting chart JSON to slides:', error);
            throw error;
        }
    }

    /**
     * Validate slide data structure
     */
    validateSlideData(slideData) {
        try {
            if (!slideData || typeof slideData !== 'object') {
                console.error('Slide data must be an object');
                return false;
            }
            
            const slides = slideData.slide_data?.slides || slideData.slides || [];
            if (!Array.isArray(slides)) {
                console.error('Slides must be an array');
                return false;
            }
            
            for (const slide of slides) {
                if (!slide.id || !slide.title) {
                    console.error('Each slide must have id and title');
                    return false;
                }
                
                if (slide.widget && slide.widget.widget_type === 'chart') {
                    if (!slide.widget.widget_code || typeof slide.widget.widget_code !== 'object') {
                        console.error('Chart slides must have valid widget_code');
                        return false;
                    }
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error validating slide data:', error);
            return false;
        }
    }
}

// Initialize chart converter
const chartConverter = new ChartConverter();

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
    
    // Add test button for debugging
    const testBtn = document.createElement('button');
    testBtn.textContent = 'Test với dữ liệu có sẵn';
    testBtn.className = 'generate-btn';
    testBtn.style.marginTop = '10px';
    testBtn.style.backgroundColor = '#28a745';
    testBtn.type = 'button'; // Prevent form submission
    testBtn.onclick = testWithExistingData;
    
    // Add button after the form
    if (generateBtn && generateBtn.parentNode && generateBtn.parentNode.parentNode) {
        const formContainer = generateBtn.parentNode.parentNode;
        formContainer.appendChild(testBtn);
    }
}

// Test function using existing slide data
async function testWithExistingData() {
    try {
        showLoading();
        
        // Load existing slide data from multiple sources
        let slideData = null;
        
        // Try to load from localStorage first
        const localStorageData = localStorage.getItem('slideData');
        if (localStorageData) {
            slideData = JSON.parse(localStorageData);
            console.log('Loaded slide data from localStorage');
        } else {
            // Try to load from server
            try {
                const response = await fetch('/logs/slide.json');
                if (response.ok) {
                    slideData = await response.json();
                    console.log('Loaded slide data from server');
                }
            } catch (serverError) {
                console.log('Could not load from server, trying default data');
            }
        }
        
        // If no data found, use default sample data
        if (!slideData) {
            slideData = {
                "title": "Báo cáo Tài chính Quý 4/2024",
                "subtitle": "Tổng quan hiệu suất kinh doanh và chiến lược phát triển",
                "slides": [
                    {
                        "type": "title",
                        "title": "Báo cáo Tài chính Quý 4/2024",
                        "subtitle": "Tổng quan hiệu suất kinh doanh và chiến lược phát triển",
                        "content": "Công ty Cổ phần Công nghệ FireAnt trình bày báo cáo tài chính quý 4 năm 2024 với kết quả kinh doanh vượt trội và chiến lược phát triển bền vững."
                    },
                    {
                        "type": "content",
                        "title": "Tổng quan Kết quả Kinh doanh",
                        "subtitle": "Đạt được nhiều bước tiến quan trọng",
                        "content": "<ul><li>Doanh thu quý 4 đạt <b>150 tỷ đồng</b>, tăng 25% so với cùng kỳ</li><li>Lợi nhuận sau thuế đạt <b>25 tỷ đồng</b>, vượt 15% kế hoạch</li><li>Tỷ suất lợi nhuận gộp cải thiện lên <b>35%</b></li></ul>"
                    },
                    {
                        "type": "chart",
                        "title": "Phân tích Doanh thu theo Quý",
                        "subtitle": "Tăng trưởng ổn định qua các quý",
                        "chart_type": "line",
                        "chart_data": {
                            "labels": ["Quý 1", "Quý 2", "Quý 3", "Quý 4"],
                            "datasets": [{
                                "label": "Doanh thu (tỷ đồng)",
                                "data": [120, 135, 145, 150],
                                "borderColor": "#3b82f6",
                                "backgroundColor": "rgba(59, 130, 246, 0.1)"
                            }]
                        }
                    }
                ]
            };
            console.log('Using default sample data');
        }
        
        console.log('Slide data:', slideData);
        
        // Generate HTML template from JSON
        const htmlContent = generateRevealJsHtmlFromJson(slideData);
        
        // Try to open in new window first
        try {
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                newWindow.document.write(htmlContent);
                newWindow.document.close();
                hideLoading();
                return;
            }
        } catch (windowError) {
            console.log('Could not open in new window, trying download');
        }
        
        // Fallback to download
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'preview-slide.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        hideLoading();

    } catch (error) {
        hideLoading();
        console.error('Error in testWithExistingData:', error);
        showError('Lỗi khi test với dữ liệu có sẵn: ' + error.message);
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
                        case 'content':
                        default:
                            return renderWidgetContentSlide(slide, index, bgColor, textColor, align);
                    }
                }
                
                // Legacy support for old format
                if (slide.type === 'chart' && slide.chart_data) {
                    return renderChartSlide(slide, index, bgColor);
                } else {
                    return renderContentSlide(slide, index, bgColor);
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
                }
                // Legacy support for old format
                if (slide.type === 'chart' && slide.chart_data) {
                    return generateChartScript(slide, index);
                }
                return '';
            }).filter(script => script).join('\n')}
        }
    <\\/script>
</body>
</html>`;
}

// Render content slide with professional design
function renderContentSlide(slide, index, gradientClass) {
    let contentHtml;
    
    // Check if content is HTML string with <ul> or <li> tags
    if (slide.content && slide.content.includes('<ul>')) {
        // Parse HTML content and convert to bullet points
        contentHtml = `
            <div class="space-y-6 animate-slide-up">
                ${slide.content.replace(/<ul>/g, '<div class="space-y-4">')
                              .replace(/<\/ul>/g, '</div>')
                              .replace(/<li>(.*?)<\/li>/g, '<div class="bullet-point flex items-start space-x-3 hover-lift"><div class="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0 animate-pulse"></div><span class="text-xl leading-relaxed text-gray-700">$1</span></div>')
                              .replace(/<b>(.*?)<\/b>/g, '<strong class="font-bold text-gray-800">$1</strong>')
                              .replace(/<p>(.*?)<\/p>/g, '<p class="text-xl leading-relaxed text-gray-700 mb-4">$1</p>')}
            </div>
        `;
    } else if (Array.isArray(slide.content)) {
        contentHtml = `
            <div class="space-y-6 animate-slide-up">
                ${slide.content.map((item, i) => `
                    <div class="bullet-point flex items-start space-x-3 hover-lift animate-delay-${i + 1}" style="animation-delay: ${0.6 + i * 0.2}s">
                        <div class="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                        <span class="text-xl leading-relaxed text-gray-700">${escapeHtml(item)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        contentHtml = `<div class="text-xl leading-relaxed text-gray-700 animate-slide-up">${escapeHtml(slide.content || '')}</div>`;
    }

    return `
        <section class="${gradientClass} relative overflow-hidden" 
                 data-background-gradient="${gradientClass}" 
                 data-transition="slide"
                 style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 4rem;">
            
            <!-- Animated background elements -->
            <div class="absolute inset-0 opacity-10">
                <div class="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
                <div class="absolute top-40 right-20 w-16 h-16 bg-white rounded-full animate-bounce"></div>
                <div class="absolute bottom-20 left-20 w-12 h-12 bg-white rounded-full animate-ping"></div>
                <div class="absolute bottom-40 right-10 w-24 h-24 bg-white rounded-full animate-pulse"></div>
            </div>
            
            <div class="slide-content relative z-10" style="max-width: 64rem; width: 100%;">
                <div class="text-center mb-8">
                    <h1 class="slide-title text-5xl font-black mb-4 animate-bounce-in" style="animation-delay: 0.2s;">
                        ${escapeHtml(slide.title || '')}
                    </h1>
                    ${slide.subtitle ? `<h2 class="text-2xl font-semibold text-white opacity-90 animate-slide-up" style="animation-delay: 0.4s;">${escapeHtml(slide.subtitle)}</h2>` : ''}
                </div>
                
                <div class="glass-effect rounded-3xl p-8 backdrop-blur-lg">
                    ${contentHtml}
                    
                    ${slide.key_points ? `
                        <div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${slide.key_points.map((point, i) => `
                                <div class="data-card hover-lift animate-delay-${i + 1}" style="animation-delay: ${1 + i * 0.2}s">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                            ${i + 1}
                                        </div>
                                        <span class="font-medium text-gray-700">${escapeHtml(point)}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                ${slide.notes ? `
                    <div class="mt-6 text-center">
                        <p class="text-sm text-white opacity-80 animate-fade-in" style="animation-delay: 1.5s;">
                            <i class="fas fa-lightbulb mr-2"></i>${escapeHtml(slide.notes)}
                        </p>
                    </div>
                ` : ''}
            </div>
        </section>
    `;
}

// Render chart slide with ECharts integration
function renderChartSlide(slide, index, gradientClass) {
    const chartId = `chart-${index}`;
    const echartId = `echart-${index}`;
    
    return `
        <section class="${gradientClass} relative overflow-hidden" 
                 data-background-gradient="${gradientClass}" 
                 data-transition="slide"
                 style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 4rem;">
            
            <!-- Animated background elements -->
            <div class="absolute inset-0 opacity-10">
                <div class="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
                <div class="absolute top-40 right-20 w-16 h-16 bg-white rounded-full animate-bounce"></div>
                <div class="absolute bottom-20 left-20 w-12 h-12 bg-white rounded-full animate-ping"></div>
                <div class="absolute bottom-40 right-10 w-24 h-24 bg-white rounded-full animate-pulse"></div>
            </div>
            
            <div class="slide-content relative z-10" style="max-width: 80rem; width: 100%;">
                <div class="text-center mb-8">
                    <h1 class="slide-title text-5xl font-black mb-4 animate-bounce-in" style="animation-delay: 0.2s;">
                        ${escapeHtml(slide.title || '')}
                    </h1>
                    ${slide.subtitle ? `<h2 class="text-2xl font-semibold text-white opacity-90 animate-slide-up" style="animation-delay: 0.4s;">${escapeHtml(slide.subtitle)}</h2>` : ''}
                </div>
                
                <div class="glass-effect rounded-3xl p-8 backdrop-blur-lg">
                    <!-- Chart Container with multiple chart types -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <!-- Chart.js Chart -->
                        <div class="data-card hover-lift animate-scale-in" style="animation-delay: 0.6s;">
                            <h3 class="text-lg font-semibold mb-4 text-center text-gray-700">
                                <i class="fas fa-chart-bar mr-2 text-blue-500"></i>Biểu đồ dữ liệu
                            </h3>
                            <div class="chart-container">
                                <canvas id="${chartId}" width="400" height="300"></canvas>
                            </div>
                        </div>
                        
                        <!-- ECharts Chart -->
                        <div class="data-card hover-lift animate-scale-in echart-container" style="animation-delay: 0.8s;">
                            <h3 class="text-lg font-semibold mb-4 text-center text-gray-700">
                                <i class="fas fa-chart-line mr-2 text-green-500"></i>Phân tích xu hướng
                            </h3>
                            <div id="${echartId}" class="chart-container"></div>
                        </div>
                    </div>
                    
                    <!-- Interactive Data Cards -->
                    ${slide.chart_data && slide.chart_data.metrics ? `
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            ${slide.chart_data.metrics.map((metric, i) => `
                                <div class="data-card text-center hover-lift animate-delay-${i + 1}" style="animation-delay: ${1 + i * 0.1}s">
                                    <div class="metric-large text-gradient">${escapeHtml(metric.value)}</div>
                                    <div class="metric-label">${escapeHtml(metric.label)}</div>
                                    ${metric.trend ? `
                                        <div class="trend-indicator ${metric.trend > 0 ? 'trend-up' : 'trend-down'} mt-2">
                                            <i class="fas fa-arrow-${metric.trend > 0 ? 'up' : 'down'}"></i>
                                            ${Math.abs(metric.trend)}%
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <!-- Progress Indicators -->
                    ${slide.chart_data && slide.chart_data.progress ? `
                        <div class="space-y-4">
                            ${slide.chart_data.progress.map((item, i) => `
                                <div class="animate-delay-${i + 1}" style="animation-delay: ${1.5 + i * 0.1}s">
                                    <div class="flex justify-between items-center mb-2">
                                        <span class="font-medium text-gray-700">${escapeHtml(item.name)}</span>
                                        <span class="text-sm font-semibold text-blue-600">${item.value}%</span>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${item.value}%"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                ${slide.notes ? `
                    <div class="mt-6 text-center">
                        <p class="text-sm text-white opacity-80 animate-fade-in" style="animation-delay: 2s;">
                            <i class="fas fa-info-circle mr-2"></i>${escapeHtml(slide.notes)}
                        </p>
                    </div>
                ` : ''}
            </div>
        </section>
    `;
}

// Generate chart script with both Chart.js and ECharts integration
function generateChartScript(slide, index) {
    const chartId = `chart-${index}`;
    const echartId = `echart-${index}`;
    const chartData = slide.chart_data;
    
    return `
        try {
            // Chart.js Chart
            const ctx${index} = document.getElementById('${chartId}');
            if (ctx${index}) {
                new Chart(ctx${index}, {
                    type: '${chartData.type || 'bar'}',
                    data: ${JSON.stringify(chartData.data || {
                        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                        datasets: [{
                            label: 'Doanh thu',
                            data: [120000, 190000, 300000, 500000],
                            backgroundColor: [
                                'rgba(59, 130, 246, 0.8)',
                                'rgba(16, 185, 129, 0.8)',
                                'rgba(139, 92, 246, 0.8)',
                                'rgba(245, 158, 11, 0.8)'
                            ],
                            borderColor: [
                                'rgba(59, 130, 246, 1)',
                                'rgba(16, 185, 129, 1)',
                                'rgba(139, 92, 246, 1)',
                                'rgba(245, 158, 11, 1)'
                            ],
                            borderWidth: 2
                        }]
                    })},
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    font: {
                                        family: 'Inter',
                                        size: 14
                                    }
                                }
                            },
                            title: {
                                display: true,
                                text: '${escapeHtml(chartData.title || slide.title || 'Biểu đồ dữ liệu')}',
                                font: {
                                    family: 'Inter',
                                    size: 16,
                                    weight: 'bold'
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: 'rgba(0, 0, 0, 0.1)'
                                },
                                ticks: {
                                    font: {
                                        family: 'Inter'
                                    }
                                }
                            },
                            x: {
                                grid: {
                                    color: 'rgba(0, 0, 0, 0.1)'
                                },
                                ticks: {
                                    font: {
                                        family: 'Inter'
                                    }
                                }
                            }
                        },
                        animation: {
                            duration: 2000,
                            easing: 'easeInOutQuart'
                        }
                    }
                });
            }

            // ECharts Integration
            const echartContainer${index} = document.getElementById('${echartId}');
            if (echartContainer${index}) {
                const myChart${index} = echarts.init(echartContainer${index});
                
                // Sample ECharts options - can be customized based on chartData
                const option${index} = {
                    title: {
                        text: '${escapeHtml(chartData.title || 'Phân tích xu hướng')}',
                        subtext: '${escapeHtml(chartData.subtitle || 'Dữ liệu tài chính')}',
                        left: 'center',
                        textStyle: {
                            fontFamily: 'Inter',
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: '#1f2937'
                        },
                        subtextStyle: {
                            fontFamily: 'Inter',
                            fontSize: 12,
                            color: '#6b7280'
                        }
                    },
                    tooltip: {
                        trigger: 'axis',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        textStyle: {
                            fontFamily: 'Inter',
                            color: '#374151'
                        },
                        formatter: function(params) {
                            let result = '<div style="padding: 10px;">';
                            result += '<div style="font-weight: bold; margin-bottom: 5px;">' + params[0].name + '</div>';
                            params.forEach(function(item) {
                                result += '<div style="margin: 3px 0;">';
                                result += '<span style="display: inline-block; width: 10px; height: 10px; background-color: ' + item.color + '; margin-right: 5px; border-radius: 50%;"></span>';
                                result += item.seriesName + ': ' + item.value.toLocaleString() + ' VNĐ';
                                result += '</div>';
                            });
                            result += '</div>';
                            return result;
                        }
                    },
                    legend: {
                        data: ['Doanh thu', 'Lợi nhuận', 'Chi phí'],
                        bottom: 10,
                        textStyle: {
                            fontFamily: 'Inter'
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '15%',
                        containLabel: true,
                        backgroundColor: 'transparent'
                    },
                    xAxis: {
                        type: 'category',
                        data: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'],
                        axisLine: {
                            lineStyle: {
                                color: '#e5e7eb'
                            }
                        },
                        axisLabel: {
                            fontFamily: 'Inter',
                            color: '#6b7280'
                        }
                    },
                    yAxis: {
                        type: 'value',
                        axisLine: {
                            lineStyle: {
                                color: '#e5e7eb'
                            }
                        },
                        axisLabel: {
                            fontFamily: 'Inter',
                            color: '#6b7280',
                            formatter: function(value) {
                                return (value / 1000000) + 'M';
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: '#f3f4f6'
                            }
                        }
                    },
                    series: [
                        {
                            name: 'Doanh thu',
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 8,
                            lineStyle: {
                                width: 3,
                                color: '#3b82f6'
                            },
                            itemStyle: {
                                color: '#3b82f6',
                                borderWidth: 2,
                                borderColor: '#fff'
                            },
                            areaStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                                    { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
                                ])
                            },
                            data: [120000, 190000, 300000, 500000, 420000, 680000]
                        },
                        {
                            name: 'Lợi nhuận',
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 8,
                            lineStyle: {
                                width: 3,
                                color: '#10b981'
                            },
                            itemStyle: {
                                color: '#10b981',
                                borderWidth: 2,
                                borderColor: '#fff'
                            },
                            data: [30000, 45000, 80000, 150000, 120000, 200000]
                        },
                        {
                            name: 'Chi phí',
                            type: 'bar',
                            barWidth: '60%',
                            itemStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: '#8b5cf6' },
                                    { offset: 1, color: '#a855f7' }
                                ]),
                                borderRadius: [4, 4, 0, 0]
                            },
                            data: [90000, 145000, 220000, 350000, 300000, 480000]
                        }
                    ],
                    animation: true,
                    animationDuration: 2000,
                    animationEasing: 'elasticOut'
                };
                
                myChart${index}.setOption(option${index});
                
                // Add interactive features
                myChart${index}.on('click', function(params) {
                    console.log('Chart clicked:', params);
                    // Add custom click behavior here
                });
                
                myChart${index}.on('mouseover', function(params) {
                    // Add hover effects
                    if (params.componentType === 'series') {
                        myChart${index}.dispatchAction({
                            type: 'highlight',
                            seriesIndex: params.seriesIndex,
                            dataIndex: params.dataIndex
                        });
                    }
                });
                
                // Handle window resize
                window.addEventListener('resize', function() {
                    myChart${index}.resize();
                });
                
                // Add keyboard shortcuts for chart interaction
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'r' || e.key === 'R') {
                        myChart${index}.resize();
                    }
                });
            }
        } catch (error) {
            console.error('Error creating charts for slide ${index}:', error);
        }
    `;
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
    
    let contentHtml = '';
    
    // Handle different content sources
    if (slide.widget.html_content) {
        contentHtml = slide.widget.html_content;
    } else if (slide.content) {
        contentHtml = `<p class="slide-content ${textColor}">${escapeHtml(slide.content)}</p>`;
    } else if (slide.widget.data && typeof slide.widget.data === 'object') {
        // Convert data object to readable content
        contentHtml = `<div class="data-content ${textColor}">
            ${Object.entries(slide.widget.data).map(([key, value]) => 
                `<div class="data-item"><strong>${escapeHtml(key)}:</strong> ${escapeHtml(String(value))}</div>`
            ).join('')}
        </div>`;
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
                
                <div class="content-container slideInRight">
                    ${contentHtml}
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

function renderWidgetChartSlide(slide, index, bgColor, textColor, align) {
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