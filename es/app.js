  // Reveal on scroll, and a top bar that solidifies once the hero is behind you.
  const io = new IntersectionObserver((rows) => {
    rows.forEach((r) => { if (r.isIntersecting) { r.target.classList.add("in"); io.unobserve(r.target); } });
  }, { rootMargin: "0px 0px -12% 0px" });
  document.querySelectorAll(".rise").forEach((n) => io.observe(n));

  // The poster frame is the first paint. The video starts only after the page has loaded:
  // portrait phones get a portrait cut of the same footage (1.5MB), other narrow screens the 720p
  // cut and desktops the 1080p. A saver-mode or slow connection gets no video, and the still
  // photo carries the hero instead (as does reduced motion).
  const v = document.querySelector(".hero-video");
  const still = document.querySelector(".hero-still");
  const showStill = () => { if (still && !still.src) still.src = still.dataset.src; };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) showStill();
  if (v) {
    const fallback = () => { showStill(); document.querySelector(".hero .shot")?.classList.add("no-video"); };
    const net = navigator.connection || {};
    if (net.saveData || /2g/.test(net.effectiveType || "")) {
      fallback();
    } else {
      const start = () => {
        if (window.innerWidth >= 900) v.src = v.dataset.hd;
        else if (matchMedia("(max-aspect-ratio: 3/4)").matches) {
          v.src = v.canPlayType('video/mp4; codecs="avc1.640028"') || !v.canPlayType('video/webm; codecs="vp9"') ? v.dataset.m : v.dataset.mw;
        } else v.src = v.dataset.sd;
        v.addEventListener("error", fallback);
        v.play?.().catch(fallback);
        setTimeout(() => { if (v.readyState < 2) fallback(); }, 6000);
      };
      afterLoad(start);
    }
  }

  // Below-the-fold work waits for the page load: the bungalow photos get their real sources
  // (they still lazy-load natively), and the guest assistant script is added.
  function afterLoad(fn) {
    // Load event, then the next painted frame, then a short beat: the hero is on screen first.
    const go = () => requestAnimationFrame(() => setTimeout(fn, 250));
    document.readyState === "complete" ? go() : addEventListener("load", go, { once: true });
  }
  afterLoad(() => {
    document.querySelectorAll("[data-srcset]").forEach((s) => { s.srcset = s.dataset.srcset; s.removeAttribute("data-srcset"); });
    document.querySelectorAll(".chapter img[data-src]").forEach((i) => { i.src = i.dataset.src; i.removeAttribute("data-src"); });
    // The guest assistant (chat.js) answers in English only, so the Spanish page goes straight to WhatsApp.
    // The italic face is only used in the quote further down the page.
    const f = document.createElement("style"); f.textContent = `@font-face { font-family: "Cormorant Garamond"; font-style: italic; font-weight: 300; font-display: swap; src: url(/fonts/cormorant-italic-latin-ext.woff2) format("woff2"); unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF; } @font-face { font-family: "Cormorant Garamond"; font-style: italic; font-weight: 300; font-display: swap; src: url(/fonts/cormorant-italic-latin.woff2) format("woff2"); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }`; document.head.appendChild(f);
  });

  // 11/10 visit counter (HAZE's own Cloudflare Worker): no cookies, no IP or device stored, just daily counts
  // of visits, the referring site, and taps on Airbnb, WhatsApp and Book direct. Our own checks add ?qc and are skipped.
  const HIT = "https://haze-voice.haze-site-cloudflare.workers.dev/a?s=aqua";
  const hit = (e, t = "") => {
    if (/[?&]qc\b/.test(location.search) || !navigator.sendBeacon) return;
    try {
      let r = ""; try { r = document.referrer ? new URL(document.referrer).hostname : ""; } catch {}
      const q = new URLSearchParams({ e, t, p: location.pathname, r, u: new URLSearchParams(location.search).get("utm_source") || "" });
      navigator.sendBeacon(HIT + "&" + q);
    } catch {}
  };
  afterLoad(() => hit("view"));
  document.addEventListener("click", (ev) => {
    const a = ev.target.closest && ev.target.closest("a[href]");
    if (!a) return;
    if (a.href.includes("airbnb.com/rooms/")) hit("airbnb", a.dataset.unit || "chat");
    else if (a.href.startsWith("https://wa.me/")) hit("whatsapp", a.classList.contains("chat") ? "float" : a.classList.contains("chatbox-wa") ? "chat" : "footer");
  });

  // Book direct: the form writes the request out and opens WhatsApp to Diego. Nothing is sent anywhere else.
  const WA = "13057661122";
  const dlg = document.querySelector(".book"), bf = dlg.querySelector("form"), err = bf.querySelector(".err");
  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  document.querySelectorAll("[data-book]").forEach((b) => b.addEventListener("click", (ev) => {
    ev.preventDefault();
    const unit = b.dataset.book;
    hit("form", unit);
    if (!dlg.showModal) { window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent("Hola Diego, quiero reservar Aqua directo (desde aqua.mx/es)."), "_blank", "noopener"); return; }
    bf.unit.value = unit;
    bf.in.min = iso(new Date());
    err.textContent = "";
    dlg.showModal();
  }));
  dlg.querySelector(".x").addEventListener("click", () => dlg.close());
  bf.addEventListener("input", () => { err.textContent = ""; });
  dlg.addEventListener("click", (ev) => { if (ev.target === dlg) dlg.close(); });
  bf.in.addEventListener("change", () => {
    if (!bf.in.value) return;
    const d = new Date(bf.in.value + "T12:00"); d.setDate(d.getDate() + 1); bf.out.min = iso(d);
    if (!bf.out.value || bf.out.value < bf.out.min) bf.out.value = "";
  });
  const nice = (v) => new Date(v + "T12:00").toLocaleDateString("es-MX", { month: "short", day: "numeric", year: "numeric" });
  bf.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const f = Object.fromEntries(new FormData(bf));
    for (const k of ["name", "contact", "msg"]) f[k] = (f[k] || "").trim();
    const nights = f.in && f.out ? Math.round((new Date(f.out + "T12:00") - new Date(f.in + "T12:00")) / 864e5) : 0;
    const miss = !f.in || !f.out ? "Elige tus fechas de llegada y salida."
      : nights < 1 ? "La salida tiene que ser después de la llegada."
      : !f.name ? "Agrega tu nombre."
      : !f.contact ? "Agrega un teléfono o correo para que Diego te pueda contactar." : "";
    if (miss) { err.textContent = miss; return; }
    const unitName = { any: "Cualquier bungalow disponible", oasis: "Oasis", brisas: "Brisas", olas: "Olas" }[f.unit] || "Cualquier bungalow disponible";
    const text = [
      "Hola Diego, quiero reservar Aqua directo (desde aqua.mx/es).",
      "Bungalow: " + unitName,
      "Fechas: " + nice(f.in) + " al " + nice(f.out) + " (" + nights + (nights === 1 ? " noche)" : " noches)"),
      "Huéspedes: " + f.guests,
      "Nombre: " + f.name,
      "Contacto: " + f.contact,
      f.msg ? "Mensaje: " + f.msg : "",
    ].filter(Boolean).join("\n");
    hit("direct", f.unit);
    window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(text), "_blank", "noopener");
    dlg.close();
  });

  const bar = document.querySelector(".bar");
  const hero = document.querySelector(".hero");
  new IntersectionObserver(([e]) => bar.classList.toggle("solid", !e.isIntersecting), { rootMargin: "-70px 0px 0px 0px" }).observe(hero);
