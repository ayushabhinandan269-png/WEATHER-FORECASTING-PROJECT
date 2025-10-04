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
let recentCities = []; // 🟢 store recent city names

/* ----------- Message Display ----------- */
function showMessage(text, type = "info") {
  selectors.message.innerHTML = `<div class="message ${type}">${text}</div>`;
  setTimeout(() => (selectors.message.innerHTML = ""), 4000);
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
    saveRecentCity(data.name); // 🟢 Save city to recent list
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
    const forecast = data.list.filter((x) => x.dt_txt.includes("12:00:00"));

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
  } catch {
    showMessage("Failed to load forecast.", "error");
  }
}

/* ----------- Recent Cities Feature ----------- */
function saveRecentCity(city) {
  
  if (!recentCities.includes(city)) {
    recentCities.unshift(city);
    if (recentCities.length > 5) recentCities.pop(); // keep only 5
    renderRecentCities();
  }
}

function renderRecentCities() {
  selectors.recentList.innerHTML = "";
  recentCities.forEach((city) => {
    const div = document.createElement("div");
    div.textContent = city;
    div.className = "px-3 py-2 hover:bg-gray-100 cursor-pointer";
    div.addEventListener("click", () => {
      getWeather(city);
      selectors.recentList.classList.add("hidden"); // hide list after click
    });
    selectors.recentList.appendChild(div);
  });
}


selectors.recentToggle.addEventListener("click", () => {
  selectors.recentList.classList.toggle("hidden");
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

/* ----------- Initial Setup ----------- */
window.addEventListener("load", () => {
  selectors.currentLoading.innerText = "Search a city or use current location.";
});