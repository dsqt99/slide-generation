/**
 * Advanced ECharts Integration with Smooth Animations
 * Professional chart animations and interactions for AI AutoSlide
 */

class ChartAnimationManager {
    constructor() {
        this.charts = new Map();
        this.animationQueue = [];
        this.isAnimating = false;
    }

    // Initialize chart with advanced animations
    initChart(elementId, chartConfig, animationType = 'default') {
        const element = document.getElementById(elementId);
        if (!element) return null;

        const chart = echarts.init(element, null, {
            renderer: 'canvas',
            useDirtyRect: false
        });

        // Enhanced chart configuration with professional animations
        const enhancedConfig = this.enhanceChartConfig(chartConfig, animationType);
        
        // Set chart option with animation
        chart.setOption(enhancedConfig);
        
        // Store chart instance
        this.charts.set(elementId, chart);
        
        // Add interactive features
        this.addInteractiveFeatures(chart, elementId);
        
        // Add resize handler
        this.addResizeHandler(chart);
        
        return chart;
    }

    // Enhance chart configuration with animations
    enhanceChartConfig(config, animationType) {
        const baseAnimationConfig = {
            animation: true,
            animationDuration: 1500,
            animationEasing: 'cubicOut',
            animationDelay: (idx) => idx * 100,
            animationDurationUpdate: 800,
            animationEasingUpdate: 'cubicInOut'
        };

        const animationConfigs = {
            default: baseAnimationConfig,
            
            slideIn: {
                ...baseAnimationConfig,
                animationDuration: 2000,
                animationDelay: (idx) => idx * 150,
                animationEasing: 'elasticOut'
            },
            
            bounce: {
                ...baseAnimationConfig,
                animationDuration: 1800,
                animationEasing: 'bounceOut',
                animationDelay: (idx) => idx * 200
            },
            
            wave: {
                ...baseAnimationConfig,
                animationDuration: 2500,
                animationDelay: (idx) => Math.sin(idx * 0.5) * 200 + idx * 50,
                animationEasing: 'cubicOut'
            },
            
            spiral: {
                ...baseAnimationConfig,
                animationDuration: 3000,
                animationDelay: (idx) => idx * idx * 10,
                animationEasing: 'elasticOut'
            }
        };

        const selectedAnimation = animationConfigs[animationType] || animationConfigs.default;
        
        return {
            ...config,
            ...selectedAnimation,
            // Enhanced visual effects
            backgroundColor: config.backgroundColor || 'transparent',
            textStyle: {
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                ...config.textStyle
            }
        };
    }

    // Add interactive features to charts
    addInteractiveFeatures(chart, elementId) {
        // Hover effects with smooth transitions
        chart.on('mouseover', (params) => {
            this.onChartHover(chart, params, 'over');
        });

        chart.on('mouseout', (params) => {
            this.onChartHover(chart, params, 'out');
        });

        // Click interactions
        chart.on('click', (params) => {
            this.onChartClick(chart, params);
        });

        // Legend interactions
        chart.on('legendselectchanged', (params) => {
            this.onLegendChange(chart, params);
        });

        // Data zoom interactions
        chart.on('datazoom', (params) => {
            this.onDataZoom(chart, params);
        });
    }

    // Handle chart hover events
    onChartHover(chart, params, type) {
        if (type === 'over') {
            // Highlight effect
            chart.dispatchAction({
                type: 'highlight',
                seriesIndex: params.seriesIndex,
                dataIndex: params.dataIndex
            });

            // Add glow effect to chart container
            const container = chart.getDom();
            container.style.filter = 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.3))';
            container.style.transition = 'filter 0.3s ease';

        } else {
            // Remove highlight
            chart.dispatchAction({
                type: 'downplay',
                seriesIndex: params.seriesIndex,
                dataIndex: params.dataIndex
            });

            // Remove glow effect
            const container = chart.getDom();
            container.style.filter = 'none';
        }
    }

    // Handle chart click events
    onChartClick(chart, params) {
        // Create ripple effect
        this.createRippleEffect(chart.getDom(), params.event.event);
        
        // Animate clicked data point
        this.animateDataPoint(chart, params);
        
        // Show detailed tooltip
        this.showDetailedTooltip(chart, params);
    }

    // Handle legend changes
    onLegendChange(chart, params) {
        // Smooth transition for series visibility
        const option = chart.getOption();
        const seriesIndex = Object.keys(params.selected).findIndex(key => 
            params.selected[key] !== params.selected[key]
        );
        
        if (seriesIndex !== -1) {
            chart.setOption({
                series: option.series.map((series, index) => ({
                    ...series,
                    animationDuration: 600,
                    animationEasing: 'cubicInOut'
                }))
            });
        }
    }

    // Handle data zoom events
    onDataZoom(chart, params) {
        // Smooth zoom animation
        chart.setOption({
            animation: true,
            animationDuration: 500,
            animationEasing: 'cubicInOut'
        });
    }

    // Create ripple effect on click
    createRippleEffect(container, event) {
        const ripple = document.createElement('div');
        const rect = container.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(59, 130, 246, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            left: ${x - 10}px;
            top: ${y - 10}px;
            width: 20px;
            height: 20px;
            pointer-events: none;
            z-index: 1000;
        `;
        
        container.style.position = 'relative';
        container.appendChild(ripple);
        
        setTimeout(() => {
            container.removeChild(ripple);
        }, 600);
    }

    // Animate specific data point
    animateDataPoint(chart, params) {
        const option = chart.getOption();
        const series = option.series[params.seriesIndex];
        
        // Create temporary highlight animation
        chart.setOption({
            series: [{
                ...series,
                data: series.data.map((item, index) => {
                    if (index === params.dataIndex) {
                        return {
                            ...item,
                            itemStyle: {
                                ...item.itemStyle,
                                shadowBlur: 20,
                                shadowColor: 'rgba(59, 130, 246, 0.6)',
                                borderWidth: 3,
                                borderColor: '#3b82f6'
                            }
                        };
                    }
                    return item;
                })
            }]
        });
        
        // Reset after animation
        setTimeout(() => {
            chart.setOption({
                series: [series]
            });
        }, 1000);
    }

    // Show detailed tooltip
    showDetailedTooltip(chart, params) {
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-detailed-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        `;
        
        tooltip.innerHTML = `
            <div class="font-semibold">${params.seriesName}</div>
            <div>Giá trị: ${params.value}</div>
            <div>Chỉ số: ${params.dataIndex + 1}</div>
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = chart.getDom().getBoundingClientRect();
        tooltip.style.left = (rect.left + params.event.offsetX + 10) + 'px';
        tooltip.style.top = (rect.top + params.event.offsetY - 10) + 'px';
        
        // Show with animation
        setTimeout(() => {
            tooltip.style.opacity = '1';
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(tooltip);
            }, 300);
        }, 2000);
    }

    // Add resize handler
    addResizeHandler(chart) {
        const resizeObserver = new ResizeObserver(() => {
            chart.resize();
        });
        
        resizeObserver.observe(chart.getDom());
        
        // Also handle window resize
        window.addEventListener('resize', () => {
            chart.resize();
        });
    }

    // Animate chart entrance
    animateChartEntrance(elementId, delay = 0) {
        setTimeout(() => {
            const chart = this.charts.get(elementId);
            if (chart) {
                const container = chart.getDom();
                container.style.opacity = '0';
                container.style.transform = 'scale(0.8) translateY(20px)';
                container.style.transition = 'all 0.8s cubic-bezier(0.22, 0.61, 0.36, 1)';
                
                setTimeout(() => {
                    container.style.opacity = '1';
                    container.style.transform = 'scale(1) translateY(0)';
                }, 100);
            }
        }, delay);
    }

    // Create chart with staggered animation
    createStaggeredChart(elementId, chartConfig, staggerDelay = 200) {
        const chart = this.initChart(elementId, chartConfig, 'wave');
        this.animateChartEntrance(elementId, staggerDelay);
        return chart;
    }

    // Update chart with smooth transition
    updateChart(elementId, newConfig, animationType = 'default') {
        const chart = this.charts.get(elementId);
        if (chart) {
            const enhancedConfig = this.enhanceChartConfig(newConfig, animationType);
            chart.setOption(enhancedConfig, true);
        }
    }

    // Dispose chart
    disposeChart(elementId) {
        const chart = this.charts.get(elementId);
        if (chart) {
            chart.dispose();
            this.charts.delete(elementId);
        }
    }

    // Dispose all charts
    disposeAllCharts() {
        this.charts.forEach((chart, elementId) => {
            chart.dispose();
        });
        this.charts.clear();
    }

    // Get chart instance
    getChart(elementId) {
        return this.charts.get(elementId);
    }

    // Create financial chart with advanced features
    createFinancialChart(elementId, data, type = 'revenue') {
        const baseConfig = {
            backgroundColor: 'transparent',
            grid: {
                left: '10%',
                right: '10%',
                top: '15%',
                bottom: '15%',
                containLabel: true
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: 'transparent',
                textStyle: {
                    color: '#fff',
                    fontSize: 14
                },
                axisPointer: {
                    type: 'cross',
                    crossStyle: {
                        color: '#3b82f6'
                    }
                }
            },
            legend: {
                top: '5%',
                textStyle: {
                    color: '#374151',
                    fontSize: 14
                }
            },
            xAxis: {
                type: 'category',
                data: data.categories || [],
                axisLine: {
                    lineStyle: {
                        color: '#e5e7eb'
                    }
                },
                axisLabel: {
                    color: '#6b7280',
                    fontSize: 12
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
                    color: '#6b7280',
                    fontSize: 12,
                    formatter: (value) => {
                        if (value >= 1000) {
                            return (value / 1000).toFixed(1) + 'K';
                        }
                        return value;
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#f3f4f6',
                        type: 'dashed'
                    }
                }
            },
            series: data.series || []
        };

        return this.createStaggeredChart(elementId, baseConfig, 300);
    }
}

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .chart-detailed-tooltip {
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
`;
document.head.appendChild(style);

// Export for global use
window.ChartAnimationManager = ChartAnimationManager;