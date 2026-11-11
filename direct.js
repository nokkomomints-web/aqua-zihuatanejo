/* aqua.mx guide pages (11/10): the same visit counter and "Book direct with Diego" request form as the home page.
 * The form only writes the guest's request into a WhatsApp message to Diego and opens WhatsApp; nothing is sent from
 * this page, and nothing is booked or paid here. The counter keeps no cookies, IPs or device data; ?qc skips it. */
(function () {
  document.documentElement.classList.add("js");
  const es = (document.documentElement.lang || "").startsWith("es");
  const WA = "13057661122";

  // Visit counter (HAZE's Cloudflare Worker, same endpoint as the home page; p = this page's path).
  const HIT = "https://haze-voice.haze-site-cloudflare.workers.dev/a?s=aqua";
  const hit = (e, t = "") => {
    if (/[?&]qc\b/.test(location.search) || !navigator.sendBeacon) return;
    try {
      let r = ""; try { r = document.referrer ? new URL(document.referrer).hostname : ""; } catch {}
      const q = new URLSearchParams({ e, t, p: location.pathname, r, u: new URLSearchParams(location.search).get("utm_source") || "" });
      navigator.sendBeacon(HIT + "&" + q);
    } catch {}
  };
  addEventListener("load", () => setTimeout(() => hit("view"), 250), { once: true });
  document.addEventListener("click", (ev) => {
    const a = ev.target.closest && ev.target.closest("a[href]");
    if (!a) return;
    if (a.href.includes("airbnb.com/rooms/")) hit("airbnb", a.dataset.unit || "page");
    else if (a.href.startsWith("https://wa.me/")) hit("whatsapp", a.classList.contains("chat") ? "float" : "footer");
  });

  // Reveal on scroll.
  const io = new IntersectionObserver((rows) => rows.forEach((r) => { if (r.isIntersecting) { r.target.classList.add("in"); io.unobserve(r.target); } }), { rootMargin: "0px 0px -10% 0px" });
  document.querySelectorAll(".rise").forEach((n) => io.observe(n));

  const L = es ? {
    eyebrow: "Reserva directa", title: "Mándale tus fechas a Diego", close: "Cerrar", unit: "Bungalow",
    units: { any: "Cualquiera disponible", oasis: "Oasis · 2 recámaras, 2 baños", brisas: "Brisas · 2 recámaras, 1 baño", olas: "Olas · 2 recámaras, 1 baño" },
    inL: "Llegada", outL: "Salida", guests: "Huéspedes", g58: "5 a 8 (dos bungalows)", g912: "9 a 12 (los tres)",
    name: "Tu nombre", contact: "Teléfono o correo", msg: "Mensaje (opcional)", send: "Enviar solicitud por WhatsApp",
    fine: "Esto abre WhatsApp con tu solicitud escrita para Diego, el dueño. Él te confirma disponibilidad y tarifa ahí. En esta página no se reserva ni se paga nada.",
    eDates: "Elige tus fechas de llegada y salida.", eOrder: "La salida tiene que ser después de la llegada.", eName: "Agrega tu nombre.", eContact: "Agrega un teléfono o correo para que Diego te pueda contactar.",
    hello: "Hola Diego, quiero reservar Aqua directo (desde aqua.mx).", anyName: "Cualquier bungalow disponible",
    lUnit: "Bungalow: ", lDates: "Fechas: ", to: " al ", night: " noche)", nights: " noches)", lGuests: "Huéspedes: ", lName: "Nombre: ", lContact: "Contacto: ", lMsg: "Mensaje: ", locale: "es-MX",
  } : {
    eyebrow: "Book direct", title: "Send Diego your dates", close: "Close", unit: "Bungalow",
    units: { any: "Any available", oasis: "Oasis · 2 bedrooms, 2 baths", brisas: "Brisas · 2 bedrooms, 1 bath", olas: "Olas · 2 bedrooms, 1 bath" },
    inL: "Check-in", outL: "Check-out", guests: "Guests", g58: "5 to 8 (two bungalows)", g912: "9 to 12 (all three)",
    name: "Your name", contact: "Phone or email", msg: "Message (optional)", send: "Send request on WhatsApp",
    fine: "This opens WhatsApp with your request written out for Diego, the owner. He confirms availability and the rate there. Nothing is booked or paid on this page.",
    eDates: "Please pick your check-in and check-out dates.", eOrder: "Check-out needs to be after check-in.", eName: "Please add your name.", eContact: "Please add a phone number or email so Diego can reach you.",
    hello: "Hola Diego, I'd like to book Aqua direct (from aqua.mx).", anyName: "Any available bungalow",
    lUnit: "Bungalow: ", lDates: "Dates: ", to: " to ", night: " night)", nights: " nights)", lGuests: "Guests: ", lName: "Name: ", lContact: "Contact: ", lMsg: "Message: ", locale: "en-US",
  };

  const dlg = document.createElement("dialog");
  dlg.className = "book";
  dlg.setAttribute("aria-labelledby", "book-title");
  dlg.innerHTML = `<form novalidate>
    <div class="top"><div><div class="eyebrow">${L.eyebrow}</div><h2 id="book-title">${L.title}</h2></div>
      <button type="button" class="x" aria-label="${L.close}">&times;</button></div>
    <label>${L.unit}<select name="unit">${Object.entries(L.units).map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select></label>
    <div class="pair"><label>${L.inL} <input type="date" name="in" required></label><label>${L.outL} <input type="date" name="out" required></label></div>
    <label>${L.guests}<select name="guests"><option>1</option><option selected>2</option><option>3</option><option>4</option><option value="${L.g58.split(" (")[0]}">${L.g58}</option><option value="${L.g912.split(" (")[0]}">${L.g912}</option></select></label>
    <div class="pair"><label>${L.name} <input type="text" name="name" autocomplete="name" maxlength="80" required></label><label>${L.contact} <input type="text" name="contact" autocomplete="email" maxlength="120" required></label></div>
    <label>${L.msg} <textarea name="msg" maxlength="500"></textarea></label>
    <p class="err" role="alert"></p>
    <button type="submit" class="send">${L.send}</button>
    <p class="fine">${L.fine}</p></form>`;
  document.body.appendChild(dlg);
  const bf = dlg.querySelector("form"), err = bf.querySelector(".err");
  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const open = (url) => window.open(url, "_blank", "noopener");

  document.querySelectorAll("[data-book]").forEach((b) => b.addEventListener("click", (ev) => {
    ev.preventDefault();
    const unit = b.dataset.book;
    hit("form", unit);
    if (!dlg.showModal) { open("https://wa.me/" + WA + "?text=" + encodeURIComponent(L.hello)); return; }
    bf.unit.value = unit in L.units ? unit : "any";
    bf.in.min = iso(new Date());
    err.textContent = "";
    dlg.showModal();
  }));
  dlg.querySelector(".x").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (ev) => { if (ev.target === dlg) dlg.close(); });
  bf.addEventListener("input", () => { err.textContent = ""; });
  bf.in.addEventListener("change", () => {
    if (!bf.in.value) return;
    const d = new Date(bf.in.value + "T12:00"); d.setDate(d.getDate() + 1); bf.out.min = iso(d);
    if (!bf.out.value || bf.out.value < bf.out.min) bf.out.value = "";
  });
  const nice = (v) => new Date(v + "T12:00").toLocaleDateString(L.locale, { month: "short", day: "numeric", year: "numeric" });
  bf.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const f = Object.fromEntries(new FormData(bf));
    for (const k of ["name", "contact", "msg"]) f[k] = (f[k] || "").trim();
    const nights = f.in && f.out ? Math.round((new Date(f.out + "T12:00") - new Date(f.in + "T12:00")) / 864e5) : 0;
    const miss = !f.in || !f.out ? L.eDates : nights < 1 ? L.eOrder : !f.name ? L.eName : !f.contact ? L.eContact : "";
    if (miss) { err.textContent = miss; return; }
    const unitName = f.unit === "any" ? L.anyName : (L.units[f.unit] || L.anyName).split(" ·")[0];
    const text = [
      L.hello,
      L.lUnit + unitName,
      L.lDates + nice(f.in) + L.to + nice(f.out) + " (" + nights + (nights === 1 ? L.night : L.nights),
      L.lGuests + f.guests,
      L.lName + f.name,
      L.lContact + f.contact,
      f.msg ? L.lMsg + f.msg : "",
    ].filter(Boolean).join("\n");
    hit("direct", f.unit);
    open("https://wa.me/" + WA + "?text=" + encodeURIComponent(text));
    dlg.close();
  });
})();
