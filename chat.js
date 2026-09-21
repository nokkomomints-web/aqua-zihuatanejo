/* Aqua guest assistant.
 *
 * Answers questions about the property from what the three listings actually say, and hands off to
 * WhatsApp for anything it does not know (price, dates, check-in times). Deliberately no API key
 * and no server: this page is static, so an answer it cannot source is an answer it should not
 * invent. Every reply below traces to the Airbnb listings for Brisas, Oasis and Olas.
 *
 * To add an answer: append to KB. `k` is the keywords that trigger it, `a` is the reply (HTML).
 */
(function () {
  // NUMBER SWITCHED 2026-09-20. Diego changed eSIM, so the Mexican line is not registered on
  // WhatsApp right now (he confirmed: "+527551044400 isn't on WhatsApp ... might be cause I
  // changed eSIM, should be good by Wednesday"). This is his US line so the button is not dead
  // over the weekend on a rental site.
  // SWITCH BACK once he confirms the Mexican line is live: 5217551044400
  // (Note: the "+011527551044400" he also sent is NOT a second number. 011 is the US
  //  international exit code, not part of the number - strip it and you get 527551044400,
  //  the one that is already failing. Only the US line below can work today.)
  const WHATSAPP = "https://wa.me/13057661122?text=Hola%2C%20I%27d%20like%20to%20ask%20about%20Aqua";
  const LINKS = {
    brisas: "https://www.airbnb.com/rooms/1482157264577134834",
    oasis: "https://www.airbnb.com/rooms/1482174106685324417",
    olas: "https://www.airbnb.com/rooms/1379307056800954871",
  };
  const book = (n) => `<a href="${LINKS[n]}" target="_blank" rel="noopener">${n[0].toUpperCase() + n.slice(1)} on Airbnb</a>`;

  const KB = [
    { k: ["how many", "bungalow", "units", "how many units", "three", "what are"],
      a: `There are three private bungalows at Aqua: <b>Brisas</b>, <b>Oasis</b> and <b>Olas</b>. Each has its own entrance, and each sleeps 4.` },
    { k: ["brisas"],
      a: `<b>Brisas</b> is oceanfront: 2 bedrooms, 1 bath, sleeps 4, a queen bed with A/C and a ceiling fan in each bedroom. ${book("brisas")}` },
    { k: ["oasis", "biggest", "largest"],
      a: `<b>Oasis</b> is the largest of the three: 2 bedrooms, 2 baths, sleeps 4. A king bed, a queen with its own bathroom, and a large private patio on the first floor. ${book("oasis")}` },
    { k: ["olas"],
      a: `<b>Olas</b> is oceanfront: 2 bedrooms, 1 bath, sleeps 4, a queen bed with A/C and a ceiling fan in each bedroom. ${book("olas")}` },
    { k: ["sleep", "how many people", "capacity", "guests", "big group", "family"],
      a: `Each bungalow sleeps 4, so all three together sleep 12. For a larger group, all three can be booked together.` },
    { k: ["bed", "king", "queen", "bedroom"],
      a: `Brisas and Olas each have two bedrooms with a queen bed. Oasis has a king in one bedroom and a queen in the other, and the queen room has its own bathroom.` },
    { k: ["bath", "bathroom", "shower"],
      a: `Oasis has 2 bathrooms. Brisas and Olas have 1 each.` },
    { k: ["beach", "ocean", "view", "water", "sand", "front"],
      a: `Aqua sits directly on La Madera Beach, with beach access and an ocean view from every bungalow.` },
    { k: ["where", "location", "address", "zihuatanejo", "zihua", "madera"],
      a: `La Madera Beach, in Zihuatanejo, Guerrero, Mexico. Restaurants are along the beach, the boardwalk to the pier is a short walk, and water taxis to Las Gatas Beach leave from the dock.` },
    { k: ["do", "things", "activities", "restaurant", "eat", "fishing", "boat", "las gatas"],
      a: `The neighbourhood has plenty of restaurants along La Madera. From the pier you can take a water taxi to Las Gatas Beach or head out on a fishing trip.` },
    { k: ["wifi", "internet"], a: `Yes, wifi in every bungalow.` },
    { k: ["air", "a/c", "ac", "hot", "fan", "conditioning"],
      a: `Every bedroom has air conditioning and a ceiling fan.` },
    { k: ["kitchen", "cook", "fridge"], a: `Yes, each bungalow has a kitchen.` },
    { k: ["laundry", "washer", "washing"], a: `Yes, there is a washer.` },
    { k: ["tv", "television"], a: `Yes, each bungalow has a TV.` },
    { k: ["amenities", "included", "what do you have"],
      a: `In every bungalow: ocean view, beach access, air conditioning and ceiling fans, a kitchen, wifi, a washer, a TV, and a private entrance.` },
    { k: ["book", "reserve", "reservation", "availability", "available", "dates", "calendar"],
      a: `Booking and live availability are on Airbnb: ${book("brisas")}, ${book("oasis")}, ${book("olas")}.` },
    { k: ["price", "cost", "rate", "how much", "night", "cheap", "discount"],
      a: `Rates change by season, so the Airbnb listings have the current price for your dates: ${book("brisas")}, ${book("oasis")}, ${book("olas")}.` },
    { k: ["review", "rating", "stars"],
      a: `Brisas is rated 5.0, Oasis 5.0, and Olas 4.63 on Airbnb.` },
    { k: ["dog", "dogs", "pet", "pets", "cat", "animal"],
      a: `I don't have a pet policy on file. Diego can confirm on WhatsApp, and the Airbnb listing shows the house rules for each bungalow.` },
    { k: ["park", "parking", "car", "rental car", "drive"],
      a: `I don't have parking details on file. Diego can tell you what is available on WhatsApp.` },
    { k: ["check in", "checkin", "check out", "checkout", "arrival", "arrive", "time"],
      a: `Check-in and check-out times are on each Airbnb listing, and Diego can confirm anything specific on WhatsApp.` },
    { k: ["airport", "zih", "taxi", "transfer", "getting here", "get there"],
      a: `Zihuatanejo has its own airport (ZIH). For transfers and directions, message Diego on WhatsApp.` },
    { k: ["pool", "swim"],
      a: `There is a pool at the property next door in the photos; for what guests can use, ask Diego on WhatsApp.` },
    { k: ["hola", "hello", "hi", "hey", "buenas"],
      a: `Hola. Ask me anything about Aqua: the bungalows, the beach, what is nearby, or how to book.` },
  ];

  const UNKNOWN = `I don't have that one on file. Diego can answer it directly on WhatsApp, and the Airbnb listing for each bungalow has the house rules.`;
  const CHIPS = ["The bungalows", "Where is it?", "What's included?", "How do I book?"];

  // Whole-word matching, not substring: "can I bring my dog" was matching the keyword "do" and
  // answering about restaurants. A wrong confident answer is worse here than "ask Diego".
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  function answer(text) {
    const q = " " + text.toLowerCase().replace(/[^a-z0-9\s/]/g, " ").replace(/\s+/g, " ") + " ";
    let best = null, bestScore = 0;
    for (const item of KB) {
      const score = item.k.reduce((s, k) => (new RegExp("\\b" + esc(k) + "\\b").test(q) ? s + k.length : s), 0);
      if (score > bestScore) { bestScore = score; best = item; }
    }
    return bestScore > 0 ? best.a : UNKNOWN;
  }

  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };

  const panel = el("div", "chatbox");
  panel.innerHTML = `
    <div class="chatbox-top">
      <div>
        <div class="chatbox-name">Aqua</div>
        <div class="chatbox-sub">Ask about the bungalows</div>
      </div>
      <button class="chatbox-x" aria-label="Close">&times;</button>
    </div>
    <div class="chatbox-log" role="log" aria-live="polite"></div>
    <div class="chatbox-chips"></div>
    <form class="chatbox-form">
      <input type="text" placeholder="Type a question" aria-label="Type a question" autocomplete="off">
      <button type="submit" aria-label="Send">Send</button>
    </form>
    <a class="chatbox-wa" href="${WHATSAPP}" target="_blank" rel="noopener">Message Diego on WhatsApp</a>`;
  document.body.appendChild(panel);

  const log = panel.querySelector(".chatbox-log");
  const chips = panel.querySelector(".chatbox-chips");
  const form = panel.querySelector(".chatbox-form");
  const input = form.querySelector("input");

  function say(who, html) {
    const row = el("div", `msg ${who}`, html);
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
  }

  function ask(text) {
    say("me", text.replace(/</g, "&lt;"));
    const reply = answer(text);
    setTimeout(() => {
      say("bot", reply);
    }, 260);
  }

  CHIPS.forEach((c) => {
    const b = el("button", "chip", c);
    b.addEventListener("click", () => ask(c));
    chips.appendChild(b);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    input.value = "";
    ask(v);
  });

  panel.querySelector(".chatbox-x").addEventListener("click", () => panel.classList.remove("open"));

  // The floating button goes straight to WhatsApp (client's call). The assistant opens from the
  // footer link only, so the two never compete for the same tap.
  document.querySelectorAll(".ask").forEach((launcher) => {
    launcher.addEventListener("click", (e) => {
      e.preventDefault();
      panel.classList.add("open");
      if (!log.childElementCount) say("bot", "Hola. Ask me anything about Aqua: the bungalows, the beach, what is nearby, or how to book.");
      input.focus();
    });
  });
})();
