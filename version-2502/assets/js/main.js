(function () {
    var root = document.body ? (document.body.getAttribute("data-root") || "") : "";

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function closeSearch(results) {
        if (results) {
            results.classList.remove("is-open");
            results.innerHTML = "";
        }
    }

    function makeResult(item) {
        var link = document.createElement("a");
        link.className = "search-result-item";
        link.href = root + item.url;

        var title = document.createElement("span");
        title.className = "search-result-title";
        title.textContent = item.title;

        var meta = document.createElement("span");
        meta.className = "search-result-meta";
        meta.textContent = [item.year, item.region, item.type, item.genre].filter(Boolean).join(" · ");

        link.appendChild(title);
        link.appendChild(meta);
        return link;
    }

    document.querySelectorAll("[data-site-search]").forEach(function (input) {
        var box = input.closest(".search-box");
        var results = box ? box.querySelector("[data-search-results]") : null;

        input.addEventListener("input", function () {
            var query = normalize(input.value);
            if (!query || query.length < 1 || !Array.isArray(window.SITE_MOVIES)) {
                closeSearch(results);
                return;
            }

            var matches = window.SITE_MOVIES.filter(function (item) {
                return normalize(item.search).indexOf(query) !== -1;
            }).slice(0, 8);

            if (!results) {
                return;
            }

            results.innerHTML = "";
            matches.forEach(function (item) {
                results.appendChild(makeResult(item));
            });

            if (matches.length) {
                results.classList.add("is-open");
            } else {
                closeSearch(results);
            }
        });

        document.addEventListener("click", function (event) {
            if (box && !box.contains(event.target)) {
                closeSearch(results);
            }
        });
    });

    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var index = 0;

        function setActive(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                setActive(dotIndex);
            });
        });

        setActive(0);
        if (slides.length > 1) {
            window.setInterval(function () {
                setActive(index + 1);
            }, 5200);
        }
    });

    document.querySelectorAll("[data-card-section]").forEach(function (section) {
        var input = section.querySelector("[data-local-search]");
        var buttons = Array.prototype.slice.call(section.querySelectorAll("[data-filter-value]"));
        var container = section.nextElementSibling;
        var cards = container ? Array.prototype.slice.call(container.querySelectorAll("[data-movie-card]")) : [];
        var empty = section.querySelector("[data-empty-state]");
        var selected = "all";

        function apply() {
            var query = input ? normalize(input.value) : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-filter"));
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchFilter = selected === "all" || text.indexOf(normalize(selected)) !== -1;
                var show = matchQuery && matchFilter;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                selected = button.getAttribute("data-filter-value") || "all";
                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                apply();
            });
        });
    });
})();
