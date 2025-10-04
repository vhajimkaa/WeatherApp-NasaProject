document.addEventListener("DOMContentLoaded", () => {
  const city = localStorage.getItem("city");
  if (!city) return window.location.href = "index.html";

  const app = document.querySelector(".weather-app");
  const cityDateEl = document.querySelector(".city-date");
  const resetBtn = document.getElementById("resetCity");

  resetBtn?.addEventListener("click", () => {
    localStorage.removeItem("city");
    window.location.href = "index.html";
  });

  const icons = {
    clouds: "assets/weather-icons/clouds.png",
    night: "assets/weather-icons/night.png",
    rain: "assets/weather-icons/rain.png",
    thunder: "assets/weather-icons/thunder.png",
    "sun-rain": "assets/weather-icons/sun-rain.png",
    sun: "assets/weather-icons/sun.png"
  };

  function updateWeather(data) {
    if (!data) return;
    app.classList.add("show");
    cityDateEl.textContent = data.city || city;

    const mainIcon = document.querySelector(".weather-icon img");
    const tempEl = document.querySelector(".weather-temp h2");
    const feelsEl = document.querySelector(".feels-like");
    const rainEl = document.querySelector(".rain-status");

    if (mainIcon) mainIcon.src = icons[data.condition] || "";
    if (tempEl) tempEl.textContent = data.temperature != null ? `${data.temperature}°C` : "-";
    if (feelsEl) feelsEl.textContent = data.feels_like != null ? `Feels like: ${data.feels_like}°C` : "-";
    if (rainEl) rainEl.textContent = data.condition || "-";

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
          if (dayEl) dayEl.textContent = f.day || "-";
          if (tempEl) tempEl.textContent = f.temp != null ? `${f.temp}°C` : "-";
          if (iconEl) iconEl.src = icons[f.condition] || "";
        }
      });
    }
  }

  fetch(`https://deadlier-finite-lonna.ngrok-free.dev/api/forecast/?city=${encodeURIComponent(city)}`)
    .then(res => res.ok ? res.json() : Promise.reject("Ошибка запроса к серверу"))
    .then(data => updateWeather(data))
    .catch(err => {
      console.error(err);
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
