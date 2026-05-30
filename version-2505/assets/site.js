document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-button");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  var hero = document.querySelector(".hero");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var activeIndex = 0;

    function showSlide(index) {
      activeIndex = index;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === activeIndex);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide((activeIndex + 1) % slides.length);
      }, 5200);
    }
  }

  var heroSearchForm = document.querySelector(".hero-search-form");

  if (heroSearchForm) {
    heroSearchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = heroSearchForm.querySelector("input");
      var keyword = input ? input.value.trim() : "";
      var url = "search.html";
      if (keyword) {
        url += "?q=" + encodeURIComponent(keyword);
      }
      window.location.href = url;
    });
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var filterInput = document.getElementById("movie-filter-input");
  var regionFilter = document.getElementById("region-filter");
  var yearFilter = document.getElementById("year-filter");
  var genreFilter = document.getElementById("genre-filter");
  var emptyState = document.querySelector(".empty-state");

  function uniqueValues(attr) {
    var values = [];
    cards.forEach(function (card) {
      var value = (card.getAttribute(attr) || "").trim();
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    return values.sort(function (a, b) {
      return a.localeCompare(b, "zh-Hans-CN");
    });
  }

  function fillSelect(select, attr) {
    if (!select || !cards.length) {
      return;
    }
    uniqueValues(attr).forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  fillSelect(regionFilter, "data-region");
  fillSelect(yearFilter, "data-year");
  fillSelect(genreFilter, "data-genre");

  function applyFilters() {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
    var region = regionFilter ? regionFilter.value : "";
    var year = yearFilter ? yearFilter.value : "";
    var genre = genreFilter ? genreFilter.value : "";
    var visibleCount = 0;

    cards.forEach(function (card) {
      var title = (card.getAttribute("data-title") || "").toLowerCase();
      var cardRegion = card.getAttribute("data-region") || "";
      var cardYear = card.getAttribute("data-year") || "";
      var cardGenre = card.getAttribute("data-genre") || "";
      var cardCategory = card.getAttribute("data-category") || "";
      var haystack = [title, cardRegion, cardYear, cardGenre, cardCategory].join(" ").toLowerCase();
      var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchRegion = !region || cardRegion === region;
      var matchYear = !year || cardYear === year;
      var matchGenre = !genre || cardGenre === genre;
      var visible = matchKeyword && matchRegion && matchYear && matchGenre;
      card.style.display = visible ? "" : "none";
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visibleCount === 0);
    }
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query) {
      filterInput.value = query;
    }
    filterInput.addEventListener("input", applyFilters);
  }

  [regionFilter, yearFilter, genreFilter].forEach(function (select) {
    if (select) {
      select.addEventListener("change", applyFilters);
    }
  });

  if (cards.length) {
    applyFilters();
  }
});
