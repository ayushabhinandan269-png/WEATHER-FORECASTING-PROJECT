/* =====================================================
   Weather Forecast Project - script.js
   Author: Ayush Abhinandan
   Description:
   Fetches real-time weather data from OpenWeatherMap API,
   displays current weather and 5-day forecast, stores
   recent searches, and changes background color based
   on conditions.
   ===================================================== */

/* ------------ API CONFIGURATION ------------ */
const API_KEY = "bed4efaf8d2f2abf7049f63d891f609e";
const BASE_URL = "https://api.openweathermap.org/data/2.5/";

/*-------------selectors----------------------*/
const selectors = {
  cityInput: document.getElementById("city-input"),
  searchBtn: document.getElementById("search-btn"),
  locBtn: document.getElementById("loc-btn"),
  unitToggle: document.getElementById("unit-toggle"),
  message: document.getElementById("message"),
  currentContent: document.getElementById("current-content"),
  currentCity: document.getElementById("current-city"),
  currentDesc: document.getElementById("current-desc"),
  currentTemp: document.getElementById("current-temp"),
  currentDetails: document.getElementById("current-details"),
  currentIcon: document.getElementById("current-icon"),
  currentLoading: document.getElementById("current-loading"),
  forecastSection: document.getElementById("forecast-section"),
  appRoot: document.getElementById("app-root"),
  recentToggle: document.getElementById("recent-toggle"),
  recentList: document.getElementById("recent-list"),
};

let isCelsius = true;
let recentCities = []; // store recent city names

/* ----------- Message Display ----------- */
function showMessage(text, type = 'info') {
  const messageBox = selectors.message;
  messageBox.classList.remove('hidden');
  messageBox.textContent = text;
  messageBox.className = 'mb-4 p-3 rounded-lg transition-opacity duration-500 ease-in-out';

  // Apply type-specific colors
  if (type === 'error') {
    messageBox.classList.add('bg-red-100', 'text-red-800');
  } else if (type === 'warning') {
    messageBox.classList.add('bg-yellow-100', 'text-yellow-800');
  } else {
    messageBox.classList.add('bg-blue-50', 'text-blue-800');
  }

  // Auto-hide after 4 seconds
  setTimeout(() => {
    messageBox.classList.add('opacity-0');
    setTimeout(() => {
      messageBox.classList.add('hidden');
      messageBox.textContent = '';
      messageBox.className = ''; // reset classes
    }, 500); // wait for fade-out to finish
  }, 4000);
}

/* ----------- Temperature Alert ----------- */
function showExtremeTempAlert(temp) {
  let msg = "";
  if (temp > 35) msg = "☀️ It's hot today — stay hydrated!";
  else if (temp < 5) msg = "❄️ It's cold — wear warm clothes!";
  if (msg)
    selectors.message.innerHTML += `<div class="alert-extreme">${msg}</div>`;
}

/* ----------- Conversion & Formatting ----------- */
function convertTemp(temp) {
  return isCelsius ? temp : (temp * 9) / 5 + 32;
}

function formatDate(timestamp) {
  const d = new Date(timestamp * 1000);
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
}

/* ----------- Background Update ----------- */
function updateBackground(weather) {
  const main = weather.toLowerCase();
  selectors.appRoot.classList.remove(
    "bg-clear",
    "bg-clouds",
    "bg-rain",
    "bg-snow",
    "bg-thunderstorm"
  );

  if (main.includes("clear")) selectors.appRoot.classList.add("bg-clear");
  else if (main.includes("cloud")) selectors.appRoot.classList.add("bg-clouds");
  else if (main.includes("rain") || main.includes("drizzle"))
    selectors.appRoot.classList.add("bg-rain");
  else if (main.includes("snow")) selectors.appRoot.classList.add("bg-snow");
  else if (main.includes("thunder"))
    selectors.appRoot.classList.add("bg-thunderstorm");
}

/* ----------- Fetch Weather ----------- */
async function getWeather(city) {
  if (!city) return showMessage("Please enter a city name.", "error");

  try {
    selectors.currentLoading.innerText = "Loading weather data...";
    selectors.currentContent.classList.add("hidden");

    const res = await fetch(
      `${BASE_URL}weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) throw new Error("City not found");

    const data = await res.json();
    displayCurrentWeather(data);
    getForecast(city);
    saveRecentCity(data.name); // Save city to recent list
  } catch (e) {
    showMessage("❌ Error: " + e.message, "error");
  }
}


/* ----------- Display Current Weather ----------- */
function displayCurrentWeather(data) {
  selectors.currentContent.classList.remove("hidden");
  selectors.currentLoading.classList.add("hidden");

  const temp = Math.round(data.main.temp);
  const weather = data.weather[0].main;
  const desc = data.weather[0].description;
  const icon = data.weather[0].icon;

  selectors.currentCity.textContent = data.name;
  selectors.currentDesc.textContent = desc;
  selectors.currentTemp.textContent = `${convertTemp(temp)}°${
    isCelsius ? "C" : "F"
  }`;
  selectors.currentDetails.innerHTML = `💧 Humidity: ${data.main.humidity}% | 🌬️ Wind: ${data.wind.speed} m/s`;
  selectors.currentIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;

  showExtremeTempAlert(temp);
  updateBackground(weather);
}

/* ----------- 5-Day Forecast ----------- */
async function getForecast(city) {
  try {
    const res = await fetch(
      `${BASE_URL}forecast?q=${city}&appid=${API_KEY}&units=metric`
    );
    const data = await res.json();
    const forecast = [];
    const seenDates = new Set();
    for (const item of data.list) {
    const date = item.dt_txt.split(" ")[0];
    if (!seenDates.has(date)) {
    seenDates.add(date);
    forecast.push(item);
  }
}


    selectors.forecastSection.innerHTML = "";
    forecast.forEach((f) => {
      const temp = Math.round(f.main.temp);
      const desc = f.weather[0].description;
      const icon = f.weather[0].icon;
      const date = formatDate(f.dt);
      const card = document.createElement("div");
      card.className = "glass-card text-center";
      card.innerHTML = `
        <h3>${date}</h3>
        <img src="https://openweathermap.org/img/wn/${icon}.png" alt="icon" class="mx-auto w-12 h-12" />
        <p>${convertTemp(temp)}°${isCelsius ? "C" : "F"}</p>
        <p>${desc}</p>
      `;
      selectors.forecastSection.appendChild(card);
    });
    selectors.forecastSection.classList.remove("hidden");
   } catch {
    showMessage("Failed to load forecast.", "error");
  }
}

/* ----------- Recent Cities Feature ----------- */

if (!selectors.recentList) selectors.recentList = document.getElementById('recent-list');
if (!selectors.recentToggle) selectors.recentToggle = document.getElementById('recent-toggle');
if (!selectors.recentContainer) selectors.recentContainer = document.getElementById('recent-container');

// local array (load once on start)
let RecentCities = JSON.parse(localStorage.getItem('wf_recent_cities')) || [];

// call this right after successful fetch (inside getWeather or after displayCurrentWeather)
// saveRecentCity(cityName) 
function saveRecentCity(city) {
  if (!city) return;
  city = city.trim();
  // remove duplicate (case-insensitive)
  recentCities = recentCities.filter(c => c.toLowerCase() !== city.toLowerCase());
  recentCities.unshift(city);               // newest first
  if (recentCities.length > 5) recentCities = recentCities.slice(0, 5);
  localStorage.setItem('wf_recent_cities', JSON.stringify(recentCities));
}

// populate the dropdown DOM (but DO NOT show it unless toggled)
function renderRecentList() {
  const list = selectors.recentList;
  if (!list) return;
  list.innerHTML = ''; // clear existing

  if (!recentCities || recentCities.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'p-2 text-gray-500 text-sm';
    empty.textContent = 'No recent cities yet';
    list.appendChild(empty);
    return;
  }

  // Add each city as a clickable row
  recentCities.forEach(city => {
    const row = document.createElement('div');
    row.className = 'px-3 py-2 hover:bg-gray-100 cursor-pointer border-b text-sm';
    row.textContent = city;
    row.addEventListener('click', () => {
      selectors.cityInput.value = city;
      // hide the list
      list.classList.add('hidden');
      if (typeof getWeather === 'function') getWeather(city);
      else if (typeof fetchByCity === 'function') fetchByCity(city); // alternative name fallback
    });
    list.appendChild(row);
  });
}

// Toggle + render when Recent button clicked
selectors.recentToggle.addEventListener('click', (e) => {
  e.stopPropagation();           // prevent click from bubbling to document
  renderRecentList();
  selectors.recentList.classList.toggle('hidden');
});

// Auto-close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const list = selectors.recentList;
  const container = selectors.recentContainer || document.getElementById('recent-container');
  if (!list || !container) return;
  if (!container.contains(e.target)) {
    list.classList.add('hidden');
  }
});


// Event listener for “Recent Cities ▾” button
selectors.recentToggle.addEventListener("click", () => {
  displayRecentCities();
});



/* ----------- Location Weather ----------- */
selectors.locBtn.addEventListener("click", () => {
  if (!navigator.geolocation)
    return showMessage("Geolocation not supported.", "error");

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    try {
      const res = await fetch(
        `${BASE_URL}weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      displayCurrentWeather(data);
      getForecast(data.name);
      saveRecentCity(data.name);
    } catch {
      showMessage("Location data unavailable.", "error");
    }
  });
});

/* ----------- Event Listeners ----------- */
selectors.searchBtn.addEventListener("click", () =>
  getWeather(selectors.cityInput.value.trim())
);

selectors.cityInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    getWeather(selectors.cityInput.value.trim());
  }
});

selectors.unitToggle.addEventListener("click", () => {
  isCelsius = !isCelsius;
  selectors.unitToggle.textContent = isCelsius ? "°C" : "°F";
  showMessage(`Switched to ${isCelsius ? "Celsius" : "Fahrenheit"}.`);
});

document.addEventListener("click", (event) => {
  if (!selectors.recentContainer?.contains(event.target)) {
    selectors.recentList.classList.add("hidden");
  }
});


/* ----------- Initial Setup ----------- */
window.addEventListener("load", () => {
  selectors.currentLoading.innerText = "Search a city or use current location.";
});