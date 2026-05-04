// 1. Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.05,
    rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// 2. Performance: Pause videos when not in view
const videoVisibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const playerId = entry.target.dataset.playerId;
        const players = {
            'story': myStoryPlayer,
            'luxury': luxuryPlayer,
            'intimate': intimatePlayer,
            'party': partyPlayer,
            'partyLeft': partyLeftPlayer,
            'partyRight': partyRightPlayer
        };
        const player = players[playerId];

        if (player && typeof player.pauseVideo === 'function' && typeof player.playVideo === 'function') {
            if (entry.isIntersecting) {
                player.playVideo();
            } else {
                player.pauseVideo();
            }
        }
    });
}, { threshold: 0.1 });

// 3. YouTube API Integration
let myStoryPlayer, luxuryPlayer, intimatePlayer, partyPlayer, partyLeftPlayer, partyRightPlayer;

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
        'vq': 'hd1080',
        'hd': 1,
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
            events: { 'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange }
        });
    }

    if (document.getElementById('intimateVideoPlayer')) {
        intimatePlayer = new YT.Player('intimateVideoPlayer', {
            videoId: 'XcIhJ-xxlk8',
            playerVars: { ...commonVars, 'playlist': 'XcIhJ-xxlk8' },
            events: { 'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange }
        });
    }

    if (document.getElementById('partyVideoPlayer')) {
        partyPlayer = new YT.Player('partyVideoPlayer', {
            videoId: 't-JuhBek4us',
            playerVars: { ...commonVars, 'playlist': 't-JuhBek4us' },
            events: { 'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange }
        });
    }

    if (document.getElementById('partyLeftPlayer')) {
        partyLeftPlayer = new YT.Player('partyLeftPlayer', {
            videoId: 'UB4kRoj3lc4',
            playerVars: { ...commonVars, 'playlist': 'UB4kRoj3lc4' },
            events: { 'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange }
        });
    }

    if (document.getElementById('partyRightPlayer')) {
        partyRightPlayer = new YT.Player('partyRightPlayer', {
            videoId: 'kJp7r38XQeI',
            playerVars: { ...commonVars, 'playlist': 'kJp7r38XQeI' },
            events: { 'onReady': onPlayerReady, 'onStateChange': onPlayerStateChange }
        });
    }
};

function onPlayerReady(event) {
    event.target.mute();

    // Attach observer to the player's container
    const iframe = event.target.getIframe();
    const container = iframe.closest('.album-item, .filmstrip-video-wrapper');
    if (container) {
        const idMap = {
            'storyVideoPlayer': 'story',
            'luxuryVideoPlayer': 'luxury',
            'intimateVideoPlayer': 'intimate',
            'partyVideoPlayer': 'party',
            'partyLeftPlayer': 'partyLeft',
            'partyRightPlayer': 'partyRight'
        };
        container.dataset.playerId = idMap[iframe.id];
        videoVisibilityObserver.observe(container);
    }

    if (typeof event.target.playVideo === 'function') {
        event.target.playVideo();
        setTimeout(() => {
            if (event.target.getPlayerState() !== YT.PlayerState.PLAYING) {
                if (event.target === myStoryPlayer) {
                    const fallbackBtn = document.getElementById('fallback-play-btn');
                    if (fallbackBtn) {
                        fallbackBtn.style.opacity = '1';
                        fallbackBtn.style.pointerEvents = 'auto';
                    }
                }
            }
        }, 1500);
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        event.target.playVideo();
    }

    const fallbackBtn = document.getElementById('fallback-play-btn');
    if (event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.BUFFERING) {
        if (fallbackBtn) {
            fallbackBtn.style.opacity = '0';
            fallbackBtn.style.pointerEvents = 'none';
        }
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.UNSTARTED) {
        if (event.target === myStoryPlayer && fallbackBtn) {
            fallbackBtn.style.opacity = '1';
            fallbackBtn.style.pointerEvents = 'auto';
        }
    }
}

function primeAllVideos() {
    const players = {
        'story': myStoryPlayer,
        'luxury': luxuryPlayer,
        'intimate': intimatePlayer,
        'party': partyPlayer,
        'partyLeft': partyLeftPlayer,
        'partyRight': partyRightPlayer
    };

    Object.keys(players).forEach(id => {
        const p = players[id];
        if (p && typeof p.playVideo === 'function') {
            const iframe = p.getIframe();
            if (iframe) {
                const container = iframe.closest('.album-item, .filmstrip-video-wrapper');
                if (container) {
                    const rect = container.getBoundingClientRect();
                    const isInView = (rect.top < window.innerHeight && rect.bottom > 0);
                    if (isInView && p.getPlayerState() !== YT.PlayerState.PLAYING) {
                        p.playVideo();
                    }
                }
            }
        }
    });
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
        'partyLeft': partyLeftPlayer,
        'partyRight': partyRightPlayer,
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
                activePlayer.currentTime = 0;
                if (iconMuted && iconUnmuted) { iconMuted.style.display = 'none'; iconUnmuted.style.display = 'block'; }
            } else {
                activePlayer.muted = true;
                if (iconMuted && iconUnmuted) { iconMuted.style.display = 'block'; iconUnmuted.style.display = 'none'; }
            }
        } else if (typeof activePlayer.isMuted === 'function') {
            if (activePlayer.isMuted()) {
                activePlayer.unMute();
                activePlayer.setVolume(100);
                activePlayer.seekTo(0);
                activePlayer.playVideo();
                if (iconMuted && iconUnmuted) { iconMuted.style.display = 'none'; iconUnmuted.style.display = 'block'; }
            } else {
                activePlayer.mute();
                if (iconMuted && iconUnmuted) { iconMuted.style.display = 'block'; iconUnmuted.style.display = 'none'; }
            }
        }
    }
};

// 4. Lightbox logic
let galleryImages = [];
let currentIndex = 0;

function initGallery() {
    const imgs = document.querySelectorAll('img:not(.partner-logo-img)');
    galleryImages = Array.from(imgs).map(img => img.src);

    imgs.forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', function (e) {
            e.stopPropagation();
            window.openLightbox(this.src);
        });
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

// 5. DOMContentLoaded Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Agency Mode Check
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'agency') {
        document.body.classList.add('agency-mode');
    }

    // Sticky Header
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    });

    // Hamburger Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
        });

        navLinks.querySelectorAll('a').forEach(item => {
            item.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });

        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Reveal animations
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

    // Lightbox touch
    const lb = document.getElementById('lightbox');
    if (lb) {
        let touchStartX = 0;
        let touchEndX = 0;
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

    // Infinite Reviews Scroll
    const reviewsSlider = document.querySelector('.reviews-slider');
    if (reviewsSlider) {
        const items = Array.from(reviewsSlider.children);
        items.forEach(item => reviewsSlider.appendChild(item.cloneNode(true)));
        items.forEach(item => reviewsSlider.insertBefore(item.cloneNode(true), reviewsSlider.firstChild));
        setTimeout(() => { reviewsSlider.scrollLeft = reviewsSlider.scrollWidth / 3; }, 100);

        let isScrolling;
        reviewsSlider.addEventListener('scroll', () => {
            window.clearTimeout(isScrolling);
            isScrolling = setTimeout(() => {
                const singleSetWidth = reviewsSlider.scrollWidth / 3;
                if (reviewsSlider.scrollLeft >= singleSetWidth * 2 - 50) {
                    reviewsSlider.style.scrollBehavior = 'auto';
                    reviewsSlider.scrollLeft -= singleSetWidth;
                } else if (reviewsSlider.scrollLeft <= 50) {
                    reviewsSlider.style.scrollBehavior = 'auto';
                    reviewsSlider.scrollLeft += singleSetWidth;
                }
            }, 150);
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
