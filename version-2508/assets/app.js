(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHeroCarousel() {
    var slides = selectAll('[data-hero-slide]');
    var dots = selectAll('[data-hero-dot]');
    var thumbs = selectAll('[data-hero-thumb]');
    var current = 0;
    var timer = null;

    if (!slides.length) {
      return;
    }

    function activate(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });

      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('active', thumbIndex === current);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot') || 0));
        schedule();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('mouseenter', function () {
        activate(Number(thumb.getAttribute('data-hero-thumb') || 0));
        schedule();
      });
    });

    activate(0);
    schedule();
  }

  function setupFilters() {
    selectAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var selectors = selectAll('[data-filter-select]', scope);
      var cards = selectAll('[data-search-card]', scope);
      var count = scope.querySelector('[data-filter-count]');
      var params = new URLSearchParams(window.location.search);
      var queryFromUrl = params.get('q');

      if (input && queryFromUrl) {
        input.value = queryFromUrl;
      }

      function applyFilter() {
        var query = normalize(input ? input.value : '');
        var activeFilters = {};

        selectors.forEach(function (selector) {
          var key = selector.getAttribute('data-filter-select');
          if (key && selector.value) {
            activeFilters[key] = normalize(selector.value);
          }
        });

        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-card-text'));
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesSelects = Object.keys(activeFilters).every(function (key) {
            return normalize(card.getAttribute('data-card-' + key)) === activeFilters[key];
          });
          var shouldShow = matchesQuery && matchesSelects;

          card.classList.toggle('hidden-by-filter', !shouldShow);

          if (shouldShow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }

      selectors.forEach(function (selector) {
        selector.addEventListener('change', applyFilter);
      });

      applyFilter();
    });
  }

  function setupImageFallback() {
    selectAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-missing');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
    setupImageFallback();
  });
})();
