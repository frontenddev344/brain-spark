/* =================================================================
   BrainSpark — script.js (vanilla)
   ================================================================= */
(function () {
  "use strict";

  /* ---------- Mobile navigation ---------- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("primaryNav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    /* close after choosing a link */
    nav.querySelectorAll(".nav__link").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Inquiry-type chips (radio behaviour) ---------- */
  var chips = document.querySelectorAll(".chips .chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-checked", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-checked", "true");
    });
  });

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector(".btn--send");
      if (!btn || btn.dataset.busy) return;

      var original = btn.innerHTML;
      btn.dataset.busy = "1";
      btn.innerHTML = "Sent ✓";
      btn.style.background = "#1F8A5B";

      setTimeout(function () {
        form.reset();
        chips.forEach(function (c, i) {
          c.classList.toggle("is-active", i === 0);
          c.setAttribute("aria-checked", i === 0 ? "true" : "false");
        });
        btn.innerHTML = original;
        btn.style.background = "";
        delete btn.dataset.busy;
      }, 2200);
    });
  }

  /* ---------- Reveal-on-scroll (subtle) ---------- */
  if ("IntersectionObserver" in window) {
    var targets = document.querySelectorAll(
      ".model-card, .app-card, .brand-card, .result-card, .logo-tile"
    );
    targets.forEach(function (el) {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      el.style.transition = "opacity .5s ease, transform .5s ease";
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var delay = (el.dataset.i || 0) * 60;
            setTimeout(function () {
              el.style.opacity = "1";
              el.style.transform = "none";
            }, delay);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    /* stagger siblings within each group */
    document
      .querySelectorAll(".model-grid, .apps__grid, .brand-grid, .results-grid, .logo-grid")
      .forEach(function (group) {
        Array.prototype.slice.call(group.children).forEach(function (child, i) {
          child.dataset.i = i;
        });
      });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Back to top ---------- */
  var backToTopBtn = document.getElementById("backToTop");
  if (backToTopBtn) {
    window.addEventListener("scroll", function () {
      backToTopBtn.classList.toggle("is-visible", window.scrollY > 400);
    }, { passive: true });
    backToTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Stat counters ---------- */
  var statEls = document.querySelectorAll(".hero__stats [data-count]");
  if (statEls.length) {
    var countersStarted = false;
    function animateCounters() {
      if (countersStarted) return;
      countersStarted = true;
      statEls.forEach(function (el) {
        var target = parseInt(el.getAttribute("data-count"), 10);
        var suffix = el.getAttribute("data-suffix") || "";
        var duration = 1600;
        var start = null;
        function step(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }
    var observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) {
        animateCounters();
      }
    }, { threshold: 0.3 });
    statEls.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Hero typing effect ---------- */
  var typedEl = document.getElementById("typedWord");
  if (typedEl) {
    var words = ["Gamification.", "Loyalty Rewards", "Big Data"];
    var wIdx = 0, cIdx = 0, deleting = false;
    function runTyper() {
      var word = words[wIdx];
      typedEl.textContent = deleting
        ? word.substring(0, cIdx - 1)
        : word.substring(0, cIdx + 1);
      deleting ? cIdx-- : cIdx++;
      var delay = deleting ? 55 : 95;
      if (!deleting && cIdx === word.length) { delay = 1600; deleting = true; }
      else if (deleting && cIdx === 0) { deleting = false; wIdx = (wIdx + 1) % words.length; delay = 350; }
      setTimeout(runTyper, delay);
    }
    setTimeout(runTyper, 600);
  }

  /* ---------- Owned & Operated slider dots (mobile) ---------- */
  var slider = document.querySelector(".apps__grid");
  var dotsWrap = document.getElementById("appsDots");
  if (slider && dotsWrap) {
    var cards = Array.prototype.slice.call(slider.querySelectorAll(".app-card"));
    var stepSize = function () {
      return cards.length > 1 ? (cards[1].offsetLeft - cards[0].offsetLeft) : slider.clientWidth;
    };

    cards.forEach(function (card, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "apps__dot" + (i === 0 ? " is-active" : "");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Go to app " + (i + 1));
      b.addEventListener("click", function () {
        slider.scrollTo({ left: i * stepSize(), behavior: "smooth" });
      });
      dotsWrap.appendChild(b);
    });

    var dots = Array.prototype.slice.call(dotsWrap.children);

    /* touch swipe */
    var touchStartX = 0;
    slider.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    slider.addEventListener("touchend", function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) < 50) return;
      var idx = Math.round(slider.scrollLeft / stepSize());
      idx = diff > 0
        ? Math.min(cards.length - 1, idx + 1)
        : Math.max(0, idx - 1);
      slider.scrollTo({ left: idx * stepSize(), behavior: "smooth" });
    }, { passive: true });

    var raf;
    slider.addEventListener("scroll", function () {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        var idx = Math.round(slider.scrollLeft / stepSize());
        idx = Math.max(0, Math.min(cards.length - 1, idx));
        dots.forEach(function (d, j) {
          d.classList.toggle("is-active", j === idx);
          d.setAttribute("aria-selected", j === idx ? "true" : "false");
        });
      });
    }, { passive: true });
  }

  /* ---------- Latest News slider (Swiper) ---------- */
  var newsSwiperEl = document.getElementById("newsSwiper");
  if (newsSwiperEl && window.Swiper) {
    new Swiper(newsSwiperEl, {
      loop: true,
      grabCursor: true,
      slidesPerView: 1,
      spaceBetween: 20,
      speed: 500,
      autoplay: { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true },
      pagination: {
        el: document.getElementById("newsDots"),
        clickable: true,
        bulletClass: "news__dot",
        bulletActiveClass: "is-active"
      },
      navigation: {
        nextEl: document.getElementById("newsNext"),
        prevEl: document.getElementById("newsPrev")
      },
      breakpoints: {
        769: { slidesPerView: 2 }
      }
    });
  }
})();
