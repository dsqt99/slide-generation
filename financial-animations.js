/*******************************
 * FINANCIAL ANIMATION MANAGER *
 * Modern Professional Effects   *
 *******************************/

class FinancialAnimationManager {
  constructor() {
    this.isAnimating = false;
    this.slideTransitionDuration = 800;
    this.init();
  }

  init() {
    this.initSmoothTransitions();
    this.initScrollEffects();
    this.initChartAnimations();
    this.initPerformanceOptimization();
  }





  // Smooth Transitions
  initSmoothTransitions() {
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes swipe-indicator-anim {
        0% {
          opacity: 0;
          transform: translateY(-50%) scale(0.5);
        }
        50% {
          opacity: 1;
          transform: translateY(-50%) scale(1.1);
        }
        100% {
          opacity: 0;
          transform: translateY(-50%) scale(1);
        }
      }

      @keyframes slide-element-entrance {
        0% {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes chart-entrance {
        0% {
          opacity: 0;
          transform: translateY(50px) rotateX(15deg);
        }
        100% {
          opacity: 1;
          transform: translateY(0) rotateX(0);
        }
      }

      @keyframes number-counter {
        0% {
          transform: translateY(10px);
          opacity: 0;
        }
        100% {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .financial-slide-enter .financial-title {
        animation: slide-element-entrance 0.8s cubic-bezier(0.23, 1, 0.320, 1) forwards;
      }

      .financial-slide-enter .financial-subtitle {
        animation: slide-element-entrance 0.8s cubic-bezier(0.23, 1, 0.320, 1) 0.2s forwards;
      }

      .financial-slide-enter .financial-text-line {
        animation: slide-element-entrance 0.8s cubic-bezier(0.23, 1, 0.320, 1) 0.4s forwards;
      }

      .financial-slide-enter .financial-chart {
        animation: chart-entrance 1s cubic-bezier(0.23, 1, 0.320, 1) 0.3s forwards;
      }

      .financial-slide-enter .financial-table {
        animation: slide-element-entrance 0.8s cubic-bezier(0.23, 1, 0.320, 1) 0.5s forwards;
      }

      .slide-number-animate {
        animation: number-counter 0.5s cubic-bezier(0.23, 1, 0.320, 1);
      }
    `;
    document.head.appendChild(style);

    // Listen for slide changes
    if (typeof Reveal !== 'undefined') {
      Reveal.on('slidechanged', (event) => {
        this.animateSlideElements(event.currentSlide);
      });
    }
  }

  animateSlideElements(slide) {
    if (!slide) return;

    // Add entrance class
    slide.classList.add('financial-slide-enter');

    // Animate elements sequentially
    const elements = slide.querySelectorAll('.financial-title, .financial-subtitle, .financial-text-line, .financial-chart, .financial-table');
    
    elements.forEach((element, index) => {
      element.style.opacity = '0';
      setTimeout(() => {
        element.style.opacity = '1';
      }, index * 150);
    });

    // Animate charts
    const charts = slide.querySelectorAll('[id^="chart-"]');
    charts.forEach((chart, index) => {
      setTimeout(() => {
        this.animateChart(chart);
      }, 300 + index * 200);
    });

    // Remove class after animation
    setTimeout(() => {
      slide.classList.remove('financial-slide-enter');
    }, 2000);
  }

  // Scroll Effects
  initScrollEffects() {
    let ticking = false;

    const updateScrollEffects = () => {
      const scrolled = window.pageYOffset;
      const viewportHeight = window.innerHeight;

      // Parallax effect for backgrounds
      const parallaxElements = document.querySelectorAll('.financial-slide');
      parallaxElements.forEach((element, index) => {
        const speed = 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });

      // Fade in elements on scroll
      const fadeElements = document.querySelectorAll('.financial-content-block');
      fadeElements.forEach(element => {
        const elementTop = element.offsetTop;
        const elementHeight = element.offsetHeight;
        const isVisible = (scrolled + viewportHeight) > elementTop && scrolled < (elementTop + elementHeight);
        
        if (isVisible) {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }
      });

      ticking = false;
    };

    const requestScrollUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  }

  // Chart Animations
  initChartAnimations() {
    // Intersection Observer for chart animations
    const chartObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateChart(entry.target);
          chartObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe all charts
    const charts = document.querySelectorAll('[id^="chart-"]');
    charts.forEach(chart => chartObserver.observe(chart));
  }

  animateChart(chartElement) {
    if (!chartElement) return;

    // Add chart entrance animation
    chartElement.style.opacity = '0';
    chartElement.style.transform = 'translateY(50px) rotateX(15deg)';
    
    setTimeout(() => {
      chartElement.style.transition = 'all 1s cubic-bezier(0.23, 1, 0.320, 1)';
      chartElement.style.opacity = '1';
      chartElement.style.transform = 'translateY(0) rotateX(0)';
    }, 100);

    // Add shine effect
    this.addChartShine(chartElement);
  }

  addChartShine(element) {
    const shine = document.createElement('div');
    shine.style.cssText = `
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, 
        transparent, 
        rgba(30, 58, 138, 0.1), 
        transparent
      );
      animation: chart-shine 2s ease-in-out;
      pointer-events: none;
      z-index: 10;
    `;
    
    element.style.position = 'relative';
    element.appendChild(shine);
    
    setTimeout(() => {
      if (element.contains(shine)) {
        element.removeChild(shine);
      }
    }, 2000);
  }

  // Performance Optimization
  initPerformanceOptimization() {
    // Use requestAnimationFrame for smooth animations
    const optimizeAnimations = () => {
      const elements = document.querySelectorAll('.financial-animate');
      elements.forEach(el => {
        if (this.isElementInViewport(el)) {
          el.classList.add('financial-visible');
        }
      });
      requestAnimationFrame(optimizeAnimations);
    };
    
    requestAnimationFrame(optimizeAnimations);

    // Throttle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) {
        cancelAnimationFrame(scrollTimeout);
      }
      scrollTimeout = requestAnimationFrame(() => {
        // Scroll-based animations
      });
    }, { passive: true });
  }

  isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // Sound Effects
  playTransitionSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Silently fail if audio is not supported
    }
  }

  // Number Counter Animation
  animateNumber(element, start, end, duration = 2000) {
    const startTime = performance.now();
    const difference = end - start;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = start + difference * easeOutQuart;
      
      element.textContent = Math.round(current).toLocaleString();
      element.classList.add('slide-number-animate');
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  // Advanced Slide Transitions
  createSlideTransition(fromSlide, toSlide, direction = 'next') {
    if (!fromSlide || !toSlide) return;

    // Create transition overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, 
        rgba(30, 58, 138, 0.9), 
        rgba(245, 158, 11, 0.9)
      );
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.6s cubic-bezier(0.23, 1, 0.320, 1);
      backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(overlay);
    
    // Animate overlay
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });

    // Remove overlay after animation
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
      }, 600);
    }, 300);
  }
}

// Initialize the financial animation manager
window.financialManager = new FinancialAnimationManager();