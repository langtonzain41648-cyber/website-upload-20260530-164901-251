(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      button.textContent = open ? '×' : '☰';
    });
  }

  function initHero() {
    var hero = document.querySelector('.hero');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    var current = 0;
    if (!slides.length) {
      return;
    }
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    var next = hero.querySelector('.hero-arrow.next');
    var prev = hero.querySelector('.hero-arrow.prev');
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide') || 0));
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5000);
  }

  function initFilters() {
    var grids = selectAll('.archive-grid, .movie-grid');
    var filterInputs = selectAll('.local-filter');
    var categoryFilters = selectAll('.category-filter');
    var yearFilters = selectAll('.year-filter');
    if (!filterInputs.length && !categoryFilters.length && !yearFilters.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    filterInputs.forEach(function (input) {
      if (q && input.classList.contains('search-page-input')) {
        input.value = q;
      }
    });
    function apply() {
      var keyword = '';
      var category = '';
      var year = '';
      filterInputs.forEach(function (input) {
        if (input.value.trim()) {
          keyword = input.value.trim().toLowerCase();
        }
      });
      categoryFilters.forEach(function (select) {
        if (select.value) {
          category = select.value;
        }
      });
      yearFilters.forEach(function (select) {
        if (select.value) {
          year = select.value;
        }
      });
      grids.forEach(function (grid) {
        selectAll('.movie-card', grid).forEach(function (card) {
          var haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-tags') || '')).toLowerCase();
          var cardCategory = card.getAttribute('data-category') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var visible = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            visible = false;
          }
          if (category && cardCategory !== category) {
            visible = false;
          }
          if (year && cardYear !== year) {
            visible = false;
          }
          card.classList.toggle('is-hidden', !visible);
        });
      });
    }
    filterInputs.concat(categoryFilters).concat(yearFilters).forEach(function (element) {
      element.addEventListener('input', apply);
      element.addEventListener('change', apply);
    });
    apply();
  }

  function initPlayers() {
    selectAll('.video-shell').forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.video-overlay');
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var ready = false;
      function prepare() {
        if (ready || !stream) {
          return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
        video.controls = true;
      }
      function play() {
        prepare();
        if (overlay) {
          overlay.classList.add('hidden');
        }
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      }
      if (overlay) {
        overlay.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (!ready) {
          play();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
