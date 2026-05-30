(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length > 0) {
    var current = 0;
    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var input = filterRoot.querySelector('[data-filter-keyword]');
    var year = filterRoot.querySelector('[data-filter-year]');
    var region = filterRoot.querySelector('[data-filter-region]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var runFilter = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var regionValue = region ? region.value : '';
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var matchRegion = !regionValue || card.getAttribute('data-region') === regionValue;
        card.classList.toggle('hidden-card', !(matchKeyword && matchYear && matchRegion));
      });
    };
    [input, year, region].forEach(function (el) {
      if (el) {
        el.addEventListener('input', runFilter);
        el.addEventListener('change', runFilter);
      }
    });
  }

  var player = document.querySelector('[data-player]');
  var layer = document.querySelector('[data-play-layer]');
  if (player && layer) {
    var stream = player.getAttribute('data-stream') || '';
    var started = false;
    var startPlayer = function () {
      if (started) {
        player.play();
        return;
      }
      started = true;
      layer.classList.add('is-hidden');
      if (player.canPlayType('application/vnd.apple.mpegurl')) {
        player.src = stream;
        player.play();
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(player);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          player.play();
        });
      } else {
        player.src = stream;
        player.play();
      }
    };
    layer.addEventListener('click', startPlayer);
    player.addEventListener('click', function () {
      if (!started) {
        startPlayer();
      }
    });
  }
})();
