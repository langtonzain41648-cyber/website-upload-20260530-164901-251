(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".nav-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var isOpen = mobileNav.classList.toggle("open");
                toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            });
        }

        var carousel = document.querySelector("[data-hero-carousel]");

        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
            var active = 0;

            function showSlide(index) {
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === active);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === active);
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                });
            });

            if (slides.length > 1) {
                window.setInterval(function () {
                    showSlide(active + 1);
                }, 5200);
            }
        }

        var searchInput = document.getElementById("siteSearch");
        var searchResults = document.getElementById("searchResults");
        var emptyState = document.getElementById("emptyState");

        if (searchInput && searchResults) {
            var cards = Array.prototype.slice.call(searchResults.querySelectorAll("[data-filter-card]"));

            searchInput.addEventListener("input", function () {
                var keyword = searchInput.value.trim().toLowerCase();
                var shown = 0;

                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-keywords") || "").toLowerCase();
                    var matched = keyword === "" || haystack.indexOf(keyword) !== -1;
                    card.classList.toggle("hidden-card", !matched);

                    if (matched) {
                        shown += 1;
                    }
                });

                if (emptyState) {
                    emptyState.classList.toggle("show", shown === 0);
                }
            });
        }
    });

    window.setupMoviePlayer = function (videoUrl) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.getElementById("playOverlay");

        if (!video || !overlay || !videoUrl) {
            return;
        }

        var loaded = false;
        var hlsInstance = null;

        function attachVideo() {
            if (loaded) {
                return;
            }

            video.controls = true;
            video.playsInline = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = videoUrl;
            }

            loaded = true;
        }

        function startPlayback() {
            attachVideo();
            overlay.classList.add("is-hidden");
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        overlay.addEventListener("click", startPlayback);

        video.addEventListener("click", function () {
            if (!loaded || video.paused) {
                startPlayback();
            }
        });

        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });

        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                overlay.classList.remove("is-hidden");
            }
        });

        video.addEventListener("ended", function () {
            overlay.classList.remove("is-hidden");
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
