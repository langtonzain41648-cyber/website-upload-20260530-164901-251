(function () {
    const nav = document.getElementById('mainNav');
    const toggle = document.querySelector('.menu-toggle');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('.hero-dot'));
        const prev = hero.querySelector('.hero-prev');
        const next = hero.querySelector('.hero-next');
        let current = 0;
        let timer = null;

        function show(index) {
            if (!slides.length) return;
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) window.clearInterval(timer);
        }

        if (prev) prev.addEventListener('click', function () { show(current - 1); start(); });
        if (next) next.addEventListener('click', function () { show(current + 1); start(); });
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.dataset.slide || 0));
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        const grid = scope.nextElementSibling;
        if (!grid) return;
        const input = scope.querySelector('.filter-input');
        const selects = Array.from(scope.querySelectorAll('.filter-select'));
        const items = Array.from(grid.querySelectorAll('.filter-item'));

        function apply() {
            const term = input ? input.value.trim().toLowerCase() : '';
            const chosen = {};
            selects.forEach(function (select) {
                chosen[select.dataset.filter] = select.value;
            });

            items.forEach(function (item) {
                const text = [
                    item.dataset.title,
                    item.dataset.region,
                    item.dataset.type,
                    item.dataset.year,
                    item.dataset.genre
                ].join(' ').toLowerCase();
                const matchesTerm = !term || text.includes(term);
                const matchesSelects = Object.keys(chosen).every(function (key) {
                    return !chosen[key] || (item.dataset[key] || '') === chosen[key];
                });
                item.classList.toggle('is-hidden', !(matchesTerm && matchesSelects));
            });
        }

        if (input) input.addEventListener('input', apply);
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
        apply();
    });

    const searchInput = document.getElementById('searchPageInput');
    if (searchInput) {
        const query = new URLSearchParams(window.location.search).get('q') || '';
        searchInput.value = query;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    document.querySelectorAll('[data-player]').forEach(function (box) {
        const video = box.querySelector('video');
        const cover = box.querySelector('.player-cover');
        const stream = box.dataset.stream;
        let ready = false;
        let hls = null;

        function attach() {
            if (!video || !stream || ready) return;
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function play() {
            attach();
            box.classList.add('playing');
            const p = video.play();
            if (p && typeof p.catch === 'function') {
                p.catch(function () {
                    box.classList.remove('playing');
                });
            }
        }

        if (cover) cover.addEventListener('click', play);
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                box.classList.add('playing');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) box.classList.remove('playing');
            });
        }
        window.addEventListener('pagehide', function () {
            if (hls) hls.destroy();
        });
    });
})();
