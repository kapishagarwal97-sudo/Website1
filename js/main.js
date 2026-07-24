/* ============================================================
   TRYB — interactions
   - custom cursor (dot + trailing ring)
   - cursor-following "popping" images
   - scroll reveal
   - animated canvas hero background (video-like)
   - mobile nav + preloader
   ============================================================ */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ---------- Preloader ---------- */
  window.addEventListener("load", function () {
    const loader = document.querySelector(".loader");
    if (loader) setTimeout(() => loader.classList.add("done"), 1200);
  });

  /* ---------- Custom cursor ---------- */
  if (!coarse) {
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      if (dot) dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });

    function ringLoop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (ring) ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(ringLoop);
    }
    if (ring) ringLoop();

    // Hover grow on interactive elements
    const hoverables = document.querySelectorAll(
      "a, button, .card, .event, .btn, .city, .mood, .slider__arrow, .slider__dot, .rail-card, .faq-q, .pill"
    );
    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", () => ring && ring.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => ring && ring.classList.remove("is-hover"));
    });
  }

  /* ---------- Cursor-following popping images ---------- */
  const layer = document.querySelector(".float-layer");
  if (layer && !coarse && !reduceMotion) {
    const imgs = Array.from(layer.querySelectorAll(".float-img"));
    if (imgs.length) {
      let idx = 0;
      let last = { x: 0, y: 0 };
      let lastTime = 0;
      const minDist = 240;   // px of travel before spawning next image
      const cooldown = 130;  // ms

      window.addEventListener("mousemove", (e) => {
        const now = performance.now();
        const dx = e.clientX - last.x;
        const dy = e.clientY - last.y;
        const dist = Math.hypot(dx, dy);
        if (dist < minDist || now - lastTime < cooldown) return;

        last = { x: e.clientX, y: e.clientY };
        lastTime = now;

        const el = imgs[idx % imgs.length];
        idx++;

        const rot = (Math.random() * 16 - 8).toFixed(1);
        el.style.left = e.clientX + "px";
        el.style.top = e.clientY + "px";
        el.style.transition = "none";
        el.style.opacity = "0";
        el.style.transform = `translate(-50%,-50%) scale(.6) rotate(${rot}deg)`;

        // force reflow, then pop in
        void el.offsetWidth;
        el.style.transition =
          "opacity .5s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1)";
        el.style.opacity = "1";
        el.style.transform = `translate(-50%,-50%) scale(1) rotate(${rot}deg)`;

        clearTimeout(el._hide);
        el._hide = setTimeout(() => {
          el.style.opacity = "0";
          el.style.transform = `translate(-50%,-50%) scale(1.1) rotate(${rot}deg)`;
        }, 650);
      });
    }
  }

  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Mobile nav ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle("open", open);
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  }

  /* ---------- Animated canvas hero background (video-like) ---------- */
  const canvas = document.querySelector(".hero__canvas");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, blobs, raf, t = 0;
    const palette = ["#b07a4b", "#eb642e", "#d7cec3", "#2a3a5c"];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeBlobs() {
      blobs = [];
      const count = 5;
      for (let i = 0; i < count; i++) {
        blobs.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: (Math.min(w, h) * (0.35 + Math.random() * 0.35)),
          hue: palette[i % palette.length],
          sx: (Math.random() - 0.5) * 0.35,
          sy: (Math.random() - 0.5) * 0.35,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function draw() {
      t += 0.006;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#1e2a44";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      blobs.forEach((b) => {
        b.x += b.sx + Math.sin(t + b.phase) * 0.4;
        b.y += b.sy + Math.cos(t + b.phase) * 0.4;
        if (b.x < -b.r) b.x = w + b.r;
        if (b.x > w + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = h + b.r;
        if (b.y > h + b.r) b.y = -b.r;

        const pr = b.r * (0.9 + Math.sin(t * 1.3 + b.phase) * 0.1);
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, pr);
        g.addColorStop(0, hexA(b.hue, 0.35));
        g.addColorStop(1, hexA(b.hue, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, pr, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(draw);
    }

    function hexA(hex, a) {
      const n = parseInt(hex.slice(1), 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    }

    function start() { resize(); makeBlobs(); cancelAnimationFrame(raf); draw(); }
    window.addEventListener("resize", () => { resize(); makeBlobs(); });
    start();

    // Pause when off-screen to save battery
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else draw();
    });
  }

  /* ---------- Mood / city filters (single active) ---------- */
  document.querySelectorAll("[data-moods], [data-cities]").forEach((group) => {
    const items = group.querySelectorAll(".mood, .city");
    items.forEach((m) => {
      m.addEventListener("click", () => {
        items.forEach((x) => x.removeAttribute("data-active"));
        m.setAttribute("data-active", "");
      });
    });
  });

  /* ---------- Header scrolled state ---------- */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Hero polaroids reveal ---------- */
  const hero = document.querySelector(".hero");
  if (hero) setTimeout(() => hero.classList.add("in"), reduceMotion ? 0 : 400);

  /* ---------- FAQ accordion ---------- */
  const faq = document.querySelector("[data-faq]");
  if (faq) {
    const items = [...faq.querySelectorAll(".faq-item")];
    const setH = (item) => {
      const a = item.querySelector(".faq-a");
      a.style.maxHeight = item.classList.contains("open") ? a.scrollHeight + "px" : "0px";
    };
    items.forEach((item) => {
      setH(item);
      item.querySelector(".faq-q").addEventListener("click", () => {
        const wasOpen = item.classList.contains("open");
        items.forEach((i) => { i.classList.remove("open"); setH(i); });
        if (!wasOpen) { item.classList.add("open"); setH(item); }
      });
    });
    window.addEventListener("resize", () =>
      items.filter((i) => i.classList.contains("open")).forEach(setH)
    );
  }

  /* ---------- Experiences slider ---------- */
  const slider = document.querySelector("[data-slider]");
  if (slider) {
    const slides = [...slider.querySelectorAll(".slide")];
    const dotsWrap = slider.querySelector("[data-dots]");
    let i = 0, timer = null;
    slides.forEach((_, idx) => {
      const d = document.createElement("button");
      d.className = "slider__dot" + (idx === 0 ? " active" : "");
      d.setAttribute("aria-label", "Go to slide " + (idx + 1));
      d.addEventListener("click", () => go(idx));
      dotsWrap.appendChild(d);
    });
    const dots = [...dotsWrap.children];
    function go(n) {
      slides[i].classList.remove("active");
      dots[i].classList.remove("active");
      i = (n + slides.length) % slides.length;
      slides[i].classList.add("active");
      dots[i].classList.add("active");
      restart();
    }
    function restart() {
      if (reduceMotion) return;
      clearInterval(timer);
      timer = setInterval(() => go(i + 1), 6000);
    }
    slider.querySelector("[data-next]").addEventListener("click", () => go(i + 1));
    slider.querySelector("[data-prev]").addEventListener("click", () => go(i - 1));
    slider.addEventListener("mouseenter", () => clearInterval(timer));
    slider.addEventListener("mouseleave", restart);
    restart();
  }

  /* ---------- Current year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
