function setupNavigation() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener("click", function () {
        nav.classList.toggle("open");
    });
}

function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
        return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function show(nextIndex) {
        index = nextIndex % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === index);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
            show(dotIndex);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }
}

function setupCardSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-card-search]"));

    inputs.forEach(function (input) {
        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();
            var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.textContent
                ].join(" ").toLowerCase();

                card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
            });
        });
    });
}

function setupMoviePlayer(streamUrl) {
    var video = document.getElementById("movieVideo");
    var overlay = document.getElementById("playOverlay");
    var playerBox = document.getElementById("playerBox");

    if (!video || !streamUrl) {
        return;
    }

    function bindSource() {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            return;
        }

        video.src = streamUrl;
    }

    function playVideo() {
        bindSource();

        if (overlay) {
            overlay.classList.add("hidden");
        }

        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener("click", function (event) {
            event.preventDefault();
            playVideo();
        });
    }

    if (playerBox) {
        playerBox.addEventListener("click", function (event) {
            if (event.target === video) {
                return;
            }
            playVideo();
        });

        playerBox.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                playVideo();
            }
        });
    }

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("hidden");
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    setupNavigation();
    setupHero();
    setupCardSearch();
});
