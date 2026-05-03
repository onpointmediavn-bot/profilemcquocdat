// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.05, // Lowered threshold to trigger earlier
    rootMargin: '0px 0px -50px 0px' // Trigger slightly before it enters the viewport
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Sticky Header & Navigation
const header = document.querySelector('header');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('sticky');
    } else {
        header.classList.remove('sticky');
    }
});

// Hamburger Toggle
if (hamburger) {
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
    });
}

// Close menu when clicking nav links
navItems.forEach(item => {
    item.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (navLinks && navLinks.classList.contains('active') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// YOUTUBE API INTEGRATION
let myStoryPlayer, luxuryPlayer, intimatePlayer, partyPlayer;

window.onYouTubeIframeAPIReady = function() {
    const commonVars = { 
        'autoplay': 1, 
        'controls': 0, 
        'disablekb': 1, 
        'loop': 1, 
        'modestbranding': 1, 
        'mute': 1, 
        'playsinline': 1, 
        'enablejsapi': 1,
        'origin': window.location.origin
    };

    if (document.getElementById('storyVideoPlayer')) {
        myStoryPlayer = new YT.Player('storyVideoPlayer', {
            videoId: 'Fq_5GRmJAMI',
            playerVars: { ...commonVars, 'vq': 'hd1080', 'playlist': 'Fq_5GRmJAMI' },
            events: { 'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange }
        });
    }

    if (document.getElementById('luxuryVideoPlayer')) {
        luxuryPlayer = new YT.Player('luxuryVideoPlayer', {
            videoId: 'D90Pw-GZ9qQ',
            playerVars: { ...commonVars, 'playlist': 'D90Pw-GZ9qQ' },
            events: { 'onReady': onPlayerReady }
        });
    }

    if (document.getElementById('intimateVideoPlayer')) {
        intimatePlayer = new YT.Player('intimateVideoPlayer', {
            videoId: 'XcIhJ-xxlk8',
            playerVars: { ...commonVars, 'playlist': 'XcIhJ-xxlk8' },
            events: { 'onReady': onPlayerReady }
        });
    }

    if (document.getElementById('partyVideoPlayer')) {
        partyPlayer = new YT.Player('partyVideoPlayer', {
            videoId: 't-JuhBek4us',
            playerVars: { ...commonVars, 'playlist': 't-JuhBek4us' },
            events: { 'onReady': onPlayerReady }
        });
    }
};

function onPlayerReady(event) {
    event.target.mute();
    if (typeof event.target.playVideo === 'function') {
        event.target.playVideo();
    }
}

function onPlayerStateChange(event) {
    const fallbackBtn = document.getElementById('fallback-play-btn');
    if (event.data === 1 || event.data === 3) {
        if (fallbackBtn) fallbackBtn.style.opacity = '0';
        setTimeout(() => { if (fallbackBtn) fallbackBtn.style.pointerEvents = 'none'; }, 300);
    } else {
        if (fallbackBtn) {
            fallbackBtn.style.opacity = '1';
            fallbackBtn.style.pointerEvents = 'auto';
        }
    }
}

window.forcePlayStory = function() {
    if (myStoryPlayer && typeof myStoryPlayer.playVideo === 'function') {
        window.toggleAudioGroup('story');
        myStoryPlayer.playVideo();
    }
};

window.toggleAudioGroup = function(activeId) {
    const anHoiPlayer = document.getElementById('anhoiVideoPlayer');
    const players = {
        'story': myStoryPlayer,
        'luxury': luxuryPlayer,
        'intimate': intimatePlayer,
        'party': partyPlayer,
        'anhoi': anHoiPlayer
    };

    Object.keys(players).forEach(id => {
        const p = players[id];
        if (p && id !== activeId) {
            if (typeof p.mute === 'function') { p.mute(); }
            if (p.muted !== undefined) { p.muted = true; }
            const iM = document.getElementById('icon-muted-' + id);
            const iU = document.getElementById('icon-unmuted-' + id);
            if (iM && iU) { iM.style.display = 'block'; iU.style.display = 'none'; }
        }
    });

    const activePlayer = players[activeId];
    const iconMuted = document.getElementById('icon-muted-' + activeId);
    const iconUnmuted = document.getElementById('icon-unmuted-' + activeId);

    if (activePlayer) {
        if (activePlayer.muted !== undefined && typeof activePlayer.mute === 'undefined') {
            if (activePlayer.muted) {
                activePlayer.muted = false;
                if (iconMuted && iconUnmuted) { iconMuted.style.display = 'none'; iconUnmuted.style.display = 'block'; }
            } else {
                activePlayer.muted = true;
                if (iconMuted && iconUnmuted) { iconMuted.style.display = 'block'; iconUnmuted.style.display = 'none'; }
            }
        } else if (typeof activePlayer.isMuted === 'function') {
            if (activePlayer.isMuted()) {
                activePlayer.unMute();
                activePlayer.setVolume(100);
                if (iconMuted && iconUnmuted) { iconMuted.style.display = 'none'; iconUnmuted.style.display = 'block'; }
            } else {
                activePlayer.mute();
                if (iconMuted && iconUnmuted) { iconMuted.style.display = 'block'; iconUnmuted.style.display = 'none'; }
            }
        }
    }
};

// Lightbox logic
let galleryImages = [];
let currentIndex = 0;

function initGallery() {
    // Collect all images EXCEPT partner logos
    const imgs = document.querySelectorAll('img:not(.partner-logo-img)');
    galleryImages = Array.from(imgs).map(img => img.src);

    imgs.forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', function (e) {
            e.stopPropagation();
            window.openLightbox(this.src);
        });
    });

    // Explicitly remove cursor pointer from logos just in case
    document.querySelectorAll('.partner-logo-img').forEach(logo => {
        logo.style.cursor = 'default';
    });
}

window.openLightbox = function(imgSrc) {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    currentIndex = galleryImages.indexOf(imgSrc);
    window.updateLightboxContent();
    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden';
};

window.updateLightboxContent = function() {
    const lbImg = document.getElementById('lightbox-img');
    if (lbImg) lbImg.src = galleryImages[currentIndex];
};

window.changeImage = function(dir) {
    currentIndex = (currentIndex + dir + galleryImages.length) % galleryImages.length;
    window.updateLightboxContent();
};

window.closeLightbox = function() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) lightbox.classList.remove('show');
    document.body.style.overflow = 'auto';
};

// Touch support for lightbox
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Initial reveal for items already in view
    document.querySelectorAll('.fade-in').forEach(el => {
        revealObserver.observe(el);
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) el.classList.add('active');
    });

    initGallery();

    // Filmstrip hover pause
    const track = document.querySelector('.filmstrip-track');
    if (track) {
        track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
        track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
    }

    const lb = document.getElementById('lightbox');
    if (lb) {
        lb.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, false);
        lb.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 50) window.changeImage(1);
            if (touchEndX > touchStartX + 50) window.changeImage(-1);
        }, false);
        lb.addEventListener('click', (e) => {
            if (e.target === lb) window.closeLightbox();
        });
    }

    // Infinite Scroll for Feedbacks
    const reviewsSlider = document.querySelector('.reviews-slider');
    if (reviewsSlider) {
        const items = Array.from(reviewsSlider.children);
        
        // Clone items 2 times for a much longer buffer
        items.forEach(item => {
            const clone = item.cloneNode(true);
            reviewsSlider.appendChild(clone);
        });
        items.forEach(item => {
            const clone = item.cloneNode(true);
            reviewsSlider.insertBefore(clone, reviewsSlider.firstChild);
        });

        // The middle section is the original. 
        // We have 3 sections total. We want to start at the middle one.
        setTimeout(() => {
            const singleSetWidth = reviewsSlider.scrollWidth / 3;
            reviewsSlider.scrollLeft = singleSetWidth;
        }, 100);

        let isScrolling;
        reviewsSlider.addEventListener('scroll', () => {
            // Wait for user to stop scrolling/swiping before teleporting
            window.clearTimeout(isScrolling);
            
            isScrolling = setTimeout(() => {
                const singleSetWidth = reviewsSlider.scrollWidth / 3;
                
                // If scrolled into the 3rd section, jump back to 2nd section
                if (reviewsSlider.scrollLeft >= singleSetWidth * 2 - 50) {
                    reviewsSlider.style.scrollBehavior = 'auto';
                    reviewsSlider.scrollLeft -= singleSetWidth;
                } 
                // If scrolled into the 1st section, jump forward to 2nd section
                else if (reviewsSlider.scrollLeft <= 50) {
                    reviewsSlider.style.scrollBehavior = 'auto';
                    reviewsSlider.scrollLeft += singleSetWidth;
                }
            }, 150); // 150ms after scroll momentum stops
        });
    }

    // Load YouTube API
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
});
