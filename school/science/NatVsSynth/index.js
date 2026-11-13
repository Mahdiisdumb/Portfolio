const AUTOPLAY_INTERVAL = 2147483647; // ms v x 10^3 = s
const track = document.getElementById('slidesTrack');
const container = document.getElementById('slideshowContainer');
const pagination = document.getElementById('paginationContainer');
const slides = track.querySelectorAll('.slide');
let currentIndex = 0, autoplayTimer = null;

function updateSlide() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    pagination.querySelectorAll('.dot').forEach((dot, idx) => dot.classList.toggle('active', idx === currentIndex));
}

function move(dir) {
    currentIndex = (currentIndex + dir + slides.length) % slides.length;
    updateSlide();
    resetAutoplay();
}

function start() {
    if (!autoplayTimer && slides.length > 1) {
        autoplayTimer = setInterval(() => move(1), AUTOPLAY_INTERVAL);
    }
}

function stop() {
    if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
    }
}

function resetAutoplay() {
    stop();
    start();
}

// Fallback keywords for legacy API
const KEYWORD_POSITION_MAP = {
    'top-left':      { left: '0%',    top: '0%',    translate: '0%, 0%' },
    'top-center':    { left: '50%',   top: '0%',    translate: '-50%, 0%' },
    'top-right':     { left: '100%',  top: '0%',    translate: '-100%, 0%' },
    'center-left':   { left: '0%',    top: '50%',   translate: '0%, -50%' },
    'center':        { left: '50%',   top: '50%',   translate: '-50%, -50%' },
    'center-right':  { left: '100%',  top: '50%',   translate: '-100%, -50%' },
    'bottom-left':   { left: '0%',    top: '100%',  translate: '0%, -100%' },
    'bottom-center': { left: '50%',   top: '100%',  translate: '-50%, -100%' },
    'bottom-right':  { left: '100%',  top: '100%',  translate: '-100%, -100%' }
};

function applyElementStyles(element) {
    const bg = element.getAttribute('data-bg') || '';
    if (bg) {
        if (bg.startsWith('http') || bg.includes('/') || bg.includes('.')) {
            element.style.backgroundImage = `url('${bg}')`;
        } else {
            element.style.background = bg;
        }
    }

    const textColor = element.getAttribute('data-text-color');
    if (textColor) element.style.color = textColor;

    const size = element.getAttribute('data-size');
    if (size) element.style.fontSize = size.match(/^\d+$/) ? `${size}px` : size;
}

function applyPositioning(element, positionAttr) {
    if (!positionAttr) return;
    
    element.style.position = 'absolute';
    
    if (positionAttr.includes(',')) {
        const [xSegment, ySegment] = positionAttr.split(',');
        const xRaw = xSegment.trim();
        const yRaw = ySegment.trim();

        const leftValue = xRaw.match(/[a-zA-Z%]/) ? xRaw : `calc(50% + ${xRaw}px)`;
        const topValue = yRaw.match(/[a-zA-Z%]/) ? yRaw : `calc(50% - ${yRaw}px)`; 

        element.style.left = leftValue;
        element.style.top = topValue;
        element.style.transform = 'translate(-50%, -50%)'; 
    } 
    else if (KEYWORD_POSITION_MAP[positionAttr]) {
        const config = KEYWORD_POSITION_MAP[positionAttr];
        element.style.left = config.left;
        element.style.top = config.top;
        element.style.transform = `translate(${config.translate})`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (slides.length === 0) return;

    slides.forEach((slide, i) => {
        applyElementStyles(slide);

        const slideContentWrapper = slide.querySelector('.slide-content');
        const slidePosition = slide.getAttribute('data-position');
        
        // Fix: Explicitly remove padding limits if custom container positioning is targeted
        if (slideContentWrapper) {
            slideContentWrapper.style.position = 'absolute';
            if (slidePosition) {
                slideContentWrapper.style.width = 'max-content';
                slideContentWrapper.style.maxWidth = '600px';
                applyPositioning(slideContentWrapper, slidePosition);
            } else {
                // If the slide frame has no positioning, treat the canvas area as a full stage container
                slideContentWrapper.style.inset = '0';
                slideContentWrapper.style.width = '100%';
                slideContentWrapper.style.maxWidth = '100%';
            }
        }

        // Deep child elements selector loop
        const styledChildren = slide.querySelectorAll('.slide-content, [data-position], [data-bg], [data-text-color], [data-size]');
        styledChildren.forEach(child => {
            applyElementStyles(child);
            // Apply positioning modifications safely only to explicit sub-items
            if (child !== slide && child !== slideContentWrapper) {
                applyPositioning(child, child.getAttribute('data-position'));
            }
        });

        const dot = document.createElement('span');
        dot.className = `dot${i === 0 ? ' active' : ''}`;
        dot.onclick = () => {
            currentIndex = i;
            updateSlide();
            resetAutoplay();
        };
        pagination.appendChild(dot);
    });

    document.getElementById('prevBtn').onclick = () => move(-1);
    document.getElementById('nextBtn').onclick = () => move(1);
    window.onkeydown = (e) => {
        if (e.key === "ArrowLeft") move(-1);
        if (e.key === "ArrowRight") move(1);
    };
    container.onmouseenter = stop;
    container.onmouseleave = start;
    start();
});