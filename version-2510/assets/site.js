(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initNavigation() {
        var toggle = document.querySelector('.nav-toggle');
        var nav = document.querySelector('.main-nav');
        var search = document.querySelector('.top-search');
        if (!toggle || !nav || !search) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
            search.classList.toggle('open');
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function initFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        if (!panel) {
            return;
        }
        var input = panel.querySelector('[data-search-input]');
        var typeSelect = panel.querySelector('[data-type-select]');
        var yearSelect = panel.querySelector('[data-year-select]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var empty = document.querySelector('.empty-state');

        function apply() {
            var keyword = normalize(input && input.value);
            var typeValue = normalize(typeSelect && typeSelect.value);
            var yearValue = normalize(yearSelect && yearSelect.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesType = !typeValue || haystack.indexOf(typeValue) !== -1;
                var matchesYear = !yearValue || haystack.indexOf(yearValue) !== -1;
                var ok = matchesKeyword && matchesType && matchesYear;
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        [input, typeSelect, yearSelect].forEach(function (el) {
            if (el) {
                el.addEventListener('input', apply);
                el.addEventListener('change', apply);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && input) {
            input.value = q;
        }
        apply();
    }

    function initPlayer() {
        var playerBox = document.querySelector('[data-player-box]');
        if (!playerBox) {
            return;
        }
        var video = playerBox.querySelector('video');
        var cover = playerBox.querySelector('.player-cover');
        var button = playerBox.querySelector('.play-button-large');
        var src = video ? video.getAttribute('data-m3u8') : '';
        var started = false;

        function play() {
            if (!video || !src) {
                return;
            }
            if (!started) {
                started = true;
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    video.addEventListener('loadedmetadata', function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = src;
                    video.play().catch(function () {});
                }
            } else {
                video.play().catch(function () {});
            }
            if (cover) {
                cover.classList.add('hidden');
            }
            video.setAttribute('controls', 'controls');
        }

        if (cover) {
            cover.addEventListener('click', play);
        }
        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                play();
            });
        }
    }

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
        initPlayer();
    });
})();
