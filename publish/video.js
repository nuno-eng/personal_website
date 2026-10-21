// Videos: show the poster with a "Watch" button, then hand over to the browser's own controls.
// Without JavaScript the <video controls> element works on its own.
(function () {
  document.querySelectorAll('[data-video]').forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.pm-video-play');
    if (!video || !button) return;
    video.controls = false;
    box.classList.add('is-ready');
    button.addEventListener('click', function () {
      box.classList.add('is-playing');
      video.controls = true;
      video.play();
    });
    video.addEventListener('play', function () { box.classList.add('is-playing'); video.controls = true; });
  });
})();
