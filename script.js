(function () {
  'use strict';

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  var hero = document.querySelector('.hero');
  var heroContent = document.querySelector('.hero-content');
  var heroVideo = document.querySelector('.hero-video');
  var heroReplay = document.querySelector('.hero-replay');
  var headerInner = document.querySelector('.header-inner');
  var reservationForm = document.getElementById('reservation-form');
  var reservationConfirmation = document.getElementById('reservation-confirmation');
  var reservationSummary = reservationConfirmation.querySelector('.reservation-summary');
  var reservationEdit = reservationConfirmation.querySelector('.reservation-edit');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var playbackTimer;

  var reservationDate = reservationForm.elements.date;
  var today = new Date();
  reservationDate.min = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0')
  ].join('-');

  function showHeroContent() {
    window.clearTimeout(playbackTimer);
    heroVideo.pause();
    hero.classList.remove('is-loading', 'is-playing');
    hero.classList.add('is-finished');
    document.body.classList.remove('hero-intro');
    heroContent.inert = false;
    headerInner.inert = false;
    heroReplay.hidden = false;
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        hero.classList.add('is-revealed');
      });
    });
  }

  function startPlayback() {
    window.clearTimeout(playbackTimer);
    heroVideo.pause();
    if (heroVideo.currentTime !== 0) heroVideo.currentTime = 0;
    hero.classList.add('is-ready');
    playbackTimer = window.setTimeout(function () {
      hero.classList.remove('is-loading', 'is-finished');
      hero.classList.remove('is-revealed');
      hero.classList.add('is-playing');
      heroVideo.play().catch(showHeroContent);
    }, 650);
  }

  function playHeroVideo() {
    if (reducedMotion.matches) {
      showHeroContent();
      return;
    }
    window.clearTimeout(playbackTimer);
    hero.classList.remove('is-finished', 'is-revealed', 'is-playing', 'is-ready');
    hero.classList.add('is-loading');
    document.body.classList.add('hero-intro');
    heroContent.inert = true;
    headerInner.inert = true;
    heroReplay.hidden = true;
    if (heroVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      startPlayback();
    } else {
      heroVideo.addEventListener('loadeddata', startPlayback, { once: true });
      heroVideo.load();
    }
  }

  function handleReducedMotion() {
    if (reducedMotion.matches) {
      heroVideo.pause();
      showHeroContent();
    }
  }

  heroVideo.addEventListener('ended', showHeroContent);
  heroVideo.addEventListener('error', showHeroContent);
  heroReplay.addEventListener('click', playHeroVideo);
  reducedMotion.addEventListener('change', handleReducedMotion);
  playHeroVideo();

  var introPhoto = document.querySelector('.intro-photo-wrap');
  var introVideo = introPhoto.querySelector('.intro-video');

  function showIntroPhoto() {
    introVideo.pause();
    introPhoto.classList.add('is-video-done');
  }

  introVideo.addEventListener('ended', showIntroPhoto);
  introVideo.addEventListener('error', showIntroPhoto);
  reducedMotion.addEventListener('change', function () {
    if (reducedMotion.matches) showIntroPhoto();
  });

  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    showIntroPhoto();
  } else {
    introVideo.preload = 'auto';
    var introObserver = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      introObserver.disconnect();
      introVideo.play().catch(showIntroPhoto);
    }, { threshold: 0.5 });
    introObserver.observe(introPhoto);
  }

  var orderVideo = document.querySelector('.order-video');
  if (orderVideo && 'IntersectionObserver' in window) {
    var orderVisible = false;
    var syncOrderVideo = function () {
      if (orderVisible && !reducedMotion.matches) {
        orderVideo.preload = 'auto';
        orderVideo.play().catch(function () {});
      } else {
        orderVideo.pause();
      }
    };
    new IntersectionObserver(function (entries) {
      orderVisible = entries[0].isIntersecting;
      syncOrderVideo();
    }, { threshold: 0.25 }).observe(orderVideo);
    reducedMotion.addEventListener('change', syncOrderVideo);
  }

  reservationForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!reservationForm.reportValidity()) return;

    var formData = new FormData(reservationForm);
    var date = new Date(formData.get('date') + 'T12:00:00');
    var guests = Number(formData.get('guests'));
    var formattedDate = new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }).format(date);
    var guestLabel = guests === 1 ? 'guest' : 'guests';
    reservationSummary.textContent = formattedDate + ' at ' + formData.get('time') + ' · ' + guests + ' ' + guestLabel;
    reservationForm.hidden = true;
    reservationConfirmation.hidden = false;
  });

  reservationEdit.addEventListener('click', function () {
    reservationConfirmation.hidden = true;
    reservationForm.hidden = false;
    reservationForm.elements.name.focus();
  });

  function closeNav() {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
  }

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });

  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) closeNav();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeNav();
      toggle.focus();
    }
  });

  document.getElementById('year').textContent = new Date().getFullYear();
}());
