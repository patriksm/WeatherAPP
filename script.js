// Elements
const countrySelect = document.getElementById("countrySelect");
const citySelect    = document.getElementById("citySelect");
const result        = document.getElementById("result");
const wxIcon        = document.getElementById("wxIcon");
const wxTitle       = document.getElementById("wxTitle");
const wxMeta        = document.getElementById("wxMeta");
const form          = document.getElementById("weatherForm");
const soundToggle   = document.getElementById("soundToggle");

// WeatherAPI key
const WEATHER_KEY = "e511a13169c149a187e80707230310";

// Utility: enable/disable select with placeholder
function setSelectState(el, disabled, placeholder) {
  el.disabled = disabled;
  if (placeholder !== undefined) {
    el.innerHTML = `<option value="">${placeholder}</option>`;
  }
}
// Utility: add options
function fillOptions(select, arr) {
  const frag = document.createDocumentFragment();
  arr.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    frag.appendChild(opt);
  });
  select.appendChild(frag);
}

// === AUDIO: very small sound engine with fade ===
const SOUND_FILES = {
  rain:  "sfx_rain.wav",
  wind:  "sfx_wind.wav",
  day:   "sfx_day_ambience.wav",
  night: "sfx_night_crickets.wav",
  snow:  "sfx_snow_wind.wav"
};


const sounds = {};
let soundEnabled = false;

function loadSound(key) {
  if (sounds[key]) return sounds[key];
  const a = new Audio(SOUND_FILES[key]);
  a.loop = true;
  a.volume = 0; // start silent, we fade in
  sounds[key] = a;
  return a;
}

function fadeTo(audio, target, ms = 600) {
  const step = 0.05;
  const interval = Math.max(30, ms / (1 / step));
  clearInterval(audio._fadeTimer);
  audio._fadeTimer = setInterval(() => {
    const v = audio.volume;
    const dir = target > v ? 1 : -1;
    const next = +(v + dir * step).toFixed(2);
    audio.volume = dir > 0 ? Math.min(next, target) : Math.max(next, target);
    if (Math.abs(audio.volume - target) < 0.01) {
      audio.volume = target;
      clearInterval(audio._fadeTimer);
      if (target === 0) audio.pause();
    }
  }, interval);
}

function stopAllSounds() {
  Object.values(sounds).forEach(a => {
    if (!a.paused) fadeTo(a, 0, 400);
  });
}

// Decide which sounds to play for the current scene
function setSoundScene(isDay, weatherType, windKph) {
  if (!soundEnabled) { stopAllSounds(); return; }

  // Base ambience (day/night)
  const base = isDay ? "day" : "night";
  const baseAudio = loadSound(base);
  if (baseAudio.paused) baseAudio.play();
  fadeTo(baseAudio, 0.35, 500);

  // Weather overlays
  const active = [];

  if (weatherType === "rain") {
    const r = loadSound("rain");
    if (r.paused) r.play();
    fadeTo(r, 0.6, 500);
    active.push("rain");
  } else if (weatherType === "snow") {
    const s = loadSound("snow");
    if (s.paused) s.play();
    fadeTo(s, 0.45, 500);
    active.push("snow");
  } else if (weatherType === "windy" || windKph >= 30) {
    const w = loadSound("wind");
    if (w.paused) w.play();
    // louder if really windy
    fadeTo(w, windKph >= 50 ? 0.65 : 0.45, 500);
    active.push("wind");
  }

  // Fade out non-active overlays
  ["rain","snow","wind"].forEach(k => {
    if (!active.includes(k) && sounds[k]) fadeTo(sounds[k], 0, 400);
  });
}

// Toggle handler
if (soundToggle) {
  soundToggle.addEventListener("change", () => {
    soundEnabled = soundToggle.checked;
    if (!soundEnabled) stopAllSounds();
  });
}

// 1) Load countries
async function loadCountries() {
  try {
    const res = await fetch("https://countriesnow.space/api/v0.1/countries/iso");
    const data = await res.json();
    const names = (data.data || []).map(c => c.name).sort((a,b)=>a.localeCompare(b));
    fillOptions(countrySelect, names);
    countrySelect.addEventListener("change", onCountryChange);
  } catch (e) {
    alert("Failed to load countries.");
    console.error(e);
  }
}

// 2) Load cities for selected country
async function onCountryChange() {
  const country = countrySelect.value;
  setSelectState(citySelect, true, "-- loading cities --");
  if (!country) { setSelectState(citySelect, true, "-- choose --"); return; }

  try {
    const res = await fetch("https://countriesnow.space/api/v0.1/countries/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country })
    });
    const data = await res.json();
    const cities = (data.data || []).sort((a,b)=>a.localeCompare(b));
    if (!cities.length) {
      setSelectState(citySelect, true, "-- no cities found --");
      return;
    }
    setSelectState(citySelect, false, "-- choose --");
    fillOptions(citySelect, cities);
  } catch (e) {
    setSelectState(citySelect, true, "-- failed to load --");
    console.error(e);
  }
}

// 3) On submit: fetch weather and change scene + sounds
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = citySelect.value;
  if (!city) return;

  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/current.xml?key=${WEATHER_KEY}&q=${encodeURIComponent(city)}&aqi=no`
    );
    if (!res.ok) throw new Error("WeatherAPI error");
    const xml = await res.text();
    const doc = new DOMParser().parseFromString(xml, "text/xml");

    // Parse fields
    const locName = doc.getElementsByTagName("name")[0]?.textContent || city;
    const tempC   = doc.getElementsByTagName("temp_c")[0]?.textContent ?? "—";
    const iconRel = doc.getElementsByTagName("icon")[0]?.textContent || "";
    const isDay   = (doc.getElementsByTagName("is_day")[0]?.textContent || "1") === "1";
    const cond    = doc.getElementsByTagName("text")[0]?.textContent?.toLowerCase() || "";
    const windKph = parseFloat(doc.getElementsByTagName("wind_kph")[0]?.textContent || "0");

    // Update card
    wxIcon.src = iconRel ? `https:${iconRel}` : "";
    wxIcon.alt = cond || "weather";
    wxTitle.textContent = `${locName} — ${tempC}°C`;
    wxMeta.textContent  = `${cond ? cond : "weather"} · wind ${windKph} kph ${isDay ? "· day" : "· night"}`;
    result.classList.remove("hidden");

    // Determine visual weather
    let weatherType = windKph >= 30 ? "windy" : (
      cond.includes("rain") || cond.includes("drizzle") ? "rain" :
      cond.includes("snow") || cond.includes("blizzard") ? "snow" :
      cond.includes("sunny") || cond.includes("clear") ? (isDay ? "sunny" : "clear") :
      cond.includes("overcast") || cond.includes("cloud") ? "cloudy" :
      isDay ? "sunny" : "clear"
    );

    setScene(isDay, weatherType);
    setSoundScene(isDay, weatherType, windKph); // <-- play sounds
  } catch (e) {
    console.error(e);
    alert("Failed to fetch weather data.");
  }
});

// Visual theme classes
function setScene(isDay, type) {
  const body = document.body;
  body.className = "";
  body.classList.add(isDay ? "theme-day" : "theme-night");
  body.classList.add(`weather-${type}`);
  if (!isDay && type === "sunny") {
    body.classList.remove("weather-sunny");
    body.classList.add("weather-clear");
  }
}

// Init
loadCountries();
