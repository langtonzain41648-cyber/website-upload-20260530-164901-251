(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        setupMobileMenu();
        setupHeroSlider();
        setupLocalFilters();
        setupImageFallbacks();
        setupVideoPlayers();
        scrollToPlayerFromHash();
    });

    function setupMobileMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');

        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener('click', function () {
            var expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!expanded));
            panel.hidden = expanded;
        });
    }

    function setupHeroSlider() {
        var root = document.querySelector('[data-hero-slider]');

        if (!root) {
            return;
        }

        var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-go-slide]'));
        var previous = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5500);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-go-slide')) || 0);
                restart();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupLocalFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

        panels.forEach(function (panel) {
            var searchInput = panel.querySelector('[data-local-search]');
            var grid = findGridForPanel(panel);
            var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('[data-card]')) : [];
            var count = panel.querySelector('[data-result-count]');
            var selectedYear = 'all';
            var selectedCategory = 'all';

            if (!grid || cards.length === 0) {
                return;
            }

            if (searchInput && searchInput.hasAttribute('data-read-query')) {
                var params = new URLSearchParams(window.location.search);
                var queryName = searchInput.getAttribute('data-read-query') || 'q';
                var incoming = params.get(queryName);

                if (incoming) {
                    searchInput.value = incoming;
                }
            }

            panel.querySelectorAll('[data-filter-year]').forEach(function (button) {
                button.addEventListener('click', function () {
                    selectedYear = button.getAttribute('data-filter-year') || 'all';
                    setActiveButton(button, '[data-filter-year]');
                    apply();
                });
            });

            panel.querySelectorAll('[data-filter-category]').forEach(function (button) {
                button.addEventListener('click', function () {
                    selectedCategory = button.getAttribute('data-filter-category') || 'all';
                    setActiveButton(button, '[data-filter-category]');
                    apply();
                });
            });

            if (searchInput) {
                searchInput.addEventListener('input', apply);
            }

            apply();

            function apply() {
                var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var meta = (card.getAttribute('data-meta') || '').toLowerCase();
                    var title = (card.getAttribute('data-title') || '').toLowerCase();
                    var cardYear = card.getAttribute('data-year') || '';
                    var cardCategory = card.getAttribute('data-category') || '';
                    var cardCategories = cardCategory.split(/\s+/).filter(Boolean);
                    var matchesKeyword = !keyword || meta.indexOf(keyword) !== -1 || title.indexOf(keyword) !== -1;
                    var matchesYear = selectedYear === 'all' || cardYear === selectedYear;
                    var matchesCategory = selectedCategory === 'all' || cardCategories.indexOf(selectedCategory) !== -1;
                    var isVisible = matchesKeyword && matchesYear && matchesCategory;

                    card.classList.toggle('is-hidden', !isVisible);

                    if (isVisible) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visible);
                }
            }

            function setActiveButton(button, selector) {
                panel.querySelectorAll(selector).forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
            }
        });
    }

    function findGridForPanel(panel) {
        var sibling = panel.nextElementSibling;

        while (sibling) {
            var grid = sibling.querySelector('[data-card-grid]');

            if (grid) {
                return grid;
            }

            sibling = sibling.nextElementSibling;
        }

        return document.querySelector('[data-card-grid]');
    }

    function setupImageFallbacks() {
        document.addEventListener('error', function (event) {
            var target = event.target;

            if (!target || target.tagName !== 'IMG') {
                return;
            }

            var shell = target.closest('.poster-shell, .hero-backdrop, .detail-backdrop');

            if (shell) {
                shell.classList.add('poster-fallback');
            }
        }, true);
    }

    function setupVideoPlayers() {
        var stages = Array.prototype.slice.call(document.querySelectorAll('[data-video-stage]'));

        stages.forEach(function (stage) {
            var trigger = stage.querySelector('[data-play-trigger]');
            var sourceButtons = Array.prototype.slice.call(document.querySelectorAll('[data-source-button]'));

            if (trigger) {
                trigger.addEventListener('click', function () {
                    startVideo(stage);
                });
            }

            sourceButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    if (!stage.contains(button) && !button.closest('.player-section')) {
                        return;
                    }

                    sourceButtons.forEach(function (item) {
                        item.classList.toggle('active', item === button);
                    });
                    stage.setAttribute('data-src', button.getAttribute('data-src') || '');
                    resetVideo(stage);
                    startVideo(stage);
                });
            });
        });
    }

    function resetVideo(stage) {
        var video = stage.querySelector('video');

        if (!video) {
            return;
        }

        if (video._hlsInstance) {
            video._hlsInstance.destroy();
            video._hlsInstance = null;
        }

        video.removeAttribute('src');
        video.load();
        video.dataset.ready = 'false';
        stage.classList.remove('is-playing');
    }

    function startVideo(stage) {
        var video = stage.querySelector('video');
        var source = stage.getAttribute('data-src');

        if (!video || !source) {
            return;
        }

        if (video.dataset.ready !== 'true') {
            attachSource(video, source);
            video.dataset.ready = 'true';
        }

        stage.classList.add('is-playing');

        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                stage.classList.remove('is-playing');
            });
        }
    }

    function attachSource(video, source) {
        var isHls = source.indexOf('.m3u8') !== -1;

        if (!isHls) {
            video.src = source;
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            video._hlsInstance = hls;
            return;
        }

        video.src = source;
    }

    function scrollToPlayerFromHash() {
        if (window.location.hash !== '#player') {
            return;
        }

        var player = document.querySelector('#player');

        if (player) {
            window.setTimeout(function () {
                player.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 160);
        }
    }
})();
