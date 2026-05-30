function initMoviePlayer(videoId, buttonId, url) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var ready = false;
    var hlsInstance = null;

    function prepare() {
        if (!video || ready) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
        } else {
            video.src = url;
        }

        ready = true;
    }

    function start() {
        prepare();
        if (button) {
            button.classList.add("is-hidden");
        }
        if (video) {
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }
    }

    if (button) {
        button.addEventListener("click", start);
    }

    if (video) {
        video.addEventListener("click", function () {
            if (!ready) {
                start();
            }
        });
        video.addEventListener("ended", function () {
            if (button) {
                button.classList.remove("is-hidden");
            }
        });
    }

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
