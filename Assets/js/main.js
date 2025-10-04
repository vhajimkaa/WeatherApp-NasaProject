document.addEventListener("DOMContentLoaded", () => {
  const city = localStorage.getItem("city");
  if (!city) return window.location.href = "index.html";

  const app = document.querySelector(".weather-app");
  const cityDateEl = document.querySelector(".city-date");
  const resetBtn = document.getElementById("resetCity");

  // City change button
  resetBtn?.addEventListener("click", () => {
    localStorage.removeItem("city");
    window.location.href = "index.html";
  });

  // Icon paths
  const icons = {
    clouds: "Assets/weather-icons/clouds.png",
    rain: "Assets/weather-icons/rain.png",
    thunderstorm: "Assets/weather-icons/thunderstorm.png",
    "sun-rain": "Assets/weather-icons/sun-rain.png",
    clear: "Assets/weather-icons/clear.png",
    drizzle: "Assets/weather-icons/rain.png",
    mist: "Assets/weather-icons/night.png",
    smoke: "Assets/weather-icons/night.png",
    haze: "Assets/weather-icons/night.png",
    dust: "Assets/weather-icons/dust.png",
    fog: "Assets/weather-icons/night.png",
    sand: "Assets/weather-icons/dust.png",
    ash: "Assets/weather-icons/dust.png",
    squall: "Assets/weather-icons/thunderstorm.png",
    tornado: "Assets/weather-icons/thunderstorm.png",
    snow: "Assets/weather-icons/snowy.png",
    sun: "Assets/weather-icons/clear.png", // дефолт
  };

  // Function to select icon by condition
  function getIcon(condition) {
    if (!condition) return icons.sun;
    const key = condition.toLowerCase().replace(/\s/g, "-");
    return icons[key] || icons.sun;
  }

  function updateWeather(data) {
    if (!data) data = {};

    app.classList.add("show");
    cityDateEl.textContent = data.city || city;

    const mainIcon = document.querySelector(".weather-icon img");
    const tempEl = document.querySelector(".weather-temp h2");
    const feelsEl = document.querySelector(".feels-like");
    const rainEl = document.querySelector(".rain-status");

  // If no data, show default
  const condition = data.condition || "sun";

  if (mainIcon) mainIcon.src = getIcon(condition);
  if (tempEl) tempEl.textContent = data.temperature != null ? `${data.temperature}°C` : "-";
  if (feelsEl) feelsEl.textContent = data.feels_like != null ? `Feels like: ${data.feels_like}°C` : "-";
  if (rainEl) rainEl.textContent = condition;

    const todayItems = document.querySelectorAll(".today-item p");
    if (todayItems.length >= 4) {
      todayItems[0].textContent = data.wind != null ? `Wind: ${data.wind} km/h` : "-";
      todayItems[1].textContent = data.sunrise || "-";
      todayItems[2].textContent = data.humidity != null ? `Humidity: ${data.humidity}%` : "-";
      todayItems[3].textContent = data.sunset || "-";
    }

    const forecastItems = document.querySelectorAll(".forecast-item");
    if (data.forecast && Array.isArray(data.forecast)) {
      data.forecast.forEach((f, i) => {
        if (forecastItems[i]) {
          const dayEl = forecastItems[i].querySelector(".day");
          const tempEl = forecastItems[i].querySelector(".temp");
          const iconEl = forecastItems[i].querySelector("img");

          const fCondition = f.condition || "sun"; // default: sun
          if (dayEl) dayEl.textContent = f.day || "-";
          if (tempEl) tempEl.textContent = f.temp != null ? `${f.temp}°C` : "-";
          if (iconEl) iconEl.src = getIcon(fCondition);
        }
      });
    }
  }

  // Fetch from backend
  fetch(`https://weatherapp-back-1.onrender.com/api/forecast?city=${encodeURIComponent(city)}`)
  .then(res => res.ok ? res.json() : Promise.reject("Server request error"))
    .then(data => updateWeather(data))
    .catch(err => {
      console.error("Error fetching weather:", err);

      // Stub with default sun icon
      updateWeather({
        city,
        temperature: "-",
        feels_like: "-",
        condition: "sun",
        humidity: "-",
        wind: "-",
        sunrise: "-",
        sunset: "-",
        forecast: Array(5).fill({ day: "-", temp: "-", condition: "sun" })
      });
    });
});