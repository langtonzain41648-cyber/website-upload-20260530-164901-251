(function () {
  var currentScript = document.currentScript;
  var hlsModuleUrl = currentScript ? new URL('hls-dru42stk.js', currentScript.src).href : 'hls-dru42stk.js';
  var hlsPromise = null;

  function loadHlsModule() {
    if (!hlsPromise) {
      hlsPromise = import(hlsModuleUrl).then(function (module) {
        return module.H;
      });
    }

    return hlsPromise;
  }

  function setupPlayer() {
    var video = document.querySelector('[data-player]');
    var overlay = document.querySelector('[data-play-overlay]');

    if (!video) {
      return;
    }

    var sourceUrl = video.getAttribute('data-video-url') || '';
    var loaded = false;

    function markOverlayHidden() {
      if (overlay) {
        overlay.classList.add('hidden');
      }
    }

    function attachNativeSource() {
      if (!video.getAttribute('src')) {
        video.src = sourceUrl;
      }
    }

    function attachHlsSource(Hls) {
      if (!Hls || !Hls.isSupported()) {
        attachNativeSource();
        return Promise.resolve();
      }

      return new Promise(function (resolve) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            hls.destroy();
            attachNativeSource();
            resolve();
          }
        });
      });
    }

    function loadSource() {
      if (loaded || !sourceUrl) {
        return Promise.resolve();
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        attachNativeSource();
        return Promise.resolve();
      }

      return loadHlsModule()
        .then(attachHlsSource)
        .catch(function () {
          attachNativeSource();
        });
    }

    function playVideo() {
      loadSource().then(function () {
        markOverlayHidden();
        var playAttempt = video.play();

        if (playAttempt && typeof playAttempt.catch === 'function') {
          playAttempt.catch(function () {
            video.controls = true;
          });
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('play', markOverlayHidden);
    video.addEventListener('click', function () {
      if (!loaded) {
        playVideo();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', setupPlayer);
})();
